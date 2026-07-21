"use client"

import React, { useState } from "react"
import { db } from "@/lib/db"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { UserPlus, Save, DollarSign, Activity, FileText } from "lucide-react"

const SERVICES = ["Checkup", "Drip", "Injection", "Gynae Consult", "General Clinic"]

export default function ReceptionPage() {
  const [name, setName] = useState("")
  const [age, setAge] = useState("")
  const [gender, setGender] = useState<"Male" | "Female" | "Other">("Female")
  const [phone, setPhone] = useState("")
  const [selectedServices, setSelectedServices] = useState<string[]>([])
  const [fee, setFee] = useState("")
  const [paymentMethod, setPaymentMethod] = useState<"Cash" | "Online">("Cash")
  
  const [isSubmitting, setIsSubmitting] = useState(false)

  const toggleService = (service: string) => {
    setSelectedServices(prev => 
      prev.includes(service) ? prev.filter(s => s !== service) : [...prev, service]
    )
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name || selectedServices.length === 0 || !fee) return

    setIsSubmitting(true)
    try {
      const patientId = crypto.randomUUID()
      await db.patients.add({
        id: patientId,
        name,
        age: parseInt(age) || 0,
        gender,
        phone,
        total_visits: 1,
        total_fees: parseInt(fee),
        created_at: new Date(),
        synced: false
      })

      await db.visits.add({
        id: crypto.randomUUID(),
        patient_id: patientId,
        services: selectedServices,
        fee_charged: parseInt(fee),
        payment_method: paymentMethod,
        timestamp: new Date(),
        flag_status: false,
        synced: false
      })

      setName("")
      setAge("")
      setPhone("")
      setSelectedServices([])
      setFee("")
      setPaymentMethod("Cash")
      alert("Patient visit logged successfully!")
    } catch (err) {
      console.error(err)
      alert("Error saving record.")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="h-full flex flex-col space-y-6">
      <div>
        <h1 className="text-2xl font-heading font-bold text-navy flex items-center gap-2">
          <UserPlus className="h-6 w-6 text-primary" />
          Reception Entry
        </h1>
        <p className="text-sm text-gray-500 mt-1">Log new patient visits quickly.</p>
      </div>

      <div className="flex-1 bg-white border border-border rounded-lg shadow-sm flex flex-col lg:flex-row overflow-hidden">
        {/* Left Column: Demographics */}
        <div className="w-full lg:w-1/2 p-6 lg:p-8 bg-offwhite/50 border-b lg:border-b-0 lg:border-r border-border">
          <div className="flex items-center gap-2 mb-6 text-navy font-semibold pb-4 border-b border-border">
            <Activity className="h-5 w-5 text-primary" />
            Patient Demographics
          </div>
          
          <div className="space-y-5">
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-charcoal">Patient Name <span className="text-red-500">*</span></label>
              <Input value={name} onChange={e => setName(e.target.value)} required placeholder="e.g. Ali Khan" className="bg-white" />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-charcoal">Phone Number</label>
                <Input value={phone} onChange={e => setPhone(e.target.value)} placeholder="0300 1234567" className="bg-white" />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-charcoal">Age</label>
                <Input value={age} onChange={e => setAge(e.target.value)} type="number" placeholder="e.g. 30" className="bg-white" />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-medium text-charcoal">Gender</label>
              <div className="flex gap-3">
                {["Female", "Male", "Other"].map(g => (
                  <label key={g} className="flex items-center gap-2 cursor-pointer">
                    <input 
                      type="radio" 
                      name="gender" 
                      value={g} 
                      checked={gender === g}
                      onChange={() => setGender(g as any)}
                      className="text-primary focus:ring-primary"
                    />
                    <span className="text-sm text-charcoal">{g}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Visit Details */}
        <div className="w-full lg:w-1/2 p-6 lg:p-8 bg-white flex flex-col">
          <div className="flex items-center gap-2 mb-6 text-navy font-semibold pb-4 border-b border-border">
            <FileText className="h-5 w-5 text-primary" />
            Clinical Visit & Billing
          </div>

          <div className="space-y-8 flex-1">
            <div className="space-y-3">
              <label className="text-sm font-medium text-charcoal flex items-center justify-between">
                <span>Services Provided <span className="text-red-500">*</span></span>
                <span className="text-xs text-gray-400 font-normal">Select all that apply</span>
              </label>
              <div className="flex flex-wrap gap-2">
                {SERVICES.map(service => {
                  const isSelected = selectedServices.includes(service)
                  return (
                    <Badge 
                      key={service}
                      variant={isSelected ? "default" : "outline"}
                      className={`cursor-pointer px-4 py-2 text-sm border-gray-300 ${isSelected ? 'shadow-sm' : ''}`}
                      onClick={() => toggleService(service)}
                    >
                      {service}
                    </Badge>
                  )
                })}
              </div>
            </div>

            <div className="space-y-3">
              <label className="text-sm font-medium text-charcoal">Fee Charged (Rs) <span className="text-red-500">*</span></label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                <Input 
                  value={fee} 
                  onChange={e => setFee(e.target.value)} 
                  type="number" 
                  required 
                  placeholder="0" 
                  className="pl-10 h-12 text-lg font-medium bg-offwhite/30" 
                />
              </div>
            </div>

            <div className="space-y-3">
              <label className="text-sm font-medium text-charcoal">Payment Method <span className="text-red-500">*</span></label>
              <div className="flex gap-2">
                <Button 
                  type="button"
                  variant={paymentMethod === "Cash" ? "default" : "outline"}
                  onClick={() => setPaymentMethod("Cash")}
                  className={`flex-1 h-12 ${paymentMethod === "Cash" ? "ring-2 ring-primary ring-offset-2" : ""}`}
                >
                  Cash
                </Button>
                <Button 
                  type="button"
                  variant={paymentMethod === "Online" ? "default" : "outline"}
                  onClick={() => setPaymentMethod("Online")}
                  className={`flex-1 h-12 ${paymentMethod === "Online" ? "ring-2 ring-primary ring-offset-2" : ""}`}
                >
                  Online Transfer
                </Button>
              </div>
            </div>
          </div>

          <div className="pt-6 mt-6 border-t border-border">
            <Button 
              onClick={handleSubmit}
              disabled={isSubmitting || !name || selectedServices.length === 0 || !fee}
              className="w-full h-14 text-lg font-medium shadow-md"
            >
              <Save className="w-5 h-5 mr-2" />
              {isSubmitting ? "Saving..." : "Lock & Save Visit"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
