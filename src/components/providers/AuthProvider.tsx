"use client"

import React, { createContext, useContext, useState, useEffect } from "react"

type Role = "locked" | "receptionist" | "doctor"

interface AuthContextType {
  role: Role
  login: (pin: string) => boolean
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

  const login = (pin: string) => {
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
