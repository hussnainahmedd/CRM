"use client"

import Link from "next/link";
import { useLiveQuery } from "dexie-react-hooks";
import { db } from "@/lib/db";
import { Card, CardContent } from "@/components/ui/card";
import { UserPlus, Stethoscope, Users, TrendingUp, Activity, ShieldCheck, ChevronRight } from "lucide-react";

export default function Home() {
  const stats = useLiveQuery(async () => {
    const startOfToday = new Date()
    startOfToday.setHours(0, 0, 0, 0)
    
    const todayVisits = await db.visits.where("timestamp").aboveOrEqual(startOfToday).toArray()
    const allPatients = await db.patients.count()
    
    return {
      totalPatients: allPatients,
      todayVisits: todayVisits.length,
      todayRevenue: todayVisits.reduce((sum, v) => sum + v.fee_charged, 0),
      flagged: todayVisits.filter(v => v.flag_status).length
    }
  })

  return (
    <div className="h-full flex flex-col space-y-10 py-6">
      {/* Hero Section */}
      <div className="relative overflow-hidden rounded-3xl bg-navy text-white p-10 md:p-14 shadow-2xl">
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-96 h-96 bg-primary rounded-full mix-blend-multiply filter blur-3xl opacity-50 animate-pulse"></div>
        <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-80 h-80 bg-teal-500 rounded-full mix-blend-multiply filter blur-3xl opacity-30"></div>
        
        <div className="relative z-10">
          <h1 className="text-5xl md:text-6xl font-heading font-bold mb-4 tracking-tight leading-tight text-primary">
            Sadiq Clinic <span className="text-primary font-light italic">CRM</span>
          </h1>
          <p className="text-lg text-gray-300 max-w-xl leading-relaxed">
            Intelligent patient management, instant offline syncing, and streamlined clinical workflows.
          </p>
        </div>
      </div>

      {/* 3D-like Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-2xl p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 relative overflow-hidden group hover:-translate-y-1 transition-transform">
          <div className="absolute -right-6 -top-6 w-24 h-24 bg-primary/10 rounded-full group-hover:scale-150 transition-transform duration-500"></div>
          <p className="text-sm font-medium text-gray-500 mb-1">Total Patients</p>
          <div className="flex items-baseline gap-2">
            <h2 className="text-4xl font-bold text-navy">{stats?.totalPatients || 0}</h2>
            <Users className="w-5 h-5 text-primary" />
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 relative overflow-hidden group hover:-translate-y-1 transition-transform">
          <div className="absolute -right-6 -top-6 w-24 h-24 bg-blue-500/10 rounded-full group-hover:scale-150 transition-transform duration-500"></div>
          <p className="text-sm font-medium text-gray-500 mb-1">Visits Today</p>
          <div className="flex items-baseline gap-2">
            <h2 className="text-4xl font-bold text-navy">{stats?.todayVisits || 0}</h2>
            <Activity className="w-5 h-5 text-blue-500" />
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 relative overflow-hidden group hover:-translate-y-1 transition-transform">
          <div className="absolute -right-6 -top-6 w-24 h-24 bg-green-500/10 rounded-full group-hover:scale-150 transition-transform duration-500"></div>
          <p className="text-sm font-medium text-gray-500 mb-1">Today's Revenue</p>
          <div className="flex items-baseline gap-2">
            <h2 className="text-4xl font-bold text-navy"><span className="text-xl">Rs.</span> {stats?.todayRevenue || 0}</h2>
            <TrendingUp className="w-5 h-5 text-green-500" />
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 relative overflow-hidden group hover:-translate-y-1 transition-transform">
          <div className="absolute -right-6 -top-6 w-24 h-24 bg-red-500/10 rounded-full group-hover:scale-150 transition-transform duration-500"></div>
          <p className="text-sm font-medium text-gray-500 mb-1">Pending Reviews</p>
          <div className="flex items-baseline gap-2">
            <h2 className="text-4xl font-bold text-navy">{stats?.todayVisits !== undefined ? stats.todayVisits - (stats?.flagged || 0) : 0}</h2>
            <ShieldCheck className="w-5 h-5 text-red-500" />
          </div>
        </div>
      </div>

      {/* Action Cards */}
      <div>
        <h3 className="text-xl font-heading font-bold text-navy mb-4">Quick Actions</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Link href="/reception">
            <Card className="h-full border-transparent shadow-sm hover:shadow-xl transition-all duration-300 bg-gradient-to-br from-white to-gray-50 group">
              <CardContent className="p-8 flex flex-col items-center text-center">
                <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform shadow-inner">
                  <UserPlus className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-xl font-bold text-navy mb-2">Reception Entry</h3>
                <p className="text-gray-500 text-sm mb-4">Log new patient visits and process immediate billing.</p>
                <div className="mt-auto text-primary font-medium flex items-center text-sm">
                  Start Entry <ChevronRight className="w-4 h-4 ml-1" />
                </div>
              </CardContent>
            </Card>
          </Link>

          <Link href="/review">
            <Card className="h-full border-transparent shadow-sm hover:shadow-xl transition-all duration-300 bg-gradient-to-br from-white to-gray-50 group">
              <CardContent className="p-8 flex flex-col items-center text-center">
                <div className="w-16 h-16 rounded-2xl bg-blue-500/10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform shadow-inner">
                  <Stethoscope className="h-8 w-8 text-blue-600" />
                </div>
                <h3 className="text-xl font-bold text-navy mb-2">Doctor Review</h3>
                <p className="text-gray-500 text-sm mb-4">Review daily logs, verify data, and flag issues.</p>
                <div className="mt-auto text-blue-600 font-medium flex items-center text-sm">
                  Review Queue <ChevronRight className="w-4 h-4 ml-1" />
                </div>
              </CardContent>
            </Card>
          </Link>

          <Link href="/patients">
            <Card className="h-full border-transparent shadow-sm hover:shadow-xl transition-all duration-300 bg-gradient-to-br from-white to-gray-50 group">
              <CardContent className="p-8 flex flex-col items-center text-center">
                <div className="w-16 h-16 rounded-2xl bg-teal-500/10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform shadow-inner">
                  <Users className="h-8 w-8 text-teal-600" />
                </div>
                <h3 className="text-xl font-bold text-navy mb-2">Patient Database</h3>
                <p className="text-gray-500 text-sm mb-4">Access full patient histories and lifetime records.</p>
                <div className="mt-auto text-teal-600 font-medium flex items-center text-sm">
                  Search DB <ChevronRight className="w-4 h-4 ml-1" />
                </div>
              </CardContent>
            </Card>
          </Link>
        </div>
      </div>
    </div>
  );
}
