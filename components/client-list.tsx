"use client"

import { useState } from "react"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Search } from "lucide-react"

type Client = {
  id: string
  name: string
  phone: string
  latest_message: string | null
  latest_message_at: string
  unread: number
}

interface ClientListProps {
  clients: Client[]
}

export function ClientList({ clients = [] }: ClientListProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedClientId, setSelectedClientId] = useState<string | null>(null)

  const filteredClients = clients.filter((client) => client.name.toLowerCase().includes(searchTerm.toLowerCase()))

  return (
    <div className="flex flex-col h-full">
      <div className="p-4 border-b">
        <div className="relative">
          <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
          <Input
            placeholder="Buscar clientes..."
            className="pl-8"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <ScrollArea className="flex-1">
        {filteredClients.length > 0 ? (
          <div className="divide-y">
            {filteredClients.map((client) => (
              <div
                key={client.id}
                className={`p-4 cursor-pointer hover:bg-muted transition-colors ${
                  selectedClientId === client.id ? "bg-muted" : ""
                }`}
                onClick={() => setSelectedClientId(client.id)}
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-medium">{client.name}</h3>
                    <p className="text-sm text-gray-500">{client.phone}</p>
                  </div>
                  <div className="flex flex-col items-end">
                    <span className="text-xs text-gray-500">
                      {new Date(client.latest_message_at).toLocaleDateString()}
                    </span>
                    {client.unread > 0 && (
                      <span className="bg-primary text-primary-foreground text-xs rounded-full px-2 py-0.5 mt-1">
                        {client.unread}
                      </span>
                    )}
                  </div>
                </div>
                {client.latest_message && (
                  <p className="text-sm mt-1 truncate text-gray-600">{client.latest_message}</p>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="p-4 text-center text-gray-500">No se encontraron clientes</div>
        )}
      </ScrollArea>
    </div>
  )
}
