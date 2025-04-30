"use client"

import { useState, useEffect } from "react"
import { useRouter, usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default function DebugNavigationPage() {
  const router = useRouter()
  const pathname = usePathname()
  const [history, setHistory] = useState<string[]>([])
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    setHistory((prev) => [...prev, pathname])
  }, [pathname])

  const testRoutes = [
    "/dashboard",
    "/clients",
    "/projects",
    "/inbox",
    "/quotation",
    "/agent-chat",
    "/prd-generator",
    "/meetings",
    "/contracts",
    "/settings",
  ]

  const navigateTo = (route: string) => {
    try {
      router.push(route)
    } catch (err) {
      setError(`Error navigating to ${route}: ${err instanceof Error ? err.message : "Unknown error"}`)
    }
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <h1 className="text-3xl font-bold">Navigation Debug</h1>

      <Card>
        <CardHeader>
          <CardTitle>Current Path</CardTitle>
          <CardDescription>The current path in the application</CardDescription>
        </CardHeader>
        <CardContent>
          <code className="bg-muted p-2 rounded block">{pathname}</code>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Navigation History</CardTitle>
          <CardDescription>History of paths visited in this session</CardDescription>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2">
            {history.map((path, index) => (
              <li key={index} className="bg-muted p-2 rounded">
                <code>{path}</code>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      {error && (
        <Card className="border-destructive">
          <CardHeader>
            <CardTitle>Navigation Error</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-destructive">{error}</p>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Test Navigation</CardTitle>
          <CardDescription>Click buttons to test navigation to different routes</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-2">
          {testRoutes.map((route) => (
            <Button key={route} onClick={() => navigateTo(route)} variant="outline">
              {route}
            </Button>
          ))}
        </CardContent>
      </Card>
    </div>
  )
}
