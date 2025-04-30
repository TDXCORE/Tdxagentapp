"use client"

import { useRouter, usePathname } from "next/navigation"

export function useNavigation() {
  const router = useRouter()
  const pathname = usePathname()

  const navigate = (path: string) => {
    // Add a small delay to allow for any state updates
    setTimeout(() => {
      router.push(path)
    }, 10)
  }

  const isActive = (path: string) => {
    return pathname === path || pathname.startsWith(`${path}/`)
  }

  return {
    navigate,
    isActive,
    pathname,
  }
}
