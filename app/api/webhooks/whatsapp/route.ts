import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function POST(request: Request) {
  try {
    const supabase = createClient()

    // Parse the incoming webhook payload
    const payload = await request.json()

    console.log("Received WhatsApp webhook:", JSON.stringify(payload))

    // Extract the message data
    // Note: This structure will depend on the WhatsApp Business API format
    const { from, to, text, timestamp } = payload

    if (!from || !text) {
      return NextResponse.json({ error: "Invalid message format" }, { status: 400 })
    }

    // Check if the client exists
    const { data: existingClient } = await supabase.from("clients").select("id, name").eq("phone", from).single()

    let clientId: string

    if (existingClient) {
      // Use existing client
      clientId = existingClient.id
    } else {
      // Create a new client
      const { data: newClient, error } = await supabase
        .from("clients")
        .insert({
          name: `WhatsApp User ${from.substring(from.length - 4)}`, // Use last 4 digits as temporary name
          phone: from,
          status: "new",
        })
        .select()
        .single()

      if (error) {
        throw new Error(`Failed to create client: ${error.message}`)
      }

      clientId = newClient.id
    }

    // Store the incoming message
    const { error: messageError } = await supabase.from("interactions").insert({
      client_id: clientId,
      channel: "whatsapp",
      message: text,
      created_at: timestamp || new Date().toISOString(),
    })

    if (messageError) {
      throw new Error(`Failed to store message: ${messageError.message}`)
    }

    // In a real implementation, you would call the agent service here to get a response
    // For now, we'll just acknowledge the webhook

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error("Error processing WhatsApp webhook:", error)
    return NextResponse.json({ error: error.message || "Internal server error" }, { status: 500 })
  }
}

// WhatsApp API requires a GET endpoint for verification
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)

  // WhatsApp sends a verification token when you set up the webhook
  const mode = searchParams.get("hub.mode")
  const token = searchParams.get("hub.verify_token")
  const challenge = searchParams.get("hub.challenge")

  // This should match the token you configured in the WhatsApp Business API
  const VERIFY_TOKEN = process.env.WHATSAPP_VERIFY_TOKEN || "tdx-whatsapp-verify-token"

  if (mode === "subscribe" && token === VERIFY_TOKEN) {
    return new Response(challenge, { status: 200 })
  } else {
    return new Response("Verification failed", { status: 403 })
  }
}
