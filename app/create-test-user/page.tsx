"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"

export default function CreateTestUserPage() {
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)

  const handleCreateTestUser = async () => {
    setLoading(true)
    setError(null)
    setResult(null)

    try {
      const response = await fetch("/api/create-test-user", {
        method: "POST",
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Error creating test user")
      }

      const data = await response.json()
      setResult(data)
    } catch (error: any) {
      console.error("Error creating test user:", error)
      setError(error.message || "Error creating test user")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Create Test User</CardTitle>
          <CardDescription>Create a test user for development purposes</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {result && (
            <Alert>
              <AlertDescription>
                <div className="space-y-2">
                  <p>Test user created successfully!</p>
                  <p>
                    <strong>Email:</strong> {result.email}
                  </p>
                  <p>
                    <strong>Password:</strong> {result.password}
                  </p>
                </div>
              </AlertDescription>
            </Alert>
          )}

          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">
              This will create a test user with a random email and password. Use this for development purposes only.
            </p>
          </div>
        </CardContent>
        <CardFooter>
          <Button className="w-full" onClick={handleCreateTestUser} disabled={loading}>
            {loading ? "Creating..." : "Create Test User"}
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}
