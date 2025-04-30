import { NextResponse } from "next/server"

export async function GET(request: Request) {
  const url = new URL(request.url)
  const target = url.searchParams.get("target") || "/dashboard"
  const delay = Number.parseInt(url.searchParams.get("delay") || "0", 10)

  // If delay is specified, wait before redirecting
  if (delay > 0) {
    await new Promise((resolve) => setTimeout(resolve, delay))
  }

  // Return a redirect response
  return NextResponse.redirect(new URL(target, request.url))
}
