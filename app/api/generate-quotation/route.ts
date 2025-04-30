import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { generateText } from "ai"
import { openai } from "@ai-sdk/openai"

export async function POST(request: Request) {
  try {
    const supabase = createClient()

    // Check authentication
    const {
      data: { session },
    } = await supabase.auth.getSession()
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Get request body
    const { clientName, projectName, projectType, complexity, duration, prdId } = await request.json()

    if (!clientName || !projectName) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Get PRD content if prdId is provided
    let prdContent = ""
    if (prdId) {
      const { data: prdData } = await supabase.from("documents").select("content").eq("id", prdId).single()

      prdContent = prdData?.content || ""
    }

    // Generate quotation using AI SDK
    const prompt = `
      Generate a detailed quotation for a client named ${clientName} for their project "${projectName}".
      
      Project details:
      - Type: ${projectType || "Web Application"}
      - Complexity: ${complexity || "Medium"} (on a scale of 1-100)
      - Duration: ${duration || 3} months
      
      ${prdContent ? `Based on the following PRD:\n${prdContent}` : ""}
      
      The quotation should include:
      1. A breakdown of services (planning, development, testing, etc.)
      2. Hours estimated for each service
      3. Hourly rates
      4. Subtotal
      5. Tax (19%)
      6. Total amount
      
      Return the quotation as a structured JSON object with the following format:
      {
        "client": "Client Name",
        "project": "Project Name",
        "date": "ISO date string",
        "items": [
          {
            "description": "Service description",
            "hours": number,
            "rate": number,
            "amount": number
          }
        ],
        "subtotal": number,
        "tax": number,
        "total": number
      }
    `

    const { text: quotationText } = await generateText({
      model: openai("gpt-4o"),
      prompt,
      system:
        "You are a professional quotation specialist who creates accurate and detailed quotations for software projects. Your quotations are fair, comprehensive, and follow industry standards.",
    })

    // Parse the quotation JSON
    let quotation
    try {
      quotation = JSON.parse(quotationText)
    } catch (error) {
      throw new Error("Failed to parse quotation JSON")
    }

    // Save quotation to database
    const { data: savedQuotation, error } = await supabase
      .from("documents")
      .insert({
        client_name: clientName,
        project_name: projectName,
        content: JSON.stringify(quotation),
        type: "quotation",
        created_by: session.user.id,
        related_prd_id: prdId || null,
      })
      .select()
      .single()

    if (error) {
      throw new Error(error.message)
    }

    return NextResponse.json({
      quotation,
      id: savedQuotation.id,
    })
  } catch (error: any) {
    console.error("Error generating quotation:", error)
    return NextResponse.json({ error: error.message || "Internal server error" }, { status: 500 })
  }
}
