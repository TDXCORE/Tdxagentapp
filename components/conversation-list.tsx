import { formatDistanceToNow } from "date-fns"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"

interface Client {
  id: string
  name: string
  company: string
  avatar_url?: string
}

interface Conversation {
  id: string
  client: Client
  last_message: string
  last_message_at: string
  unread: number
  status: "active" | "pending" | "closed"
}

interface ConversationListProps {
  conversations: Conversation[]
}

export function ConversationList({ conversations }: ConversationListProps) {
  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-500"
      case "pending":
        return "bg-yellow-500"
      case "closed":
        return "bg-gray-500"
      default:
        return "bg-gray-500"
    }
  }

  if (conversations.length === 0) {
    return <div className="text-center py-8 text-gray-500">No conversations to display</div>
  }

  return (
    <div className="divide-y">
      {conversations.map((conversation) => (
        <div key={conversation.id} className="p-4 hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer">
          <div className="flex items-center gap-3">
            <div className="relative">
              <Avatar>
                <AvatarImage
                  src={conversation.client.avatar_url || "/placeholder.svg"}
                  alt={conversation.client.name}
                />
                <AvatarFallback>{getInitials(conversation.client.name)}</AvatarFallback>
              </Avatar>
              <span
                className={`absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-white ${getStatusColor(conversation.status)}`}
              />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex justify-between items-start">
                <p className="font-medium truncate">{conversation.client.name}</p>
                <p className="text-xs text-gray-500">
                  {formatDistanceToNow(new Date(conversation.last_message_at), { addSuffix: true })}
                </p>
              </div>
              <p className="text-sm text-gray-500 truncate">{conversation.client.company}</p>
              <p className="text-xs truncate">{conversation.last_message}</p>
            </div>
            {conversation.unread > 0 && <Badge className="ml-auto">{conversation.unread}</Badge>}
          </div>
        </div>
      ))}
    </div>
  )
}
