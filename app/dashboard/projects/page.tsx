import type { Metadata } from "next"
import { ProjectsTable } from "@/components/projects-table"

export const metadata: Metadata = {
  title: "Projects | TDX Agent Platform",
  description: "Manage your projects",
}

export default function ProjectsPage() {
  // Mock data for projects with all required properties
  const projects = [
    {
      id: "1",
      name: "E-commerce Tienda JP",
      title: "E-commerce Tienda JP",
      description: "Sistema de gestión de inventario y ventas online para tienda de ropa",
      status: "in_progress",
      created_at: "2023-04-15T10:00:00Z",
      start_date: "2023-04-20T00:00:00Z",
      end_date: "2023-07-20T00:00:00Z",
      clients: {
        id: "1",
        name: "Juan Pérez",
        company_name: "Tienda de Ropa JP"
      }
    },
    {
      id: "2",
      name: "App Restaurante El Sabor",
      title: "App Restaurante El Sabor",
      description: "Aplicación para gestionar reservas y pedidos en restaurante",
      status: "planning",
      created_at: "2023-04-12T14:00:00Z",
      start_date: "2023-05-01T00:00:00Z",
      end_date: "2023-08-01T00:00:00Z",
      clients: {
        id: "2",
        name: "María López",
        company_name: "Restaurante El Sabor"
      }
    },
    {
      id: "3",
      name: "Portal Consultora CR",
      title: "Portal Consultora CR",
      description: "Portal web corporativo con sistema de gestión de clientes",
      status: "completed",
      created_at: "2023-03-20T09:00:00Z",
      start_date: "2023-03-25T00:00:00Z",
      end_date: "2023-05-25T00:00:00Z",
      clients: {
        id: "3",
        name: "Carlos Rodríguez",
        company_name: "Consultora CR"
      }
    }
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Proyectos</h1>
      <p className="text-muted-foreground">Gestión de proyectos activos y completados</p>

      {projects && projects.length > 0 ? (
        <ProjectsTable projects={projects} />
      ) : (
        <div className="text-center py-10 border rounded-lg">
          <h3 className="text-lg font-medium">No se encontraron proyectos</h3>
          <p className="text-muted-foreground mt-1">Comienza creando tu primer proyecto</p>
        </div>
      )}
    </div>
  )
}