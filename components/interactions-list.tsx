import { ScrollArea } from "@/components/ui/scroll-area"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { formatDistanceToNow } from "date-fns"
import type { Interaction } from "@/lib/types"

interface InteractionsListProps {
  interactions: Interaction[]
}

export function InteractionsList({ interactions }: InteractionsListProps) {
  if (interactions.length === 0) {
    return <div className="text-center py-8 text-muted-foreground">No interactions found for this client.</div>
  }

  const getChannelIcon = (channel: string) => {
    switch (channel) {
      case "whatsapp":
        return "WA"
      case "email":
        return "EM"
      case "internal":
        return "IN"
      default:
        return "UN"
    }
  }

  return (
    <ScrollArea className="h-[500px] pr-4">
      <div className="space-y-6">
        {interactions.map((interaction) => (
          <div key={interaction.id} className="space-y-2">
            <div className="flex items-center gap-2">
              <Avatar className="h-8 w-8">
                <AvatarFallback className="bg-primary text-primary-foreground text-xs">
                  {getChannelIcon(interaction.channel)}
                </AvatarFallback>
              </Avatar>
              <div className="flex flex-col">
                <span className="text-sm font-medium">
                  {interaction.channel.charAt(0).toUpperCase() + interaction.channel.slice(1)}
                </span>
                <span className="text-xs text-muted-foreground">
                  {formatDistanceToNow(new Date(interaction.created_at), { addSuffix: true })}
                </span>
              </div>
            </div>

            <div className="ml-10 p-3 bg-muted rounded-md">
              <p className="text-sm">{interaction.message}</p>
            </div>

            {interaction.agent_response && (
              <div className="ml-10 p-3 bg-primary/10 rounded-md">
                <p className="text-sm">{interaction.agent_response}</p>
                {interaction.intent_detected && (
                  <p className="text-xs text-muted-foreground mt-1">Intent detected: {interaction.intent_detected}</p>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </ScrollArea>
  )
}
