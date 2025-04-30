import { notFound } from "next/navigation"
import Link from "next/link"
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { ProjectsList } from "@/components/projects-list"
import { ArrowLeft, Mail, Phone, Building, Calendar, Edit, Plus } from "lucide-react"

export async function generateMetadata({ params }: { params: { id: string } }) {
  const supabase = createServerComponentClient({ cookies })
  const { data: client } = await supabase.from("clients").select("name").eq("id", params.id).single()

  if (!client) {
    return {
      title: "Client Not Found | TDX Agent Platform",
    }
  }

  return {
    title: `${client.name} | TDX Agent Platform`,
    description: `Client details for ${client.name}`,
  }
}

export default async function ClientDetailPage({ params }: { params: { id: string } }) {
  const supabase = createServerComponentClient({ cookies })

  // Fetch client details
  const { data: client } = await supabase.from("clients").select("*").eq("id", params.id).single()

  if (!client) {
    notFound()
  }

  // Fetch client projects
  const { data: projects } = await supabase
    .from("projects")
    .select("*")
    .eq("client_id", client.id)
    .order("created_at", { ascending: false })

  // Fetch client interactions
  const { data: interactions } = await supabase
    .from("interactions")
    .select("*")
    .eq("client_id", client.id)
    .order("created_at", { ascending: false })

  const getStatusColor = (status: string) => {
    switch (status) {
      case "new":
        return "bg-blue-500"
      case "qualified":
        return "bg-green-500"
      case "discarded":
        return "bg-red-500"
      case "converted":
        return "bg-purple-500"
      default:
        return "bg-gray-500"
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/clients">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Clients
            </Link>
          </Button>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline" size="sm" asChild>
            <Link href={`/clients/${client.id}/edit`}>
              <Edit className="h-4 w-4 mr-2" />
              Edit Client
            </Link>
          </Button>
          <Button size="sm" asChild>
            <Link href={`/projects/new?client=${client.id}`}>
              <Plus className="h-4 w-4 mr-2" />
              New Project
            </Link>
          </Button>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <div className="md:col-span-1 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex justify-between items-center">
                <span>{client.name}</span>
                <Badge variant="outline">
                  <span className={`mr-1.5 h-2 w-2 rounded-full ${getStatusColor(client.status)}`}></span>
                  {client.status.charAt(0).toUpperCase() + client.status.slice(1)}
                </Badge>
              </CardTitle>
              {client.company_name && (
                <CardDescription className="flex items-center">
                  <Building className="h-4 w-4 mr-2" />
                  {client.company_name}
                </CardDescription>
              )}
            </CardHeader>
            <CardContent className="space-y-4">
              {client.email && (
                <div className="flex items-center">
                  <Mail className="h-4 w-4 mr-2 text-muted-foreground" />
                  <a href={`mailto:${client.email}`} className="text-sm hover:underline">
                    {client.email}
                  </a>
                </div>
              )}

              {client.phone && (
                <div className="flex items-center">
                  <Phone className="h-4 w-4 mr-2 text-muted-foreground" />
                  <a href={`tel:${client.phone}`} className="text-sm hover:underline">
                    {client.phone}
                  </a>
                </div>
              )}

              <div className="flex items-center">
                <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
                <span className="text-sm">Client since {new Date(client.created_at).toLocaleDateString()}</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Client Statistics</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Projects</span>
                <span className="font-medium">{projects?.length || 0}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Interactions</span>
                <span className="font-medium">{interactions?.length || 0}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Last Contact</span>
                <span className="font-medium">
                  {interactions && interactions.length > 0
                    ? new Date(interactions[0].created_at).toLocaleDateString()
                    : "Never"}
                </span>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="md:col-span-2">
          <Tabs defaultValue="projects" className="space-y-4">
            <TabsList>
              <TabsTrigger value="projects">Projects</TabsTrigger>
              <TabsTrigger value="interactions">Interactions</TabsTrigger>
            </TabsList>

            <TabsContent value="projects" className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-medium">Client Projects</h3>
                <Button size="sm" asChild>
                  <Link href={`/projects/new?client=${client.id}`}>
                    <Plus className="h-4 w-4 mr-2" />
                    New Project
                  </Link>
                </Button>
              </div>

              {projects && projects.length > 0 ? (
                <ProjectsList projects={projects} />
              ) : (
                <Card>
                  <CardContent className="text-center py-8">
                    <p className="text-muted-foreground">No projects found for this client</p>
                    <Button className="mt-4" asChild>
                      <Link href={`/projects/new?client=${client.id}`}>Create First Project</Link>
                    </Button>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="interactions" className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-medium">Client Interactions</h3>
                <Button size="sm" asChild>
                  <Link href={`/inbox?client=${client.id}`}>
                    <Plus className="h-4 w-4 mr-2" />
                    New Interaction
                  </Link>
                </Button>
              </div>

              {interactions && interactions.length > 0 ? (
                <div className="space-y-4">
                  {interactions.map((interaction) => (
                    <Card key={interaction.id}>
                      <CardHeader className="pb-2">
                        <div className="flex justify-between">
                          <CardTitle className="text-sm font-medium">
                            {new Date(interaction.created_at).toLocaleString()}
                          </CardTitle>
                          <Badge variant="outline">{interaction.channel}</Badge>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-2">
                        <div className="bg-muted p-3 rounded-md">
                          <p className="text-sm">{interaction.message}</p>
                        </div>

                        {interaction.agent_response && (
                          <div className="bg-primary/10 p-3 rounded-md">
                            <p className="text-sm font-medium mb-1">Agent Response:</p>
                            <p className="text-sm">{interaction.agent_response}</p>
                          </div>
                        )}

                        {interaction.intent_detected && (
                          <div className="text-xs text-muted-foreground">
                            Intent detected: {interaction.intent_detected}
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <Card>
                  <CardContent className="text-center py-8">
                    <p className="text-muted-foreground">No interactions found for this client</p>
                    <Button className="mt-4" asChild>
                      <Link href={`/inbox?client=${client.id}`}>Start Conversation</Link>
                    </Button>
                  </CardContent>
                </Card>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  )
}
