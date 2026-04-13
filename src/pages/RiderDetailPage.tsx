import { useParams, Link } from "react-router-dom"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { ArrowLeft, Mail, Phone, MapPin, Calendar, Star } from "lucide-react"
import { UserActivityTimeline } from "@/components/UserActivityTimeline"

// Mock data based on the new RiderUserAdmin schema
const mockRider = {
  id: "1",
  email: "alice@example.com",
  role: "RIDER",
  full_name: "Alice Williams",
  is_active: true,
  is_superuser: false,
  is_beta_tester: true,
  phone_number: "+1 (555) 123-4567",
  avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80",
  location: "New York, NY",
  bio: "Frequent traveler and car enthusiast.",
  date_of_birth: "1990-05-15",
  currency: "USD",
  language: "EN",
  created_at: "2023-01-15T10:30:00Z",
  last_login_at: "2025-11-14T08:15:00Z",
  login_count: 142,
  average_rating: 4.8,
  rating_count: 12,
  total_reservations: 15,
  completed_reservations: 14,
  cancelled_reservations: 1,
  completion_rate: 0.93,
  cancel_rate: 0.07,
}

export function RiderDetailPage() {
  const { id } = useParams()
  // In a real app, we would fetch data based on ID
  const rider = mockRider

  return (
    <div className="flex flex-col gap-8 max-w-5xl mx-auto">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" asChild>
            <Link to="/riders">
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
                <AvatarImage src={rider.avatar} alt={rider.full_name} />
                <AvatarFallback className="text-2xl">{rider.full_name.substring(0, 2).toUpperCase()}</AvatarFallback>
              </Avatar>
            </div>
            <CardTitle className="text-2xl">{rider.full_name}</CardTitle>
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
                <p className="text-xs text-muted-foreground">{rider.rating_count} Reviews</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 flex flex-col items-center justify-center text-center h-full">
                <span className="text-2xl font-bold mb-1">{rider.total_reservations}</span>
                <p className="text-xs text-muted-foreground">Total Bookings</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 flex flex-col items-center justify-center text-center h-full">
                <span className="text-2xl font-bold mb-1 text-green-600">{(rider.completion_rate * 100).toFixed(0)}%</span>
                <p className="text-xs text-muted-foreground">Completion Rate</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 flex flex-col items-center justify-center text-center h-full">
                <span className="text-2xl font-bold mb-1">{rider.login_count}</span>
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
