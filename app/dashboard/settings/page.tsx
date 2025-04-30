"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import { Save } from "lucide-react"

export default function SettingsPage() {
  const [generalSettings, setGeneralSettings] = useState({
    companyName: "TDX",
    email: "contact@tdx.com",
    phone: "+1 (555) 123-4567",
    address: "123 Tech Street, San Francisco, CA 94107",
    timezone: "America/Los_Angeles",
  })

  const [notificationSettings, setNotificationSettings] = useState({
    emailNotifications: true,
    pushNotifications: false,
    dailyDigest: true,
    leadAlerts: true,
    contractAlerts: true,
  })

  const [integrationSettings, setIntegrationSettings] = useState({
    openaiApiKey: "sk-••••••••••••••••••••••••••••••",
    whatsappApiKey: "wa-••••••••••••••••••••••••••••••",
    microsoftGraphClientId: "ms-••••••••••••••••••••••••••••••",
    microsoftGraphClientSecret: "ms-••••••••••••••••••••••••••••••",
    awsSesKey: "aws-••••••••••••••••••••••••••••••",
  })

  const { toast } = useToast()

  const handleSaveGeneralSettings = () => {
    toast({
      title: "Configuración Guardada",
      description: "La configuración general ha sido actualizada",
    })
  }

  const handleSaveNotificationSettings = () => {
    toast({
      title: "Configuración Guardada",
      description: "La configuración de notificaciones ha sido actualizada",
    })
  }

  const handleSaveIntegrationSettings = () => {
    toast({
      title: "Configuración Guardada",
      description: "La configuración de integraciones ha sido actualizada",
    })
  }

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-3xl font-bold">Configuración</h1>

      <Tabs defaultValue="general" className="space-y-6">
        <TabsList>
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="notifications">Notificaciones</TabsTrigger>
          <TabsTrigger value="integrations">Integraciones</TabsTrigger>
          <TabsTrigger value="users">Usuarios</TabsTrigger>
        </TabsList>

        <TabsContent value="general">
          <Card>
            <CardHeader>
              <CardTitle>Configuración General</CardTitle>
              <CardDescription>Administre la información y preferencias de su empresa</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="companyName">Nombre de la Empresa</Label>
                <Input
                  id="companyName"
                  value={generalSettings.companyName}
                  onChange={(e) => setGeneralSettings({ ...generalSettings, companyName: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Correo Electrónico</Label>
                <Input
                  id="email"
                  type="email"
                  value={generalSettings.email}
                  onChange={(e) => setGeneralSettings({ ...generalSettings, email: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Teléfono</Label>
                <Input
                  id="phone"
                  value={generalSettings.phone}
                  onChange={(e) => setGeneralSettings({ ...generalSettings, phone: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="address">Dirección</Label>
                <Textarea
                  id="address"
                  value={generalSettings.address}
                  onChange={(e) => setGeneralSettings({ ...generalSettings, address: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="timezone">Zona Horaria</Label>
                <Select
                  value={generalSettings.timezone}
                  onValueChange={(value) => setGeneralSettings({ ...generalSettings, timezone: value })}
                >
                  <SelectTrigger id="timezone">
                    <SelectValue placeholder="Seleccione zona horaria" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="America/Los_Angeles">Hora del Pacífico (PT)</SelectItem>
                    <SelectItem value="America/Denver">Hora de la Montaña (MT)</SelectItem>
                    <SelectItem value="America/Chicago">Hora Central (CT)</SelectItem>
                    <SelectItem value="America/New_York">Hora del Este (ET)</SelectItem>
                    <SelectItem value="Europe/London">Hora de Greenwich (GMT)</SelectItem>
                    <SelectItem value="Europe/Paris">Hora Central Europea (CET)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
            <CardFooter>
              <Button onClick={handleSaveGeneralSettings}>
                <Save className="mr-2 h-4 w-4" />
                Guardar Cambios
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="notifications">
          <Card>
            <CardHeader>
              <CardTitle>Configuración de Notificaciones</CardTitle>
              <CardDescription>Configure cómo recibe notificaciones</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="emailNotifications">Notificaciones por Correo</Label>
                  <p className="text-sm text-gray-500">Recibir notificaciones por correo electrónico</p>
                </div>
                <Switch
                  id="emailNotifications"
                  checked={notificationSettings.emailNotifications}
                  onCheckedChange={(checked) =>
                    setNotificationSettings({ ...notificationSettings, emailNotifications: checked })
                  }
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="pushNotifications">Notificaciones Push</Label>
                  <p className="text-sm text-gray-500">Recibir notificaciones en el navegador</p>
                </div>
                <Switch
                  id="pushNotifications"
                  checked={notificationSettings.pushNotifications}
                  onCheckedChange={(checked) =>
                    setNotificationSettings({ ...notificationSettings, pushNotifications: checked })
                  }
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="dailyDigest">Resumen Diario</Label>
                  <p className="text-sm text-gray-500">Recibir un resumen diario de actividades</p>
                </div>
                <Switch
                  id="dailyDigest"
                  checked={notificationSettings.dailyDigest}
                  onCheckedChange={(checked) =>
                    setNotificationSettings({ ...notificationSettings, dailyDigest: checked })
                  }
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="leadAlerts">Alertas de Leads</Label>
                  <p className="text-sm text-gray-500">Recibir notificaciones cuando se crean nuevos leads</p>
                </div>
                <Switch
                  id="leadAlerts"
                  checked={notificationSettings.leadAlerts}
                  onCheckedChange={(checked) =>
                    setNotificationSettings({ ...notificationSettings, leadAlerts: checked })
                  }
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="contractAlerts">Alertas de Contratos</Label>
                  <p className="text-sm text-gray-500">Recibir notificaciones sobre cambios en el estado de los contratos</p>
                </div>
                <Switch
                  id="contractAlerts"
                  checked={notificationSettings.contractAlerts}
                  onCheckedChange={(checked) =>
                    setNotificationSettings({ ...notificationSettings, contractAlerts: checked })
                  }
                />
              </div>
            </CardContent>
            <CardFooter>
              <Button onClick={handleSaveNotificationSettings}>
                <Save className="mr-2 h-4 w-4" />
                Guardar Cambios
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="integrations">
          <Card>
            <CardHeader>
              <CardTitle>Configuración de Integraciones</CardTitle>
              <CardDescription>Configure integraciones con servicios externos</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="openaiApiKey">Clave API de OpenAI</Label>
                <Input
                  id="openaiApiKey"
                  type="password"
                  value={integrationSettings.openaiApiKey}
                  onChange={(e) => setIntegrationSettings({ ...integrationSettings, openaiApiKey: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="whatsappApiKey">Clave API de WhatsApp Business</Label>
                <Input
                  id="whatsappApiKey"
                  type="password"
                  value={integrationSettings.whatsappApiKey}
                  onChange={(e) => setIntegrationSettings({ ...integrationSettings, whatsappApiKey: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="microsoftGraphClientId">ID de Cliente de Microsoft Graph</Label>
                <Input
                  id="microsoftGraphClientId"
                  type="password"
                  value={integrationSettings.microsoftGraphClientId}
                  onChange={(e) =>
                    setIntegrationSettings({ ...integrationSettings, microsoftGraphClientId: e.target.value })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="microsoftGraphClientSecret">Secreto de Cliente de Microsoft Graph</Label>
                <Input
                  id="microsoftGraphClientSecret"
                  type="password"
                  value={integrationSettings.microsoftGraphClientSecret}
                  onChange={(e) =>
                    setIntegrationSettings({ ...integrationSettings, microsoftGraphClientSecret: e.target.value })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="awsSesKey">Clave AWS SES</Label>
                <Input
                  id="awsSesKey"
                  type="password"
                  value={integrationSettings.awsSesKey}
                  onChange={(e) => setIntegrationSettings({ ...integrationSettings, awsSesKey: e.target.value })}
                />
              </div>
            </CardContent>
            <CardFooter>
              <Button onClick={handleSaveIntegrationSettings}>
                <Save className="mr-2 h-4 w-4" />
                Guardar Cambios
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="users">
          <Card>
            <CardHeader>
              <CardTitle>Gestión de Usuarios</CardTitle>
              <CardDescription>Administre usuarios y sus permisos</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-medium">Usuarios</h3>
                  <Button>Añadir Usuario</Button>
                </div>
                <div className="border rounded-md">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left p-3">Nombre</th>
                        <th className="text-left p-3">Correo</th>
                        <th className="text-left p-3">Rol</th>
                        <th className="text-left p-3">Estado</th>
                        <th className="text-left p-3">Acciones</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="border-b">
                        <td className="p-3">Juan Pérez</td>
                        <td className="p-3">juan.perez@tdx.com</td>
                        <td className="p-3">Admin</td>
                        <td className="p-3">Activo</td>
                        <td className="p-3">
                          <Button variant="ghost" size="sm">
                            Editar
                          </Button>
                        </td>
                      </tr>
                      <tr className="border-b">
                        <td className="p-3">María López</td>
                        <td className="p-3">maria.lopez@tdx.com</td>
                        <td className="p-3">Ventas</td>
                        <td className="p-3">Activo</td>
                        <td className="p-3">
                          <Button variant="ghost" size="sm">
                            Editar
                          </Button>
                        </td>
                      </tr>
                      <tr>
                        <td className="p-3">Carlos Rodríguez</td>
                        <td className="p-3">carlos.rodriguez@tdx.com</td>
                        <td className="p-3">Técnico</td>
                        <td className="p-3">Inactivo</td>
                        <td className="p-3">
                          <Button variant="ghost" size="sm">
                            Editar
                          </Button>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}