import { useState, useEffect } from "react"
import { useParams, Link } from "react-router-dom"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { ArrowLeft, Mail, Phone, MapPin, Calendar, Star, Car, Loader2 } from "lucide-react"
import { UserActivityTimeline } from "@/components/UserActivityTimeline"
import { api } from "@/lib/api"
import { getMediaUrl } from "@/lib/utils"

export function UserDetailPage() {
  const { id } = useParams()
  const [owner, setOwner] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchOwner = async () => {
      try {
        setIsLoading(true)
        const response = await api.get(`/admin/users/${id}`)
        setOwner(response.data)
      } catch (error) {
        console.error("Failed to fetch owner details:", error)
      } finally {
        setIsLoading(false)
      }
    }
    
    if (id) fetchOwner()
  }, [id])

  if (isLoading) {
    return (
      <div className="flex h-[400px] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (!owner) {
    return (
      <div className="flex flex-col items-center justify-center h-[400px] gap-4">
        <h2 className="text-xl font-semibold">User not found</h2>
        <Button asChild variant="outline">
          <Link to="/users">Back to Users</Link>
        </Button>
      </div>
    )
  }

  const initial = owner.full_name 
    ? owner.full_name.charAt(0).toUpperCase() 
    : owner.email?.charAt(0).toUpperCase() || "O"

  return (
    <div className="flex flex-col gap-8 max-w-5xl mx-auto">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" asChild>
            <Link to="/users">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <h2 className="text-3xl font-bold tracking-tight">Owner Details</h2>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">Edit Profile</Button>
          <Button variant={owner.is_active ? "destructive" : "default"}>
            {owner.is_active ? "Deactivate" : "Activate"}
          </Button>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {/* Profile Card */}
        <Card className="md:col-span-1">
          <CardHeader className="text-center pb-2">
            <div className="flex justify-center mb-4">
              <Avatar className="h-24 w-24 border-4 border-background shadow-sm">
                {owner.avatar && <AvatarImage src={getMediaUrl(owner.avatar)} alt={owner.full_name || ""} />}
                <AvatarFallback className="text-2xl bg-blue-600 text-white">{initial}</AvatarFallback>
              </Avatar>
            </div>
            <CardTitle className="text-2xl">{owner.full_name || "Unnamed"}</CardTitle>
            {owner.business_name && (
              <p className="text-sm font-medium text-muted-foreground mt-1">{owner.business_name}</p>
            )}
            <CardDescription className="flex items-center justify-center gap-2 mt-2">
              <Badge variant={owner.is_active ? "success" : "secondary"}>
                {owner.is_active ? "Active" : "Inactive"}
              </Badge>
              <Badge variant="outline" className="bg-primary/5">Owner</Badge>
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 pt-4">
            <div className="space-y-3 text-sm">
              <div className="flex items-center gap-3 text-muted-foreground">
                <Mail className="h-4 w-4" />
                <span className="text-foreground">{owner.email}</span>
              </div>
              <div className="flex items-center gap-3 text-muted-foreground">
                <Phone className="h-4 w-4" />
                <span className="text-foreground">{owner.phone_number || "Not provided"}</span>
              </div>
              <div className="flex items-center gap-3 text-muted-foreground">
                <MapPin className="h-4 w-4" />
                <span className="text-foreground">{owner.location || owner.address?.city || "Not provided"}</span>
              </div>
              <div className="flex items-center gap-3 text-muted-foreground">
                <Calendar className="h-4 w-4" />
                <span className="text-foreground">Joined {new Date(owner.created_at).toLocaleDateString()}</span>
              </div>
            </div>
            
            {owner.bio && (
              <div className="pt-4 border-t">
                <h4 className="text-sm font-medium mb-2">Bio</h4>
                <p className="text-sm text-muted-foreground">{owner.bio}</p>
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
                  <span className="text-2xl font-bold text-foreground">{owner.average_rating?.toFixed(1) || "-"}</span>
                </div>
                <p className="text-xs text-muted-foreground">{owner.rating_count || 0} Reviews</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 flex flex-col items-center justify-center text-center h-full">
                <div className="flex items-center gap-1 mb-1 text-primary">
                  <Car className="h-4 w-4" />
                  <span className="text-2xl font-bold text-foreground">{owner.total_vehicles || 0}</span>
                </div>
                <p className="text-xs text-muted-foreground">Fleet Size</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 flex flex-col items-center justify-center text-center h-full">
                <span className="text-2xl font-bold mb-1">{owner.total_reservations || 0}</span>
                <p className="text-xs text-muted-foreground">Total Bookings</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 flex flex-col items-center justify-center text-center h-full">
                <span className="text-2xl font-bold mb-1 text-green-600">
                  {((owner.completion_rate || 0) * 100).toFixed(0)}%
                </span>
                <p className="text-xs text-muted-foreground">Completion Rate</p>
              </CardContent>
            </Card>
          </div>

          {/* Activity Timeline */}
          <UserActivityTimeline userId={owner.id} userType="OWNER" />
        </div>
      </div>
    </div>
  )
}
