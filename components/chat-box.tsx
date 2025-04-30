"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { ChatAssignmentDialog } from "./chat-assignment-dialog"
import { useToast } from "@/hooks/use-toast"
import { Send } from "lucide-react"

type Message = {
  id: string
  content: string
  sender: "user" | "agent" | "system"
  timestamp: Date
}

export function ChatBox() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      content: "Hola, ¿en qué puedo ayudarte?",
      sender: "agent",
      timestamp: new Date(Date.now() - 1000 * 60 * 5),
    },
    {
      id: "2",
      content: "Estoy interesado en desarrollar una aplicación web para mi negocio.",
      sender: "user",
      timestamp: new Date(Date.now() - 1000 * 60 * 4),
    },
    {
      id: "3",
      content:
        "¡Excelente! ¿Podría proporcionarme más detalles sobre su negocio y qué funcionalidades necesita en la aplicación?",
      sender: "agent",
      timestamp: new Date(Date.now() - 1000 * 60 * 3),
    },
    {
      id: "4",
      content: "Tengo una tienda de ropa y necesito un sistema para gestionar inventario y ventas online.",
      sender: "user",
      timestamp: new Date(Date.now() - 1000 * 60 * 2),
    },
    {
      id: "5",
      content:
        "Entiendo. Podemos desarrollar una solución personalizada para su tienda. ¿Tiene alguna preferencia de diseño o funcionalidades específicas?",
      sender: "agent",
      timestamp: new Date(Date.now() - 1000 * 60 * 1),
    },
  ])
  const [newMessage, setNewMessage] = useState("")
  const { toast } = useToast()

  const handleSendMessage = () => {
    if (!newMessage.trim()) return

    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      content: newMessage,
      sender: "user",
      timestamp: new Date(),
    }
    setMessages([...messages, userMessage])
    setNewMessage("")

    // Simulate agent response after a delay
    setTimeout(() => {
      const agentMessage: Message = {
        id: (Date.now() + 1).toString(),
        content:
          "Gracias por la información. Nuestro equipo analizará su solicitud y le proporcionará una propuesta detallada pronto.",
        sender: "agent",
        timestamp: new Date(),
      }
      setMessages((prev) => [...prev, agentMessage])
    }, 1000)
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex justify-between items-center p-4 border-b">
        <div>
          <h3 className="font-medium">Cliente: Juan Pérez</h3>
          <p className="text-sm text-gray-500">WhatsApp: +1234567890</p>
        </div>
        <div className="flex gap-2">
          <ChatAssignmentDialog />
        </div>
      </div>

      <ScrollArea className="flex-1 p-4">
        <div className="space-y-4">
          {messages.map((message) => (
            <div key={message.id} className={`flex ${message.sender === "user" ? "justify-end" : "justify-start"}`}>
              <div
                className={`max-w-[80%] rounded-lg p-3 ${
                  message.sender === "user"
                    ? "bg-primary text-primary-foreground"
                    : message.sender === "system"
                      ? "bg-muted text-muted-foreground"
                      : "bg-secondary text-secondary-foreground"
                }`}
              >
                <p>{message.content}</p>
                <p className="text-xs opacity-70 mt-1">
                  {message.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                </p>
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>

      <div className="p-4 border-t">
        <form
          onSubmit={(e) => {
            e.preventDefault()
            handleSendMessage()
          }}
          className="flex gap-2"
        >
          <Input
            placeholder="Escriba un mensaje..."
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
          />
          <Button type="submit" size="icon">
            <Send className="h-4 w-4" />
          </Button>
        </form>
      </div>
    </div>
  )
}
