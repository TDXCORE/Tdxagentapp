import type { Metadata } from "next"
import { ChatBox } from "@/components/chat-box"
import { ClientList } from "@/components/client-list"
import { ClientDetails } from "@/components/client-details"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export const metadata: Metadata = {
  title: "Inbox | TDX Agent Platform",
  description: "WhatsApp conversations with clients",
}

export default function InboxPage() {
  // Mock data for clients
  const clientsWithLatestInteraction = [
    {
      id: "1",
      name: "Juan Pérez",
      company_name: "Tienda de Ropa JP",
      email: "juan.perez@example.com",
      phone: "+1234567890",
      status: "new",
      created_at: "2023-04-10T10:00:00Z",
      latest_message: "Tengo una tienda de ropa y necesito un sistema para gestionar inventario y ventas online.",
      latest_message_at: "2023-04-10T10:30:00Z",
      unread: 2
    },
    {
      id: "2",
      name: "María López",
      company_name: "Restaurante El Sabor",
      email: "maria.lopez@example.com",
      phone: "+0987654321",
      status: "qualified",
      created_at: "2023-04-09T14:00:00Z",
      latest_message: "Necesito una aplicación para gestionar reservas y pedidos en mi restaurante.",
      latest_message_at: "2023-04-09T15:20:00Z",
      unread: 0
    },
    {
      id: "3",
      name: "Carlos Rodríguez",
      company_name: "Consultora CR",
      email: "carlos.rodriguez@example.com",
      phone: "+1122334455",
      status: "converted",
      created_at: "2023-04-08T09:00:00Z",
      latest_message: "Gracias por la cotización, me parece bien. ¿Cuándo podemos empezar?",
      latest_message_at: "2023-04-08T11:45:00Z",
      unread: 1
    }
  ];

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