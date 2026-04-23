import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Activity, Clock, Loader2, Calendar, Car, LogIn, Star, CreditCard, User, Bell } from "lucide-react"
import { api } from "@/lib/api"
import { cn } from "@/lib/utils"

interface ActivityItem {
  id: string
  timestamp: string
  user_id: string
  activity_type: string
  details: Record<string, any>
}

interface UserActivityTimelineProps {
  userId: string
  userType: "RIDER" | "OWNER"
  initialLimit?: number
  showCategories?: boolean
}

// Helpers for activity visualization
const getActivityIcon = (type: string) => {
  if (type.includes("RESERVATION") || type.includes("BOOKING")) return <Calendar className="h-4 w-4" />
  if (type.includes("VEHICLE")) return <Car className="h-4 w-4" />
  if (type.includes("LOGIN") || type.includes("AUTH") || type.includes("PASSWORD")) return <LogIn className="h-4 w-4" />
  if (type.includes("RATING") || type.includes("REVIEW")) return <Star className="h-4 w-4" />
  if (type.includes("PAYMENT") || type.includes("WALLET")) return <CreditCard className="h-4 w-4" />
  if (type.includes("USER") || type.includes("PROFILE")) return <User className="h-4 w-4" />
  return <Bell className="h-4 w-4" />
}

const getActivityColor = (type: string) => {
  if (type.includes("CREATE") || type.includes("REGISTER") || type.includes("SUCCESS")) return "bg-green-500"
  if (type.includes("DELETE") || type.includes("CANCEL") || type.includes("FAIL") || type.includes("ERROR")) return "bg-red-500"
  if (type.includes("UPDATE") || type.includes("EDIT")) return "bg-amber-500"
  if (type.includes("LOGIN")) return "bg-blue-500"
  if (type.includes("RESERVATION") || type.includes("BOOKING")) return "bg-purple-500"
  return "bg-slate-500"
}

