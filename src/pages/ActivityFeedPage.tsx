import { useState, useEffect, useMemo } from "react"
import { api } from "@/lib/api"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Loader2, User, Car, CalendarDays, Clock, Shield } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Link } from "react-router-dom"
import { getActivityIcon, getActivityColor, getActivityDescription } from "@/lib/activityUtils"
import { groupActivities } from "@/lib/activityGrouping"
import { cn } from "@/lib/utils"

export function ActivityFeedPage() {
  const [activeTab, setActiveTab ] = useState("all")
  const [rawActivities, setRawActivities] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [page, setPage] = useState(1)
  const [total, setTotal] = useState(0)
  const limit = 50

  const [auditActionFilter, setAuditActionFilter] = useState("all")
  const [auditDateFilter, setAuditDateFilter] = useState("all")

  useEffect(() => {
    const fetchActivities = async () => {
      try {
        setIsLoading(true)
        const skip = (page - 1) * limit
        let rawItems: any[] = []
        let totalCount = 0
        
        if (activeTab === "all") {
          // Unified Activity Feed!
          const response = await api.get('/admin/activity/all', { params: { skip, limit } })
          rawItems = response.data.data || response.data || []
          totalCount = response.data.count || response.data.total || rawItems.length
        } else if (activeTab === "audit") {
          // Admin Audit Trail!
          const response = await api.get('/admin/audit-logs', { params: { skip, limit } })
          rawItems = response.data.data || response.data || []
          totalCount = response.data.count || response.data.total || rawItems.length
        } else {
          // Legacy individual filters
          const response = await api.get(`/admin/activity/${activeTab}`, {
            params: { skip, limit }
          })
          rawItems = response.data.data || []
          totalCount = response.data.count || 0
        }
        
        setRawActivities(rawItems)
        setTotal(totalCount)
      } catch (error) {
        console.error("Failed to fetch activities:", error)
      } finally {
        setIsLoading(false)
      }
    }
    fetchActivities()
  }, [activeTab, page])
  
  const activities = useMemo(() => {
    let result = [...rawActivities]

    if (activeTab === "audit") {
      result = result.filter(item => {
        // Filter by auditActionFilter
        if (auditActionFilter !== "all") {
          const itemType = String(item.activity_type || item.type || "").toUpperCase()
          if (!itemType.includes(auditActionFilter.toUpperCase())) {
            return false
          }
        }
        
        // Filter by auditDateFilter
        if (auditDateFilter !== "all") {
          const timestamp = item.timestamp || item.latest_timestamp
          if (timestamp) {
            const itemDate = new Date(timestamp)
            const now = new Date()
            if (auditDateFilter === "today") {
              const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
              if (itemDate < today) return false
            } else if (auditDateFilter === "week") {
              const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
              if (itemDate < weekAgo) return false
            } else if (auditDateFilter === "month") {
              const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
              if (itemDate < monthAgo) return false
            }
          }
        }
        return true
      })
    }

    return groupActivities(result)
  }, [rawActivities, activeTab, auditActionFilter, auditDateFilter])
  
  const totalPages = Math.ceil(total / limit)

  return (
    <div className="flex flex-col gap-6 max-w-5xl mx-auto mb-10 w-full animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Activity Feed</h1>
          <p className="text-muted-foreground mt-1 text-sm">Monitor system events, user actions, and administrative audits.</p>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={(v) => { setActiveTab(v); setPage(1); }} className="w-full">
        <TabsList className="flex flex-wrap h-auto w-full max-w-[650px] mb-6 p-1 gap-1">
          <TabsTrigger value="all" className="flex items-center gap-2"><Clock className="h-4 w-4" /> All</TabsTrigger>
          <TabsTrigger value="users" className="flex items-center gap-2"><User className="h-4 w-4" /> Users</TabsTrigger>
          <TabsTrigger value="vehicles" className="flex items-center gap-2"><Car className="h-4 w-4" /> Vehicles</TabsTrigger>
          <TabsTrigger value="reservations" className="flex items-center gap-2"><CalendarDays className="h-4 w-4" /> Reservations</TabsTrigger>
          <TabsTrigger value="audit" className="flex items-center gap-2"><Shield className="h-4 w-4 text-emerald-500" /> Audit Log</TabsTrigger>
        </TabsList>

        {activeTab === "audit" && (
          <div className="flex flex-wrap gap-4 items-center bg-muted/30 p-4 rounded-xl border mb-4">
            <div className="flex flex-col gap-1.5 min-w-[180px]">
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Action Type</span>
              <select 
                value={auditActionFilter} 
                onChange={(e) => setAuditActionFilter(e.target.value)}
                className="bg-background border rounded-md px-3 py-1.5 text-xs font-semibold text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
              >
                <option value="all">All actions</option>
                <option value="impersonate">Impersonation</option>
                <option value="suspend">Suspend / Activate</option>
                <option value="reset">Data Reset</option>
                <option value="vehicle">Vehicles Adjust</option>
              </select>
            </div>
            
            <div className="flex flex-col gap-1.5 min-w-[180px]">
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Date History</span>
              <select 
                value={auditDateFilter} 
                onChange={(e) => setAuditDateFilter(e.target.value)}
                className="bg-background border rounded-md px-3 py-1.5 text-xs font-semibold text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
              >
                <option value="all">All time</option>
                <option value="today">Today</option>
                <option value="week">Past 7 days</option>
                <option value="month">Past 30 days</option>
              </select>
            </div>
          </div>
        )}

        <Card className="border shadow-sm">
          <CardContent className="p-6">
            {isLoading ? (
              <div className="py-24 flex flex-col items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground font-light mb-4" />
                <p className="text-sm text-muted-foreground">Loading activity history...</p>
              </div>
            ) : activities.length === 0 ? (
              <div className="py-24 text-center text-muted-foreground border-2 border-dashed rounded-lg">
                No activities found matching criteria.
              </div>
            ) : (
              <div className="space-y-6">
                {activities.map((activity, index) => (
                  <div key={activity.id + index} className="relative pl-10 pb-2 group">
                    {/* Vertical Line */}
                    {index !== activities.length - 1 && (
                      <div className="absolute left-[15px] top-8 bottom-[-24px] w-[2px] bg-border transition-colors group-hover:bg-primary/20" />
                    )}
                    
                    {/* Timeline Dot Icon */}
                    <div className={cn(
                      "absolute left-0 top-0.5 h-[32px] w-[32px] rounded-full flex items-center justify-center text-white shadow-sm ring-4 ring-background",
                      getActivityColor(activity.activity_type)
                    )}>
                      {getActivityIcon(activity.activity_type)}
                    </div>
                    
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 py-1">
                      <div className="flex-1">
                        <div className="flex flex-wrap items-center gap-2 mb-1.5">
                          {activity.user_id && (
                            <Link to={`/owners/${activity.user_id}`} className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-muted hover:bg-muted/80 text-xs font-medium text-foreground transition-colors border shadow-sm">
                              <User className="h-3 w-3 text-muted-foreground" />
                              <span className="font-mono text-muted-foreground">usr_{activity.user_id.split('-')[0]}</span>
                              {activity.details?.user_email && <span className="hidden md:inline ml-1 text-muted-foreground font-sans truncate max-w-[150px]">({activity.details.user_email})</span>}
                            </Link>
                          )}
                          {activity.count > 1 && (
                            <span className="inline-flex items-center justify-center bg-primary/10 text-primary border border-primary/20 text-[10px] font-bold px-2 py-0.5 rounded-full">
                              {activity.count}x TIMES
                            </span>
                          )}
                        </div>
                        <div className="bg-muted/20 border rounded-lg p-4 shadow-sm transition-colors hover:bg-muted/40">
                          {getActivityDescription(activity)}
                        </div>
                      </div>
                      
                      <div className="flex flex-col items-end gap-1.5 shrink-0 bg-muted/30 px-3 py-2 rounded-lg border">
                        <div className="flex items-center gap-1.5 text-xs font-semibold text-foreground">
                          <Clock className="h-3.5 w-3.5 text-muted-foreground" />
                          {new Date(activity.latest_timestamp).toLocaleTimeString('en-US', { 
                            timeZone: 'UTC', hour: '2-digit', minute: '2-digit'
                          })}
                        </div>
                        <div className="text-[10px] uppercase tracking-wider font-semibold text-muted-foreground">
                          {new Date(activity.latest_timestamp).toLocaleDateString('en-US', { 
                            timeZone: 'UTC', month: 'short', day: 'numeric', year: 'numeric'
                          })}
                        </div>
                        {activity.count > 1 && (
                          <div className="text-[9px] text-muted-foreground max-w-[90px] text-right mt-1 leading-tight">
                            Span: {new Date(activity.earliest_timestamp).toLocaleTimeString('en-US', { timeZone: 'UTC', hour: '2-digit', minute: '2-digit' })} - {new Date(activity.latest_timestamp).toLocaleTimeString('en-US', { timeZone: 'UTC', hour: '2-digit', minute: '2-digit' })}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
            
            {/* Pagination Controls */}
            {!isLoading && totalPages > 1 && (
              <div className="mt-8 pt-6 border-t flex justify-between items-center">
                <span className="text-sm font-medium text-muted-foreground">
                  Page {page} of {totalPages}
                </span>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage(page - 1)}
                    disabled={page === 1}
                  >
                    Previous
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage(page + 1)}
                    disabled={page === totalPages}
                  >
                    Next
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </Tabs>
    </div>
  )
}
