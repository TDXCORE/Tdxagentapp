import { NextResponse } from "next/server"
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { generateText } from "ai"
import { openai } from "@ai-sdk/openai"

export async function GET(request: Request) {
  try {
    const supabase = createServerComponentClient({ cookies })

    // Check authentication
    const {
      data: { session },
    } = await supabase.auth.getSession()
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Get query parameters
    const { searchParams } = new URL(request.url)
    const clientId = searchParams.get("client_id")
    const channel = searchParams.get("channel")
    const limit = Number.parseInt(searchParams.get("limit") || "50")
    const offset = Number.parseInt(searchParams.get("offset") || "0")

    // Build query
    let query = supabase.from("interactions").select(
      `
      *,
      clients(id, name, company_name)
    `,
      { count: "exact" },
    )

    if (clientId) {
      query = query.eq("client_id", clientId)
    }

    if (channel) {
      query = query.eq("channel", channel)
    }

    // Execute query with pagination
    const { data, error, count } = await query
      .order("created_at", { ascending: false })
      .range(offset, offset + limit - 1)

    if (error) {
      throw error
    }

    return NextResponse.json({
      interactions: data,
      total: count,
      limit,
      offset,
    })
  } catch (error: any) {
    console.error("Error fetching interactions:", error)
    return NextResponse.json({ error: error.message || "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const supabase = createServerComponentClient({ cookies })

    // Check authentication
    const {
      data: { session },
    } = await supabase.auth.getSession()
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Get request body
    const body = await request.json()

    // Validate required fields
    if (!body.message || !body.client_id) {
      return NextResponse.json({ error: "Message and client_id are required" }, { status: 400 })
    }

    // Get client information
    const { data: client } = await supabase.from("clients").select("*").eq("id", body.client_id).single()

    if (!client) {
      return NextResponse.json({ error: "Client not found" }, { status: 404 })
    }

    // Get agent settings
    const { data: agentSettings } = await supabase
      .from("agent_settings")
      .select("*")
      .eq("agent_type", "router")
      .single()

    // Generate agent response using AI
    const systemPrompt =
      agentSettings?.prompt_template ||
      `
      You are a helpful assistant for TDX, a technology development company. 
      Your role is to greet the customer, understand their needs, and route them to the appropriate specialized agent.
      Ask for their name, company, and a brief description of what they're looking for.
    `

    const { text: agentResponse } = await generateText({
      model: openai(agentSettings?.model || "gpt-4o"),
      prompt: body.message,
      system: systemPrompt,
      temperature: agentSettings?.temperature || 0.7,
      maxTokens: agentSettings?.max_tokens || 2000,
    })

    // Detect intent
    let intentDetected = "general"
    const lowerResponse = agentResponse.toLowerCase()

    if (lowerResponse.includes("requirements") || lowerResponse.includes("prd")) {
      intentDetected = "prd"
    } else if (lowerResponse.includes("price") || lowerResponse.includes("quote") || lowerResponse.includes("cost")) {
      intentDetected = "quotation"
    } else if (lowerResponse.includes("contract") || lowerResponse.includes("legal")) {
      intentDetected = "contract"
    }

    // Insert new interaction
    const { data, error } = await supabase
      .from("interactions")
      .insert({
        client_id: body.client_id,
        channel: body.channel || "internal",
        message: body.message,
        agent_response: agentResponse,
        intent_detected: intentDetected,
      })
      .select()
      .single()

    if (error) {
      throw error
    }

    return NextResponse.json({
      interaction: data,
      agentResponse,
      intentDetected,
    })
  } catch (error: any) {
    console.error("Error creating interaction:", error)
    return NextResponse.json({ error: error.message || "Internal server error" }, { status: 500 })
  }
}
