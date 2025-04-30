"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

interface DebugComponentProps {
  componentName: string
  componentPath: string
}

export function DebugComponent({ componentName, componentPath }: DebugComponentProps) {
  const [error, setError] = useState<string | null>(null)
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    async function loadComponent() {
      try {
        const module = await import(componentPath)
        if (module[componentName]) {
          setLoaded(true)
        } else {
          setError(`Component '${componentName}' not found in module '${componentPath}'`)
        }
      } catch (err: any) {
        setError(err.message)
      }
    }

    loadComponent()
  }, [componentName, componentPath])

  return (
    <Card>
      <CardHeader>
        <CardTitle>Component Debug: {componentName}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div>
            <p className="font-semibold">Component Path:</p>
            <p className="text-sm font-mono">{componentPath}</p>
          </div>
          <div>
            <p className="font-semibold">Status:</p>
            {loaded ? (
              <p className="text-green-500">Component loaded successfully</p>
            ) : (
              <p className="text-red-500">Component failed to load</p>
            )}
          </div>
          {error && (
            <div>
              <p className="font-semibold">Error:</p>
              <p className="text-sm font-mono text-red-500">{error}</p>
            </div>
          )}
          <Button
            onClick={() => {
              setError(null)
              setLoaded(false)
              setTimeout(() => {
                import(componentPath)
                  .then((module) => {
                    if (module[componentName]) {
                      setLoaded(true)
                    } else {
                      setError(`Component '${componentName}' not found in module '${componentPath}'`)
                    }
                  })
                  .catch((err) => setError(err.message))
              }, 500)
            }}
          >
            Retry Load
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
