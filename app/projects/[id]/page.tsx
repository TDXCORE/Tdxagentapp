import { notFound } from "next/navigation"
import Link from "next/link"
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Calendar, Edit, FileText, DollarSign, FileCheck, Plus } from "lucide-react"

export async function generateMetadata({ params }: { params: { id: string } }) {
  const supabase = createServerComponentClient({ cookies })
  const { data: project } = await supabase.from("projects").select("title").eq("id", params.id).single()

  if (!project) {
    return {
      title: "Project Not Found | TDX Agent Platform",
    }
  }

  return {
    title: `${project.title} | TDX Agent Platform`,
    description: `Project details for ${project.title}`,
  }
}

export default async function ProjectDetailPage({ params }: { params: { id: string } }) {
  const supabase = createServerComponentClient({ cookies })

  // Fetch project details with client information
  const { data: project } = await supabase
    .from("projects")
    .select("*, clients(id, name, company_name)")
    .eq("id", params.id)
    .single()

  if (!project) {
    notFound()
  }

  // Fetch project meetings
  const { data: meetings } = await supabase
    .from("meetings")
    .select("*")
    .eq("project_id", project.id)
    .order("scheduled_at", { ascending: true })

  // Fetch project quotations
  const { data: quotations } = await supabase
    .from("quotations")
    .select("*")
    .eq("project_id", project.id)
    .order("created_at", { ascending: false })

  // Fetch project contracts
  const { data: contracts } = await supabase
    .from("contracts")
    .select("*")
    .eq("project_id", project.id)
    .order("created_at", { ascending: false })

  const getStatusColor = (status: string) => {
    switch (status) {
      case "draft":
        return "bg-gray-500"
      case "active":
        return "bg-green-500"
      case "completed":
        return "bg-blue-500"
      case "canceled":
        return "bg-red-500"
      default:
        return "bg-gray-500"
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/projects">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Projects
            </Link>
          </Button>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline" size="sm" asChild>
            <Link href={`/projects/${project.id}/edit`}>
              <Edit className="h-4 w-4 mr-2" />
              Edit Project
            </Link>
          </Button>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <div className="md:col-span-1 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex justify-between items-center">
                <span>{project.title}</span>
                <Badge variant="outline">
                  <span className={`mr-1.5 h-2 w-2 rounded-full ${getStatusColor(project.status)}`}></span>
                  {project.status.charAt(0).toUpperCase() + project.status.slice(1)}
                </Badge>
              </CardTitle>
              {project.clients && (
                <CardDescription>
                  Client:{" "}
                  <Link href={`/clients/${project.clients.id}`} className="hover:underline">
                    {project.clients.name}
                  </Link>
                  {project.clients.company_name && ` (${project.clients.company_name})`}
                </CardDescription>
              )}
            </CardHeader>
            <CardContent className="space-y-4">
              {project.description && (
                <div>
                  <h4 className="text-sm font-medium mb-1">Description</h4>
                  <p className="text-sm text-muted-foreground">{project.description}</p>
                </div>
              )}

              {(project.start_date || project.end_date) && (
                <div>
                  <h4 className="text-sm font-medium mb-1">Timeline</h4>
                  <div className="flex items-center">
                    <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
                    <span className="text-sm">
                      {project.start_date && project.end_date
                        ? `${new Date(project.start_date).toLocaleDateString()} - ${new Date(project.end_date).toLocaleDateString()}`
                        : project.start_date
                          ? `Starts on ${new Date(project.start_date).toLocaleDateString()}`
                          : `Due by ${new Date(project.end_date!).toLocaleDateString()}`}
                    </span>
                  </div>
                </div>
              )}

              <div>
                <h4 className="text-sm font-medium mb-1">Created</h4>
                <div className="flex items-center">
                  <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
                  <span className="text-sm">{new Date(project.created_at).toLocaleDateString()}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Project Statistics</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Meetings</span>
                <span className="font-medium">{meetings?.length || 0}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Quotations</span>
                <span className="font-medium">{quotations?.length || 0}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Contracts</span>
                <span className="font-medium">{contracts?.length || 0}</span>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="md:col-span-2">
          <Tabs defaultValue="documents" className="space-y-4">
            <TabsList>
              <TabsTrigger value="documents">Documents</TabsTrigger>
              <TabsTrigger value="meetings">Meetings</TabsTrigger>
            </TabsList>

            <TabsContent value="documents" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex justify-between items-center">
                    <span>Project Requirements Document</span>
                    <Button size="sm" asChild>
                      <Link href={`/projects/${project.id}/prd`}>
                        <FileText className="h-4 w-4 mr-2" />
                        {project.prd_document_url ? "View PRD" : "Generate PRD"}
                      </Link>
                    </Button>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {project.prd_document_url ? (
                    <div className="flex items-center">
                      <FileText className="h-5 w-5 mr-2 text-muted-foreground" />
                      <a
                        href={project.prd_document_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm hover:underline"
                      >
                        View Project Requirements Document
                      </a>
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">No PRD has been generated for this project yet.</p>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex justify-between items-center">
                    <span>Quotations</span>
                    <Button size="sm" asChild>
                      <Link href={`/projects/${project.id}/quotation`}>
                        <DollarSign className="h-4 w-4 mr-2" />
                        Create Quotation
                      </Link>
                    </Button>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {quotations && quotations.length > 0 ? (
                    <div className="space-y-4">
                      {quotations.map((quotation) => (
                        <div
                          key={quotation.id}
                          className="flex justify-between items-center border-b pb-2 last:border-0 last:pb-0"
                        >
                          <div>
                            <p className="text-sm font-medium">
                              {quotation.amount ? `${quotation.amount} ${quotation.currency}` : "No amount specified"}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              Created on {new Date(quotation.created_at).toLocaleDateString()}
                            </p>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Badge variant="outline">{quotation.status}</Badge>
                            {quotation.pdf_url && (
                              <Button variant="ghost" size="sm" className="h-8 w-8 p-0" asChild>
                                <a href={quotation.pdf_url} target="_blank" rel="noopener noreferrer">
                                  <FileText className="h-4 w-4" />
                                  <span className="sr-only">View PDF</span>
                                </a>
                              </Button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">
                      No quotations have been created for this project yet.
                    </p>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex justify-between items-center">
                    <span>Contracts</span>
                    <Button size="sm" asChild>
                      <Link href={`/projects/${project.id}/contract`}>
                        <FileCheck className="h-4 w-4 mr-2" />
                        Generate Contract
                      </Link>
                    </Button>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {contracts && contracts.length > 0 ? (
                    <div className="space-y-4">
                      {contracts.map((contract) => (
                        <div
                          key={contract.id}
                          className="flex justify-between items-center border-b pb-2 last:border-0 last:pb-0"
                        >
                          <div>
                            <p className="text-sm font-medium">{contract.template_used || "Standard Contract"}</p>
                            <p className="text-xs text-muted-foreground">
                              Created on {new Date(contract.created_at).toLocaleDateString()}
                            </p>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Badge variant="outline">{contract.status}</Badge>
                            {contract.pdf_url && (
                              <Button variant="ghost" size="sm" className="h-8 w-8 p-0" asChild>
                                <a href={contract.pdf_url} target="_blank" rel="noopener noreferrer">
                                  <FileText className="h-4 w-4" />
                                  <span className="sr-only">View PDF</span>
                                </a>
                              </Button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">
                      No contracts have been generated for this project yet.
                    </p>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="meetings" className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-medium">Project Meetings</h3>
                <Button size="sm" asChild>
                  <Link href={`/projects/${project.id}/schedule`}>
                    <Plus className="h-4 w-4 mr-2" />
                    Schedule Meeting
                  </Link>
                </Button>
              </div>

              {meetings && meetings.length > 0 ? (
                <div className="space-y-4">
                  {meetings.map((meeting) => (
                    <Card key={meeting.id}>
                      <CardHeader className="pb-2">
                        <div className="flex justify-between">
                          <CardTitle className="text-sm font-medium">
                            Meeting on {new Date(meeting.scheduled_at).toLocaleString()}
                          </CardTitle>
                          {meeting.scheduled_by_agent && <Badge variant="outline">Scheduled by Agent</Badge>}
                        </div>
                      </CardHeader>
                      <CardContent>
                        {meeting.link ? (
                          <a
                            href={meeting.link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sm text-primary hover:underline flex items-center"
                          >
                            <Calendar className="h-4 w-4 mr-2" />
                            Join Meeting
                          </a>
                        ) : (
                          <p className="text-sm text-muted-foreground">No meeting link available</p>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <Card>
                  <CardContent className="text-center py-8">
                    <p className="text-muted-foreground">No meetings scheduled for this project</p>
                    <Button className="mt-4" asChild>
                      <Link href={`/projects/${project.id}/schedule`}>Schedule Meeting</Link>
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
