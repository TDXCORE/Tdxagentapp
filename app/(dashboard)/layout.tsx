import type { ReactNode } from "react"
import { redirect } from "next/navigation"
import { cookies } from "next/headers"
import { createServerClient } from "@supabase/ssr"
import { Sidebar } from "@/components/sidebar"

export default async function DashboardLayout({ children }: { children: ReactNode }) {
  try {
    // Create a Supabase client
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

    // Check session
    const { data, error } = await supabase.auth.getSession()

    if (error) {
      console.error("Session error in dashboard layout:", error.message)
      // Instead of using redirect, return a redirect response
      return redirect("/auth/login")
    }

    if (!data.session) {
      console.log("No session found in dashboard layout, redirecting to login")
      // Instead of using redirect, return a redirect response
      return redirect("/auth/login")
    }

    // If we have a session, render the dashboard layout
    return (
      <div className="flex h-screen overflow-hidden">
        <Sidebar />
        <main className="flex-1 overflow-y-auto p-6">{children}</main>
      </div>
    )
  } catch (error) {
    console.error("Error in dashboard layout:", error)
    // If there's an error checking the session, redirect to login
    return redirect("/auth/login")
  }
}
