"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface AgentSelectorProps {
  agents: string[]
}

export function AgentSelector({ agents }: AgentSelectorProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [selectedAgent, setSelectedAgent] = useState<string>(searchParams.get("agent") || agents[0] || "")

  useEffect(() => {
    // Update URL when agent changes
    if (selectedAgent) {
      const params = new URLSearchParams(searchParams.toString())
      params.set("agent", selectedAgent)
      router.push(`?${params.toString()}`)
    }
  }, [selectedAgent, router, searchParams])

  const handleAgentChange = (value: string) => {
    setSelectedAgent(value)
  }

  return (
    <div className="w-64">
      <Select value={selectedAgent} onValueChange={handleAgentChange}>
        <SelectTrigger>
          <SelectValue placeholder="Seleccionar agente" />
        </SelectTrigger>
        <SelectContent>
          {agents.map((agent) => (
            <SelectItem key={agent} value={agent}>
              {agent.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase())}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}