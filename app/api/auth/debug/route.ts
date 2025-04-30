import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import { createServerClient } from "@supabase/ssr"

export async function GET() {
  try {
    const cookieStore = cookies()
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return cookieStore.get(name)?.value
          },
          set(name: string, value: string, options: any) {
            cookieStore.set({ name, value, ...options })
          },
          remove(name: string, options: any) {
            cookieStore.set({ name, value: "", ...options })
          },
        },
      },
    )

    const { data, error } = await supabase.auth.getSession()

    if (error) {
      return NextResponse.json(
        {
          error: error.message,
          status: "error",
          timestamp: new Date().toISOString(),
          cookies: Object.fromEntries(Array.from(cookieStore.getAll()).map((cookie) => [cookie.name, "***"])),
          env: {
            NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL ? "set" : "not set",
            NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? "set" : "not set",
          },
        },
        { status: 500 },
      )
    }

    return NextResponse.json({
      status: "success",
      session: data.session
        ? {
            user: {
              id: data.session.user.id,
              email: data.session.user.email,
              role: data.session.user.role,
            },
            expires_at: data.session.expires_at,
          }
        : null,
      timestamp: new Date().toISOString(),
      cookies: Object.fromEntries(Array.from(cookieStore.getAll()).map((cookie) => [cookie.name, "***"])),
      env: {
        NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL ? "set" : "not set",
        NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? "set" : "not set",
      },
    })
  } catch (error) {
    console.error("Error in auth debug route:", error)
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Unknown error",
        status: "error",
        timestamp: new Date().toISOString(),
      },
      { status: 500 },
    )
  }
}
