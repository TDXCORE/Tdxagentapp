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
      title: "Settings Saved",
      description: "General settings have been updated",
    })
  }

  const handleSaveNotificationSettings = () => {
    toast({
      title: "Settings Saved",
      description: "Notification settings have been updated",
    })
  }

  const handleSaveIntegrationSettings = () => {
    toast({
      title: "Settings Saved",
      description: "Integration settings have been updated",
    })
  }

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-3xl font-bold">Settings</h1>

      <Tabs defaultValue="general" className="space-y-6">
        <TabsList>
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="integrations">Integrations</TabsTrigger>
          <TabsTrigger value="users">Users</TabsTrigger>
        </TabsList>

        <TabsContent value="general">
          <Card>
            <CardHeader>
              <CardTitle>General Settings</CardTitle>
              <CardDescription>Manage your company information and preferences</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="companyName">Company Name</Label>
                <Input
                  id="companyName"
                  value={generalSettings.companyName}
                  onChange={(e) => setGeneralSettings({ ...generalSettings, companyName: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={generalSettings.email}
                  onChange={(e) => setGeneralSettings({ ...generalSettings, email: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Phone</Label>
                <Input
                  id="phone"
                  value={generalSettings.phone}
                  onChange={(e) => setGeneralSettings({ ...generalSettings, phone: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="address">Address</Label>
                <Textarea
                  id="address"
                  value={generalSettings.address}
                  onChange={(e) => setGeneralSettings({ ...generalSettings, address: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="timezone">Timezone</Label>
                <Select
                  value={generalSettings.timezone}
                  onValueChange={(value) => setGeneralSettings({ ...generalSettings, timezone: value })}
                >
                  <SelectTrigger id="timezone">
                    <SelectValue placeholder="Select timezone" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="America/Los_Angeles">Pacific Time (PT)</SelectItem>
                    <SelectItem value="America/Denver">Mountain Time (MT)</SelectItem>
                    <SelectItem value="America/Chicago">Central Time (CT)</SelectItem>
                    <SelectItem value="America/New_York">Eastern Time (ET)</SelectItem>
                    <SelectItem value="Europe/London">Greenwich Mean Time (GMT)</SelectItem>
                    <SelectItem value="Europe/Paris">Central European Time (CET)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
            <CardFooter>
              <Button onClick={handleSaveGeneralSettings}>
                <Save className="mr-2 h-4 w-4" />
                Save Changes
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="notifications">
          <Card>
            <CardHeader>
              <CardTitle>Notification Settings</CardTitle>
              <CardDescription>Configure how you receive notifications</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="emailNotifications">Email Notifications</Label>
                  <p className="text-sm text-gray-500">Receive notifications via email</p>
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
                  <Label htmlFor="pushNotifications">Push Notifications</Label>
                  <p className="text-sm text-gray-500">Receive notifications in the browser</p>
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
                  <Label htmlFor="dailyDigest">Daily Digest</Label>
                  <p className="text-sm text-gray-500">Receive a daily summary of activities</p>
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
                  <Label htmlFor="leadAlerts">Lead Alerts</Label>
                  <p className="text-sm text-gray-500">Get notified when new leads are created</p>
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
                  <Label htmlFor="contractAlerts">Contract Alerts</Label>
                  <p className="text-sm text-gray-500">Get notified about contract status changes</p>
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
                Save Changes
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="integrations">
          <Card>
            <CardHeader>
              <CardTitle>Integration Settings</CardTitle>
              <CardDescription>Configure external service integrations</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="openaiApiKey">OpenAI API Key</Label>
                <Input
                  id="openaiApiKey"
                  type="password"
                  value={integrationSettings.openaiApiKey}
                  onChange={(e) => setIntegrationSettings({ ...integrationSettings, openaiApiKey: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="whatsappApiKey">WhatsApp Business API Key</Label>
                <Input
                  id="whatsappApiKey"
                  type="password"
                  value={integrationSettings.whatsappApiKey}
                  onChange={(e) => setIntegrationSettings({ ...integrationSettings, whatsappApiKey: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="microsoftGraphClientId">Microsoft Graph Client ID</Label>
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
                <Label htmlFor="microsoftGraphClientSecret">Microsoft Graph Client Secret</Label>
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
                <Label htmlFor="awsSesKey">AWS SES Key</Label>
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
                Save Changes
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="users">
          <Card>
            <CardHeader>
              <CardTitle>User Management</CardTitle>
              <CardDescription>Manage users and their permissions</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-medium">Users</h3>
                  <Button>Add User</Button>
                </div>
                <div className="border rounded-md">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left p-3">Name</th>
                        <th className="text-left p-3">Email</th>
                        <th className="text-left p-3">Role</th>
                        <th className="text-left p-3">Status</th>
                        <th className="text-left p-3">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="border-b">
                        <td className="p-3">John Doe</td>
                        <td className="p-3">john.doe@tdx.com</td>
                        <td className="p-3">Admin</td>
                        <td className="p-3">Active</td>
                        <td className="p-3">
                          <Button variant="ghost" size="sm">
                            Edit
                          </Button>
                        </td>
                      </tr>
                      <tr className="border-b">
                        <td className="p-3">Jane Smith</td>
                        <td className="p-3">jane.smith@tdx.com</td>
                        <td className="p-3">Sales</td>
                        <td className="p-3">Active</td>
                        <td className="p-3">
                          <Button variant="ghost" size="sm">
                            Edit
                          </Button>
                        </td>
                      </tr>
                      <tr>
                        <td className="p-3">Bob Johnson</td>
                        <td className="p-3">bob.johnson@tdx.com</td>
                        <td className="p-3">Tech</td>
                        <td className="p-3">Inactive</td>
                        <td className="p-3">
                          <Button variant="ghost" size="sm">
                            Edit
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
