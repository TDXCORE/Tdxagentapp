import type { Metadata } from "next"
import { ClientsTable } from "@/components/clients-table"

export const metadata: Metadata = {
  title: "Clients | TDX Agent Platform",
  description: "Manage your clients",
}

export default function ClientsPage() {
  // Mock data for clients with correct status types
  const clients = [
    {
      id: "1",
      name: "Juan Pérez",
      company_name: "Tienda de Ropa JP",
      email: "juan.perez@example.com",
      phone: "+1234567890",
      status: "new" as "new" | "qualified" | "converted" | "discarded",
      created_at: "2023-04-10T10:00:00Z"
    },
    {
      id: "2",
      name: "María López",
      company_name: "Restaurante El Sabor",
      email: "maria.lopez@example.com",
      phone: "+0987654321",
      status: "qualified" as "new" | "qualified" | "converted" | "discarded",
      created_at: "2023-04-09T14:00:00Z"
    },
    {
      id: "3",
      name: "Carlos Rodríguez",
      company_name: "Consultora CR",
      email: "carlos.rodriguez@example.com",
      phone: "+1122334455",
      status: "converted" as "new" | "qualified" | "converted" | "discarded",
      created_at: "2023-04-08T09:00:00Z"
    }
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Clientes</h1>
      <p className="text-muted-foreground">Gestión de clientes y leads</p>

      {clients && clients.length > 0 ? (
        <ClientsTable clients={clients} />
      ) : (
        <div className="text-center py-10 border rounded-lg">
          <h3 className="text-lg font-medium">No se encontraron clientes</h3>
          <p className="text-muted-foreground mt-1">Comienza añadiendo tu primer cliente</p>
        </div>
      )}
    </div>
  )
}