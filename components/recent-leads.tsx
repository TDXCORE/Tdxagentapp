import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { formatDistanceToNow } from "date-fns"

interface Lead {
  id: string
  client_name: string
  company: string
  status: "new" | "qualified" | "disqualified" | "converted"
  created_at: string
}

interface RecentLeadsProps {
  leads: Lead[]
}

export function RecentLeads({ leads }: RecentLeadsProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case "new":
        return "bg-blue-500"
      case "qualified":
        return "bg-green-500"
      case "disqualified":
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

  if (leads.length === 0) {
    return <div className="text-center py-4 text-gray-500">No recent leads to display</div>
  }

  return (
    <div className="space-y-4">
      {leads.map((lead) => (
        <div key={lead.id} className="flex items-center gap-4">
          <Avatar className="h-10 w-10">
            <AvatarFallback className={getStatusColor(lead.status)}>{getInitials(lead.client_name)}</AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium">{lead.client_name}</p>
            <p className="text-xs text-gray-500 truncate">{lead.company}</p>
          </div>
          <div className="flex flex-col items-end">
            <Badge variant={lead.status === "disqualified" ? "destructive" : "outline"}>
              {lead.status.charAt(0).toUpperCase() + lead.status.slice(1)}
            </Badge>
            <p className="text-xs text-gray-500">
              {formatDistanceToNow(new Date(lead.created_at), { addSuffix: true })}
            </p>
          </div>
        </div>
      ))}
    </div>
  )
}
