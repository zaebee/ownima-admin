import { useState, useEffect } from "react"
import { Activity } from "lucide-react"
import { api } from "@/lib/api"
import { subDays, format } from "date-fns"
import { MetricsData } from "@/types/dashboard"

import { DashboardSkeleton } from "@/components/dashboard/DashboardSkeleton"
import { StatCards } from "@/components/dashboard/StatCards"
import { RevenueChart } from "@/components/dashboard/RevenueChart"
import { ActionRequiredAlerts } from "@/components/dashboard/ActionRequiredAlerts"
import { UserEngagementCard } from "@/components/dashboard/UserEngagementCard"
import { FleetStatusChart } from "@/components/dashboard/FleetStatusChart"
import { BookingStatusChart } from "@/components/dashboard/BookingStatusChart"
import { OpenSearchAnalytics } from "@/components/dashboard/OpenSearchAnalytics"
import { ReservationsVelocityChart } from "@/components/dashboard/ReservationsVelocityChart"
import { VehicleDemandChart } from "@/components/dashboard/VehicleDemandChart"

export function Dashboard() {
  const [metrics, setMetrics] = useState<MetricsData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        setLoading(true)
        const endDate = new Date()
        const startDate = subDays(endDate, 30)
        
        const response = await api.get('/admin/metrics/blocks', {
          params: {
            date_start: format(startDate, 'yyyy-MM-dd'),
            date_end: format(endDate, 'yyyy-MM-dd')
          }
        })
        
        setMetrics(response.data)
      } catch (error) {
        console.error("Failed to fetch dashboard metrics:", error)
      } finally {
        setLoading(false)
      }
    }
    
    fetchMetrics()
  }, [])

  if (loading || !metrics) {
    return <DashboardSkeleton />
  }

  return (
    <div className="flex flex-col gap-8 pb-10 max-w-7xl mx-auto w-full animate-in fade-in duration-500">
      
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b pb-4">
        <div className="flex flex-col gap-2">
          <h2 className="text-3xl font-bold tracking-tight">Control Center</h2>
          <p className="text-muted-foreground">Platform operations, analytics, and security.</p>
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground bg-muted/30 px-3 py-1.5 rounded-md border text-slate-800 dark:text-slate-200">
          <Activity className="h-4 w-4 text-green-500 animate-pulse" />
          <span>System Healthy</span>
        </div>
      </div>

      <StatCards metrics={metrics} />

      <div className="grid gap-4 md:grid-cols-7">
        <RevenueChart />
        <ActionRequiredAlerts metrics={metrics} />
      </div>

      <UserEngagementCard metrics={metrics} />

      <div className="grid gap-4 md:grid-cols-3">
        <FleetStatusChart metrics={metrics} />
        <OpenSearchAnalytics />
        <BookingStatusChart metrics={metrics} />
      </div>

      {/* Secondary BI Row */}
      <div className="grid gap-6 md:grid-cols-2">
        <ReservationsVelocityChart />
        <VehicleDemandChart />
      </div>
    </div>
  )
}
