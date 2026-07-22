"use client"

import React, { useState, useEffect } from "react"
import { useAuth } from "@/components/providers/AuthProvider"
import { PinLockScreen } from "@/components/auth/PinLockScreen"
import { Sidebar } from "@/components/layout/Sidebar"
import { Download, Lock } from "lucide-react"

export function AppContent({ children }: { children: React.ReactNode }) {
  const { role, logout } = useAuth()

  // PWA Install Prompt Logic for Mobile Header
  const [installPrompt, setInstallPrompt] = useState<any>(null)
  
  useEffect(() => {
    const handler = (e: any) => {
      e.preventDefault();
      setInstallPrompt(e);
    };
    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  const handleInstall = async () => {
    if (!installPrompt) return;
    installPrompt.prompt();
    const { outcome } = await installPrompt.userChoice;
    if (outcome === "accepted") {
      setInstallPrompt(null);
    }
  };

  if (role === "locked") {
    return <PinLockScreen />
  }

  return (
    <>
      <Sidebar />
      <div className="flex-1 flex flex-col md:ml-64 w-full">
        <div className="md:hidden bg-navy text-white p-4 flex items-center justify-between shadow-md z-40 sticky top-0">
          <div className="font-heading text-lg font-bold flex items-center gap-2">
            <span className="text-primary">✚</span> Sadiq Clinic
          </div>
          <div className="flex items-center gap-3">
            {installPrompt && (
              <button 
                onClick={handleInstall}
                className="flex items-center gap-1.5 bg-teal-500 hover:bg-teal-400 text-white py-1.5 px-3 rounded text-sm font-medium transition-colors"
              >
                <Download className="w-3.5 h-3.5" /> Install
              </button>
            )}
            <button 
              onClick={logout}
              className="p-1.5 bg-white/10 hover:bg-white/20 text-white rounded transition-colors"
              title="Lock App"
            >
              <Lock className="w-4 h-4" />
            </button>
          </div>
        </div>
        
        <main className="flex-1 p-4 sm:p-6 lg:p-8">
          {children}
        </main>
      </div>
    </>
  )
}
