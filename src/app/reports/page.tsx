"use client"

import React, { useState } from "react"
import { useLiveQuery } from "dexie-react-hooks"
import { db } from "@/lib/db"
import { Card, CardContent } from "@/components/ui/card"
import { FileText, Send, Calendar as CalendarIcon, TrendingUp, AlertTriangle, Users, Wallet, Activity } from "lucide-react"
import { sendDailyReport } from "@/lib/whatsapp"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/components/providers/AuthProvider"

export default function ReportsPage() {
  const [isSending, setIsSending] = useState(false)
  const { role } = useAuth()

  // Aggregate today's stats
  const todayVisits = useLiveQuery(async () => {
    const startOfToday = new Date()
    startOfToday.setHours(0, 0, 0, 0)
    return db.visits.where("timestamp").aboveOrEqual(startOfToday).toArray()
  })

  if (role === "receptionist") {
    return (
      <div className="flex flex-col items-center justify-center h-full p-8 text-center space-y-4">
        <AlertTriangle className="w-16 h-16 text-red-500" />
        <h1 className="text-2xl font-bold text-navy">Access Denied</h1>
        <p className="text-gray-500">You need Doctor privileges to view financial reports.</p>
      </div>
    )
  }

  if (todayVisits === undefined) return <div className="p-8 text-center text-gray-500">Loading reports...</div>

  const stats = {
    totalPatients: todayVisits.length,
    totalCollected: todayVisits.reduce((sum, v) => sum + v.fee_charged, 0),
    cashCollected: todayVisits.filter(v => v.payment_method === 'Cash').reduce((sum, v) => sum + v.fee_charged, 0),
    onlineCollected: todayVisits.filter(v => v.payment_method === 'Online').reduce((sum, v) => sum + v.fee_charged, 0),
    flaggedCount: todayVisits.filter(v => v.flag_status).length,
    services: {
      checkup: todayVisits.filter(v => v.services.includes("Checkup")).length,
      drip: todayVisits.filter(v => v.services.includes("Drip")).length,
      gynae: todayVisits.filter(v => v.services.includes("Gynae Consult")).length,
      general: todayVisits.filter(v => v.services.includes("General Clinic")).length,
    }
  }

  const handleSendWhatsApp = async () => {
    setIsSending(true)
    try {
      await sendDailyReport(stats)
    } catch (err) {
      console.error(err)
    } finally {
      setIsSending(false)
    }
  }

  return (
    <div className="max-w-5xl mx-auto space-y-8 py-4">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between md:items-end gap-6 bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
        <div>
          <h1 className="text-4xl font-heading font-bold text-navy flex items-center gap-3">
            <div className="p-3 bg-primary/10 rounded-xl">
              <FileText className="h-8 w-8 text-primary" />
            </div>
            End of Day Report
          </h1>
          <p className="text-gray-500 mt-2 text-lg">
            Summary for <span className="font-semibold text-charcoal">{new Date().toLocaleDateString("en-US", { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
          </p>
        </div>
        
        <Button onClick={handleSendWhatsApp} disabled={isSending} size="lg" className="h-14 px-8 text-lg shadow-md hover:shadow-lg transition-all bg-[#25D366] hover:bg-[#128C7E] text-white">
          <Send className="w-5 h-5 mr-3" />
          {isSending ? "Generating..." : "Generate WhatsApp Report"}
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Metrics */}
        <div className="lg:col-span-2 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="border-none shadow-[0_8px_30px_rgb(0,0,0,0.04)] bg-gradient-to-br from-white to-gray-50 overflow-hidden relative">
              <div className="absolute top-0 right-0 p-6 opacity-10"><Users className="w-24 h-24" /></div>
              <CardContent className="p-8 relative z-10">
                <p className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-2">Total Patients Seen</p>
                <div className="text-5xl font-bold text-navy">{stats.totalPatients}</div>
              </CardContent>
            </Card>

            <Card className="border-none shadow-[0_8px_30px_rgb(0,0,0,0.04)] bg-gradient-to-br from-primary to-teal-800 text-white overflow-hidden relative">
              <div className="absolute top-0 right-0 p-6 opacity-10"><TrendingUp className="w-24 h-24" /></div>
              <CardContent className="p-8 relative z-10">
                <p className="text-sm font-semibold text-teal-100 uppercase tracking-wider mb-2">Total Revenue</p>
                <div className="text-5xl font-bold">
                  <span className="text-3xl font-normal opacity-80 mr-1">Rs.</span>
                  {stats.totalCollected.toLocaleString()}
                </div>
              </CardContent>
            </Card>
          </div>

          <Card className="border-none shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
            <CardContent className="p-8">
              <h3 className="text-lg font-bold text-navy mb-6 flex items-center gap-2">
                <Activity className="w-5 h-5 text-primary" />
                Service Breakdown
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                  { label: "Checkup", count: stats.services.checkup },
                  { label: "Drip / Injection", count: stats.services.drip },
                  { label: "Gynae Consult", count: stats.services.gynae },
                  { label: "General Clinic", count: stats.services.general },
                ].map(service => (
                  <div key={service.label} className="bg-offwhite rounded-xl p-4 border border-gray-100">
                    <div className="text-3xl font-bold text-navy mb-1">{service.count}</div>
                    <div className="text-xs font-medium text-gray-500 uppercase">{service.label}</div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Collection Details */}
        <div className="space-y-6">
          <Card className="border-none shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
            <CardContent className="p-8">
              <h3 className="text-lg font-bold text-navy mb-6 flex items-center gap-2">
                <Wallet className="w-5 h-5 text-primary" />
                Collection Source
              </h3>
              
              <div className="space-y-6">
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="font-medium text-gray-600">Cash Payments</span>
                    <span className="font-bold text-navy">Rs. {stats.cashCollected.toLocaleString()}</span>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-2.5">
                    <div 
                      className="bg-primary h-2.5 rounded-full" 
                      style={{ width: `${stats.totalCollected ? (stats.cashCollected / stats.totalCollected) * 100 : 0}%` }}
                    ></div>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="font-medium text-gray-600">Online Transfers</span>
                    <span className="font-bold text-navy">Rs. {stats.onlineCollected.toLocaleString()}</span>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-2.5">
                    <div 
                      className="bg-blue-500 h-2.5 rounded-full" 
                      style={{ width: `${stats.totalCollected ? (stats.onlineCollected / stats.totalCollected) * 100 : 0}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {stats.flaggedCount > 0 && (
            <div className="bg-red-50 border border-red-100 rounded-2xl p-6 flex items-start gap-4 shadow-sm">
              <div className="p-2 bg-red-100 text-red-600 rounded-lg shrink-0">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div>
                <h4 className="font-bold text-red-900">Flagged Entries Detected</h4>
                <p className="text-sm text-red-700 mt-1">
                  There are <strong>{stats.flaggedCount}</strong> flagged entries in today's log. Please review them before finalizing the day.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
