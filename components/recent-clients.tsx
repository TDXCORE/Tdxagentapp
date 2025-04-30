import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { formatDistanceToNow } from "date-fns"
import type { Client, ClientStatus } from "@/lib/supabase/schema"

interface RecentClientsProps {
  clients: Client[]
}

export function RecentClients({ clients }: RecentClientsProps) {
  const getStatusColor = (status: ClientStatus) => {
    switch (status) {
      case "new":
        return "bg-blue-500"
      case "qualified":
        return "bg-green-500"
      case "discarded":
        return "bg-red-500"
      case "converted":
        return "bg-purple-500"
      default:
        return "bg-gray-500"
    }
  }

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
  }

  if (clients.length === 0) {
    return <div className="text-center py-4 text-gray-500">No recent clients to display</div>
  }

  return (
    <div className="space-y-4">
      {clients.map((client) => (
        <div key={client.id} className="flex items-center gap-4">
          <Avatar className="h-10 w-10">
            <AvatarFallback className={getStatusColor(client.status)}>{getInitials(client.name)}</AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium">{client.name}</p>
            <p className="text-xs text-gray-500 truncate">{client.company_name || "No company"}</p>
          </div>
          <div className="flex flex-col items-end">
            <Badge variant={client.status === "discarded" ? "destructive" : "outline"}>
              {client.status.charAt(0).toUpperCase() + client.status.slice(1)}
            </Badge>
            <p className="text-xs text-gray-500">
              {formatDistanceToNow(new Date(client.created_at), { addSuffix: true })}
            </p>
          </div>
        </div>
      ))}
    </div>
  )
}
