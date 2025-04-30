import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function GET(request: Request) {
  try {
    const supabase = createClient()

    // Get session
    const { data: sessionData, error: sessionError } = await supabase.auth.getSession()

    // Get user
    const { data: userData, error: userError } = await supabase.auth.getUser()

    // Check if environment variables are set
    const envCheck = {
      NEXT_PUBLIC_SUPABASE_URL: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
      NEXT_PUBLIC_SUPABASE_ANON_KEY: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      SUPABASE_SERVICE_ROLE_KEY: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
    }

    return NextResponse.json({
      session: {
        exists: !!sessionData.session,
        error: sessionError ? sessionError.message : null,
      },
      user: {
        exists: !!userData.user,
        error: userError ? userError.message : null,
        email: userData.user?.email,
      },
      environmentVariables: envCheck,
      timestamp: new Date().toISOString(),
    })
  } catch (error: any) {
    console.error("Debug auth error:", error)
    return NextResponse.json(
      {
        error: error.message || "Internal server error",
        stack: process.env.NODE_ENV === "development" ? error.stack : undefined,
      },
      { status: 500 },
    )
  }
}
