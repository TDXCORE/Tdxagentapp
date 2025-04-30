export const supabaseConfig = {
  url: process.env.NEXT_PUBLIC_SUPABASE_URL || "",
  anonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "",
  serviceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY || "",
  jwtSecret: process.env.SUPABASE_JWT_SECRET || "",

  // Database schema configuration
  schema: {
    clients: "clients",
    interactions: "interactions",
    projects: "projects",
    meetings: "meetings",
    quotations: "quotations",
    contracts: "contracts",
    users: "users",
    agent_settings: "agent_settings",
  },

  // Storage bucket configuration
  storage: {
    documents: "documents",
    avatars: "avatars",
  },
}
