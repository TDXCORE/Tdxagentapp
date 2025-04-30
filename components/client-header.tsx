import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Edit, Mail, Phone, Building } from "lucide-react"
import type { Client } from "@/lib/types"

interface ClientHeaderProps {
  client: Client
}

export function ClientHeader({ client }: ClientHeaderProps) {
  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
  }

  const getStatusColor = (status: string) => {
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

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Avatar className="h-16 w-16">
            <AvatarFallback className="text-lg">{getInitials(client.name)}</AvatarFallback>
          </Avatar>
          <div>
            <h1 className="text-2xl font-bold">{client.name}</h1>
            <div className="flex items-center gap-4 mt-1">
              {client.company_name && (
                <div className="flex items-center text-sm text-muted-foreground">
                  <Building className="mr-1 h-4 w-4" />
                  {client.company_name}
                </div>
              )}
              <Badge variant="outline">
                <span className={`mr-1.5 h-2 w-2 rounded-full ${getStatusColor(client.status)}`}></span>
                {client.status.charAt(0).toUpperCase() + client.status.slice(1)}
              </Badge>
            </div>
          </div>
        </div>
        <Button variant="outline">
          <Edit className="mr-2 h-4 w-4" />
          Edit Client
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
        <div className="flex items-center">
          <Mail className="h-4 w-4 text-muted-foreground mr-2" />
          <span>{client.email || "No email provided"}</span>
        </div>
        <div className="flex items-center">
          <Phone className="h-4 w-4 text-muted-foreground mr-2" />
          <span>{client.phone || "No phone provided"}</span>
        </div>
      </div>
    </Card>
  )
}
