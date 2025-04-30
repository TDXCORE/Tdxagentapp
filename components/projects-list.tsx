import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Calendar, FileText, DollarSign, FileCheck } from "lucide-react"
import Link from "next/link"
import type { Project } from "@/lib/types"

interface ProjectsListProps {
  projects: Project[]
}

export function ProjectsList({ projects }: ProjectsListProps) {
  if (projects.length === 0) {
    return <div className="text-center py-8 text-muted-foreground">No projects found for this client.</div>
  }

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
    <div className="space-y-4">
      {projects.map((project) => (
        <Card key={project.id}>
          <CardHeader className="pb-2">
            <div className="flex justify-between items-start">
              <CardTitle>{project.title}</CardTitle>
              <Badge variant="outline">
                <span className={`mr-1.5 h-2 w-2 rounded-full ${getStatusColor(project.status)}`}></span>
                {project.status.charAt(0).toUpperCase() + project.status.slice(1)}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="pb-2">
            <p className="text-sm text-muted-foreground line-clamp-2">
              {project.description || "No description provided"}
            </p>

            {(project.start_date || project.end_date) && (
              <div className="flex items-center mt-2 text-sm">
                <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
                {project.start_date && project.end_date ? (
                  <span>
                    {new Date(project.start_date).toLocaleDateString()} -{" "}
                    {new Date(project.end_date).toLocaleDateString()}
                  </span>
                ) : project.start_date ? (
                  <span>Starts on {new Date(project.start_date).toLocaleDateString()}</span>
                ) : (
                  <span>Due by {new Date(project.end_date!).toLocaleDateString()}</span>
                )}
              </div>
            )}
          </CardContent>
          <CardFooter className="pt-2">
            <div className="flex justify-between w-full">
              <div className="flex space-x-2">
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0" asChild>
                  <Link href={`/projects/${project.id}/prd`}>
                    <FileText className="h-4 w-4" />
                    <span className="sr-only">PRD</span>
                  </Link>
                </Button>
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0" asChild>
                  <Link href={`/projects/${project.id}/quotation`}>
                    <DollarSign className="h-4 w-4" />
                    <span className="sr-only">Quotation</span>
                  </Link>
                </Button>
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0" asChild>
                  <Link href={`/projects/${project.id}/contract`}>
                    <FileCheck className="h-4 w-4" />
                    <span className="sr-only">Contract</span>
                  </Link>
                </Button>
              </div>
              <Button variant="outline" size="sm" asChild>
                <Link href={`/projects/${project.id}`}>View Details</Link>
              </Button>
            </div>
          </CardFooter>
        </Card>
      ))}
    </div>
  )
}
