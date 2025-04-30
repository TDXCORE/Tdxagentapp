import { NextResponse } from "next/server"
import { routes } from "@/lib/routes"

export async function GET() {
  try {
    // Get all registered routes
    const registeredRoutes = Object.entries(routes).map(([key, path]) => ({
      name: key,
      path,
    }))

    // Legacy routes that should be redirected
    const legacyRoutes = [
      { from: "/inbox", to: routes.inbox },
      { from: "/quotation", to: routes.quotation },
      { from: "/agent-chat", to: routes.agentChat },
      { from: "/prd-generator", to: routes.prdGenerator },
    ]

    return NextResponse.json({
      success: true,
      registeredRoutes,
      legacyRoutes,
      routeGroups: ["(dashboard)", "(auth)"],
      env: {
        NODE_ENV: process.env.NODE_ENV,
        NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL ? "Set" : "Not set",
      },
    })
  } catch (error) {
    console.error("Error in debug routes:", error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
