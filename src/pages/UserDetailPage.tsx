import { useState, useEffect } from "react"
import { useParams, Link } from "react-router-dom"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { ArrowLeft, Mail, Phone, MapPin, Calendar, Star, Car, Loader2, Globe, Clock, CalendarDays, Activity } from "lucide-react"
import { UserActivityTimeline } from "@/components/UserActivityTimeline"
import { UserVehicles } from "@/components/UserVehicles"
import { UserReservations } from "@/components/UserReservations"
import { api } from "@/lib/api"
import { getMediaUrl, cn } from "@/lib/utils"

const formatTime = (seconds: number | null | undefined) => {
  if (seconds === null || seconds === undefined) return "N/A"
  if (seconds < 60) return `${Math.round(seconds)}s`
  if (seconds < 3600) return `${Math.round(seconds / 60)}m`
  return `${(seconds / 3600).toFixed(1)}h`
}

export function UserDetailPage() {
  const { id } = useParams()
  const [owner, setOwner] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<"overview" | "vehicles" | "reservations">("overview")

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
    
  const addressStr = [owner.address?.city, owner.address?.county].filter(Boolean).join(", ") || owner.location || "Not provided"

  return (
    <div className="flex flex-col gap-6 max-w-6xl mx-auto pb-10">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
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

      <Card className="border-none shadow-sm rounded-xl overflow-hidden bg-muted/20">
        <div className="flex flex-col lg:flex-row gap-6 p-6">
          <div className="flex-shrink-0">
            <Avatar className="h-24 w-24 border-4 border-background shadow-md">
              {owner.avatar && <AvatarImage src={getMediaUrl(owner.avatar)} alt={owner.full_name || ""} />}
              <AvatarFallback className="text-3xl bg-blue-600 text-white font-semibold">{initial}</AvatarFallback>
            </Avatar>
          </div>
          
          <div className="flex flex-col justify-center flex-1">
            <div className="flex flex-wrap items-center gap-3 mb-1">
              <h1 className="text-2xl font-bold">{owner.full_name || "Unnamed"}</h1>
              {owner.username && <span className="text-muted-foreground font-mono text-sm leading-none pt-1">@{owner.username}</span>}
              <Badge variant={owner.is_active ? "success" : "secondary"}>
                {owner.is_active ? "Active" : "Inactive"}
              </Badge>
              <Badge variant="outline" className="bg-primary/5">Owner</Badge>
              {owner.is_beta_tester && (
                <Badge variant="outline" className="bg-foreground text-background">Beta Tester</Badge>
              )}
              {owner.is_superuser && (
                <Badge variant="outline" className="bg-destructive/10 text-destructive border-destructive/20">Superuser</Badge>
              )}
            </div>
            
            {(owner.rent_service_name || owner.business_name) && (
              <div className="flex items-center gap-2 mb-3 mt-1">
                <p className="text-foreground font-medium">{owner.rent_service_name || owner.business_name}</p>
                {owner.booking_website_published && owner.username && (
                  <Badge variant="outline" className="bg-emerald-500/10 text-emerald-600 border-emerald-200 text-[10px] h-5 px-0 uppercase tracking-wider hover:bg-emerald-500/20 transition-colors">
                    <a href={`https://booking.ownima.com/${owner.username}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 px-1.5 w-full h-full">
                      Public Web
                    </a>
                  </Badge>
                )}
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-3 text-sm mt-4">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Mail className="h-4 w-4 shrink-0" />
                <span className="text-foreground truncate" title={owner.email}>{owner.email}</span>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <Phone className="h-4 w-4 shrink-0" />
                <span className="text-foreground">{owner.phone_number || "Not provided"}</span>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <MapPin className="h-4 w-4 shrink-0" />
                <span className="text-foreground truncate" title={addressStr}>{addressStr}</span>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <Globe className="h-4 w-4 shrink-0" />
                <span className="text-foreground">Language: {owner.language || "EN"} • Currency: {owner.currency || "RUB"}</span>
              </div>
              {(owner.working_hours_start && owner.working_hours_end) && (
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Clock className="h-4 w-4 shrink-0" />
                  <span className="text-foreground">Hours: {owner.working_hours_start} - {owner.working_hours_end}</span>
                </div>
              )}
              <div className="flex items-center gap-2 text-muted-foreground">
                <Calendar className="h-4 w-4 shrink-0" />
                <span className="text-foreground">Joined {new Date(owner.created_at).toLocaleDateString()}</span>
              </div>
            </div>
          </div>
          
          <div className="flex gap-4 items-center sm:items-start lg:items-center mt-4 lg:mt-0 lg:pl-6 lg:border-l border-border/50">
            <div className="flex flex-col items-center justify-center p-4 min-w-[120px] bg-background rounded-lg border shadow-sm">
              <div className="flex items-center gap-1 text-amber-500 mb-0.5">
                <Star className="h-5 w-5 fill-current" />
                <span className="text-2xl font-bold text-foreground">{owner.average_rating?.toFixed(1) || "New"}</span>
              </div>
              <p className="text-xs text-muted-foreground font-medium">{owner.rating_count || 0} Reviews</p>
            </div>
          </div>
        </div>
      </Card>

      {/* Tabs */}
      <div className="flex flex-wrap items-center gap-2 border-b mt-2 mb-2">
        <button 
          onClick={() => setActiveTab("overview")}
          className={cn(
            "flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-all whitespace-nowrap",
            activeTab === "overview" 
              ? "border-primary text-foreground" 
              : "border-transparent text-muted-foreground hover:text-foreground"
          )}
        >
          <Activity className="h-4 w-4" />
          Overview & Activity
        </button>
        <button 
          onClick={() => setActiveTab("vehicles")}
          className={cn(
            "flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-all whitespace-nowrap",
            activeTab === "vehicles" 
              ? "border-primary text-foreground" 
              : "border-transparent text-muted-foreground hover:text-foreground"
          )}
        >
          <Car className="h-4 w-4" />
          Fleet / Vehicles
          <Badge variant="secondary" className="ml-1 h-5 px-1.5">{owner.total_vehicles || 0}</Badge>
        </button>
        <button 
          onClick={() => setActiveTab("reservations")}
          className={cn(
            "flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-all whitespace-nowrap",
            activeTab === "reservations" 
              ? "border-primary text-foreground" 
              : "border-transparent text-muted-foreground hover:text-foreground"
          )}
        >
          <CalendarDays className="h-4 w-4" />
          Reservations
          <Badge variant="secondary" className="ml-1 h-5 px-1.5">{owner.total_reservations || 0}</Badge>
        </button>
      </div>

      {activeTab === "overview" && (
        <div className="grid gap-6 md:grid-cols-3">
          <div className="md:col-span-1 space-y-6">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base text-muted-foreground uppercase tracking-wider text-xs">Performance Core</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between items-center pb-2 border-b">
                  <span className="text-sm font-medium text-muted-foreground">Total Bookings</span>
                  <span className="font-bold">{owner.total_reservations || 0}</span>
                </div>
                <div className="flex justify-between items-center pb-2 border-b">
                  <span className="text-sm font-medium text-muted-foreground">Completed</span>
                  <span className="font-bold text-emerald-600">{owner.completed_reservations || 0}</span>
                </div>
                <div className="flex justify-between items-center pb-2 border-b">
                  <span className="text-sm font-medium text-muted-foreground">Cancelled</span>
                  <span className="font-bold text-red-600">{owner.cancelled_reservations || 0}</span>
                </div>
                <div className="flex justify-between items-center pb-2 border-b">
                  <span className="text-sm font-medium text-muted-foreground">Cancel Rate</span>
                  <span className="font-bold">{owner.cancel_rate !== undefined ? (owner.cancel_rate * 100).toFixed(1) + "%" : "0%"}</span>
                </div>
                <div className="flex justify-between items-center pb-2 border-b">
                  <span className="text-sm font-medium text-muted-foreground">Completion Rate</span>
                  <span className="font-bold text-emerald-600">{((owner.completion_rate || 0) * 100).toFixed(0)}%</span>
                </div>
                <div className="flex justify-between items-center pb-2 border-b">
                  <span className="text-sm font-medium text-muted-foreground">Avg Response</span>
                  <span className="font-bold">{formatTime(owner.avg_response_time_seconds)}</span>
                </div>
                <div className="flex justify-between items-center pb-2 border-b">
                  <span className="text-sm font-medium text-muted-foreground">Logins</span>
                  <span className="font-bold text-blue-600">{owner.login_count || 0}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-muted-foreground">Last online</span>
                  <span className="font-mono text-xs">
                    {owner.last_login_at ? new Date(owner.last_login_at).toLocaleDateString() : "Never"}
                  </span>
                </div>
              </CardContent>
            </Card>

            {owner.bio && (
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base text-muted-foreground uppercase tracking-wider text-xs">About / Bio</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-foreground leading-relaxed italic border-l-2 border-primary pl-4">{owner.bio}</p>
                </CardContent>
              </Card>
            )}
          </div>

          <div className="md:col-span-2">
            {id && <UserActivityTimeline userId={id} userType="OWNER" />}
          </div>
        </div>
      )}

      {activeTab === "vehicles" && (
        <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
          {id && <UserVehicles userId={id} ownerCurrency={owner.currency} />}
        </div>
      )}
      
      {activeTab === "reservations" && (
        <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
          {id && <UserReservations userId={id} userType="OWNER" />}
        </div>
      )}
    </div>
  )
}