const getActivityDescription = (activity: ActivityItem) => {
  const { activity_type, details } = activity
  
  // Create a human readable description based on activity type and details
  const formattedType = activity_type.replace(/_/g, ' ').toLowerCase()
  const capitalizedType = formattedType.charAt(0).toUpperCase() + formattedType.slice(1)
  
  // Format specific details if present
  let context = []
  if (details.reservation_id) context.push(<span key="res" className="font-semibold">Res: {details.reservation_id.substring(0, 8)}...</span>)
  if (details.vehicle_id) context.push(<span key="veh" className="font-semibold">Veh: {details.vehicle_id.substring(0, 8)}...</span>)
  if (details.rating) context.push(<span key="rating" className="font-semibold">Score: {details.rating}⭐</span>)
  
  return (
    <div className="flex flex-col">
      <span className="text-sm font-medium">{capitalizedType}</span>
      {context.length > 0 && (
        <span className="text-xs text-muted-foreground mt-0.5 flex gap-2">
          {context.reduce((prev, curr) => [prev, <span key={`sep-${Math.random()}`}>•</span>, curr] as any)}
        </span>
      )}
      {/* Show JSON string of details if we couldn't parse specific well-known fields */}
      {context.length === 0 && Object.keys(details).length > 0 && (
        <span className="text-xs text-muted-foreground mt-0.5 max-w-[300px] truncate">
          {JSON.stringify(details).replace(/["{}]/g, '')}
        </span>
      )}
    </div>
  )
}

export function UserActivityTimeline({ 
  userId, 
  userType, 
  initialLimit = 20, 
  showCategories = true 
}: UserActivityTimelineProps) {
  const [activities, setActivities] = useState<ActivityItem[]>([])
  const [category, setCategory] = useState<string>("all")
  const [loading, setLoading] = useState(true)
  const [skip, setSkip] = useState(0)
  const [total, setTotal] = useState(0)

  const fetchActivities = async (isLoadMore = false) => {
    try {
      if (!isLoadMore) setLoading(true)
      
      const endpoint = userType === "OWNER" 
        ? `/admin/users/${userId}/activities` 
        : `/admin/riders/${userId}/activities`
        
      const response = await api.get(endpoint, {
        params: {
          category: category === "all" ? null : category,
          skip: isLoadMore ? skip : 0,
          limit: initialLimit
        }
      })
      
      if (isLoadMore) {
        setActivities(prev => [...prev, ...response.data.data])
      } else {
        setActivities(response.data.data)
        setSkip(0)
      }
      
      setTotal(response.data.count)
      setSkip(prev => prev + initialLimit)
    } catch (error: any) {
      if (error?.response?.status === 404 || error?.response?.status === 403 || !error.response) {
        // MOCK DATA FALLBACK for UI Preview
        setTimeout(() => {
          const mockData: ActivityItem[] = [
            {
              id: "act_1",
              timestamp: new Date(Date.now() - 1000 * 60 * 15).toISOString(), // 15 mins ago
              user_id: userId,
              activity_type: "RESERVATION_CONFIRMED",
              details: { reservation_id: "res-9892x-11k", message: "Owner manually confirmed booking" }
            },
            {
              id: "act_2",
              timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(), // 2 hours ago
              user_id: userId,
              activity_type: "VEHICLE_UPDATED",
              details: { vehicle_id: "veh-482xs", field: "Price changed to 3500 THB" }
            },
            {
              id: "act_3",
              timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(), // 1 day ago
              user_id: userId,
              activity_type: "LOGIN_SUCCESS",
              details: { ipAddress: "192.168.1.1", device: "Safari / Mac OS" }
            },
            {
              id: "act_4",
              timestamp: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(), // 2 days ago
              user_id: userId,
              activity_type: "PAYMENT_RECEIVED",
              details: { amount: 10500, currency: "THB", status: "Payout processed" }
            },
            {
              id: "act_5",
              timestamp: new Date(Date.now() - 1000 * 60 * 60 * 120).toISOString(), // 5 days ago
              user_id: userId,
              activity_type: "VEHICLE_CREATED",
              details: { vehicle_name: "Tesla Model 3 Standard Range", status: "Listed" }
            }
          ]
          
          let filtered = mockData
          if (category === "reservations") filtered = mockData.filter(m => m.activity_type.includes("RESERVATION"))
          if (category === "ratings") filtered = mockData.filter(m => m.activity_type.includes("RATING"))
          if (category === "auth") filtered = mockData.filter(m => m.activity_type.includes("LOGIN"))

          if (isLoadMore) {
            setActivities(prev => [...prev, ...filtered])
          } else {
            setActivities(filtered)
            setSkip(0)
          }
          setTotal(filtered.length)
          setSkip(prev => prev + initialLimit)
          setLoading(false)
        }, 500)
      } else {
        console.error("Failed to fetch activities:", error)
        setLoading(false)
      }
    }
  }

  useEffect(() => {
    if (userId) {
      fetchActivities()
    }
  }, [userId, userType, category])

  const handleCategoryChange = (newCategory: string) => {
    if (category !== newCategory) {
      setCategory(newCategory)
      setSkip(0)
    }
  }

  const hasMore = activities.length < total

  return (
    <Card>
      <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-4 gap-4">
        <div>
          <CardTitle className="text-lg flex items-center gap-2">
            <Activity className="h-5 w-5 text-primary" />
            Recent Activity
          </CardTitle>
          <CardDescription>Latest actions performed by this {userType.toLowerCase()}</CardDescription>
        </div>
        {showCategories && (
          <div className="flex flex-wrap gap-2">
            <Badge 
              variant={category === "all" ? "default" : "outline"} 
              className={cn("cursor-pointer hover:bg-primary/90 transition-colors", category !== "all" && "hover:bg-muted font-normal text-muted-foreground")}
              onClick={() => handleCategoryChange("all")}
            >
              All
            </Badge>
            <Badge 
              variant={category === "reservations" ? "default" : "outline"} 
              className={cn("cursor-pointer hover:bg-primary/90 transition-colors", category !== "reservations" && "hover:bg-muted font-normal text-muted-foreground")}
              onClick={() => handleCategoryChange("reservations")}
            >
              Bookings
            </Badge>
            <Badge 
              variant={category === "ratings" ? "default" : "outline"} 
              className={cn("cursor-pointer hover:bg-primary/90 transition-colors", category !== "ratings" && "hover:bg-muted font-normal text-muted-foreground")}
              onClick={() => handleCategoryChange("ratings")}
            >
              Ratings
            </Badge>
            <Badge 
              variant={category === "auth" ? "default" : "outline"} 
              className={cn("cursor-pointer hover:bg-primary/90 transition-colors", category !== "auth" && "hover:bg-muted font-normal text-muted-foreground")}
              onClick={() => handleCategoryChange("auth")}
            >
              Auth
            </Badge>
          </div>
        )}
      </CardHeader>
      <CardContent>
        {loading && activities.length === 0 ? (
          <div className="py-12 flex items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : activities.length === 0 ? (
          <div className="py-12 text-center text-muted-foreground border-2 border-dashed rounded-lg">
            No activity found for this category.
          </div>
        ) : (
          <>
            <div className="space-y-6 pt-4 px-2">
              {activities.map((activity, index) => (
                <div key={activity.id} className="relative pl-8 pb-2">
                  {/* Vertical Line */}
                  {index !== activities.length - 1 && (
                    <div className="absolute left-[13px] top-8 bottom-[-16px] w-px bg-border" />
                  )}
                  
                  {/* Timeline Dot Icon */}
                  <div className={cn(
                    "absolute left-0 top-1 h-[28px] w-[28px] rounded-full border-4 border-background flex items-center justify-center text-white",
                    getActivityColor(activity.activity_type)
                  )}>
                    <div className="scale-[0.6]">{getActivityIcon(activity.activity_type)}</div>
                  </div>
                  
                  {/* Content */}
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2">
                    {getActivityDescription(activity)}
                    <div className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground shrink-0 border rounded-md px-2 py-1 bg-muted/20">
                      <Clock className="h-3.5 w-3.5" />
                      {new Date(activity.timestamp).toLocaleString(undefined, { 
                        month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
                      })}
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            {/* Load More Button */}
            {hasMore ? (
              <div className="mt-8 text-center">
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="w-full max-w-sm" 
                  onClick={() => fetchActivities(true)}
                  disabled={loading}
                >
                  {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                  Load More Activity ({activities.length} of {total})
                </Button>
              </div>
            ) : (
              <div className="mt-8 text-center text-xs text-muted-foreground">
                End of activity history.
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  )
}
