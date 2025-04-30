"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"
import { SendHorizontal } from "lucide-react"

export default function AgentChatPage() {
  const [message, setMessage] = useState("")
  const [chatHistory, setChatHistory] = useState<Array<{ role: string; content: string; timestamp: Date }>>([
    {
      role: "agent",
      content: "Hello! I'm the TDX AI assistant. How can I help you today?",
      timestamp: new Date(),
    },
  ])
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!message.trim()) return

    // Add user message to chat
    const userMessage = { role: "user", content: message, timestamp: new Date() }
    setChatHistory((prev) => [...prev, userMessage])

    // Clear input
    setMessage("")
    setIsLoading(true)

    try {
      // Call API to get agent response
      const response = await fetch("/api/agent-chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message }),
      })

      if (!response.ok) {
        throw new Error("Failed to get response from agent")
      }

      const data = await response.json()

      // Add agent response to chat
      setChatHistory((prev) => [...prev, { role: "agent", content: data.response, timestamp: new Date() }])

      // Show toast with detected intent if available
      if (data.intent) {
        toast({
          title: "Intent Detected",
          description: `The agent detected: ${data.intent}`,
        })
      }
    } catch (error) {
      console.error("Error:", error)

      // Fallback to simulated response in case of error
      setTimeout(() => {
        setChatHistory((prev) => [
          ...prev,
          {
            role: "agent",
            content: "I apologize, but I'm having trouble connecting to my backend. Could you please try again later?",
            timestamp: new Date(),
          },
        ])
      }, 1000)

      toast({
        title: "Error",
        description: "Failed to get response from agent",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex flex-col h-[calc(100vh-32px)]">
      <h1 className="text-3xl font-bold mb-6">Chat con Agente</h1>

      <Card className="flex-1 flex flex-col">
        <CardContent className="p-6 flex-1 flex flex-col">
          <div className="flex-1 overflow-y-auto mb-4 space-y-4">
            {chatHistory.map((message, index) => (
              <div key={index} className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}>
                <div
                  className={`max-w-[80%] rounded-lg px-4 py-2 ${
                    message.role === "user" ? "bg-primary text-primary-foreground" : "bg-muted"
                  }`}
                >
                  <p className="whitespace-pre-wrap">{message.content}</p>
                  <span className="text-xs opacity-70 block mt-1">{message.timestamp.toLocaleTimeString()}</span>
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="max-w-[80%] rounded-lg px-4 py-2 bg-muted">
                  <p className="animate-pulse">Escribiendo...</p>
                </div>
              </div>
            )}
          </div>

          <form onSubmit={handleSendMessage} className="flex gap-2">
            <input
              type="text"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Escribe tu mensaje..."
              className="flex-1 px-4 py-2 rounded-md border border-input bg-background"
              disabled={isLoading}
            />
            <Button type="submit" disabled={isLoading || !message.trim()}>
              <SendHorizontal className="h-5 w-5" />
              <span className="sr-only">Enviar</span>
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}