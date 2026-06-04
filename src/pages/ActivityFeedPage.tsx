import { useState, useEffect } from "react"
import { api } from "@/lib/api"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Loader2, User, Car, CalendarDays, Clock } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Link } from "react-router-dom"
import { getActivityIcon, getActivityColor, getActivityDescription } from "@/lib/activityUtils"
import { groupActivities, GroupedActivityItem } from "@/lib/activityGrouping"
import { cn } from "@/lib/utils"

export function ActivityFeedPage() {
  const [activeTab, setActiveTab] = useState("users")
  const [activities, setActivities] = useState<GroupedActivityItem[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [page, setPage] = useState(1)
  const [total, setTotal] = useState(0)
  const limit = 50

  useEffect(() => {
    const fetchActivities = async () => {
      try {
        setIsLoading(true)
        const skip = (page - 1) * limit
        const response = await api.get(`/admin/activity/${activeTab}`, {
          params: { skip, limit }
        })
        const rawItems = response.data.data || []
        setActivities(groupActivities(rawItems))
        setTotal(response.data.count || 0)
      } catch (error) {
        console.error("Failed to fetch activities:", error)
      } finally {
        setIsLoading(false)
      }
    }
    fetchActivities()
  }, [activeTab, page])
  
  const totalPages = Math.ceil(total / limit)

  return (
    <div className="flex flex-col gap-6 max-w-5xl mx-auto mb-10 w-full animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Activity Feed</h1>
          <p className="text-muted-foreground mt-1 text-sm">Monitor system events and user actions.</p>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={(v) => { setActiveTab(v); setPage(1); }} className="w-full">
        <TabsList className="grid w-full grid-cols-3 max-w-[400px] mb-6">
          <TabsTrigger value="users" className="flex items-center gap-2"><User className="h-4 w-4" /> Users</TabsTrigger>
          <TabsTrigger value="vehicles" className="flex items-center gap-2"><Car className="h-4 w-4" /> Vehicles</TabsTrigger>
          <TabsTrigger value="reservations" className="flex items-center gap-2"><CalendarDays className="h-4 w-4" /> Reservations</TabsTrigger>
        </TabsList>

        <Card className="border shadow-sm">
          <CardContent className="p-6">
            {isLoading ? (
              <div className="py-24 flex flex-col items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground font-light mb-4" />
                <p className="text-sm text-muted-foreground">Loading activity history...</p>
              </div>
            ) : activities.length === 0 ? (
              <div className="py-24 text-center text-muted-foreground border-2 border-dashed rounded-lg">
                No activities found.
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
