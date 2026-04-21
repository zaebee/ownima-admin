import { useState, useEffect } from "react"
import { useParams, Link } from "react-router-dom"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { ArrowLeft, Mail, Phone, MapPin, Calendar, Star, Loader2 } from "lucide-react"
import { UserActivityTimeline } from "@/components/UserActivityTimeline"
import { api } from "@/lib/api"
import { getMediaUrl } from "@/lib/utils"

export function RiderDetailPage() {
  const { id } = useParams()
  const [rider, setRider] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchRider = async () => {
      try {
        setIsLoading(true)
        const response = await api.get(`/admin/riders/${id}`)
        setRider(response.data)
      } catch (error) {
        console.error("Failed to fetch rider details:", error)
      } finally {
        setIsLoading(false)
      }
    }
    
    if (id) fetchRider()
  }, [id])

  if (isLoading) {
    return (
      <div className="flex h-[400px] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (!rider) {
    return (
      <div className="flex flex-col items-center justify-center h-[400px] gap-4">
        <h2 className="text-xl font-semibold">User not found</h2>
        <Button asChild variant="outline">
          <Link to="/users">Back to Users</Link>
        </Button>
      </div>
    )
  }

  const initial = rider.full_name 
    ? rider.full_name.charAt(0).toUpperCase() 
    : rider.email?.charAt(0).toUpperCase() || "R"

  return (
    <div className="flex flex-col gap-8 max-w-5xl mx-auto">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" asChild>
            <Link to="/users">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <h2 className="text-3xl font-bold tracking-tight">Rider Details</h2>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">Edit Profile</Button>
          <Button variant={rider.is_active ? "destructive" : "default"}>
            {rider.is_active ? "Deactivate" : "Activate"}
          </Button>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {/* Profile Card */}
        <Card className="md:col-span-1">
          <CardHeader className="text-center pb-2">
            <div className="flex justify-center mb-4">
              <Avatar className="h-24 w-24 border-4 border-background shadow-sm">
                {rider.avatar && <AvatarImage src={getMediaUrl(rider.avatar)} alt={rider.full_name || ""} />}
                <AvatarFallback className="text-2xl bg-green-600 text-white">{initial}</AvatarFallback>
              </Avatar>
            </div>
            <CardTitle className="text-2xl">{rider.full_name || "Unnamed"}</CardTitle>
            <CardDescription className="flex items-center justify-center gap-2 mt-1">
              <Badge variant={rider.is_active ? "success" : "secondary"}>
                {rider.is_active ? "Active" : "Inactive"}
              </Badge>
              {rider.is_beta_tester && <Badge variant="outline" className="border-blue-500 text-blue-600 bg-blue-50">Beta Tester</Badge>}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 pt-4">
            <div className="space-y-3 text-sm">
              <div className="flex items-center gap-3 text-muted-foreground">
                <Mail className="h-4 w-4" />
                <span className="text-foreground">{rider.email}</span>
              </div>
              <div className="flex items-center gap-3 text-muted-foreground">
                <Phone className="h-4 w-4" />
                <span className="text-foreground">{rider.phone_number || "Not provided"}</span>
              </div>
              <div className="flex items-center gap-3 text-muted-foreground">
                <MapPin className="h-4 w-4" />
                <span className="text-foreground">{rider.location || "Not provided"}</span>
              </div>
              <div className="flex items-center gap-3 text-muted-foreground">
                <Calendar className="h-4 w-4" />
                <span className="text-foreground">Joined {new Date(rider.created_at).toLocaleDateString()}</span>
              </div>
            </div>
            
            {rider.bio && (
              <div className="pt-4 border-t">
                <h4 className="text-sm font-medium mb-2">Bio</h4>
                <p className="text-sm text-muted-foreground">{rider.bio}</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Metrics & Activity */}
        <div className="md:col-span-2 space-y-6">
          {/* Stats Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4 flex flex-col items-center justify-center text-center h-full">
                <div className="flex items-center gap-1 text-amber-500 mb-1">
                  <Star className="h-4 w-4 fill-current" />
                  <span className="text-2xl font-bold text-foreground">{rider.average_rating?.toFixed(1) || "-"}</span>
                </div>
                <p className="text-xs text-muted-foreground">{rider.rating_count || 0} Reviews</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 flex flex-col items-center justify-center text-center h-full">
                <span className="text-2xl font-bold mb-1">{rider.total_reservations || 0}</span>
                <p className="text-xs text-muted-foreground">Total Bookings</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 flex flex-col items-center justify-center text-center h-full">
                <span className="text-2xl font-bold mb-1 text-green-600">
                  {((rider.completion_rate || 0) * 100).toFixed(0)}%
                </span>
                <p className="text-xs text-muted-foreground">Completion Rate</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 flex flex-col items-center justify-center text-center h-full">
                <span className="text-2xl font-bold mb-1">{rider.login_count || 0}</span>
                <p className="text-xs text-muted-foreground">Total Logins</p>
              </CardContent>
            </Card>
          </div>

          {/* Activity Timeline */}
          <UserActivityTimeline userId={rider.id} userType="RIDER" />
        </div>
      </div>
    </div>
  )
}
