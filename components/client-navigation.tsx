"use client"

import type React from "react"

import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"

interface NavigationLinkProps {
  href: string
  children: React.ReactNode
  className?: string
}

export function NavigationLink({ href, children, className = "" }: NavigationLinkProps) {
  const router = useRouter()

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault()
    router.push(href)
  }

  return (
    <Button variant="link" className={className} onClick={handleClick}>
      {children}
    </Button>
  )
}
