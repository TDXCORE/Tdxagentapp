"use client"

import type React from "react"

import { createContext, useContext, useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"

type AuthContextType = {
  isLoading: boolean
  isAuthenticated: boolean
  checkSession: () => Promise<boolean>
}

const AuthContext = createContext<AuthContextType>({
  isLoading: true,
  isAuthenticated: false,
  checkSession: async () => false,
})

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isLoading, setIsLoading] = useState(true)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const checkSession = async () => {
    try {
      const { data, error } = await supabase.auth.getSession()

      if (error) {
        console.error("Error checking session:", error.message)
        setIsAuthenticated(false)
        return false
      }

      const hasSession = !!data.session
      setIsAuthenticated(hasSession)
      return hasSession
    } catch (error) {
      console.error("Exception checking session:", error)
      setIsAuthenticated(false)
      return false
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    checkSession()

    // Set up auth state change listener
    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      console.log("Auth state changed:", event)
      setIsAuthenticated(!!session)
      setIsLoading(false)

      if (event === "SIGNED_OUT") {
        router.push("/auth/login")
      } else if (event === "SIGNED_IN") {
        router.push("/dashboard")
      }
    })

    return () => {
      authListener.subscription.unsubscribe()
    }
  }, [router, supabase.auth])

  return <AuthContext.Provider value={{ isLoading, isAuthenticated, checkSession }}>{children}</AuthContext.Provider>
}

export const useAuth = () => useContext(AuthContext)
