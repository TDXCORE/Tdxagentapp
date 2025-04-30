"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { useToast } from "@/hooks/use-toast"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Download, FileText, Mail, Save } from "lucide-react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

export default function ContractsPage() {
  const [clientName, setClientName] = useState("")
  const [projectName, setProjectName] = useState("")
  const [contractType, setContractType] = useState("standard")
  const [loading, setLoading] = useState(false)
  const [contract, setContract] = useState<any>(null)
  const { toast } = useToast()

  const handleGenerateContract = async () => {
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
      // Simulate contract generation
      setTimeout(() => {
        const generatedContract = {
          id: `CNT-${Math.floor(Math.random() * 10000)}`,
          client: clientName,
          project: projectName,
          type: contractType,
          date: new Date().toISOString(),
          status: "draft",
          content: `
# CONTRATO DE SERVICIOS

Este Contrato de Servicios (el "Contrato") se celebra a partir del ${new Date().toLocaleDateString()} entre:

**TDX** ("Proveedor de Servicios"), una empresa de desarrollo tecnológico, y

**${clientName}** ("Cliente")

## 1. SERVICIOS

El Proveedor de Servicios acuerda proporcionar al Cliente servicios de desarrollo de software para el proyecto "${projectName}" según se describe en el Documento de Requisitos del Proyecto adjunto.

## 2. PAGO

El Cliente acuerda pagar al Proveedor de Servicios de acuerdo con el calendario de pagos descrito en la Cotización adjunta.

## 3. PLAZO

Este Contrato comenzará en la fecha de ejecución y continuará hasta que todos los servicios hayan sido proporcionados, a menos que se termine antes.

## 4. PROPIEDAD INTELECTUAL

Al recibir el pago completo, el Proveedor de Servicios cede al Cliente todos los derechos, títulos e intereses en los entregables.

## 5. CONFIDENCIALIDAD

Ambas partes acuerdan mantener la confidencialidad de cualquier información propietaria compartida durante el curso de este Contrato.

## 6. TERMINACIÓN

Cualquiera de las partes puede terminar este Contrato con un aviso por escrito de 30 días.

## 7. LEY APLICABLE

Este Contrato se regirá por las leyes de [Jurisdicción].

## 8. FIRMAS

**Proveedor de Servicios:**
TDX
_____________________
Fecha: ${new Date().toLocaleDateString()}

**Cliente:**
${clientName}
_____________________
Fecha: ________________
          `,
        }

        setContract(generatedContract)
        setLoading(false)

        toast({
          title: "Contrato Generado",
          description: "El contrato ha sido generado exitosamente",
        })
      }, 1500)

      // In the actual implementation, we would call the Contract agent API here
      // const response = await fetch("/api/generate-contract", {
      //   method: "POST",
      //   headers: { "Content-Type": "application/json" },
      //   body: JSON.stringify({
      //     clientName,
      //     projectName,
      //     contractType
      //   }),
      // });
      // const data = await response.json();
      // setContract(data.contract);
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo generar el contrato",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleSaveContract = async () => {
    toast({
      title: "Contrato Guardado",
      description: "El contrato ha sido guardado en la base de datos",
    })
  }

  const handleSendContract = async () => {
    toast({
      title: "Contrato Enviado",
      description: "El contrato ha sido enviado al cliente para su firma",
    })
  }

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-3xl font-bold">Generador de Contratos</h1>

      <div className="grid grid-cols-12 gap-6">
        <div className="col-span-4">
          <Card>
            <CardHeader>
              <CardTitle>Información del Contrato</CardTitle>
              <CardDescription>Ingrese los detalles para generar un contrato</CardDescription>
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
              <div className="space-y-2">
                <Label htmlFor="contractType">Tipo de Contrato</Label>
                <Select value={contractType} onValueChange={setContractType}>
                  <SelectTrigger id="contractType">
                    <SelectValue placeholder="Seleccione el tipo de contrato" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="standard">Acuerdo Estándar</SelectItem>
                    <SelectItem value="nda">Acuerdo de Confidencialidad</SelectItem>
                    <SelectItem value="msa">Acuerdo Marco de Servicios</SelectItem>
                    <SelectItem value="sow">Declaración de Trabajo</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
            <CardFooter>
              <Button onClick={handleGenerateContract} disabled={loading} className="w-full">
                {loading ? "Generando..." : "Generar Contrato"}
              </Button>
            </CardFooter>
          </Card>

          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Plantillas de Contratos</CardTitle>
              <CardDescription>Seleccione una plantilla para comenzar</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Button variant="outline" className="w-full justify-start">
                  <FileText className="mr-2 h-4 w-4" />
                  Acuerdo de Servicios Estándar
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <FileText className="mr-2 h-4 w-4" />
                  Acuerdo de Confidencialidad
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <FileText className="mr-2 h-4 w-4" />
                  Acuerdo Marco de Servicios
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="col-span-8">
          <Card className="h-[calc(100vh-220px)] flex flex-col">
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>Vista Previa del Contrato</CardTitle>
                  <CardDescription>Vista previa y envío del contrato generado</CardDescription>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" onClick={handleSaveContract} disabled={!contract}>
                    <Save className="mr-2 h-4 w-4" />
                    Guardar
                  </Button>
                  <Button variant="outline" onClick={handleSendContract} disabled={!contract}>
                    <Mail className="mr-2 h-4 w-4" />
                    Enviar para Firma
                  </Button>
                  <Button variant="outline" disabled={!contract}>
                    <Download className="mr-2 h-4 w-4" />
                    Descargar
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="flex-1 overflow-hidden">
              <Tabs defaultValue="preview" className="h-full">
                <TabsList className="grid grid-cols-2">
                  <TabsTrigger value="preview">Vista Previa</TabsTrigger>
                  <TabsTrigger value="history">Historial</TabsTrigger>
                </TabsList>
                <TabsContent value="preview" className="h-[calc(100%-40px)]">
                  <ScrollArea className="h-full pr-4">
                    {contract ? (
                      <div className="prose dark:prose-invert max-w-none">
                        <pre className="whitespace-pre-wrap">{contract.content}</pre>
                      </div>
                    ) : (
                      <div className="h-full flex items-center justify-center text-gray-500">
                        <p>Genere un contrato para ver la vista previa</p>
                      </div>
                    )}
                  </ScrollArea>
                </TabsContent>
                <TabsContent value="history" className="h-[calc(100%-40px)]">
                  <ScrollArea className="h-full pr-4">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>ID de Contrato</TableHead>
                          <TableHead>Cliente</TableHead>
                          <TableHead>Proyecto</TableHead>
                          <TableHead>Fecha</TableHead>
                          <TableHead>Estado</TableHead>
                          <TableHead>Acciones</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        <TableRow>
                          <TableCell>CNT-1234</TableCell>
                          <TableCell>Acme Inc.</TableCell>
                          <TableCell>Portal de Clientes</TableCell>
                          <TableCell>2023-06-15</TableCell>
                          <TableCell>Firmado</TableCell>
                          <TableCell>
                            <Button variant="ghost" size="sm">
                              <Download className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell>CNT-1235</TableCell>
                          <TableCell>TechCorp</TableCell>
                          <TableCell>Aplicación Móvil</TableCell>
                          <TableCell>2023-06-20</TableCell>
                          <TableCell>Borrador</TableCell>
                          <TableCell>
                            <Button variant="ghost" size="sm">
                              <Download className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      </TableBody>
                    </Table>
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