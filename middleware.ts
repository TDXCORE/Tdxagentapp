import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { createServerClient } from "@supabase/ssr"
import { isProtectedRoute, isAuthRoute, routes } from "@/lib/routes"

export async function middleware(req: NextRequest) {
  const res = NextResponse.next()
  const pathname = req.nextUrl.pathname

  try {
    // Create a Supabase client
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return req.cookies.get(name)?.value
          },
          set(name: string, value: string, options: any) {
            res.cookies.set({ name, value, ...options })
          },
          remove(name: string, options: any) {
            res.cookies.set({ name, value: "", ...options })
          },
        },
      },
    )

    // Skip middleware for static assets, API routes, and debug routes
    if (
      pathname.startsWith("/_next") ||
      pathname.startsWith("/favicon.ico") ||
      pathname.startsWith("/api/") ||
      pathname.startsWith("/debug-")
    ) {
      return res
    }

    // Handle legacy routes (redirect to dashboard versions)
    const legacyRouteRedirects = {
      "/inbox": routes.inbox,
      "/quotation": routes.quotation,
      "/agent-chat": routes.agentChat,
      "/prd-generator": routes.prdGenerator,
      "/clients": routes.clients,
      "/projects": routes.projects,
      "/meetings": routes.meetings,
      "/contracts": routes.contracts,
      "/settings": routes.settings,
    }

    // Check if the current path is a legacy route that needs redirection
    if (pathname in legacyRouteRedirects) {
      return NextResponse.redirect(
        new URL(legacyRouteRedirects[pathname as keyof typeof legacyRouteRedirects], req.url),
      )
    }

    // Root path handling - always redirect to login or dashboard based on auth status
    if (pathname === "/") {
      const { data, error } = await supabase.auth.getSession()

      if (error) {
        console.error("Session error in middleware:", error.message)
        return NextResponse.redirect(new URL(routes.login, req.url))
      }

      if (data.session) {
        return NextResponse.redirect(new URL(routes.dashboard, req.url))
      }

      return NextResponse.redirect(new URL(routes.login, req.url))
    }

    // Get session for protected routes
    if (isProtectedRoute(pathname)) {
      const { data, error } = await supabase.auth.getSession()

      if (error) {
        console.error("Session error in middleware:", error.message)
        // Store the original URL to redirect back after login
        const redirectUrl = new URL(routes.login, req.url)
        redirectUrl.searchParams.set("returnUrl", pathname)
        return NextResponse.redirect(redirectUrl)
      }

      if (!data.session) {
        // Store the original URL to redirect back after login
        const redirectUrl = new URL(routes.login, req.url)
        redirectUrl.searchParams.set("returnUrl", pathname)
        return NextResponse.redirect(redirectUrl)
      }
    }

    // Redirect authenticated users away from auth pages
    if (isAuthRoute(pathname) && pathname !== routes.logout) {
      const { data, error } = await supabase.auth.getSession()

      if (error) {
        console.error("Session error in middleware:", error.message)
        return res
      }

      if (data.session) {
        return NextResponse.redirect(new URL(routes.dashboard, req.url))
      }
    }

    // Continue with the request for all other cases
    return res
  } catch (error) {
    console.error("Middleware error:", error)
    // If there's an error, allow the request to continue
    return res
  }
}

// Run middleware on all routes
export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
}
