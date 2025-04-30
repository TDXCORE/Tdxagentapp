"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ScrollArea } from "@/components/ui/scroll-area"
import { useToast } from "@/hooks/use-toast"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { FileText, Download, Save } from "lucide-react"

export default function PRDGeneratorPage() {
  const [prdContent, setPrdContent] = useState("")
  const [clientName, setClientName] = useState("")
  const [projectName, setProjectName] = useState("")
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()

  const handleGeneratePRD = async () => {
    if (!clientName || !projectName) {
      toast({
        title: "Información faltante",
        description: "Por favor proporcione el nombre del cliente y el nombre del proyecto",
        variant: "destructive",
      })
      return
    }

    setLoading(true)

    try {
      // Simulate PRD generation
      setTimeout(() => {
        const generatedPRD = `# Documento de Requisitos del Proyecto
## ${projectName}
### Cliente: ${clientName}

## 1. Visión General del Proyecto
Este es un PRD de ejemplo generado para el proyecto ${projectName} de ${clientName}. En la implementación real, esto sería generado por el agente de PRD basado en la conversación con el cliente.

## 2. Objetivos
- Objetivo 1
- Objetivo 2
- Objetivo 3

## 3. Requisitos
### Requisitos Funcionales
- Requisito 1
- Requisito 2
- Requisito 3

### Requisitos No Funcionales
- Rendimiento
- Seguridad
- Escalabilidad

## 4. Cronograma
- Fase 1: Planificación (2 semanas)
- Fase 2: Desarrollo (4 semanas)
- Fase 3: Pruebas (2 semanas)
- Fase 4: Implementación (1 semana)

## 5. Presupuesto
$XX,XXX - $XX,XXX

## 6. Interesados
- ${clientName} (Cliente)
- Gerente de Proyecto TDX
- Equipo de Desarrollo TDX

Generado el: ${new Date().toLocaleDateString()}`

        setPrdContent(generatedPRD)
        setLoading(false)

        toast({
          title: "PRD Generado",
          description: "El PRD ha sido generado exitosamente",
        })
      }, 2000)

      // In the actual implementation, we would call the PRD agent API here
      // const response = await fetch("/api/generate-prd", {
      //   method: "POST",
      //   headers: { "Content-Type": "application/json" },
      //   body: JSON.stringify({ clientName, projectName }),
      // });
      // const data = await response.json();
      // setPrdContent(data.prd);
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo generar el PRD",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleSavePRD = async () => {
    toast({
      title: "PRD Guardado",
      description: "El PRD ha sido guardado en la base de datos",
    })
  }

  const handleDownloadPRD = () => {
    const element = document.createElement("a")
    const file = new Blob([prdContent], { type: "text/markdown" })
    element.href = URL.createObjectURL(file)
    element.download = `${projectName.replace(/\s+/g, "-").toLowerCase()}-prd.md`
    document.body.appendChild(element)
    element.click()
    document.body.removeChild(element)
  }

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-3xl font-bold">Generador de PRD</h1>

      <div className="grid grid-cols-12 gap-6">
        <div className="col-span-12 md:col-span-4">
          <Card>
            <CardHeader>
              <CardTitle>Información del Proyecto</CardTitle>
              <CardDescription>Ingrese los detalles para generar un PRD</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="clientName">Nombre del Cliente</Label>
                <Input
                  id="clientName"
                  placeholder="Ingrese el nombre del cliente"
                  value={clientName}
                  onChange={(e) => setClientName(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="projectName">Nombre del Proyecto</Label>
                <Input
                  id="projectName"
                  placeholder="Ingrese el nombre del proyecto"
                  value={projectName}
                  onChange={(e) => setProjectName(e.target.value)}
                />
              </div>
              {/* Additional fields would go here */}
            </CardContent>
            <CardFooter>
              <Button onClick={handleGeneratePRD} disabled={loading} className="w-full">
                {loading ? "Generando..." : "Generar PRD"}
              </Button>
            </CardFooter>
          </Card>

          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Plantillas de PRD</CardTitle>
              <CardDescription>Seleccione una plantilla para comenzar</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Button variant="outline" className="w-full justify-start">
                  <FileText className="mr-2 h-4 w-4" />
                  Plantilla PRD Estándar
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <FileText className="mr-2 h-4 w-4" />
                  Plantilla PRD Detallada
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <FileText className="mr-2 h-4 w-4" />
                  Plantilla PRD Mínima
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="col-span-12 md:col-span-8">
          <Card className="h-[calc(100vh-220px)] flex flex-col">
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>Editor de PRD</CardTitle>
                  <CardDescription>Edite y previsualice el PRD generado</CardDescription>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" onClick={handleSavePRD}>
                    <Save className="mr-2 h-4 w-4" />
                    Guardar
                  </Button>
                  <Button variant="outline" onClick={handleDownloadPRD}>
                    <Download className="mr-2 h-4 w-4" />
                    Descargar
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="flex-1 overflow-hidden">
              <Tabs defaultValue="edit" className="h-full">
                <TabsList className="grid grid-cols-2">
                  <TabsTrigger value="edit">Editar</TabsTrigger>
                  <TabsTrigger value="preview">Vista Previa</TabsTrigger>
                </TabsList>
                <TabsContent value="edit" className="h-[calc(100%-40px)]">
                  <Textarea
                    className="h-full resize-none font-mono"
                    placeholder="El contenido del PRD aparecerá aquí"
                    value={prdContent}
                    onChange={(e) => setPrdContent(e.target.value)}
                  />
                </TabsContent>
                <TabsContent value="preview" className="h-[calc(100%-40px)]">
                  <ScrollArea className="h-full pr-4">
                    <div className="prose dark:prose-invert max-w-none">
                      {prdContent ? (
                        <pre className="whitespace-pre-wrap">{prdContent}</pre>
                      ) : (
                        <div className="h-full flex items-center justify-center text-gray-500">
                          <p>Genere un PRD para ver la vista previa</p>
                        </div>
                      )}
                    </div>
                  </ScrollArea>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}