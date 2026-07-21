"use client"

import React, { useState } from "react"
import { useLiveQuery } from "dexie-react-hooks"
import { db } from "@/lib/db"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ShieldCheck, Flag, CheckCircle, Clock } from "lucide-react"
import { useAuth } from "@/components/providers/AuthProvider"

export default function ReviewPage() {
  const { role } = useAuth()
  const [flagReason, setFlagReason] = useState<Record<string, string>>({})

  if (role === "receptionist") {
    return (
      <div className="flex flex-col items-center justify-center h-full p-8 text-center space-y-4">
        <ShieldCheck className="w-16 h-16 text-red-500" />
        <h1 className="text-2xl font-bold text-navy">Access Denied</h1>
        <p className="text-gray-500">You need Doctor privileges to access the review queue.</p>
      </div>
    )
  }

  // Fetch all today's visits
  const todayVisits = useLiveQuery(async () => {
    const startOfDay = new Date()
    startOfDay.setHours(0, 0, 0, 0)
    
    const visits = await db.visits
      .where("timestamp")
      .aboveOrEqual(startOfDay)
      .reverse()
      .toArray()
      
    // Fetch patient names for these visits
    const visitsWithPatients = await Promise.all(
      visits.map(async (v) => {
        const p = await db.patients.get(v.patient_id)
        return { ...v, patient_name: p?.name || "Unknown" }
      })
    )
    return visitsWithPatients
  })

  const toggleFlag = async (visitId: string, currentStatus: boolean) => {
    await db.visits.update(visitId, { flag_status: !currentStatus })
  }

  return (
    <div className="h-full flex flex-col space-y-6">
      <div>
        <h1 className="text-2xl font-heading font-bold text-navy flex items-center gap-2">
          <ShieldCheck className="h-6 w-6 text-primary" />
          Doctor's Daily Review
        </h1>
        <p className="text-sm text-gray-500 mt-1">Review locked entries from the reception desk.</p>
      </div>

      <div className="flex-1 bg-white border border-border rounded-lg shadow-sm overflow-hidden flex flex-col">
        {todayVisits === undefined ? (
          <div className="p-8 text-center text-gray-500">Loading today's records...</div>
        ) : todayVisits.length === 0 ? (
          <div className="p-12 text-center">
            <CheckCircle className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-navy">No visits yet</h3>
            <p className="text-sm text-gray-500">Reception entries will appear here for review.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead className="bg-offwhite border-b border-border text-navy uppercase font-semibold text-xs tracking-wider">
                <tr>
                  <th className="px-6 py-4">Time</th>
                  <th className="px-6 py-4">Patient</th>
                  <th className="px-6 py-4">Services</th>
                  <th className="px-6 py-4">Fee Charged</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {todayVisits.map(visit => (
                  <tr key={visit.id} className={`transition-colors ${visit.flag_status ? 'bg-red-50/50' : 'hover:bg-gray-50'}`}>
                    <td className="px-6 py-4 text-gray-500 flex items-center gap-2">
                      <Clock className="w-4 h-4" />
                      {visit.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </td>
                    <td className="px-6 py-4 font-semibold text-navy">
                      {visit.patient_name}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex gap-1 flex-wrap w-48 overflow-hidden">
                        {visit.services.map(s => (
                          <span key={s} className="text-xs bg-gray-100 text-charcoal px-2 py-1 rounded border border-gray-200">
                            {s}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="font-semibold text-primary">Rs. {visit.fee_charged}</span>
                      <span className="text-xs text-gray-400 ml-1">({visit.payment_method})</span>
                    </td>
                    <td className="px-6 py-4">
                      {visit.flag_status ? (
                        <Badge variant="destructive" className="bg-red-100 text-red-700 border-red-200 hover:bg-red-200">Flagged</Badge>
                      ) : (
                        <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">Verified</Badge>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                      {visit.flag_status ? (
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => toggleFlag(visit.id, visit.flag_status)}
                          className="text-gray-600"
                        >
                          Unflag
                        </Button>
                      ) : (
                        <div className="flex items-center justify-end gap-2">
                          <input 
                            className="border border-border rounded px-2 py-1 text-xs w-32 focus:outline-none focus:border-primary"
                            placeholder="Reason for flag..."
                            value={flagReason[visit.id] || ""}
                            onChange={(e) => setFlagReason({...flagReason, [visit.id]: e.target.value})}
                          />
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="text-red-600 hover:bg-red-50 hover:text-red-700"
                            onClick={() => toggleFlag(visit.id, visit.flag_status)}
                          >
                            <Flag className="w-4 h-4 mr-1" /> Flag
                          </Button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
