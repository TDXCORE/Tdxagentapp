import type { Metadata } from "next"
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { ClientsTable } from "@/components/clients-table"

export const metadata: Metadata = {
  title: "Clients | TDX Agent Platform",
  description: "Manage your clients",
}

export default async function ClientsPage() {
  const supabase = createServerComponentClient({ cookies })

  // Fetch all clients
  const { data: clients } = await supabase.from("clients").select("*").order("created_at", { ascending: false })

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Clients</h1>
      <p className="text-muted-foreground">Manage your clients and their information</p>

      {clients && clients.length > 0 ? (
        <ClientsTable clients={clients} />
      ) : (
        <div className="text-center py-10 border rounded-lg">
          <h3 className="text-lg font-medium">No clients found</h3>
          <p className="text-muted-foreground mt-1">Get started by adding your first client</p>
        </div>
      )}
    </div>
  )
}
