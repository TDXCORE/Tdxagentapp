// Global error handler for client-side errors
export function setupErrorHandler() {
  if (typeof window !== "undefined") {
    window.addEventListener("error", (event) => {
      console.error("Global error caught:", event.error)

      // You could send this to a logging service
      // logErrorToService(event.error)

      // Optionally prevent the browser's default error handling
      // event.preventDefault()
    })

    window.addEventListener("unhandledrejection", (event) => {
      console.error("Unhandled promise rejection:", event.reason)

      // You could send this to a logging service
      // logErrorToService(event.reason)

      // Optionally prevent the browser's default error handling
      // event.preventDefault()
    })
  }
}

// Initialize the error handler in a client component
export function initErrorHandler() {
  if (typeof window !== "undefined") {
    setupErrorHandler()
  }
}
