import { useParams, Link } from "react-router-dom"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { ArrowLeft, Mail, Phone, MapPin, Calendar, Star, Car } from "lucide-react"
import { UserActivityTimeline } from "@/components/UserActivityTimeline"

// Mock data based on the OwnerUserAdmin schema
const mockOwner = {
  id: "1",
  email: "john@example.com",
  role: "OWNER",
  full_name: "John Doe",
  business_name: "Doe Rentals",
  is_active: true,
  is_superuser: false,
  is_beta_tester: false,
  phone_number: "+1 (555) 987-6543",
  avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80",
  location: "San Francisco, CA",
  bio: "Premium car rentals in the Bay Area.",
  created_at: "2022-08-20T14:00:00Z",
  last_login_at: "2025-11-14T09:30:00Z",
  login_count: 342,
  average_rating: 4.9,
  rating_count: 84,
  total_vehicles: 12,
  total_reservations: 156,
  completed_reservations: 148,
  cancelled_reservations: 8,
  completion_rate: 0.95,
  cancel_rate: 0.05,
}

export function UserDetailPage() {
  const { id } = useParams()
  // In a real app, we would fetch data based on ID
  const owner = mockOwner

  return (
    <div className="flex flex-col gap-8 max-w-5xl mx-auto">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" asChild>
            <Link to="/owners">
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
                <AvatarImage src={owner.avatar} alt={owner.full_name} />
                <AvatarFallback className="text-2xl">{owner.full_name.substring(0, 2).toUpperCase()}</AvatarFallback>
              </Avatar>
            </div>
            <CardTitle className="text-2xl">{owner.full_name}</CardTitle>
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
                <span className="text-foreground">{owner.location || "Not provided"}</span>
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
                <p className="text-xs text-muted-foreground">{owner.rating_count} Reviews</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 flex flex-col items-center justify-center text-center h-full">
                <div className="flex items-center gap-1 mb-1 text-primary">
                  <Car className="h-4 w-4" />
                  <span className="text-2xl font-bold text-foreground">{owner.total_vehicles}</span>
                </div>
                <p className="text-xs text-muted-foreground">Fleet Size</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 flex flex-col items-center justify-center text-center h-full">
                <span className="text-2xl font-bold mb-1">{owner.total_reservations}</span>
                <p className="text-xs text-muted-foreground">Total Bookings</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 flex flex-col items-center justify-center text-center h-full">
                <span className="text-2xl font-bold mb-1 text-green-600">{(owner.completion_rate * 100).toFixed(0)}%</span>
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
