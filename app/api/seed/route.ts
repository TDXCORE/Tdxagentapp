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

    // Check if user is admin
    const { data: user } = await supabase.from("users").select("role").eq("id", session.user.id).single()

    if (!user || user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized: Admin access required" }, { status: 403 })
    }

    // Seed agent settings
    const agentSettings = [
      {
        agent_type: "router",
        prompt_template: `You are a helpful assistant for TDX, a technology development company. 
        Your role is to greet the customer, understand their needs, and route them to the appropriate specialized agent.
        Ask for their name, company, and a brief description of what they're looking for.`,
        model: "gpt-4o",
        temperature: 0.7,
        max_tokens: 2000,
      },
      {
        agent_type: "prd",
        prompt_template: `You are a requirements gathering specialist for TDX. Your job is to ask detailed questions about the client's project to create a comprehensive PRD.
        Focus on understanding their business goals, technical requirements, user stories, and constraints.`,
        model: "gpt-4o",
        temperature: 0.7,
        max_tokens: 3000,
      },
      {
        agent_type: "quotation",
        prompt_template: `You are a pricing specialist for TDX. Based on the project requirements, estimate the effort, timeline, and cost.
        Ask clarifying questions about project scope, complexity, and any specific technologies or integrations required.`,
        model: "gpt-4o",
        temperature: 0.7,
        max_tokens: 2000,
      },
      {
        agent_type: "contract",
        prompt_template: `You are a contract specialist for TDX. Your role is to explain contract terms, answer legal questions, and help prepare for the contract phase.`,
        model: "gpt-4o",
        temperature: 0.7,
        max_tokens: 2000,
      },
    ]

    // Insert agent settings
    const { error: settingsError } = await supabase.from("agent_settings").insert(agentSettings)

    if (settingsError) {
      throw new Error(`Failed to seed agent settings: ${settingsError.message}`)
    }

    // Seed sample clients
    const clients = [
      {
        name: "John Doe",
        company_name: "Acme Inc.",
        email: "john.doe@acme.com",
        phone: "+1 (555) 123-4567",
        status: "new",
      },
      {
        name: "Jane Smith",
        company_name: "TechCorp",
        email: "jane.smith@techcorp.com",
        phone: "+1 (555) 987-6543",
        status: "qualified",
      },
      {
        name: "Bob Johnson",
        company_name: "InnovateTech",
        email: "bob.johnson@innovatetech.com",
        phone: "+1 (555) 456-7890",
        status: "converted",
      },
    ]

    // Insert clients
    const { data: insertedClients, error: clientsError } = await supabase.from("clients").insert(clients).select()

    if (clientsError) {
      throw new Error(`Failed to seed clients: ${clientsError.message}`)
    }

    // Seed sample projects
    if (insertedClients) {
      const projects = [
        {
          client_id: insertedClients[0].id,
          title: "Website Redesign",
          description: "Complete redesign of company website with modern UI/UX",
          status: "draft",
          start_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
          end_date: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
        },
        {
          client_id: insertedClients[1].id,
          title: "Mobile App Development",
          description: "iOS and Android app for customer portal",
          status: "active",
          start_date: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
          end_date: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
        },
        {
          client_id: insertedClients[2].id,
          title: "AI Integration",
          description: "Integrate AI chatbot into existing customer service platform",
          status: "completed",
          start_date: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
          end_date: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
        },
      ]

      // Insert projects
      const { error: projectsError } = await supabase.from("projects").insert(projects)

      if (projectsError) {
        throw new Error(`Failed to seed projects: ${projectsError.message}`)
      }
    }

    return NextResponse.json({ success: true, message: "Database seeded successfully" })
  } catch (error: any) {
    console.error("Error seeding database:", error)
    return NextResponse.json({ error: error.message || "Internal server error" }, { status: 500 })
  }
}
