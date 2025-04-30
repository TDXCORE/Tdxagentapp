import { cookies } from "next/headers"
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs"
import { NextResponse } from "next/server"

export async function GET() {
  try {
    const cookieStore = cookies()
    const supabase = createServerComponentClient({ cookies: () => cookieStore })

    // Get session data
    const { data: sessionData, error: sessionError } = await supabase.auth.getSession()

    // Get user data
    const { data: userData, error: userError } = await supabase.auth.getUser()

    // Get all cookies for debugging
    const allCookies = cookieStore.getAll().map((c) => ({
      name: c.name,
      value: c.value.substring(0, 10) + "...", // Truncate for security
    }))

    return NextResponse.json({
      session: {
        exists: !!sessionData.session,
        error: sessionError?.message || null,
      },
      user: {
        exists: !!userData.user,
        id: userData.user?.id || null,
        email: userData.user?.email || null,
        error: userError?.message || null,
      },
      cookies: {
        count: allCookies.length,
        items: allCookies,
      },
    })
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Unknown error" }, { status: 500 })
  }
}
