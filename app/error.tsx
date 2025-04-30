"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  const router = useRouter()
  const [isRedirecting, setIsRedirecting] = useState(false)
  const [redirectTarget, setRedirectTarget] = useState<string | null>(null)
  const [redirectTimeout, setRedirectTimeout] = useState<NodeJS.Timeout | null>(null)

  useEffect(() => {
    // Log the error to an error reporting service
    console.error("Application error:", error)

    // Clear any existing timeout when the component unmounts or error changes
    return () => {
      if (redirectTimeout) {
        clearTimeout(redirectTimeout)
      }
    }
  }, [error, redirectTimeout])

  useEffect(() => {
    // Handle redirect errors
    if (error.message === "REDIRECT_ERROR" || error.message === "Redirect") {
      setIsRedirecting(true)

      // Extract redirect target from error if available
      const redirectMatch = error.stack?.match(/Redirect to "([^"]+)"/)
      const target = redirectMatch ? redirectMatch[1] : "/auth/login"
      setRedirectTarget(target)

      // Use client-side navigation instead of window.location for better UX
      const timeout = setTimeout(() => {
        try {
          router.push(target)
        } catch (e) {
          console.error("Failed to redirect using router:", e)
          // Fallback to window.location if router fails
          window.location.href = target
        }
      }, 2000)

      setRedirectTimeout(timeout)
    }
  }, [error, router])

  // If the error is a redirect, show a loading message
  if (isRedirecting) {
    return (
      <div className="flex min-h-screen items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Redirigiendo...</CardTitle>
            <CardDescription>Por favor espere mientras lo redirigimos.</CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent"></div>
          </CardContent>
          {redirectTarget && (
            <CardFooter className="flex justify-center">
              <Button
                variant="link"
                onClick={() => {
                  if (redirectTimeout) clearTimeout(redirectTimeout)
                  window.location.href = redirectTarget
                }}
              >
                Haga clic aquí si no es redirigido automáticamente
              </Button>
            </CardFooter>
          )}
        </Card>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Algo salió mal</CardTitle>
          <CardDescription>Ha ocurrido un error en la aplicación. Nuestro equipo ha sido notificado.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="bg-muted p-4 rounded-md overflow-auto max-h-[200px]">
            <p className="font-mono text-sm">{error.message}</p>
            {process.env.NODE_ENV === "development" && (
              <pre className="mt-2 text-xs text-muted-foreground">{error.stack}</pre>
            )}
          </div>
        </CardContent>
        <CardFooter className="flex flex-col gap-4">
          <Button onClick={reset} className="w-full">
            Intentar de nuevo
          </Button>
          <Button variant="outline" onClick={() => router.push("/")} className="w-full">
            Volver al inicio
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}
