import { createServerSide } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export async function POST(request: Request) {
  try {
    const supabase = createServerSide()
    const { message } = await request.json()

    // Get router agent settings
    const { data: agentSettings } = await supabase
      .from("agent_settings")
      .select("*")
      .eq("agent_type", "router")
      .single()

    if (!agentSettings) {
      return NextResponse.json({ error: "Agent settings not found" }, { status: 404 })
    }

    // Determine intent (this would be done by a real AI in production)
    let intent = ""
    let response = ""

    // Simple keyword-based intent detection for demo purposes
    const messageLower = message.toLowerCase()

    if (messageLower.includes("price") || messageLower.includes("cost") || messageLower.includes("quote")) {
      intent = "quotation"
      response =
        "I understand you're interested in pricing. I'll help you get a detailed quote for your project. Could you tell me more about what you're looking to build?"
    } else if (
      messageLower.includes("contract") ||
      messageLower.includes("agreement") ||
      messageLower.includes("terms")
    ) {
      intent = "contract"
      response =
        "I see you have questions about our contract or terms. I'd be happy to explain our standard agreement and any specific clauses you're concerned about."
    } else if (
      messageLower.includes("requirements") ||
      messageLower.includes("specs") ||
      messageLower.includes("features")
    ) {
      intent = "prd"
      response =
        "Let's work on defining your project requirements. A detailed PRD will help ensure we build exactly what you need. What's the main problem you're trying to solve?"
    } else {
      intent = "router"
      response =
        "Thank you for your message. I'm here to help with your technology development needs. Could you share more details about your project, or do you have specific questions about our services?"
    }

    // Save the interaction
    await supabase.from("interactions").insert({
      message,
      agent_response: response,
      intent_detected: intent,
      channel: "web",
    })

    return NextResponse.json({ response, intent })
  } catch (error) {
    console.error("Error in agent-chat:", error)
    return NextResponse.json({ error: "Failed to process message" }, { status: 500 })
  }
}
