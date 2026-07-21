"use client"

import React, { useState } from "react"
import { useLiveQuery } from "dexie-react-hooks"
import { db } from "@/lib/db"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Search, Users, ChevronRight } from "lucide-react"
import Link from "next/link"
import { useAuth } from "@/components/providers/AuthProvider"

export default function PatientsPage() {
  const { role } = useAuth()
  const [searchQuery, setSearchQuery] = useState("")

  if (role === "receptionist") {
    return (
      <div className="flex flex-col items-center justify-center h-full p-8 text-center space-y-4">
        <Users className="w-16 h-16 text-red-500" />
        <h1 className="text-2xl font-bold text-navy">Access Denied</h1>
        <p className="text-gray-500">You need Doctor privileges to access the full patient database.</p>
      </div>
    )
  }

  const patients = useLiveQuery(
    () => {
      if (searchQuery.trim().length > 0) {
        const lowerQ = searchQuery.toLowerCase()
        return db.patients
          .filter(p => 
            Boolean(p.name.toLowerCase().includes(lowerQ) || 
            (p.phone && p.phone.includes(searchQuery)))
          )
          .reverse()
          .sortBy("created_at")
      }
      return db.patients.orderBy("created_at").reverse().toArray()
    },
    [searchQuery]
  )

  return (
    <div className="h-full flex flex-col space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-heading font-bold text-navy flex items-center gap-2">
            <Users className="h-6 w-6 text-primary" />
            Patient Database
          </h1>
          <p className="text-sm text-gray-500 mt-1">Search and manage full patient records.</p>
        </div>
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 bg-white border-border focus:border-primary shadow-sm h-10" 
            placeholder="Search by name or phone..." 
          />
        </div>
      </div>

      <div className="flex-1 bg-white border border-border rounded-lg shadow-sm overflow-hidden flex flex-col">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-offwhite border-b border-border text-navy uppercase font-semibold text-xs tracking-wider">
              <tr>
                <th className="px-6 py-4">Patient Name</th>
                <th className="px-6 py-4">Age / Gender</th>
                <th className="px-6 py-4">Phone Number</th>
                <th className="px-6 py-4">Total Visits</th>
                <th className="px-6 py-4">Lifetime Value</th>
                <th className="px-6 py-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {patients === undefined ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                    Loading patient records...
                  </td>
                </tr>
              ) : patients.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center">
                    <Users className="h-10 w-10 text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-500 font-medium">No patients found</p>
                  </td>
                </tr>
              ) : (
                patients.map(patient => (
                  <tr key={patient.id} className="hover:bg-gray-50 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="font-semibold text-navy">{patient.name}</div>
                      <div className="text-xs text-gray-400">ID: {patient.id?.slice(0,8)}...</div>
                    </td>
                    <td className="px-6 py-4 text-charcoal">
                      {patient.age} yrs • {patient.gender}
                    </td>
                    <td className="px-6 py-4 text-charcoal">
                      {patient.phone || "—"}
                    </td>
                    <td className="px-6 py-4 font-medium text-charcoal">
                      {patient.total_visits}
                    </td>
                    <td className="px-6 py-4">
                      <span className="font-semibold text-primary">Rs. {patient.total_fees}</span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <Link href={`/patients/${patient.id}`}>
                        <Button variant="ghost" size="sm" className="text-primary hover:bg-primary/10">
                          View Profile <ChevronRight className="w-4 h-4 ml-1" />
                        </Button>
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
