"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Switch } from "@/components/ui/switch"
import { useToast } from "@/hooks/use-toast"
import { Save, Plus } from "lucide-react"
import { createClient } from "@/lib/supabase/client"

interface BehaviorEditorProps {
  agentName: string
  initialBehavior?: any
}

export function BehaviorEditor({ agentName, initialBehavior = {} }: BehaviorEditorProps) {
  console.log("BehaviorEditor rendering with agentName:", agentName);
  console.log("initialBehavior:", initialBehavior);

  const [behavior, setBehavior] = useState({
    personality: initialBehavior.personality || "helpful",
    tone: initialBehavior.tone || "professional",
    verbosity: initialBehavior.verbosity || "balanced",
    creativity: initialBehavior.creativity || "balanced",
    customInstructions: initialBehavior.customInstructions || "",
    memoryEnabled: initialBehavior.memoryEnabled !== false,
    contextWindow: initialBehavior.contextWindow || 10,
    responseFormat: initialBehavior.responseFormat || "markdown",
  })

  const { toast } = useToast()
  const supabase = createClient()

  // Update behavior when agent changes
  useEffect(() => {
    const fetchAgentBehavior = async () => {
      try {
        console.log("Fetching behavior for agent:", agentName);
        const { data } = await supabase
          .from("agent_settings")
          .select("behavior")
          .eq("agent_name", agentName)
          .single()

        console.log("Fetched behavior data:", data);
        if (data && data.behavior) {
          setBehavior({
            personality: data.behavior.personality || "helpful",
            tone: data.behavior.tone || "professional",
            verbosity: data.behavior.verbosity || "balanced",
            creativity: data.behavior.creativity || "balanced",
            customInstructions: data.behavior.customInstructions || "",
            memoryEnabled: data.behavior.memoryEnabled !== false,
            contextWindow: data.behavior.contextWindow || 10,
            responseFormat: data.behavior.responseFormat || "markdown",
          })
        }
      } catch (error) {
        console.error("Error fetching agent behavior:", error)
      }
    }

    if (agentName) {
      fetchAgentBehavior()
    }
  }, [agentName, supabase])

  const handleSaveBehavior = async () => {
    try {
      console.log("Saving behavior:", behavior);
      const { error } = await supabase
        .from("agent_settings")
        .update({ behavior })
        .eq("agent_name", agentName)

      if (error) throw error

      toast({
        title: "Behavior saved",
        description: "Agent behavior settings have been saved successfully",
      })
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to save behavior settings",
        variant: "destructive",
      })
    }
  }

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <h3 className="text-lg font-medium">Agent Personality</h3>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="personality">Personality</Label>
            <Select
              value={behavior.personality}
              onValueChange={(value) => setBehavior({ ...behavior, personality: value })}
            >
              <SelectTrigger id="personality">
                <SelectValue placeholder="Select personality" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="helpful">Helpful</SelectItem>
                <SelectItem value="direct">Direct</SelectItem>
                <SelectItem value="friendly">Friendly</SelectItem>
                <SelectItem value="analytical">Analytical</SelectItem>
                <SelectItem value="empathetic">Empathetic</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="tone">Tone</Label>
            <Select
              value={behavior.tone}
              onValueChange={(value) => setBehavior({ ...behavior, tone: value })}
            >
              <SelectTrigger id="tone">
                <SelectValue placeholder="Select tone" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="professional">Professional</SelectItem>
                <SelectItem value="casual">Casual</SelectItem>
                <SelectItem value="formal">Formal</SelectItem>
                <SelectItem value="technical">Technical</SelectItem>
                <SelectItem value="conversational">Conversational</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="verbosity">Verbosity</Label>
            <Select
              value={behavior.verbosity}
              onValueChange={(value) => setBehavior({ ...behavior, verbosity: value })}
            >
              <SelectTrigger id="verbosity">
                <SelectValue placeholder="Select verbosity" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="concise">Concise</SelectItem>
                <SelectItem value="balanced">Balanced</SelectItem>
                <SelectItem value="detailed">Detailed</SelectItem>
                <SelectItem value="comprehensive">Comprehensive</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="creativity">Creativity</Label>
            <Select
              value={behavior.creativity}
              onValueChange={(value) => setBehavior({ ...behavior, creativity: value })}
            >
              <SelectTrigger id="creativity">
                <SelectValue placeholder="Select creativity level" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="factual">Factual</SelectItem>
                <SelectItem value="balanced">Balanced</SelectItem>
                <SelectItem value="creative">Creative</SelectItem>
                <SelectItem value="innovative">Innovative</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="customInstructions">Custom Instructions</Label>
          <Textarea
            id="customInstructions"
            placeholder="Enter additional instructions for the agent's behavior..."
            className="min-h-[100px]"
            value={behavior.customInstructions}
            onChange={(e) => setBehavior({ ...behavior, customInstructions: e.target.value })}
          />
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-medium">Memory & Context</h3>
        <div className="flex items-center space-x-2">
          <Switch
            id="memoryEnabled"
            checked={behavior.memoryEnabled}
            onCheckedChange={(checked) => setBehavior({ ...behavior, memoryEnabled: checked })}
          />
          <Label htmlFor="memoryEnabled">Enable Memory</Label>
        </div>

        <div className="space-y-2">
          <Label htmlFor="contextWindow">Context Window (messages)</Label>
          <Input
            id="contextWindow"
            type="number"
            min={1}
            max={50}
            value={behavior.contextWindow}
            onChange={(e) => setBehavior({ ...behavior, contextWindow: parseInt(e.target.value) })}
          />
          <p className="text-sm text-gray-500">Number of previous messages to include in context</p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="responseFormat">Response Format</Label>
          <Select
            value={behavior.responseFormat}
            onValueChange={(value) => setBehavior({ ...behavior, responseFormat: value })}
          >
            <SelectTrigger id="responseFormat">
              <SelectValue placeholder="Select response format" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="text">Plain Text</SelectItem>
              <SelectItem value="markdown">Markdown</SelectItem>
              <SelectItem value="html">HTML</SelectItem>
              <SelectItem value="json">JSON</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="flex justify-end">
        <Button onClick={handleSaveBehavior}>
          <Save className="h-4 w-4 mr-2" />
          Save Behavior
        </Button>
      </div>
    </div>
  )
}