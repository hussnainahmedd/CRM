"use client"

import React from "react"
import { useAuth } from "@/components/providers/AuthProvider"
import { PinLockScreen } from "@/components/auth/PinLockScreen"
import { Sidebar } from "@/components/layout/Sidebar"

export function AppContent({ children }: { children: React.ReactNode }) {
  const { role } = useAuth()

  if (role === "locked") {
    return <PinLockScreen />
  }

  return (
    <>
      <Sidebar />
      <div className="flex-1 flex flex-col md:ml-64 w-full">
        {/* Mobile Header */}
        <div className="md:hidden bg-navy text-white p-4 flex items-center justify-between shadow-md z-40 sticky top-0">
          <div className="font-heading text-lg font-bold flex items-center gap-2">
            <span className="text-primary">✚</span> Sadiq Clinic
          </div>
        </div>
        
        <main className="flex-1 p-4 sm:p-6 lg:p-8">
          {children}
        </main>
      </div>
    </>
  )
}
