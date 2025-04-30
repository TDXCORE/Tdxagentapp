"use client"

import { useEffect } from "react"

let isErrorLoggerInitialized = false

export function initErrorLogger() {
  if (typeof window === "undefined" || isErrorLoggerInitialized) {
    return
  }

  isErrorLoggerInitialized = true

  // Store the original console.error
  const originalConsoleError = console.error

  // Override console.error to add additional logging
  console.error = (...args) => {
    // Call the original console.error
    originalConsoleError.apply(console, args)

    // Check if this is a redirect error
    const errorArg = args.find(
      (arg) => arg instanceof Error || (typeof arg === "object" && arg !== null && "message" in arg),
    )
    if (errorArg && (errorArg.message === "REDIRECT_ERROR" || errorArg.message === "Redirect")) {
      originalConsoleError.call(console, "Redirect error detected:", {
        message: errorArg.message,
        stack: errorArg.stack,
        name: errorArg.name,
      })
    }
  }

  // Capture unhandled promise rejections
  window.addEventListener("unhandledrejection", (event) => {
    originalConsoleError.call(console, "Unhandled Promise Rejection:", event.reason)
  })

  // Capture global errors
  window.addEventListener("error", (event) => {
    originalConsoleError.call(console, "Global Error:", event.error || event.message)
  })
}

export function ErrorLogger() {
  useEffect(() => {
    initErrorLogger()
  }, [])

  return null
}
