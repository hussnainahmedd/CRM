"use client"

import React, { createContext, useContext, useState, useEffect } from "react"

type Role = "locked" | "receptionist" | "doctor"

interface AuthContextType {
  role: Role
  login: (pin: string) => Promise<boolean>
  logout: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

// Default Hardcoded PINs
const RECEPTIONIST_PIN = "1122"
const DOCTOR_PIN = "9988"

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [role, setRole] = useState<Role>("locked")
  const [isInitialized, setIsInitialized] = useState(false)

  // Load session from sessionStorage on mount
  useEffect(() => {
    const savedRole = sessionStorage.getItem("crm_auth_role") as Role
    if (savedRole === "receptionist" || savedRole === "doctor") {
      setRole(savedRole)
    }
    setIsInitialized(true)
  }, [])

  const login = async (pin: string): Promise<boolean> => {
    // Attempt online API login if network is available
    if (typeof window !== "undefined" && navigator.onLine) {
      try {
        const res = await fetch("/api/auth/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ pin })
        })
        
        if (res.ok) {
          const data = await res.json()
          setRole(data.role)
          sessionStorage.setItem("crm_auth_role", data.role)
          localStorage.setItem("crm_offline_pin", pin)
          localStorage.setItem("crm_offline_role", data.role)
          return true
        } else {
          // Explicitly failed online check
          return false
        }
      } catch (err) {
        console.warn("Online login failed, falling back to offline", err)
      }
    }

    // Fallback to offline cached credentials
    const savedPin = localStorage.getItem("crm_offline_pin")
    if (savedPin === pin) {
      const savedRole = (localStorage.getItem("crm_offline_role") as Role) || "receptionist"
      setRole(savedRole)
      sessionStorage.setItem("crm_auth_role", savedRole)
      return true
    }

    // Ultimate fallback for initial offline run
    if (pin === DOCTOR_PIN) {
      setRole("doctor")
      sessionStorage.setItem("crm_auth_role", "doctor")
      return true
    }
    if (pin === RECEPTIONIST_PIN) {
      setRole("receptionist")
      sessionStorage.setItem("crm_auth_role", "receptionist")
      return true
    }
    return false
  }

  const logout = () => {
    setRole("locked")
    sessionStorage.removeItem("crm_auth_role")
  }

  // Prevent hydration flashing by waiting until session is checked
  if (!isInitialized) return null

  return (
    <AuthContext.Provider value={{ role, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
