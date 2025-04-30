"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"

export default function DebugPage() {
  const [clientInfo, setClientInfo] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function loadDebugInfo() {
      try {
        // Test dynamic imports
        const clientModule = await import("@/lib/supabase/client")

        setClientInfo({
          exports: Object.keys(clientModule),
          hasCreateClient: typeof clientModule.createClient === "function",
          hasCreateClientSide: typeof clientModule.createClientSide === "function",
        })
      } catch (err: any) {
        console.error("Error loading module:", err)
        setError(err.message || "Error loading module")
      } finally {
        setLoading(false)
      }
    }

    loadDebugInfo()
  }, [])

  const testAuthEndpoint = async () => {
    try {
      setLoading(true)
      const response = await fetch("/api/debug-auth")
      const data = await response.json()
      console.log("Auth debug data:", data)
      alert(JSON.stringify(data, null, 2))
    } catch (err: any) {
      console.error("Error testing auth endpoint:", err)
      setError(err.message || "Error testing auth endpoint")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Debug Page</CardTitle>
          <CardDescription>Diagnose module loading and authentication issues</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="space-y-2">
            <h3 className="text-lg font-medium">Client Module Info</h3>
            {loading ? (
              <p>Loading...</p>
            ) : (
              <pre className="bg-muted p-2 rounded-md text-xs overflow-auto max-h-[200px]">
                {JSON.stringify(clientInfo, null, 2)}
              </pre>
            )}
          </div>
        </CardContent>
        <CardFooter className="flex flex-col gap-4">
          <Button onClick={testAuthEndpoint} disabled={loading} className="w-full">
            Test Auth Endpoint
          </Button>
          <Button variant="outline" onClick={() => window.location.reload()} className="w-full">
            Reload Page
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}
