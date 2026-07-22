"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Stethoscope, Users, UserPlus, ShieldCheck, FileText, Lock, Download, RefreshCw } from "lucide-react"
import { cn } from "@/lib/utils"
import { useAuth } from "@/components/providers/AuthProvider"

export function Sidebar() {
  const pathname = usePathname()
  const { role, logout } = useAuth()

  const allLinks = [
    { name: "Dashboard", href: "/", icon: Stethoscope, roles: ["doctor", "receptionist"] },
    { name: "Reception Entry", href: "/reception", icon: UserPlus, roles: ["doctor", "receptionist"] },
    { name: "Patient Database", href: "/patients", icon: Users, roles: ["doctor"] },
    { name: "Doctor Review", href: "/review", icon: ShieldCheck, roles: ["doctor"] },
    { name: "Daily Reports", href: "/reports", icon: FileText, roles: ["doctor"] },
  ]

  const links = allLinks.filter(link => link.roles.includes(role))

  // PWA Install Prompt Logic
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

  return (
    <aside className="w-64 bg-navy text-offwhite hidden md:flex flex-col h-screen fixed top-0 left-0">
      <div className="h-16 flex items-center px-6 border-b border-white/10">
        <Stethoscope className="h-6 w-6 text-primary mr-3" />
        <span className="font-heading text-xl font-bold tracking-wide text-white">Sadiq Clinic</span>
      </div>

      <div className="flex-1 overflow-y-auto py-6 px-4 space-y-1">
        {links.map((link) => {
          const isActive = pathname === link.href || (link.href !== "/" && pathname.startsWith(link.href))
          return (
            <Link
              key={link.name}
              href={link.href}
              className={cn(
                "flex items-center px-4 py-3 text-sm font-medium rounded-md transition-colors",
                isActive 
                  ? "bg-primary text-white" 
                  : "text-gray-300 hover:bg-white/10 hover:text-white"
              )}
            >
              <link.icon className={cn("mr-3 h-5 w-5", isActive ? "text-white" : "text-gray-400")} />
              {link.name}
            </Link>
          )
        })}
      </div>

      {installPrompt && (
        <div className="px-4 pb-4">
          <button 
            onClick={handleInstall}
            className="w-full flex items-center justify-center gap-2 bg-teal-500 hover:bg-teal-400 text-white py-2 px-4 rounded-md font-medium transition-colors shadow-lg shadow-teal-500/20"
          >
            <Download className="w-4 h-4" /> Install CRM App
          </button>
        </div>
      )}

      <div className="p-4 border-t border-white/10">
        <div className="flex items-center justify-between px-2 py-3">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-white font-bold">
              {role === "doctor" ? "D" : "R"}
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-medium text-white capitalize truncate w-32">
                {role === "doctor" ? "Dr. Rizwan Sadiq" : "Reception"}
              </span>
              <span className="text-xs text-gray-400 capitalize">{role}</span>
            </div>
          </div>
          
          <div className="flex items-center gap-1">
            <button 
              onClick={logout}
              className="p-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-full transition-colors"
              title="Lock App"
            >
              <Lock className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </aside>
  )
}
