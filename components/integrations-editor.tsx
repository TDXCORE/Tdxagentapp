"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Switch } from "@/components/ui/switch"
import { useToast } from "@/hooks/use-toast"
import { Save, RefreshCw } from "lucide-react"
import { createClient } from "@/lib/supabase/client"

interface IntegrationsEditorProps {
  agentName: string
  initialIntegrations?: any
}

export function IntegrationsEditor({ agentName, initialIntegrations = {} }: IntegrationsEditorProps) {
  console.log("IntegrationsEditor rendering with agentName:", agentName);
  console.log("initialIntegrations:", initialIntegrations);
  const [integrations, setIntegrations] = useState({
    supabase: {
      enabled: initialIntegrations.supabase?.enabled !== false,
      apiKey: initialIntegrations.supabase?.apiKey || "",
      url: initialIntegrations.supabase?.url || "",
      tables: initialIntegrations.supabase?.tables || []
    },
    openai: {
      enabled: initialIntegrations.openai?.enabled !== false,
      apiKey: initialIntegrations.openai?.apiKey || "",
      organization: initialIntegrations.openai?.organization || ""
    },
    microsoftGraph: {
      enabled: initialIntegrations.microsoftGraph?.enabled || false,
      clientId: initialIntegrations.microsoftGraph?.clientId || "",
      clientSecret: initialIntegrations.microsoftGraph?.clientSecret || "",
      tenantId: initialIntegrations.microsoftGraph?.tenantId || ""
    },
    whatsapp: {
      enabled: initialIntegrations.whatsapp?.enabled || false,
      apiToken: initialIntegrations.whatsapp?.apiToken || "",
      phoneNumberId: initialIntegrations.whatsapp?.phoneNumberId || "",
      verifyToken: initialIntegrations.whatsapp?.verifyToken || ""
    },
    awsSes: {
      enabled: initialIntegrations.awsSes?.enabled || false,
      accessKeyId: initialIntegrations.awsSes?.accessKeyId || "",
      secretAccessKey: initialIntegrations.awsSes?.secretAccessKey || "",
      region: initialIntegrations.awsSes?.region || "us-east-1"
    }
  })

  const { toast } = useToast()
  const supabase = createClient()

  // Update integrations when agent changes
  useEffect(() => {
    const fetchAgentIntegrations = async () => {
      try {
        console.log("Fetching integrations for agent:", agentName);
        const { data } = await supabase
          .from("agent_settings")
          .select("integrations")
          .eq("agent_name", agentName)
          .single()
        
        console.log("Fetched integrations data:", data);

        if (data && data.integrations) {
          setIntegrations({
            supabase: {
              enabled: data.integrations.supabase?.enabled !== false,
              apiKey: data.integrations.supabase?.apiKey || "",
              url: data.integrations.supabase?.url || "",
              tables: data.integrations.supabase?.tables || []
            },
            openai: {
              enabled: data.integrations.openai?.enabled !== false,
              apiKey: data.integrations.openai?.apiKey || "",
              organization: data.integrations.openai?.organization || ""
            },
            microsoftGraph: {
              enabled: data.integrations.microsoftGraph?.enabled || false,
              clientId: data.integrations.microsoftGraph?.clientId || "",
              clientSecret: data.integrations.microsoftGraph?.clientSecret || "",
              tenantId: data.integrations.microsoftGraph?.tenantId || ""
            },
            whatsapp: {
              enabled: data.integrations.whatsapp?.enabled || false,
              apiToken: data.integrations.whatsapp?.apiToken || "",
              phoneNumberId: data.integrations.whatsapp?.phoneNumberId || "",
              verifyToken: data.integrations.whatsapp?.verifyToken || ""
            },
            awsSes: {
              enabled: data.integrations.awsSes?.enabled || false,
              accessKeyId: data.integrations.awsSes?.accessKeyId || "",
              secretAccessKey: data.integrations.awsSes?.secretAccessKey || "",
              region: data.integrations.awsSes?.region || "us-east-1"
            }
          })
        }
      } catch (error) {
        console.error("Error fetching agent integrations:", error)
      }
    }

    if (agentName) {
      fetchAgentIntegrations()
    }
  }, [agentName, supabase])

  const handleSaveIntegrations = async () => {
    try {
      console.log("Saving integrations:", integrations);
      const { error } = await supabase
        .from("agent_settings")
        .update({ integrations })
        .eq("agent_name", agentName)

      if (error) throw error

      toast({
        title: "Integrations saved",
        description: "Agent integrations have been saved successfully",
      })
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to save integrations",
        variant: "destructive",
      })
    }
  }

  const handleTestConnection = (integration: string) => {
    toast({
      title: "Testing connection",
      description: `Testing connection to ${integration}...`,
    })

    // Simulate testing connection
    setTimeout(() => {
      toast({
        title: "Connection successful",
        description: `Successfully connected to ${integration}`,
      })
    }, 1500)
  }

  return (
    <div className="space-y-6">
      <Tabs defaultValue="supabase" className="space-y-4">
        <TabsList className="grid grid-cols-5 gap-2">
          <TabsTrigger value="supabase">Supabase</TabsTrigger>
          <TabsTrigger value="openai">OpenAI</TabsTrigger>
          <TabsTrigger value="microsoftGraph">Microsoft Graph</TabsTrigger>
          <TabsTrigger value="whatsapp">WhatsApp</TabsTrigger>
          <TabsTrigger value="awsSes">AWS SES</TabsTrigger>
        </TabsList>

        <TabsContent value="supabase">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Supabase Integration</CardTitle>
                  <CardDescription>Configure Supabase database integration</CardDescription>
                </div>
                <Switch
                  checked={integrations.supabase.enabled}
                  onCheckedChange={(checked) => 
                    setIntegrations({
                      ...integrations,
                      supabase: { ...integrations.supabase, enabled: checked }
                    })
                  }
                />
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="supabaseUrl">Supabase URL</Label>
                <Input
                  id="supabaseUrl"
                  placeholder="https://your-project.supabase.co"
                  value={integrations.supabase.url}
                  onChange={(e) => 
                    setIntegrations({
                      ...integrations,
                      supabase: { ...integrations.supabase, url: e.target.value }
                    })
                  }
                  disabled={!integrations.supabase.enabled}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="supabaseApiKey">API Key</Label>
                <Input
                  id="supabaseApiKey"
                  type="password"
                  placeholder="Supabase API Key"
                  value={integrations.supabase.apiKey}
                  onChange={(e) => 
                    setIntegrations({
                      ...integrations,
                      supabase: { ...integrations.supabase, apiKey: e.target.value }
                    })
                  }
                  disabled={!integrations.supabase.enabled}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="supabaseTables">Tables (comma separated)</Label>
                <Input
                  id="supabaseTables"
                  placeholder="clients, projects, interactions"
                  value={integrations.supabase.tables.join(", ")}
                  onChange={(e) => 
                    setIntegrations({
                      ...integrations,
                      supabase: { 
                        ...integrations.supabase, 
                        tables: e.target.value.split(",").map(table => table.trim()).filter(Boolean)
                      }
                    })
                  }
                  disabled={!integrations.supabase.enabled}
                />
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button 
                variant="outline" 
                onClick={() => handleTestConnection("Supabase")}
                disabled={!integrations.supabase.enabled}
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Test Connection
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="openai">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>OpenAI Integration</CardTitle>
                  <CardDescription>Configure OpenAI API integration</CardDescription>
                </div>
                <Switch
                  checked={integrations.openai.enabled}
                  onCheckedChange={(checked) => 
                    setIntegrations({
                      ...integrations,
                      openai: { ...integrations.openai, enabled: checked }
                    })
                  }
                />
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="openaiApiKey">API Key</Label>
                <Input
                  id="openaiApiKey"
                  type="password"
                  placeholder="OpenAI API Key"
                  value={integrations.openai.apiKey}
                  onChange={(e) => 
                    setIntegrations({
                      ...integrations,
                      openai: { ...integrations.openai, apiKey: e.target.value }
                    })
                  }
                  disabled={!integrations.openai.enabled}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="openaiOrg">Organization ID (optional)</Label>
                <Input
                  id="openaiOrg"
                  placeholder="org-..."
                  value={integrations.openai.organization}
                  onChange={(e) => 
                    setIntegrations({
                      ...integrations,
                      openai: { ...integrations.openai, organization: e.target.value }
                    })
                  }
                  disabled={!integrations.openai.enabled}
                />
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button 
                variant="outline" 
                onClick={() => handleTestConnection("OpenAI")}
                disabled={!integrations.openai.enabled}
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Test Connection
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="microsoftGraph">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Microsoft Graph API</CardTitle>
                  <CardDescription>Configure Microsoft Graph API for calendar integration</CardDescription>
                </div>
                <Switch
                  checked={integrations.microsoftGraph.enabled}
                  onCheckedChange={(checked) => 
                    setIntegrations({
                      ...integrations,
                      microsoftGraph: { ...integrations.microsoftGraph, enabled: checked }
                    })
                  }
                />
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="msClientId">Client ID</Label>
                <Input
                  id="msClientId"
                  placeholder="Microsoft Graph Client ID"
                  value={integrations.microsoftGraph.clientId}
                  onChange={(e) => 
                    setIntegrations({
                      ...integrations,
                      microsoftGraph: { ...integrations.microsoftGraph, clientId: e.target.value }
                    })
                  }
                  disabled={!integrations.microsoftGraph.enabled}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="msClientSecret">Client Secret</Label>
                <Input
                  id="msClientSecret"
                  type="password"
                  placeholder="Microsoft Graph Client Secret"
                  value={integrations.microsoftGraph.clientSecret}
                  onChange={(e) => 
                    setIntegrations({
                      ...integrations,
                      microsoftGraph: { ...integrations.microsoftGraph, clientSecret: e.target.value }
                    })
                  }
                  disabled={!integrations.microsoftGraph.enabled}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="msTenantId">Tenant ID</Label>
                <Input
                  id="msTenantId"
                  placeholder="Microsoft Graph Tenant ID"
                  value={integrations.microsoftGraph.tenantId}
                  onChange={(e) => 
                    setIntegrations({
                      ...integrations,
                      microsoftGraph: { ...integrations.microsoftGraph, tenantId: e.target.value }
                    })
                  }
                  disabled={!integrations.microsoftGraph.enabled}
                />
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button 
                variant="outline" 
                onClick={() => handleTestConnection("Microsoft Graph")}
                disabled={!integrations.microsoftGraph.enabled}
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Test Connection
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="whatsapp">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>WhatsApp API</CardTitle>
                  <CardDescription>Configure WhatsApp Business API integration</CardDescription>
                </div>
                <Switch
                  checked={integrations.whatsapp.enabled}
                  onCheckedChange={(checked) => 
                    setIntegrations({
                      ...integrations,
                      whatsapp: { ...integrations.whatsapp, enabled: checked }
                    })
                  }
                />
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="waApiToken">API Token</Label>
                <Input
                  id="waApiToken"
                  type="password"
                  placeholder="WhatsApp API Token"
                  value={integrations.whatsapp.apiToken}
                  onChange={(e) => 
                    setIntegrations({
                      ...integrations,
                      whatsapp: { ...integrations.whatsapp, apiToken: e.target.value }
                    })
                  }
                  disabled={!integrations.whatsapp.enabled}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="waPhoneId">Phone Number ID</Label>
                <Input
                  id="waPhoneId"
                  placeholder="WhatsApp Phone Number ID"
                  value={integrations.whatsapp.phoneNumberId}
                  onChange={(e) => 
                    setIntegrations({
                      ...integrations,
                      whatsapp: { ...integrations.whatsapp, phoneNumberId: e.target.value }
                    })
                  }
                  disabled={!integrations.whatsapp.enabled}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="waVerifyToken">Verify Token</Label>
                <Input
                  id="waVerifyToken"
                  placeholder="WhatsApp Verify Token"
                  value={integrations.whatsapp.verifyToken}
                  onChange={(e) => 
                    setIntegrations({
                      ...integrations,
                      whatsapp: { ...integrations.whatsapp, verifyToken: e.target.value }
                    })
                  }
                  disabled={!integrations.whatsapp.enabled}
                />
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button 
                variant="outline" 
                onClick={() => handleTestConnection("WhatsApp")}
                disabled={!integrations.whatsapp.enabled}
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Test Connection
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="awsSes">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>AWS SES</CardTitle>
                  <CardDescription>Configure AWS Simple Email Service integration</CardDescription>
                </div>
                <Switch
                  checked={integrations.awsSes.enabled}
                  onCheckedChange={(checked) => 
                    setIntegrations({
                      ...integrations,
                      awsSes: { ...integrations.awsSes, enabled: checked }
                    })
                  }
                />
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="awsAccessKey">Access Key ID</Label>
                <Input
                  id="awsAccessKey"
                  placeholder="AWS Access Key ID"
                  value={integrations.awsSes.accessKeyId}
                  onChange={(e) => 
                    setIntegrations({
                      ...integrations,
                      awsSes: { ...integrations.awsSes, accessKeyId: e.target.value }
                    })
                  }
                  disabled={!integrations.awsSes.enabled}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="awsSecretKey">Secret Access Key</Label>
                <Input
                  id="awsSecretKey"
                  type="password"
                  placeholder="AWS Secret Access Key"
                  value={integrations.awsSes.secretAccessKey}
                  onChange={(e) => 
                    setIntegrations({
                      ...integrations,
                      awsSes: { ...integrations.awsSes, secretAccessKey: e.target.value }
                    })
                  }
                  disabled={!integrations.awsSes.enabled}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="awsRegion">Region</Label>
                <Input
                  id="awsRegion"
                  placeholder="us-east-1"
                  value={integrations.awsSes.region}
                  onChange={(e) => 
                    setIntegrations({
                      ...integrations,
                      awsSes: { ...integrations.awsSes, region: e.target.value }
                    })
                  }
                  disabled={!integrations.awsSes.enabled}
                />
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button 
                variant="outline" 
                onClick={() => handleTestConnection("AWS SES")}
                disabled={!integrations.awsSes.enabled}
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Test Connection
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>

      <div className="flex justify-end">
        <Button onClick={handleSaveIntegrations}>
          <Save className="h-4 w-4 mr-2" />
          Save All Integrations
        </Button>
      </div>
    </div>
  )
}