"use client"

import React, { use } from "react"
import { useLiveQuery } from "dexie-react-hooks"
import { db } from "@/lib/db"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Activity, Calendar, DollarSign, User, Phone, Tag, Clock, ShieldCheck } from "lucide-react"
import Link from "next/link"
import { useAuth } from "@/components/providers/AuthProvider"

export default function PatientProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params)
  const patientId = resolvedParams.id
  const { role } = useAuth()
  
  const patient = useLiveQuery(() => db.patients.get(patientId), [patientId])
  const visits = useLiveQuery(
    () => db.visits.where("patient_id").equals(patientId).reverse().sortBy("timestamp"),
    [patientId]
  )

  if (role === "receptionist") {
    return (
      <div className="flex flex-col items-center justify-center h-full p-8 text-center space-y-4">
        <ShieldCheck className="w-16 h-16 text-red-500" />
        <h1 className="text-2xl font-bold text-navy">Access Denied</h1>
        <p className="text-gray-500">You need Doctor privileges to view complete patient profiles.</p>
      </div>
    )
  }

  if (patient === undefined || visits === undefined) return <div className="p-8 text-center text-gray-500">Loading profile...</div>
  if (!patient) return <div className="p-8 text-center text-red-500">Patient not found</div>

  return (
    <div className="h-full flex flex-col space-y-6">
      {/* Breadcrumb / Top Bar */}
      <div className="flex items-center text-sm text-gray-500 gap-2">
        <Link href="/patients" className="hover:text-primary transition-colors">Patients</Link>
        <span>/</span>
        <span className="text-navy font-medium">{patient.name}</span>
      </div>

      <div className="flex flex-col lg:flex-row gap-6 items-start">
        {/* Left Column: Demographics */}
        <div className="w-full lg:w-1/3 shrink-0 space-y-6">
          <Card className="border-border shadow-sm overflow-hidden">
            <div className="h-24 bg-navy"></div>
            <CardContent className="px-6 pb-6 pt-0 relative">
              <div className="w-20 h-20 rounded-xl bg-white border-4 border-white shadow-sm flex items-center justify-center -mt-10 mb-4 text-3xl font-bold text-primary">
                {patient.name.charAt(0).toUpperCase()}
              </div>
              <h2 className="text-2xl font-heading font-bold text-navy mb-1">{patient.name}</h2>
              <div className="text-sm text-gray-500 flex flex-wrap gap-2 mb-6">
                <span>{patient.gender}</span> • <span>{patient.age} yrs</span>
              </div>

              <div className="space-y-4">
                <div className="flex items-center gap-3 text-sm text-charcoal">
                  <Phone className="w-4 h-4 text-gray-400" />
                  {patient.phone || "No phone number"}
                </div>
                <div className="flex items-center gap-3 text-sm text-charcoal">
                  <Tag className="w-4 h-4 text-gray-400" />
                  Patient ID: {patient.id?.slice(0, 8)}
                </div>
              </div>

              <hr className="my-6 border-border" />

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-offwhite p-3 rounded-lg border border-border">
                  <div className="text-xs text-gray-500 mb-1">Total Visits</div>
                  <div className="text-xl font-bold text-navy">{patient.total_visits}</div>
                </div>
                <div className="bg-offwhite p-3 rounded-lg border border-border">
                  <div className="text-xs text-gray-500 mb-1">Lifetime Value</div>
                  <div className="text-xl font-bold text-primary">Rs. {patient.total_fees}</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Clinical Timeline */}
        <div className="w-full lg:w-2/3 flex-1">
          <Card className="border-border shadow-sm h-full min-h-[500px]">
            <div className="border-b border-border bg-offwhite px-6 py-4 flex gap-6 font-medium text-sm">
              <div className="text-primary border-b-2 border-primary pb-4 -mb-4">Visit History</div>
              <div className="text-gray-400 cursor-not-allowed">Clinical Notes</div>
              <div className="text-gray-400 cursor-not-allowed">Documents</div>
            </div>
            
            <CardContent className="p-6">
              {visits.length === 0 ? (
                <div className="text-center text-gray-500 py-12">No visits recorded.</div>
              ) : (
                <div className="space-y-6">
                  {visits.map((visit) => (
                    <div key={visit.id} className="relative pl-6 pb-6 border-l-2 border-gray-200 last:border-0 last:pb-0">
                      <div className="absolute -left-[9px] top-0 w-4 h-4 rounded-full border-2 border-white bg-primary"></div>
                      
                      <div className="bg-white border border-border rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow">
                        <div className="flex justify-between items-start mb-3">
                          <div className="flex items-center gap-2">
                            <Calendar className="w-4 h-4 text-primary" />
                            <span className="font-semibold text-navy">
                              {visit.timestamp.toLocaleDateString("en-US", { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}
                            </span>
                            <span className="text-xs text-gray-400 ml-2 flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {visit.timestamp.toLocaleTimeString("en-US", { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>
                          <div className="text-right">
                            <div className="font-bold text-primary text-lg">Rs. {visit.fee_charged}</div>
                            <div className="text-xs text-gray-500">{visit.payment_method}</div>
                          </div>
                        </div>

                        <div className="flex flex-wrap gap-2">
                          {visit.services.map(s => (
                            <Badge key={s} variant="secondary" className="bg-gray-100 text-charcoal font-normal border border-gray-200">
                              {s}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
