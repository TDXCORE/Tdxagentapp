"use client"

import { usePathname, useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"
import {
  Users,
  FolderKanban,
  MessageSquare,
  FileText,
  CalendarClock,
  FileCodeIcon as FileContract,
  Settings,
  Home,
  LogOut,
  InboxIcon,
  Calculator,
  Bot,
} from "lucide-react"

export function Sidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const { toast } = useToast()

  const handleLogout = async () => {
    try {
      const supabase = createClient()
      const { error } = await supabase.auth.signOut()

      if (error) {
        throw error
      }

      toast({
        title: "Sesión cerrada",
        description: "Has cerrado sesión correctamente",
      })

      // Use router for navigation
      router.refresh()
      router.push("/auth/login")
    } catch (error) {
      console.error("Logout error:", error)
      toast({
        title: "Error al cerrar sesión",
        description: "No se pudo cerrar la sesión correctamente",
        variant: "destructive",
      })
    }
  }

  // Updated links with dashboard prefix
  const links = [
    { href: "/dashboard", label: "Dashboard", icon: Home },
    { href: "/dashboard/clients", label: "Clientes", icon: Users },
    { href: "/dashboard/projects", label: "Proyectos", icon: FolderKanban },
    { href: "/dashboard/inbox", label: "Inbox", icon: InboxIcon },
    { href: "/dashboard/quotation", label: "Cotizaciones", icon: Calculator },
    { href: "/dashboard/agent-chat", label: "Chat con Agente", icon: MessageSquare },
    { href: "/dashboard/agent-setup", label: "Agent Setup", icon: Bot },
    { href: "/dashboard/prd-generator", label: "Generador de PRD", icon: FileText },
    { href: "/dashboard/meetings", label: "Reuniones", icon: CalendarClock },
    { href: "/dashboard/contracts", label: "Contratos", icon: FileContract },
    { href: "/dashboard/settings", label: "Configuración", icon: Settings },
  ]

  return (
    <div className="w-64 bg-card h-screen flex flex-col border-r">
      <div className="p-4 border-b">
        <h1 className="text-xl font-bold">TDX Platform</h1>
      </div>
      <nav className="flex-1 overflow-y-auto p-2">
        <ul className="space-y-1">
          {links.map((link) => {
            const Icon = link.icon
            const isActive = pathname === link.href || pathname.startsWith(`${link.href}/`)
            return (
              <li key={link.href}>
                <Button
                  variant={isActive ? "default" : "ghost"}
                  className={`w-full justify-start ${isActive ? "bg-primary text-primary-foreground" : ""}`}
                  onClick={() => router.push(link.href)}
                >
                  <Icon className="h-5 w-5 mr-3" />
                  <span>{link.label}</span>
                </Button>
              </li>
            )
          })}
        </ul>
      </nav>
      <div className="p-4 border-t">
        <Button variant="outline" className="w-full flex items-center gap-2" onClick={handleLogout}>
          <LogOut className="h-4 w-4" />
          <span>Cerrar sesión</span>
        </Button>
      </div>
    </div>
  )
}
