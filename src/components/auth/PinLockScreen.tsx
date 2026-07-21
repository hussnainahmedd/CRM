"use client"

import React, { useState } from "react"
import { useAuth } from "@/components/providers/AuthProvider"
import { Lock, ShieldCheck, User, Stethoscope } from "lucide-react"

export function PinLockScreen() {
  const { login } = useAuth()
  const [pin, setPin] = useState("")
  const [error, setError] = useState(false)

  const handleKeypad = (num: string) => {
    if (pin.length < 4) {
      setPin(prev => prev + num)
      setError(false)
    }
  }

  const handleDelete = () => {
    setPin(prev => prev.slice(0, -1))
    setError(false)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (pin.length !== 4) return
    
    const success = login(pin)
    if (!success) {
      setError(true)
      setPin("")
    }
  }

  return (
    <div className="fixed inset-0 bg-navy flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-3xl p-8 md:p-12 shadow-2xl w-full max-w-md relative overflow-hidden">
        {/* Decorative background */}
        <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-b from-primary/10 to-transparent"></div>
        
        <div className="relative z-10 flex flex-col items-center">
          <div className="w-20 h-20 bg-primary/10 text-primary rounded-full flex items-center justify-center mb-6 shadow-sm border border-primary/20">
            <ShieldCheck className="w-10 h-10" />
          </div>
          
          <h1 className="text-3xl font-heading font-bold text-navy mb-2">Secure Login</h1>
          <p className="text-sm text-gray-500 mb-8 text-center">
            Enter your 4-digit security PIN to access the Sadiq Clinic CRM.
          </p>

          <form onSubmit={handleSubmit} className="w-full flex flex-col items-center">
            {/* PIN Dots Display */}
            <div className="flex gap-4 mb-8">
              {[0, 1, 2, 3].map((index) => (
                <div 
                  key={index} 
                  className={`w-4 h-4 rounded-full transition-all duration-300 ${
                    pin.length > index 
                      ? "bg-primary scale-110" 
                      : error 
                        ? "bg-red-200 border border-red-300"
                        : "bg-gray-200"
                  }`}
                />
              ))}
            </div>

            {error && <p className="text-red-500 text-sm mb-4 font-medium animate-bounce">Incorrect PIN. Try again.</p>}

            {/* Hidden Input for Keyboard users */}
            <input 
              type="password" 
              maxLength={4}
              value={pin}
              onChange={(e) => setPin(e.target.value.replace(/[^0-9]/g, ''))}
              className="absolute opacity-0 pointer-events-none"
              autoFocus
            />

            {/* Keypad */}
            <div className="grid grid-cols-3 gap-4 w-full mb-8">
              {['1','2','3','4','5','6','7','8','9'].map(num => (
                <button
                  key={num}
                  type="button"
                  onClick={() => handleKeypad(num)}
                  className="h-16 rounded-xl bg-offwhite hover:bg-gray-200 text-navy font-semibold text-2xl transition-colors"
                >
                  {num}
                </button>
              ))}
              <button
                type="button"
                onClick={handleDelete}
                className="h-16 rounded-xl bg-red-50 hover:bg-red-100 text-red-500 font-semibold text-lg transition-colors"
              >
                DEL
              </button>
              <button
                type="button"
                onClick={() => handleKeypad('0')}
                className="h-16 rounded-xl bg-offwhite hover:bg-gray-200 text-navy font-semibold text-2xl transition-colors"
              >
                0
              </button>
              <button
                type="submit"
                disabled={pin.length < 4}
                className={`h-16 rounded-xl font-semibold text-lg transition-colors ${
                  pin.length === 4 
                    ? "bg-primary hover:bg-teal-700 text-white shadow-md" 
                    : "bg-gray-100 text-gray-400"
                }`}
              >
                OK
              </button>
            </div>
          </form>

          <div className="flex justify-center gap-6 text-xs text-gray-400">
            <span className="flex items-center gap-1"><User className="w-3 h-3"/> Rec: 1122</span>
            <span className="flex items-center gap-1"><Stethoscope className="w-3 h-3"/> Doc: 9988</span>
          </div>
        </div>
      </div>
    </div>
  )
}
