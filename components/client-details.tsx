"use client"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { FileText, User, Calendar, Tag } from "lucide-react"

export function ClientDetails() {
  return (
    <div className="flex flex-col h-full">
      <div className="p-4 border-b">
        <h3 className="font-medium">Detalles del Cliente</h3>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-4 space-y-4">
          <div className="space-y-2">
            <h4 className="text-sm font-medium flex items-center gap-2">
              <User className="h-4 w-4" /> Información Personal
            </h4>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div className="text-gray-500">Nombre:</div>
              <div>Juan Pérez</div>
              <div className="text-gray-500">Teléfono:</div>
              <div>+1234567890</div>
              <div className="text-gray-500">Email:</div>
              <div>juan.perez@example.com</div>
              <div className="text-gray-500">Empresa:</div>
              <div>Tienda de Ropa JP</div>
            </div>
          </div>

          <div className="space-y-2">
            <h4 className="text-sm font-medium flex items-center gap-2">
              <Tag className="h-4 w-4" /> Etiquetas
            </h4>
            <div className="flex flex-wrap gap-2">
              <Badge variant="outline">Nuevo Cliente</Badge>
              <Badge variant="outline">E-commerce</Badge>
              <Badge variant="outline">Prioridad Media</Badge>
            </div>
          </div>

          <div className="space-y-2">
            <h4 className="text-sm font-medium flex items-center gap-2">
              <Calendar className="h-4 w-4" /> Historial
            </h4>
            <div className="space-y-2">
              <div className="text-xs">
                <div className="flex justify-between">
                  <span className="font-medium">Primer contacto</span>
                  <span className="text-gray-500">10/04/2023</span>
                </div>
                <p className="text-gray-600">Consulta inicial sobre desarrollo web</p>
              </div>
              <div className="text-xs">
                <div className="flex justify-between">
                  <span className="font-medium">Reunión</span>
                  <span className="text-gray-500">15/04/2023</span>
                </div>
                <p className="text-gray-600">Discusión de requisitos del proyecto</p>
              </div>
              <div className="text-xs">
                <div className="flex justify-between">
                  <span className="font-medium">Cotización enviada</span>
                  <span className="text-gray-500">18/04/2023</span>
                </div>
                <p className="text-gray-600">Cotización para tienda online</p>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <h4 className="text-sm font-medium flex items-center gap-2">
              <FileText className="h-4 w-4" /> Documentos
            </h4>
            <div className="space-y-2">
              <Button variant="outline" size="sm" className="w-full justify-start">
                <FileText className="mr-2 h-4 w-4" />
                Cotización_TiendaOnline.pdf
              </Button>
              <Button variant="outline" size="sm" className="w-full justify-start">
                <FileText className="mr-2 h-4 w-4" />
                Requisitos_Proyecto.docx
              </Button>
            </div>
          </div>
        </div>
      </ScrollArea>
    </div>
  )
}
