"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export default function DebugRedirectPage() {
  const router = useRouter()
  const [target, setTarget] = useState("/dashboard")
  const [delay, setDelay] = useState("0")

  const handleClientRedirect = () => {
    // Client-side redirect
    setTimeout(
      () => {
        router.push(target)
      },
      Number.parseInt(delay, 10),
    )
  }

  const handleWindowRedirect = () => {
    // Window location redirect
    setTimeout(
      () => {
        window.location.href = target
      },
      Number.parseInt(delay, 10),
    )
  }

  const handleApiRedirect = () => {
    // API redirect
    router.push(`/api/debug-redirect?target=${encodeURIComponent(target)}&delay=${delay}`)
  }

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Prueba de Redirección</CardTitle>
          <CardDescription>Utilice esta página para probar diferentes métodos de redirección</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="target">Destino</Label>
            <Input id="target" value={target} onChange={(e) => setTarget(e.target.value)} placeholder="/dashboard" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="delay">Retraso (ms)</Label>
            <Input id="delay" value={delay} onChange={(e) => setDelay(e.target.value)} placeholder="0" type="number" />
          </div>
        </CardContent>
        <CardFooter className="flex flex-col gap-4">
          <Button onClick={handleClientRedirect} className="w-full">
            Redirección del Cliente (router.push)
          </Button>
          <Button onClick={handleWindowRedirect} className="w-full">
            Redirección de la Ventana (window.location)
          </Button>
          <Button onClick={handleApiRedirect} className="w-full">
            Redirección de la API
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}
