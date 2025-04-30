"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import { Switch } from "@/components/ui/switch"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/hooks/use-toast"
import { Save, RotateCcw } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import type { AgentSetting } from "@/lib/supabase/schema"

interface LLMSettingsProps {
  initialSettings: AgentSetting[]
}

export function LLMSettings({ initialSettings }: LLMSettingsProps) {
  const [settings, setSettings] = useState({
    defaultModel: initialSettings.find((s) => s.agent_type === "router")?.model || "gpt-4o",
    temperature: initialSettings.find((s) => s.agent_type === "router")?.temperature || 0.7,
    maxTokens: initialSettings.find((s) => s.agent_type === "router")?.max_tokens || 2000,
    topP: 1,
    frequencyPenalty: 0,
    presencePenalty: 0,
    streamResponse: true,
  })

  const { toast } = useToast()
  const supabase = createClient()

  const handleSaveSettings = async () => {
    try {
      // Update all agent settings with the new default values
      for (const setting of initialSettings) {
        await supabase
          .from("agent_settings")
          .update({
            model: settings.defaultModel,
            temperature: settings.temperature,
            max_tokens: settings.maxTokens,
          })
          .eq("id", setting.id)
      }

      toast({
        title: "Settings saved",
        description: "LLM settings have been saved successfully",
      })
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to save settings",
        variant: "destructive",
      })
    }
  }

  const handleResetDefaults = () => {
    setSettings({
      defaultModel: "gpt-4o",
      temperature: 0.7,
      maxTokens: 2000,
      topP: 1,
      frequencyPenalty: 0,
      presencePenalty: 0,
      streamResponse: true,
    })

    toast({
      title: "Settings reset",
      description: "LLM settings have been reset to defaults",
    })
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Model Selection</CardTitle>
          <CardDescription>Choose the language model to use for each agent type</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="model">Default Model</Label>
            <Select
              value={settings.defaultModel}
              onValueChange={(value) => setSettings({ ...settings, defaultModel: value })}
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
            {initialSettings.map((setting) => (
              <div key={setting.id} className="space-y-2">
                <Label>{setting.agent_type.charAt(0).toUpperCase() + setting.agent_type.slice(1)} Agent Model</Label>
                <Select defaultValue={setting.model}>
                  <SelectTrigger>
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
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Generation Parameters</CardTitle>
          <CardDescription>Configure the parameters for text generation</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <div className="flex justify-between">
              <Label htmlFor="temperature">Temperature: {settings.temperature}</Label>
              <span className="text-sm text-gray-500">Controls randomness</span>
            </div>
            <Slider
              id="temperature"
              min={0}
              max={2}
              step={0.1}
              value={[settings.temperature]}
              onValueChange={(value) => setSettings({ ...settings, temperature: value[0] })}
            />
            <div className="flex justify-between text-xs text-gray-500">
              <span>Deterministic (0)</span>
              <span>Balanced (1)</span>
              <span>Random (2)</span>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between">
              <Label htmlFor="maxTokens">Max Tokens: {settings.maxTokens}</Label>
              <span className="text-sm text-gray-500">Maximum response length</span>
            </div>
            <Slider
              id="maxTokens"
              min={100}
              max={4000}
              step={100}
              value={[settings.maxTokens]}
              onValueChange={(value) => setSettings({ ...settings, maxTokens: value[0] })}
            />
            <div className="flex justify-between text-xs text-gray-500">
              <span>Short (100)</span>
              <span>Medium (2000)</span>
              <span>Long (4000)</span>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between">
              <Label htmlFor="topP">Top P: {settings.topP}</Label>
              <span className="text-sm text-gray-500">Controls diversity</span>
            </div>
            <Slider
              id="topP"
              min={0.1}
              max={1}
              step={0.1}
              value={[settings.topP]}
              onValueChange={(value) => setSettings({ ...settings, topP: value[0] })}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="frequencyPenalty">Frequency Penalty: {settings.frequencyPenalty}</Label>
              <Slider
                id="frequencyPenalty"
                min={-2}
                max={2}
                step={0.1}
                value={[settings.frequencyPenalty]}
                onValueChange={(value) => setSettings({ ...settings, frequencyPenalty: value[0] })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="presencePenalty">Presence Penalty: {settings.presencePenalty}</Label>
              <Slider
                id="presencePenalty"
                min={-2}
                max={2}
                step={0.1}
                value={[settings.presencePenalty]}
                onValueChange={(value) => setSettings({ ...settings, presencePenalty: value[0] })}
              />
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              id="streamResponse"
              checked={settings.streamResponse}
              onCheckedChange={(checked) => setSettings({ ...settings, streamResponse: checked })}
            />
            <Label htmlFor="streamResponse">Stream Response</Label>
          </div>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button variant="outline" onClick={handleResetDefaults}>
            <RotateCcw className="h-4 w-4 mr-2" />
            Reset to Defaults
          </Button>
          <Button onClick={handleSaveSettings}>
            <Save className="h-4 w-4 mr-2" />
            Save Settings
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}
