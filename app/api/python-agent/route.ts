import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

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
    const { message, clientId, agentType = "router" } = await request.json()

    if (!message) {
      return NextResponse.json({ error: "Missing message" }, { status: 400 })
    }

    // Get client information if clientId is provided
    let clientInfo = null
    if (clientId) {
      const { data } = await supabase.from("clients").select("*").eq("id", clientId).single()
      clientInfo = data
    }

    // Get previous messages for context
    let messages = []
    if (clientId) {
      const { data } = await supabase
        .from("interactions")
        .select("*")
        .eq("client_id", clientId)
        .order("created_at", { ascending: true })
        .limit(10)

      if (data) {
        messages = data.map((interaction) => ({
          role: "user",
          content: interaction.message,
        }))

        // Add agent responses
        data.forEach((interaction) => {
          if (interaction.agent_response) {
            messages.push({
              role: "assistant",
              content: interaction.agent_response,
            })
          }
        })
      }
    }

    // Add the current message
    messages.push({
      role: "user",
      content: message,
    })

    // In a real implementation, we would call the Python agent service here
    // For example:
    // const response = await fetch("http://python-agent-service:8000/chat", {
    //   method: "POST",
    //   headers: { "Content-Type": "application/json" },
    //   body: JSON.stringify({
    //     messages,
    //     client_info: clientInfo,
    //     agent_type: agentType
    //   }),
    // })
    // const data = await response.json()
    // return NextResponse.json(data)

    // For now, we'll simulate a response
    const intentMap: Record<string, string> = {
      requirements: "prd",
      specification: "prd",
      features: "prd",
      price: "quotation",
      cost: "quotation",
      quote: "quotation",
      contract: "contract",
      legal: "contract",
      terms: "contract",
    }

    // Detect intent from message
    let intentDetected = "general"
    const lowerMessage = message.toLowerCase()

    for (const [keyword, intent] of Object.entries(intentMap)) {
      if (lowerMessage.includes(keyword)) {
        intentDetected = intent
        break
      }
    }

    // Generate a simulated response
    let agentResponse = ""

    if (agentType === "router") {
      agentResponse = `Thank you for your message. I'm the TDX AI assistant.
      
      ${clientInfo ? `I see you're ${clientInfo.name} from ${clientInfo.company_name || "your company"}. How can I assist you today?` : `Could you please tell me your name and company? This will help me assist you better.`}
      
      Based on your message, I can help you with ${intentDetected === "prd" ? "gathering requirements for your project" : intentDetected === "quotation" ? "providing pricing information" : intentDetected === "contract" ? "contract-related questions" : "general information about our services"}.
      
      Is there anything specific you'd like to know?`
    }

    // Simulate next agent recommendation
    const nextAgent = intentDetected !== "general" ? intentDetected : "router"

    return NextResponse.json({
      agentResponse,
      intentDetected,
      nextAgent,
      confidence: 0.9,
    })
  } catch (error: any) {
    console.error("Error in Python agent:", error)
    return NextResponse.json({ error: error.message || "Internal server error" }, { status: 500 })
  }
}
