import { createBrowserClient } from "@supabase/ssr"
import type { Database } from "./types"

// Create a single instance of the client to be reused
let supabaseClient: ReturnType<typeof createBrowserClient<Database>> | null = null

export function createClient() {
  if (!supabaseClient) {
    supabaseClient = createBrowserClient<Database>(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    )
  }
  return supabaseClient
}

// For backward compatibility with existing code
export function createClientSide() {
  return createClient()
}

// For debugging: Check current auth state
export async function getClientSession() {
  const client = createClient()
  return await client.auth.getSession()
}
