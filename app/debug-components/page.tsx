"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { DebugComponent } from "@/components/debug-component"

export default function DebugComponentsPage() {
  const [componentName, setComponentName] = useState("KpiCards")
  const [componentPath, setComponentPath] = useState("@/components/kpi-cards")
  const [debugComponents, setDebugComponents] = useState<Array<{ name: string; path: string }>>([
    { name: "KpiCards", path: "@/components/kpi-cards" },
  ])

  return (
    <div className="container mx-auto py-8 space-y-8">
      <h1 className="text-3xl font-bold">Debug Components</h1>

      <Card>
        <CardHeader>
          <CardTitle>Add Component to Debug</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="componentName" className="block text-sm font-medium mb-1">
                Component Name
              </label>
              <Input
                id="componentName"
                value={componentName}
                onChange={(e) => setComponentName(e.target.value)}
                placeholder="e.g., KpiCards"
              />
            </div>
            <div>
              <label htmlFor="componentPath" className="block text-sm font-medium mb-1">
                Component Path
              </label>
              <Input
                id="componentPath"
                value={componentPath}
                onChange={(e) => setComponentPath(e.target.value)}
                placeholder="e.g., @/components/kpi-cards"
              />
            </div>
          </div>
          <Button
            className="mt-4"
            onClick={() => {
              setDebugComponents([...debugComponents, { name: componentName, path: componentPath }])
              setComponentName("")
              setComponentPath("")
            }}
          >
            Add Component
          </Button>
        </CardContent>
      </Card>

      <div className="space-y-6">
        {debugComponents.map((component, index) => (
          <DebugComponent key={index} componentName={component.name} componentPath={component.path} />
        ))}
      </div>
    </div>
  )
}
