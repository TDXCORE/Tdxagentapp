// Centralized route definitions
export const routes = {
  // Auth routes
  login: "/auth/login",
  register: "/auth/register",
  logout: "/auth/logout",

  // Dashboard routes
  dashboard: "/dashboard",
  clients: "/dashboard/clients",
  projects: "/dashboard/projects",
  inbox: "/dashboard/inbox",
  quotation: "/dashboard/quotation",
  agentChat: "/dashboard/agent-chat",
  prdGenerator: "/dashboard/prd-generator",
  meetings: "/dashboard/meetings",
  contracts: "/dashboard/contracts",
  settings: "/dashboard/settings",
}

// Helper function to check if a path is a protected route
export function isProtectedRoute(pathname: string): boolean {
  return (
    pathname.startsWith("/dashboard") ||
    pathname.startsWith("/clients") ||
    pathname.startsWith("/projects") ||
    pathname.startsWith("/inbox") ||
    pathname.startsWith("/quotation") ||
    pathname.startsWith("/agent-chat") ||
    pathname.startsWith("/prd-generator") ||
    pathname.startsWith("/meetings") ||
    pathname.startsWith("/contracts") ||
    pathname.startsWith("/settings")
  )
}

// Helper function to check if a path is an auth route
export function isAuthRoute(pathname: string): boolean {
  return pathname.startsWith("/auth")
}
