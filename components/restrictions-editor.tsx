"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { useToast } from "@/hooks/use-toast"
import { Save, Plus, Trash2 } from "lucide-react"
import { createClient } from "@/lib/supabase/client"

interface RestrictionsEditorProps {
  agentName: string
  initialRestrictions?: any
}

export function RestrictionsEditor({ agentName, initialRestrictions = {} }: RestrictionsEditorProps) {
  console.log("RestrictionsEditor rendering with agentName:", agentName);
  console.log("initialRestrictions:", initialRestrictions);

  const [restrictions, setRestrictions] = useState({
    forbiddenTopics: initialRestrictions.forbiddenTopics || [],
    forbiddenActions: initialRestrictions.forbiddenActions || [],
    dataPrivacyRules: initialRestrictions.dataPrivacyRules || [],
    maxResponseLength: initialRestrictions.maxResponseLength || 2000,
    requireConfirmation: initialRestrictions.requireConfirmation !== false,
    customRestrictions: initialRestrictions.customRestrictions || "",
  })

  const [newTopic, setNewTopic] = useState("")
  const [newAction, setNewAction] = useState("")
  const [newPrivacyRule, setNewPrivacyRule] = useState("")

  const { toast } = useToast()
  const supabase = createClient()

  // Update restrictions when agent changes
  useEffect(() => {
    const fetchAgentRestrictions = async () => {
      try {
        console.log("Fetching restrictions for agent:", agentName);
        const { data } = await supabase
          .from("agent_settings")
          .select("restrictions")
          .eq("agent_name", agentName)
          .single()

        console.log("Fetched restrictions data:", data);
        if (data && data.restrictions) {
          setRestrictions({
            forbiddenTopics: data.restrictions.forbiddenTopics || [],
            forbiddenActions: data.restrictions.forbiddenActions || [],
            dataPrivacyRules: data.restrictions.dataPrivacyRules || [],
            maxResponseLength: data.restrictions.maxResponseLength || 2000,
            requireConfirmation: data.restrictions.requireConfirmation !== false,
            customRestrictions: data.restrictions.customRestrictions || "",
          })
        }
      } catch (error) {
        console.error("Error fetching agent restrictions:", error)
      }
    }

    if (agentName) {
      fetchAgentRestrictions()
    }
  }, [agentName, supabase])

  const handleSaveRestrictions = async () => {
    try {
      console.log("Saving restrictions:", restrictions);
      const { error } = await supabase
        .from("agent_settings")
        .update({ restrictions })
        .eq("agent_name", agentName)

      if (error) throw error

      toast({
        title: "Restrictions saved",
        description: "Agent restrictions have been saved successfully",
      })
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to save restrictions",
        variant: "destructive",
      })
    }
  }

  const addForbiddenTopic = () => {
    if (newTopic.trim() === "") return
    setRestrictions({
      ...restrictions,
      forbiddenTopics: [...restrictions.forbiddenTopics, newTopic.trim()],
    })
    setNewTopic("")
  }

  const removeForbiddenTopic = (index: number) => {
    const updatedTopics = [...restrictions.forbiddenTopics]
    updatedTopics.splice(index, 1)
    setRestrictions({ ...restrictions, forbiddenTopics: updatedTopics })
  }

  const addForbiddenAction = () => {
    if (newAction.trim() === "") return
    setRestrictions({
      ...restrictions,
      forbiddenActions: [...restrictions.forbiddenActions, newAction.trim()],
    })
    setNewAction("")
  }

  const removeForbiddenAction = (index: number) => {
    const updatedActions = [...restrictions.forbiddenActions]
    updatedActions.splice(index, 1)
    setRestrictions({ ...restrictions, forbiddenActions: updatedActions })
  }

  const addPrivacyRule = () => {
    if (newPrivacyRule.trim() === "") return
    setRestrictions({
      ...restrictions,
      dataPrivacyRules: [...restrictions.dataPrivacyRules, newPrivacyRule.trim()],
    })
    setNewPrivacyRule("")
  }

  const removePrivacyRule = (index: number) => {
    const updatedRules = [...restrictions.dataPrivacyRules]
    updatedRules.splice(index, 1)
    setRestrictions({ ...restrictions, dataPrivacyRules: updatedRules })
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Forbidden Topics</CardTitle>
          <CardDescription>Topics the agent should not discuss or engage with</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex space-x-2">
            <Input
              placeholder="Add a forbidden topic..."
              value={newTopic}
              onChange={(e) => setNewTopic(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && addForbiddenTopic()}
            />
            <Button onClick={addForbiddenTopic}>
              <Plus className="h-4 w-4" />
            </Button>
          </div>

          <div className="space-y-2">
            {restrictions.forbiddenTopics.map((topic, index) => (
              <div key={index} className="flex items-center justify-between bg-gray-100 dark:bg-gray-800 p-2 rounded">
                <span>{topic}</span>
                <Button variant="ghost" size="sm" onClick={() => removeForbiddenTopic(index)}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
            {restrictions.forbiddenTopics.length === 0 && (
              <p className="text-sm text-gray-500">No forbidden topics added yet</p>
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Forbidden Actions</CardTitle>
          <CardDescription>Actions the agent should not perform</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex space-x-2">
            <Input
              placeholder="Add a forbidden action..."
              value={newAction}
              onChange={(e) => setNewAction(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && addForbiddenAction()}
            />
            <Button onClick={addForbiddenAction}>
              <Plus className="h-4 w-4" />
            </Button>
          </div>

          <div className="space-y-2">
            {restrictions.forbiddenActions.map((action, index) => (
              <div key={index} className="flex items-center justify-between bg-gray-100 dark:bg-gray-800 p-2 rounded">
                <span>{action}</span>
                <Button variant="ghost" size="sm" onClick={() => removeForbiddenAction(index)}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
            {restrictions.forbiddenActions.length === 0 && (
              <p className="text-sm text-gray-500">No forbidden actions added yet</p>
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Data Privacy Rules</CardTitle>
          <CardDescription>Rules for handling sensitive data</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex space-x-2">
            <Input
              placeholder="Add a data privacy rule..."
              value={newPrivacyRule}
              onChange={(e) => setNewPrivacyRule(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && addPrivacyRule()}
            />
            <Button onClick={addPrivacyRule}>
              <Plus className="h-4 w-4" />
            </Button>
          </div>

          <div className="space-y-2">
            {restrictions.dataPrivacyRules.map((rule, index) => (
              <div key={index} className="flex items-center justify-between bg-gray-100 dark:bg-gray-800 p-2 rounded">
                <span>{rule}</span>
                <Button variant="ghost" size="sm" onClick={() => removePrivacyRule(index)}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
            {restrictions.dataPrivacyRules.length === 0 && (
              <p className="text-sm text-gray-500">No data privacy rules added yet</p>
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Additional Restrictions</CardTitle>
          <CardDescription>Configure other restrictions for the agent</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="maxResponseLength">Maximum Response Length (characters)</Label>
            <Input
              id="maxResponseLength"
              type="number"
              min={100}
              max={10000}
              value={restrictions.maxResponseLength}
              onChange={(e) => setRestrictions({ ...restrictions, maxResponseLength: parseInt(e.target.value) })}
            />
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              id="requireConfirmation"
              checked={restrictions.requireConfirmation}
              onCheckedChange={(checked) => setRestrictions({ ...restrictions, requireConfirmation: checked })}
            />
            <Label htmlFor="requireConfirmation">Require Confirmation for Critical Actions</Label>
          </div>

          <div className="space-y-2">
            <Label htmlFor="customRestrictions">Custom Restrictions</Label>
            <Textarea
              id="customRestrictions"
              placeholder="Enter any additional restrictions..."
              className="min-h-[100px]"
              value={restrictions.customRestrictions}
              onChange={(e) => setRestrictions({ ...restrictions, customRestrictions: e.target.value })}
            />
          </div>
        </CardContent>
        <CardFooter>
          <Button onClick={handleSaveRestrictions} className="ml-auto">
            <Save className="h-4 w-4 mr-2" />
            Save Restrictions
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}