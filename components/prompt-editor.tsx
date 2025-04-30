"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/hooks/use-toast"
import { Save, Plus, Trash2 } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import type { AgentSetting } from "@/lib/supabase/schema"

interface PromptEditorProps {
  initialPrompts: AgentSetting[]
}

export function PromptEditor({ initialPrompts }: PromptEditorProps) {
  const [prompts, setPrompts] = useState<AgentSetting[]>(initialPrompts)
  const [selectedPromptId, setSelectedPromptId] = useState<string | null>(
    initialPrompts.length > 0 ? initialPrompts[0].id : null,
  )
  const [editingPrompt, setEditingPrompt] = useState<AgentSetting | null>(
    initialPrompts.length > 0 ? initialPrompts[0] : null,
  )

  const { toast } = useToast()
  const supabase = createClient()

  const handleSelectPrompt = (id: string) => {
    const prompt = prompts.find((p) => p.id === id)
    if (prompt) {
      setSelectedPromptId(id)
      setEditingPrompt({ ...prompt })
    }
  }

  const handleCreateNewPrompt = async () => {
    try {
      const newPrompt: Omit<AgentSetting, "id" | "created_at" | "updated_at"> = {
        agent_type: "custom",
        prompt_template: "",
        model: "gpt-4o",
        temperature: 0.7,
        max_tokens: 2000,
      }

      const { data, error } = await supabase.from("agent_settings").insert(newPrompt).select().single()

      if (error) {
        throw error
      }

      setPrompts([...prompts, data])
      setSelectedPromptId(data.id)
      setEditingPrompt(data)

      toast({
        title: "Prompt created",
        description: "New prompt template has been created",
      })
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to create new prompt",
        variant: "destructive",
      })
    }
  }

  const handleSavePrompt = async () => {
    if (!editingPrompt) return

    try {
      const { error } = await supabase
        .from("agent_settings")
        .update({
          agent_type: editingPrompt.agent_type,
          prompt_template: editingPrompt.prompt_template,
          model: editingPrompt.model,
          temperature: editingPrompt.temperature,
          max_tokens: editingPrompt.max_tokens,
        })
        .eq("id", editingPrompt.id)

      if (error) {
        throw error
      }

      const updatedPrompts = prompts.map((p) => (p.id === editingPrompt.id ? editingPrompt : p))
      setPrompts(updatedPrompts)

      toast({
        title: "Prompt saved",
        description: "The prompt has been saved successfully",
      })
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to save prompt",
        variant: "destructive",
      })
    }
  }

  const handleDeletePrompt = async () => {
    if (!selectedPromptId) return

    try {
      const { error } = await supabase.from("agent_settings").delete().eq("id", selectedPromptId)

      if (error) {
        throw error
      }

      const updatedPrompts = prompts.filter((p) => p.id !== selectedPromptId)
      setPrompts(updatedPrompts)
      setSelectedPromptId(updatedPrompts.length > 0 ? updatedPrompts[0].id : null)
      setEditingPrompt(updatedPrompts.length > 0 ? updatedPrompts[0] : null)

      toast({
        title: "Prompt deleted",
        description: "The prompt has been deleted successfully",
      })
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to delete prompt",
        variant: "destructive",
      })
    }
  }

  return (
    <div className="grid grid-cols-12 gap-6">
      <div className="col-span-4">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium">Prompt Templates</h3>
          <Button variant="outline" size="sm" onClick={handleCreateNewPrompt}>
            <Plus className="h-4 w-4 mr-2" />
            New Prompt
          </Button>
        </div>

        <div className="space-y-2">
          {prompts.map((prompt) => (
            <Card
              key={prompt.id}
              className={`cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 ${
                selectedPromptId === prompt.id ? "border-primary" : ""
              }`}
              onClick={() => handleSelectPrompt(prompt.id)}
            >
              <CardHeader className="p-4">
                <CardTitle className="text-sm">{prompt.agent_type}</CardTitle>
                <CardDescription className="text-xs">Model: {prompt.model}</CardDescription>
              </CardHeader>
            </Card>
          ))}
        </div>
      </div>

      <div className="col-span-8">
        {editingPrompt ? (
          <Card>
            <CardHeader>
              <CardTitle>Edit Prompt</CardTitle>
              <CardDescription>Modify the prompt template for the selected agent</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="agentType">Agent Type</Label>
                <Select
                  value={editingPrompt.agent_type}
                  onValueChange={(value) => setEditingPrompt({ ...editingPrompt, agent_type: value })}
                >
                  <SelectTrigger id="agentType">
                    <SelectValue placeholder="Select agent type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="router">Router Agent</SelectItem>
                    <SelectItem value="prd">PRD Agent</SelectItem>
                    <SelectItem value="quotation">Quotation Agent</SelectItem>
                    <SelectItem value="contract">Contract Agent</SelectItem>
                    <SelectItem value="custom">Custom Agent</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="promptContent">Prompt Template</Label>
                <Textarea
                  id="promptContent"
                  className="min-h-[200px] font-mono"
                  value={editingPrompt.prompt_template}
                  onChange={(e) => setEditingPrompt({ ...editingPrompt, prompt_template: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="model">Model</Label>
                <Select
                  value={editingPrompt.model}
                  onValueChange={(value) => setEditingPrompt({ ...editingPrompt, model: value })}
                >
                  <SelectTrigger id="model">
                    <SelectValue placeholder="Select model" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="gpt-4o">GPT-4o</SelectItem>
                    <SelectItem value="gpt-4-turbo">GPT-4 Turbo</SelectItem>
                    <SelectItem value="gpt-3.5-turbo">GPT-3.5 Turbo</SelectItem>
                    <SelectItem value="claude-3-opus">Claude 3 Opus</SelectItem>
                    <SelectItem value="claude-3-sonnet">Claude 3 Sonnet</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="temperature">Temperature</Label>
                  <Input
                    id="temperature"
                    type="number"
                    min={0}
                    max={2}
                    step={0.1}
                    value={editingPrompt.temperature}
                    onChange={(e) =>
                      setEditingPrompt({ ...editingPrompt, temperature: Number.parseFloat(e.target.value) })
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="maxTokens">Max Tokens</Label>
                  <Input
                    id="maxTokens"
                    type="number"
                    min={100}
                    max={8000}
                    step={100}
                    value={editingPrompt.max_tokens}
                    onChange={(e) =>
                      setEditingPrompt({ ...editingPrompt, max_tokens: Number.parseInt(e.target.value) })
                    }
                  />
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button variant="destructive" onClick={handleDeletePrompt}>
                <Trash2 className="h-4 w-4 mr-2" />
                Delete
              </Button>
              <Button onClick={handleSavePrompt}>
                <Save className="h-4 w-4 mr-2" />
                Save Changes
              </Button>
            </CardFooter>
          </Card>
        ) : (
          <div className="h-full flex items-center justify-center border rounded-lg p-6">
            <div className="text-center">
              <p className="text-gray-500">Select a prompt template to edit or create a new one</p>
              <Button className="mt-4" variant="outline" onClick={handleCreateNewPrompt}>
                <Plus className="h-4 w-4 mr-2" />
                Create New Prompt
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
