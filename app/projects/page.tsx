import type { Metadata } from "next"
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { ProjectsTable } from "@/components/projects-table"

export const metadata: Metadata = {
  title: "Projects | TDX Agent Platform",
  description: "Manage your projects",
}

export default async function ProjectsPage() {
  const supabase = createServerComponentClient({ cookies })

  // Fetch all projects with client information
  const { data: projects } = await supabase
    .from("projects")
    .select("*, clients(id, name, company_name)")
    .order("created_at", { ascending: false })

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Projects</h1>
      <p className="text-muted-foreground">Manage your projects and their deliverables</p>

      {projects && projects.length > 0 ? (
        <ProjectsTable projects={projects} />
      ) : (
        <div className="text-center py-10 border rounded-lg">
          <h3 className="text-lg font-medium">No projects found</h3>
          <p className="text-muted-foreground mt-1">Get started by creating your first project</p>
        </div>
      )}
    </div>
  )
}
