import type { Metadata } from "next"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { PromptEditor } from "@/components/prompt-editor"
import { WorkflowEditor } from "@/components/workflow-editor"
import { LLMSettings } from "@/components/llm-settings"
import { createClient } from "@/lib/supabase/server"

export const metadata: Metadata = {
  title: "Agent Setup | TDX Agent Platform",
  description: "Configure AI agents and workflows",
}

export default async function AgentSetupPage() {
  const supabase = createClient()

  // Fetch agent settings
  const { data: agentSettings } = await supabase.from("agent_settings").select("*")

  // If no settings exist, create default ones
  if (!agentSettings || agentSettings.length === 0) {
    // Create default settings for router agent
    await supabase.from("agent_settings").insert({
      agent_type: "router",
      prompt_template: `You are a helpful assistant for TDX, a technology development company. 
      Your role is to greet the customer, understand their needs, and route them to the appropriate specialized agent.
      Ask for their name, company, and a brief description of what they're looking for.`,
      model: "gpt-4o",
      temperature: 0.7,
      max_tokens: 2000,
    })

    // Create default settings for prd agent
    await supabase.from("agent_settings").insert({
      agent_type: "prd",
      prompt_template: `You are a requirements gathering specialist for TDX. Your job is to ask detailed questions about the client's project to create a comprehensive PRD.
      Focus on understanding their business goals, technical requirements, user stories, and constraints.`,
      model: "gpt-4o",
      temperature: 0.7,
      max_tokens: 3000,
    })

    // Create default settings for quotation agent
    await supabase.from("agent_settings").insert({
      agent_type: "quotation",
      prompt_template: `You are a pricing specialist for TDX. Based on the project requirements, estimate the effort, timeline, and cost.
      Ask clarifying questions about project scope, complexity, and any specific technologies or integrations required.`,
      model: "gpt-4o",
      temperature: 0.7,
      max_tokens: 2000,
    })

    // Create default settings for contract agent
    await supabase.from("agent_settings").insert({
      agent_type: "contract",
      prompt_template: `You are a contract specialist for TDX. Your role is to explain contract terms, answer legal questions, and help prepare for the contract phase.`,
      model: "gpt-4o",
      temperature: 0.7,
      max_tokens: 2000,
    })

    // Fetch the newly created settings
    const { data: newSettings } = await supabase.from("agent_settings").select("*")
    const agentSettings = newSettings
  }

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-3xl font-bold">Agent Setup</h1>

      <Tabs defaultValue="prompts" className="space-y-6">
        <TabsList>
          <TabsTrigger value="prompts">Prompts</TabsTrigger>
          <TabsTrigger value="workflows">Workflows</TabsTrigger>
          <TabsTrigger value="llm">LLM Settings</TabsTrigger>
          <TabsTrigger value="functions">Functions</TabsTrigger>
        </TabsList>

        <TabsContent value="prompts" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Prompt Templates</CardTitle>
              <CardDescription>Configure base prompts for different agent types and intents</CardDescription>
            </CardHeader>
            <CardContent>
              <PromptEditor initialPrompts={agentSettings || []} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="workflows" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Agent Workflows</CardTitle>
              <CardDescription>Configure the flow between different agents</CardDescription>
            </CardHeader>
            <CardContent>
              <WorkflowEditor />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="llm" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>LLM Settings</CardTitle>
              <CardDescription>Configure parameters for language models</CardDescription>
            </CardHeader>
            <CardContent>
              <LLMSettings initialSettings={agentSettings || []} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="functions" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Function Chains</CardTitle>
              <CardDescription>Configure function chains and prompt chaining</CardDescription>
            </CardHeader>
            <CardContent>
              <p>Function chain editor will be displayed here</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
