import type { Metadata } from "next"
import { createClient } from "@/lib/supabase/server"
import { ChatBox } from "@/components/chat-box"
import { ClientList } from "@/components/client-list"
import { ClientDetails } from "@/components/client-details"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export const metadata: Metadata = {
  title: "Inbox | TDX Agent Platform",
  description: "WhatsApp conversations with clients",
}

export default async function InboxPage() {
  const supabase = createClient()

  // Fetch clients and their latest interactions
  const { data: clients } = await supabase
    .from("clients")
    .select(`
      *,
      interactions:interactions(
        id,
        message,
        agent_response,
        created_at
      )
    `)
    .order("created_at", { ascending: false })

  // Process clients to get the latest interaction for each
  const clientsWithLatestInteraction =
    clients?.map((client) => {
      const interactions = client.interactions as any[]
      const latestInteraction =
        interactions?.length > 0
          ? interactions.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())[0]
          : null

      return {
        ...client,
        latest_message: latestInteraction?.message || null,
        latest_message_at: latestInteraction?.created_at || client.created_at,
        unread: 0, // This would need to be calculated based on read status in a real app
        interactions: undefined, // Remove the full interactions array
      }
    }) || []

  return (
    <div className="flex flex-col h-full gap-4">
      <h1 className="text-3xl font-bold">Inbox</h1>

      <Tabs defaultValue="all" className="flex-1">
        <TabsList>
          <TabsTrigger value="all">Todos</TabsTrigger>
          <TabsTrigger value="new">Nuevos</TabsTrigger>
          <TabsTrigger value="assigned">Asignados</TabsTrigger>
          <TabsTrigger value="resolved">Resueltos</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="flex-1">
          <div className="grid grid-cols-12 gap-4 h-[calc(100vh-220px)]">
            <div className="col-span-3 overflow-y-auto border rounded-lg">
              <ClientList clients={clientsWithLatestInteraction} />
            </div>

            <div className="col-span-6 border rounded-lg flex flex-col">
              <ChatBox />
            </div>

            <div className="col-span-3 border rounded-lg overflow-y-auto">
              <ClientDetails />
            </div>
          </div>
        </TabsContent>

        <TabsContent value="new">
          <div className="h-[calc(100vh-220px)] flex items-center justify-center">
            <p>Los nuevos clientes se mostrarán aquí</p>
          </div>
        </TabsContent>

        <TabsContent value="assigned">
          <div className="h-[calc(100vh-220px)] flex items-center justify-center">
            <p>Las conversaciones asignadas se mostrarán aquí</p>
          </div>
        </TabsContent>

        <TabsContent value="resolved">
          <div className="h-[calc(100vh-220px)] flex items-center justify-center">
            <p>Las conversaciones resueltas se mostrarán aquí</p>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
