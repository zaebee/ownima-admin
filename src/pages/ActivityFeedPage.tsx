import { useState, useEffect } from "react"
import { api } from "@/lib/api"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Loader2, User, Car, CalendarDays, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from "lucide-react"
import { Button } from "@/components/ui/button"

export function ActivityFeedPage() {
  const [activeTab, setActiveTab] = useState("users")
  const [activities, setActivities] = useState<any[]>([])
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
        setActivities(response.data.data || [])
        setTotal(response.data.count || 0)
      } catch (error) {
        console.error("Failed to fetch activities:", error)
      } finally {
        setIsLoading(false)
      }
    }
    fetchActivities()
  }, [activeTab, page])

  const renderDetails = (item: any) => {
    return <pre className="text-xs text-muted-foreground whitespace-pre-wrap font-mono bg-muted/50 p-2 rounded-md">{JSON.stringify(item.details, null, 2)}</pre>
  }
  
  const totalPages = Math.ceil(total / limit)

  return (
    <div className="flex flex-col gap-6 max-w-6xl mx-auto mb-10 w-full animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Activity Feed</h1>
          <p className="text-muted-foreground mt-1 text-sm">Monitor system events and user actions.</p>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={(v) => { setActiveTab(v); setPage(1); }} className="w-full">
        <TabsList className="grid w-full grid-cols-3 max-w-[400px]">
          <TabsTrigger value="users" className="flex items-center gap-2"><User className="h-4 w-4" /> Users</TabsTrigger>
          <TabsTrigger value="vehicles" className="flex items-center gap-2"><Car className="h-4 w-4" /> Vehicles</TabsTrigger>
          <TabsTrigger value="reservations" className="flex items-center gap-2"><CalendarDays className="h-4 w-4" /> Reservations</TabsTrigger>
        </TabsList>

        <Card className="mt-4 overflow-hidden border">
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader className="bg-muted/50">
                  <TableRow>
                    <TableHead className="w-[180px]">DATE & TIME</TableHead>
                    <TableHead className="w-[220px]">EVENT TYPE</TableHead>
                    <TableHead>DETAILS</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoading ? (
                    <TableRow>
                      <TableCell colSpan={3} className="h-48 text-center">
                        <Loader2 className="h-6 w-6 animate-spin mx-auto text-muted-foreground mb-4" />
                        <p className="text-sm text-muted-foreground">Loading activities...</p>
                      </TableCell>
                    </TableRow>
                  ) : activities.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={3} className="h-48 text-center text-muted-foreground">
                        No activities found.
                      </TableCell>
                    </TableRow>
                  ) : (
                    activities.map((activity) => (
                      <TableRow key={activity.id} className="group">
                        <TableCell className="align-top font-medium">
                          <div className="flex flex-col gap-1">
                            <span>{new Date(activity.timestamp).toLocaleDateString('en-US', { timeZone: 'UTC', month: 'short', day: 'numeric', year: 'numeric' })}</span>
                            <span className="text-xs text-muted-foreground">
                              {new Date(activity.timestamp).toLocaleTimeString('en-US', { timeZone: 'UTC', hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell className="align-top">
                          <div className="flex flex-col items-start gap-2">
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-secondary text-secondary-foreground border">
                              {activity.activity_type.replace(/_/g, ' ')}
                            </span>
                            {activity.user_id && (
                              <div className="text-[10px] text-muted-foreground font-mono bg-muted/30 px-1.5 py-0.5 rounded cursor-help" title={`User ID: ${activity.user_id}`}>
                                usr_{activity.user_id.split('-')[0]}
                              </div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="align-top pb-4 pt-4">
                          {renderDetails(activity)}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
            
            {/* Pagination */}
            {!isLoading && totalPages > 1 && (
              <div className="flex items-center justify-between px-6 py-4 border-t bg-muted/20">
                <div className="text-sm text-muted-foreground hidden sm:block">
                  Page {page} of {totalPages}
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => setPage(1)}
                    disabled={page === 1}
                  >
                    <ChevronsLeft className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => setPage(p => Math.max(1, p - 1))}
                    disabled={page === 1}
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                    disabled={page === totalPages}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => setPage(totalPages)}
                    disabled={page === totalPages}
                  >
                    <ChevronsRight className="h-4 w-4" />
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
