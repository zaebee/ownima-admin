import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Activity, Clock } from "lucide-react"

interface ActivityItem {
  id: string
  type: string
  description: string
  timestamp: string
}

interface UserActivityTimelineProps {
  userId: string
  userType: "RIDER" | "OWNER"
  initialLimit?: number
  showCategories?: boolean
}

// Mock data for demonstration
const mockActivities: ActivityItem[] = [
  {
    id: "a1",
    type: "RESERVATION_CREATED",
    description: "Created reservation #RES-12345",
    timestamp: "2025-11-14T10:30:00Z",
  },
  {
    id: "a2",
    type: "USER_LOGIN",
    description: "Logged in",
    timestamp: "2025-11-14T08:15:00Z",
  },
  {
    id: "a3",
    type: "RATING_SUBMITTED",
    description: "Rated vehicle #V-789 (5 stars)",
    timestamp: "2025-11-10T15:20:00Z",
  }
]

export function UserActivityTimeline({ 
  userId, 
  userType, 
  initialLimit = 10, 
  showCategories = true 
}: UserActivityTimelineProps) {
  const [activities, setActivities] = useState<ActivityItem[]>([])
  const [category, setCategory] = useState<string>("all")
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // In a real app, this would fetch from /admin/riders/{userId}/activities or /admin/users/{userId}/activities
    // using the category filter
    setLoading(true)
    setTimeout(() => {
      setActivities(mockActivities)
      setLoading(false)
    }, 500)
  }, [userId, userType, category])

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <div>
          <CardTitle className="text-lg flex items-center gap-2">
            <Activity className="h-5 w-5 text-primary" />
            Recent Activity
          </CardTitle>
          <CardDescription>Latest actions performed by this {userType.toLowerCase()}</CardDescription>
        </div>
        {showCategories && (
          <div className="flex gap-2">
            <Badge 
              variant={category === "all" ? "default" : "outline"} 
              className="cursor-pointer hover:bg-muted"
              onClick={() => setCategory("all")}
            >
              All
            </Badge>
            <Badge 
              variant={category === "reservations" ? "default" : "outline"} 
              className="cursor-pointer hover:bg-muted"
              onClick={() => setCategory("reservations")}
            >
              Bookings
            </Badge>
            <Badge 
              variant={category === "auth" ? "default" : "outline"} 
              className="cursor-pointer hover:bg-muted"
              onClick={() => setCategory("auth")}
            >
              Auth
            </Badge>
          </div>
        )}
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="py-8 text-center text-muted-foreground">Loading activities...</div>
        ) : (
          <>
            <div className="space-y-6 pt-4">
              {activities.map((activity, index) => (
                <div key={activity.id} className="relative pl-6 pb-2">
                  {index !== activities.length - 1 && (
                    <div className="absolute left-[11px] top-6 bottom-0 w-px bg-border" />
                  )}
                  <div className="absolute left-0 top-1.5 h-[22px] w-[22px] rounded-full border-4 border-background bg-primary" />
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                    <p className="text-sm font-medium">{activity.description}</p>
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Clock className="h-3 w-3" />
                      {new Date(activity.timestamp).toLocaleString()}
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1 font-mono bg-muted/50 inline-block px-1.5 py-0.5 rounded">
                    {activity.type}
                  </p>
                </div>
              ))}
            </div>
            <div className="mt-6 text-center">
              <Button variant="outline" size="sm" className="w-full">Load More Activity</Button>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  )
}
