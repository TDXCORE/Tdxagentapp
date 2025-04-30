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
    const { clientId, projectName, additionalInfo } = await request.json()

    if (!clientId || !projectName) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Get client information
    const { data: clientData } = await supabase.from("clients").select("*").eq("id", clientId).single()

    if (!clientData) {
      return NextResponse.json({ error: "Client not found" }, { status: 404 })
    }

    // Get conversation history for context
    const { data: interactionsData } = await supabase
      .from("interactions")
      .select("*")
      .eq("client_id", clientId)
      .order("created_at", { ascending: true })

    // In a real implementation, we would call the Python PRD agent service here
    // For now, we'll use the AI SDK to generate a PRD

    // Build context from interactions
    let conversationContext = ""
    if (interactionsData && interactionsData.length > 0) {
      conversationContext = "Conversation history:\n\n"
      interactionsData.forEach((interaction) => {
        conversationContext += `Client: ${interaction.message}\n`
        if (interaction.agent_response) {
          conversationContext += `Agent: ${interaction.agent_response}\n\n`
        }
      })
    }

    // Generate PRD using AI SDK
    const prompt = `
      Generate a detailed Project Requirements Document (PRD) for a client named ${clientData.name} from ${clientData.company_name || "their company"} for their project "${projectName}".
      
      ${additionalInfo ? `Additional information about the project: ${additionalInfo}` : ""}
      
      ${conversationContext}
      
      The PRD should include:
      1. A comprehensive project overview
      2. Clear objectives
      3. Detailed functional and non-functional requirements
      4. A realistic timeline with phases
      5. A budget range
      6. Key stakeholders
      
      Format the PRD in Markdown.
    `

    const { text: prdContent } = await generateText({
      model: openai("gpt-4o"),
      prompt,
      system:
        "You are a professional requirements analyst who creates detailed and structured PRDs for software projects. Your documents are clear, comprehensive, and follow industry best practices.",
    })

    // Create a new project in the database
    const { data: project, error } = await supabase
      .from("projects")
      .insert({
        client_id: clientId,
        title: projectName,
        description: additionalInfo || "Generated from client interactions",
        status: "draft",
      })
      .select()
      .single()

    if (error) {
      throw new Error(error.message)
    }

    // Store the PRD document URL (in a real implementation, we would upload the PDF to storage)
    const prdDocumentUrl = `/projects/${project.id}/prd.pdf`

    await supabase.from("projects").update({ prd_document_url: prdDocumentUrl }).eq("id", project.id)

    return NextResponse.json({
      prdContent,
      projectId: project.id,
      prdDocumentUrl,
    })
  } catch (error: any) {
    console.error("Error generating PRD:", error)
    return NextResponse.json({ error: error.message || "Internal server error" }, { status: 500 })
  }
}
