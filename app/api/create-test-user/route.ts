import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function POST() {
  try {
    // Generate random email and password
    const randomString = Math.random().toString(36).substring(2, 10)
    const email = `test-${randomString}@example.com`
    const password = `Test${randomString}!`

    const supabase = createClient()

    // Create user in Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
    })

    if (authError) {
      console.error("Error creating auth user:", authError)
      return NextResponse.json({ error: authError.message }, { status: 500 })
    }

    if (!authData.user) {
      return NextResponse.json({ error: "Failed to create user" }, { status: 500 })
    }

    // Insert user into users table
    const { error: insertError } = await supabase.from("users").insert({
      id: authData.user.id,
      name: `Test User ${randomString}`,
      email,
      role: "sales",
    })

    if (insertError) {
      console.error("Error inserting user data:", insertError)
      // Continue anyway since the auth user was created
    }

    return NextResponse.json({
      message: "Test user created successfully",
      email,
      password,
      userId: authData.user.id,
    })
  } catch (error: any) {
    console.error("Error creating test user:", error)
    return NextResponse.json({ error: error.message || "Internal server error" }, { status: 500 })
  }
}
