"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { useToast } from "@/hooks/use-toast"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import { Download, Mail, Save, Plus, Search } from "lucide-react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default function QuotationPage() {
  const [clientName, setClientName] = useState("")
  const [projectName, setProjectName] = useState("")
  const [projectType, setProjectType] = useState("web")
  const [complexity, setComplexity] = useState(50)
  const [duration, setDuration] = useState(4)
  const [loading, setLoading] = useState(false)
  const [quotation, setQuotation] = useState<any>(null)
  const [activeTab, setActiveTab] = useState("new")
  const { toast } = useToast()

  const handleGenerateQuotation = async () => {
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
      // Simulate quotation generation
      setTimeout(() => {
        const baseRate = projectType === "web" ? 1000 : projectType === "mobile" ? 1200 : 1500
        const complexityFactor = complexity / 50
        const totalHours = duration * 160 // 160 hours per month
        const hourlyRate = (baseRate * complexityFactor) / 40 // 40 hours per week
        const subtotal = hourlyRate * totalHours
        const tax = subtotal * 0.19 // 19% tax
        const total = subtotal + tax

        const generatedQuotation = {
          client: clientName,
          project: projectName,
          projectType,
          complexity,
          duration,
          date: new Date().toISOString(),
          items: [
            {
              description: "Planificación y Análisis del Proyecto",
              hours: Math.round(totalHours * 0.2),
              rate: hourlyRate,
              amount: Math.round(totalHours * 0.2 * hourlyRate),
            },
            {
              description: "Diseño y Desarrollo",
              hours: Math.round(totalHours * 0.6),
              rate: hourlyRate,
              amount: Math.round(totalHours * 0.6 * hourlyRate),
            },
            {
              description: "Pruebas e Implementación",
              hours: Math.round(totalHours * 0.2),
              rate: hourlyRate,
              amount: Math.round(totalHours * 0.2 * hourlyRate),
            },
          ],
          subtotal: Math.round(subtotal),
          tax: Math.round(tax),
          total: Math.round(total),
        }

        setQuotation(generatedQuotation)
        setLoading(false)

        toast({
          title: "Cotización Generada",
          description: "La cotización ha sido generada exitosamente",
        })
      }, 1500)

      // In the actual implementation, we would call the Quotation agent API here
      // const response = await fetch("/api/generate-quotation", {
      //   method: "POST",
      //   headers: { "Content-Type": "application/json" },
      //   body: JSON.stringify({
      //     clientName,
      //     projectName,
      //     projectType,
      //     complexity,
      //     duration
      //   }),
      // });
      // const data = await response.json();
      // setQuotation(data.quotation);
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo generar la cotización",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleSaveQuotation = async () => {
    toast({
      title: "Cotización Guardada",
      description: "La cotización ha sido guardada en la base de datos",
    })
  }

  const handleSendQuotation = async () => {
    toast({
      title: "Cotización Enviada",
      description: "La cotización ha sido enviada al cliente",
    })
  }

  // Sample quotation history data
  const quotationHistory = [
    { id: "Q-1001", client: "Empresa ABC", project: "Sitio Web Corporativo", date: "2023-04-15", total: 12500 },
    { id: "Q-1002", client: "Startup XYZ", project: "Aplicación Móvil", date: "2023-04-10", total: 18750 },
    { id: "Q-1003", client: "Consultora 123", project: "Sistema de Gestión", date: "2023-04-05", total: 25000 },
    { id: "Q-1004", client: "Tienda Online", project: "E-commerce", date: "2023-03-28", total: 15000 },
    { id: "Q-1005", client: "Agencia Digital", project: "Rediseño Web", date: "2023-03-20", total: 8500 },
  ]

  return (
    <div className="flex flex-col gap-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Cotizaciones</h1>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setActiveTab("history")}>
            <Search className="mr-2 h-4 w-4" />
            Ver Historial
          </Button>
          <Button onClick={() => setActiveTab("new")}>
            <Plus className="mr-2 h-4 w-4" />
            Nueva Cotización
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1">
        <TabsList>
          <TabsTrigger value="new">Nueva Cotización</TabsTrigger>
          <TabsTrigger value="history">Historial</TabsTrigger>
        </TabsList>

        <TabsContent value="new" className="space-y-4 mt-4">
          <div className="grid grid-cols-12 gap-6">
            <div className="col-span-4">
              <Card>
                <CardHeader>
                  <CardTitle>Información del Proyecto</CardTitle>
                  <CardDescription>Ingrese los detalles para generar una cotización</CardDescription>
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
                    <Label htmlFor="projectType">Tipo de Proyecto</Label>
                    <Select value={projectType} onValueChange={setProjectType}>
                      <SelectTrigger id="projectType">
                        <SelectValue placeholder="Seleccione el tipo de proyecto" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="web">Aplicación Web</SelectItem>
                        <SelectItem value="mobile">Aplicación Móvil</SelectItem>
                        <SelectItem value="ai">Solución de IA</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Complejidad del Proyecto</Label>
                    <div className="pt-2">
                      <Slider
                        value={[complexity]}
                        min={10}
                        max={100}
                        step={10}
                        onValueChange={(value) => setComplexity(value[0])}
                      />
                      <div className="flex justify-between text-xs text-gray-500 mt-1">
                        <span>Simple</span>
                        <span>Medio</span>
                        <span>Complejo</span>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="duration">Duración del Proyecto (meses)</Label>
                    <Input
                      id="duration"
                      type="number"
                      min={1}
                      max={24}
                      value={duration}
                      onChange={(e) => setDuration(Number.parseInt(e.target.value) || 1)}
                    />
                  </div>
                </CardContent>
                <CardFooter>
                  <Button onClick={handleGenerateQuotation} disabled={loading} className="w-full">
                    {loading ? "Generando..." : "Generar Cotización"}
                  </Button>
                </CardFooter>
              </Card>
            </div>

            <div className="col-span-8">
              <Card className="h-[calc(100vh-220px)] flex flex-col">
                <CardHeader>
                  <div className="flex justify-between items-center">
                    <div>
                      <CardTitle>Vista Previa de Cotización</CardTitle>
                      <CardDescription>Vista previa y envío de la cotización generada</CardDescription>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" onClick={handleSaveQuotation} disabled={!quotation}>
                        <Save className="mr-2 h-4 w-4" />
                        Guardar
                      </Button>
                      <Button variant="outline" onClick={handleSendQuotation} disabled={!quotation}>
                        <Mail className="mr-2 h-4 w-4" />
                        Enviar
                      </Button>
                      <Button variant="outline" disabled={!quotation}>
                        <Download className="mr-2 h-4 w-4" />
                        Descargar
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="flex-1 overflow-hidden">
                  <ScrollArea className="h-full pr-4">
                    {quotation ? (
                      <div className="p-6 border rounded-lg">
                        <div className="flex justify-between mb-8">
                          <div>
                            <h2 className="text-2xl font-bold">TDX</h2>
                            <p className="text-gray-500">Technology Development Experts</p>
                            <p className="text-gray-500">contact@tdx.com</p>
                          </div>
                          <div className="text-right">
                            <h3 className="text-xl font-bold">Cotización</h3>
                            <p className="text-gray-500">Fecha: {new Date(quotation.date).toLocaleDateString()}</p>
                            <p className="text-gray-500">Cotización #: Q-{Math.floor(Math.random() * 10000)}</p>
                          </div>
                        </div>

                        <div className="mb-8">
                          <h3 className="font-bold mb-2">Información del Cliente</h3>
                          <p>{quotation.client}</p>
                          <p>Proyecto: {quotation.project}</p>
                          <p>
                            Tipo:{" "}
                            {quotation.projectType === "web"
                              ? "Aplicación Web"
                              : quotation.projectType === "mobile"
                                ? "Aplicación Móvil"
                                : "Solución de IA"}
                          </p>
                        </div>

                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Descripción</TableHead>
                              <TableHead className="text-right">Horas</TableHead>
                              <TableHead className="text-right">Tarifa</TableHead>
                              <TableHead className="text-right">Monto</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {quotation.items.map((item: any, index: number) => (
                              <TableRow key={index}>
                                <TableCell>{item.description}</TableCell>
                                <TableCell className="text-right">{item.hours}</TableCell>
                                <TableCell className="text-right">${item.rate.toFixed(2)}</TableCell>
                                <TableCell className="text-right">${item.amount.toLocaleString()}</TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>

                        <div className="mt-8 text-right">
                          <div className="flex justify-end">
                            <div className="w-1/3">
                              <div className="flex justify-between mb-2">
                                <span>Subtotal:</span>
                                <span>${quotation.subtotal.toLocaleString()}</span>
                              </div>
                              <div className="flex justify-between mb-2">
                                <span>IVA (19%):</span>
                                <span>${quotation.tax.toLocaleString()}</span>
                              </div>
                              <div className="flex justify-between font-bold">
                                <span>Total:</span>
                                <span>${quotation.total.toLocaleString()}</span>
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className="mt-8 pt-8 border-t">
                          <p className="text-gray-500 text-sm">
                            Esta cotización es válida por 30 días a partir de la fecha de emisión.
                          </p>
                        </div>
                      </div>
                    ) : (
                      <div className="h-full flex items-center justify-center text-gray-500">
                        <p>Genere una cotización para ver la vista previa</p>
                      </div>
                    )}
                  </ScrollArea>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="history" className="space-y-4 mt-4">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>Historial de Cotizaciones</CardTitle>
                <div className="flex gap-2 items-center">
                  <Input placeholder="Buscar cotizaciones..." className="w-64" />
                  <Button variant="outline" size="sm">
                    <Search className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>Cliente</TableHead>
                    <TableHead>Proyecto</TableHead>
                    <TableHead>Fecha</TableHead>
                    <TableHead className="text-right">Total</TableHead>
                    <TableHead className="text-right">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {quotationHistory.map((quote) => (
                    <TableRow key={quote.id}>
                      <TableCell>{quote.id}</TableCell>
                      <TableCell>{quote.client}</TableCell>
                      <TableCell>{quote.project}</TableCell>
                      <TableCell>{new Date(quote.date).toLocaleDateString()}</TableCell>
                      <TableCell className="text-right">${quote.total.toLocaleString()}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button variant="ghost" size="sm">
                            <Mail className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm">
                            <Download className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
