"use server"

import { redirect } from "next/navigation"

/**
 * Safe redirect function that adds context to the redirect
 * This helps the error boundary component extract the target URL
 */
export async function safeRedirect(destination: string, reason?: string) {
  // Create a custom error with the redirect target in the message
  const redirectError = new Error(`Redirect to "${destination}"${reason ? ` - ${reason}` : ""}`)
  redirectError.name = "RedirectError"

  // Use Next.js redirect function
  redirect(destination)
}

/**
 * Client-side redirect with delay
 * Note: This function is meant to be used on the client side only
 */
export async function clientRedirect(destination: string, delay = 0) {
  return new Promise<void>((resolve) => {
    setTimeout(() => {
      window.location.href = destination
      resolve()
    }, delay)
  })
}
