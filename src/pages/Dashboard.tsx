import { useState, useEffect, useRef } from "react"
import { Activity, Server, RotateCcw } from "lucide-react"
import { api } from "@/lib/api"
import { subDays, format } from "date-fns"
import { MetricsData } from "@/types/dashboard"
import { Button } from "@/components/ui/button"

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
  const [systemInfo, setSystemInfo] = useState<any>(null)
  const [isResetting, setIsResetting] = useState(false)
  const [sysInfoOpen, setSysInfoOpen] = useState(false)
  const sysInfoRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    // Close dropdown on outside click
    const handleClickOutside = (event: MouseEvent) => {
      if (sysInfoRef.current && !sysInfoRef.current.contains(event.target as Node)) {
        setSysInfoOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        setLoading(true)
        const endDate = new Date()
        const startDate = subDays(endDate, 30)
        
        const [metricsResponse, systemResponse] = await Promise.all([
           api.get('/admin/metrics/blocks', {
            params: {
              date_start: format(startDate, 'yyyy-MM-dd'),
              date_end: format(endDate, 'yyyy-MM-dd')
            }
          }),
          api.get('/admin/system/info').catch(() => ({ data: null }))
        ])
        
        setMetrics(metricsResponse.data)
        if (systemResponse?.data) {
          setSystemInfo(systemResponse.data)
        }
      } catch (error) {
        console.error("Failed to fetch dashboard metrics:", error)
      } finally {
        setLoading(false)
      }
    }
    
    fetchMetrics()
  }, [])

  const handleResetShowcase = async () => {
    if (!window.confirm("Are you SURE you want to completely reset the showcase account? This action deletes vehicles, price templates, and extra options associated with the demo account, and imports clean CSV data. This cannot be undone.")) return
    
    try {
      setIsResetting(true)
      await api.post('/showcase/reset')
      alert("Showcase reset job enqueued successfully.")
    } catch (error: any) {
      alert("Failed to enqueue showcase reset.\n" + (error.response?.data?.detail || error.message))
    } finally {
      setIsResetting(false)
    }
  }

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
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm" onClick={handleResetShowcase} disabled={isResetting} className="h-8">
             <RotateCcw className={`mr-2 h-3.5 w-3.5 ${isResetting ? "animate-spin" : ""}`} />
             {isResetting ? "Resetting Demo..." : "Reset Showcase Data"}
          </Button>

          <div className="relative" ref={sysInfoRef}>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => setSysInfoOpen(!sysInfoOpen)}
              className="h-8 gap-2 border-green-200 bg-green-50/10 hover:bg-green-50/50"
            >
               <Activity className="h-3.5 w-3.5 text-green-500 animate-pulse" />
               <span className="text-xs text-green-700 dark:text-green-400 font-medium tracking-wide">System Online</span>
            </Button>
            
            {sysInfoOpen && (
               <div className="absolute right-0 top-full mt-2 w-80 rounded-md border shadow-lg overflow-hidden z-50 bg-popover text-popover-foreground animate-in fade-in slide-in-from-top-2 duration-200">
                  <div className="bg-slate-50 dark:bg-slate-900 border-b p-3 flex items-center justify-between">
                    <span className="text-foreground font-semibold font-mono text-sm tracking-tight flex items-center gap-2">
                      <Server className="w-4 h-4 text-emerald-500 dark:text-emerald-400"/> System Diagnostics
                    </span>
                  </div>
                  <div className="p-4 space-y-2.5 flex flex-col pt-4 pb-4 text-xs font-mono">
                     <div className="flex justify-between items-center text-muted-foreground"><span className="text-[10px] uppercase font-semibold">API VER:</span> <span className="text-foreground font-medium">{systemInfo?.api_version || "local"}</span></div>
                     <div className="flex justify-between items-center text-muted-foreground"><span className="text-[10px] uppercase font-semibold">APP BUILD:</span> <span className="text-foreground font-medium text-[10px]">{systemInfo?.git_commit || "dev"}</span></div>
                     <div className="flex justify-between items-center text-muted-foreground"><span className="text-[10px] uppercase font-semibold">ENV:</span> <span className="text-foreground font-medium">{systemInfo?.environment || "development"}</span></div>
                     <div className="flex justify-between items-center text-muted-foreground"><span className="text-[10px] uppercase font-semibold">PYTHON:</span> <span className="text-foreground font-medium">{systemInfo?.python_version || "unknown"}</span></div>
                     <div className="flex justify-between items-center text-muted-foreground mt-3 pt-3 border-t">
                       <span className="text-[10px] uppercase font-semibold">UPTIME:</span> 
                       <span className="text-foreground font-semibold">{systemInfo?.uptime_seconds ? Math.floor(systemInfo.uptime_seconds / 3600) + ' hrs ' + Math.floor((systemInfo.uptime_seconds % 3600) / 60) + ' min' : "unknown"}</span>
                     </div>
                  </div>
               </div>
            )}
          </div>
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
