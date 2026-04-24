import { useState, useEffect } from "react"
import { useParams, Link } from "react-router-dom"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { Loader2, Car, ChevronLeft, CalendarDays, Key, MapPin, Share2, Wrench, Settings2, Gauge, ShieldCheck, Route, FileText, Zap, Edit } from "lucide-react"
import { api } from "@/lib/api"

const getStatusString = (status: number) => {
  switch (status) {
    case 1: return "DRAFT";
    case 2: return "FREE";
    case 3: return "MAINTENANCE";
    case 4: return "COLLECTED";
    case 5: return "ARCHIVED";
    case 0: return "UNSPECIFIED";
    default: return `STATUS_${status}`;
  }
}

const getStatusVariant = (status: number) => {
  switch (status) {
    case 1: return "secondary";   
    case 2: return "success";     
    case 3: return "warning";     
    case 4: return "info";        
    case 5: return "destructive"; 
    case 0:
    default: return "outline";    
  }
}

export function VehicleDetailPage() {
  const { id } = useParams()
  const [vehicle, setVehicle] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchVehicle = async () => {
      try {
        setLoading(true)
        const response = await api.get(`/admin/vehicles/${id}`)
        setVehicle(response.data.data)
        setLoading(false)
      } catch (error: any) {
        if (error?.response?.status === 404 || error?.response?.status === 403 || !error.response) {
          // Provide mock data 
          setTimeout(() => {
            setVehicle({
              id,
              name: "Tesla Model 3 Standard Range",
              general_info: { 
                reg_number: "AA 1234 CT", 
                year: 2023, 
                vehicle_class: "Sedan", 
                brand: "Tesla", 
                model: "Model 3",
                vin: "1G1YZ2C81C510XXXX",
                transmission: "Automatic",
                engine: "Electric (0cc)",
                doors: 4,
                seats: 5,
                fuel_type: "Electric",
                mileage: 12500
              },
              status: 2, 
              price: 3500,
              currency: "THB",
              owner: { id: "5fd5a990-756d-45e4-b4ae-8ade802f11c7", full_name: "Demo Account", email: "demo@ownima.com" },
              created_at: new Date().toISOString(),
              images: [
                "https://images.unsplash.com/photo-1560958089-b8a1929cea89?q=80&w=2071&auto=format&fit=crop"
              ]
            })
            setLoading(false)
          }, 800)
        } else {
          console.error("Failed to fetch vehicle", error)
          setLoading(false)
        }
      } 
    }
    fetchVehicle()
  }, [id])

  if (loading) {
    return (
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 pb-10 animate-in fade-in duration-500">
        <div className="flex items-center justify-between">
          <Skeleton className="h-6 w-32" />
          <div className="flex gap-2">
            <Skeleton className="h-9 w-24 rounded-md" />
            <Skeleton className="h-9 w-32 rounded-md" />
          </div>
        </div>

        <div className="flex flex-col gap-4">
          <div className="flex items-end gap-4">
            <Skeleton className="h-10 w-96" />
            <Skeleton className="h-6 w-20 rounded-full mb-1" />
          </div>
          <Skeleton className="h-5 w-64" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-2">
          <div className="lg:col-span-2 flex flex-col gap-6">
            <Skeleton className="w-full h-[400px] rounded-xl" />
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-28 rounded-xl" />
              ))}
            </div>
            <Skeleton className="w-full h-[300px] rounded-xl" />
          </div>
          <div className="flex flex-col gap-6">
            <Skeleton className="w-full h-[180px] rounded-xl" />
            <Skeleton className="w-full h-[250px] rounded-xl" />
            <Skeleton className="w-full h-[200px] rounded-xl" />
          </div>
        </div>
      </div>
    )
  }

  if (!vehicle) {
    return (
      <div className="flex h-[50vh] flex-col items-center justify-center gap-4">
        <Car className="h-12 w-12 text-muted-foreground opacity-20" />
        <h2 className="text-xl font-semibold">Vehicle Not Found</h2>
        <Button variant="outline" asChild><Link to="/vehicles">Back to Fleet</Link></Button>
      </div>
    )
  }

  const vInfo = vehicle.general_info || {}

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-8 pb-10 animate-in fade-in duration-500">
      {/* Header Actions */}
      <div className="flex items-center justify-between">
        <Link 
          to="/vehicles" 
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors group"
        >
          <ChevronLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
          Back to Fleet
        </Link>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="hidden sm:inline-flex">
            <Share2 className="mr-2 h-4 w-4" />
            Share URL
          </Button>
          <Button size="sm">
            <Edit className="mr-2 h-4 w-4" />
            Edit Profile
          </Button>
        </div>
      </div>

      {/* Main Title & Status */}
      <div className="flex flex-col gap-1.5">
        <div className="flex items-center gap-3">
          <h1 className="text-3xl font-bold tracking-tight text-foreground">
            {vehicle.name || `${vInfo.brand} ${vInfo.model}`}
          </h1>
          <Badge variant={getStatusVariant(vehicle.status) as any} className="text-xs px-2.5 py-0.5 uppercase">
            {getStatusString(vehicle.status)}
          </Badge>
        </div>
        <p className="text-muted-foreground flex items-center gap-2">
          <span className="font-medium text-foreground">{vInfo.year || "Unknown Year"}</span>
          <span>•</span>
          <span>VIN: <span className="font-mono text-foreground">{vInfo.vin || "Unknown"}</span></span>
          <span>•</span>
          <span>ID: <span className="font-mono text-foreground text-xs">{vehicle.id}</span></span>
        </p>
      </div>

      {/* Grid Content */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 lg:gap-8">
        
        {/* LEFT COLUMN: VISUALS & DETAILED SPECS */}
        <div className="xl:col-span-2 flex flex-col gap-6 lg:gap-8">
          
          {/* Main Visual */}
          <div className="w-full aspect-[21/9] md:aspect-[21/9] rounded-xl overflow-hidden bg-slate-100 dark:bg-slate-900 border relative group">
            {vehicle.images && vehicle.images.length > 0 ? (
              <img 
                src={vehicle.images[0]} 
                alt={`${vInfo.brand} ${vInfo.model}`} 
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
              />
            ) : (
              <div className="flex items-center justify-center h-full w-full opacity-10">
                <Car className="h-32 w-32" />
              </div>
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent pointer-events-none" />
            <div className="absolute bottom-4 left-4 right-4 flex justify-between items-end">
              <Badge variant="outline" className="bg-background/80 backdrop-blur-md border-border/50 text-foreground font-mono text-base px-3 py-1 shadow-lg">
                {vInfo.reg_number || "NO PLATE"}
              </Badge>
            </div>
          </div>

          {/* Key Quick Stats (Bento style) */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card className="bg-muted/40 shadow-none border-border/60">
              <CardContent className="p-4 flex flex-col gap-3">
                <Gauge className="h-5 w-5 text-blue-500" />
                <div>
                  <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider mb-1">Mileage</p>
                  <p className="text-lg font-semibold">{vInfo.mileage ? `${vInfo.mileage.toLocaleString()} km` : "N/A"}</p>
                </div>
              </CardContent>
            </Card>
            <Card className="bg-muted/40 shadow-none border-border/60">
              <CardContent className="p-4 flex flex-col gap-3">
                <Zap className="h-5 w-5 text-amber-500" />
                <div>
                  <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider mb-1">Fuel Type</p>
                  <p className="text-lg font-semibold">{vInfo.fuel_type || "N/A"}</p>
                </div>
              </CardContent>
            </Card>
            <Card className="bg-muted/40 shadow-none border-border/60">
              <CardContent className="p-4 flex flex-col gap-3">
                <Settings2 className="h-5 w-5 text-slate-500" />
                <div>
                  <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider mb-1">Transmission</p>
                  <p className="text-lg font-semibold">{vInfo.transmission || "N/A"}</p>
                </div>
              </CardContent>
            </Card>
            <Card className="bg-muted/40 shadow-none border-border/60">
              <CardContent className="p-4 flex flex-col gap-3">
                <ShieldCheck className="h-5 w-5 text-emerald-500" />
                <div>
                  <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider mb-1">Class</p>
                  <p className="text-lg font-semibold">{vInfo.vehicle_class || "N/A"}</p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Full Technical Specs */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <FileText className="h-5 w-5 text-muted-foreground" />
                Complete Specifications
              </CardTitle>
            </CardHeader>
            <CardContent>
              <dl className="grid grid-cols-2 md:grid-cols-3 gap-y-6 gap-x-4">
                <div>
                  <dt className="text-sm font-medium text-muted-foreground mb-1">Brand</dt>
                  <dd className="text-sm font-semibold">{vInfo.brand || "—"}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-muted-foreground mb-1">Model</dt>
                  <dd className="text-sm font-semibold">{vInfo.model || "—"}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-muted-foreground mb-1">Year</dt>
                  <dd className="text-sm font-semibold">{vInfo.year || "—"}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-muted-foreground mb-1">Engine</dt>
                  <dd className="text-sm font-semibold">{vInfo.engine || "—"}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-muted-foreground mb-1">Doors</dt>
                  <dd className="text-sm font-semibold">{vInfo.doors || "—"}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-muted-foreground mb-1">Seats</dt>
                  <dd className="text-sm font-semibold">{vInfo.seats || "—"}</dd>
                </div>
              </dl>
            </CardContent>
          </Card>
        </div>

        {/* RIGHT COLUMN: PRICING, ASSIGNMENT, ACTIONS */}
        <div className="flex flex-col gap-6 lg:gap-8">
          
          {/* Pricing Highlight Card */}
          <Card className="bg-slate-900 border-slate-800 text-slate-50 relative overflow-hidden">
            <div className="absolute -right-6 -top-6 opacity-5 pointer-events-none">
              <DollarSignIcon className="w-32 h-32" />
            </div>
            <CardHeader className="pb-2">
              <CardDescription className="text-slate-400 font-medium uppercase tracking-wider text-xs">Standard Daily Rate</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-baseline gap-2 mb-4">
                <span className="text-5xl font-bold tracking-tight text-emerald-400">
                  {Number(vehicle.price || 0).toLocaleString()}
                </span>
                <span className="text-lg font-medium text-slate-400 uppercase">
                  {vehicle.currency || "RUB"}
                </span>
              </div>
              <Button className="w-full bg-emerald-500 hover:bg-emerald-600 text-slate-900 border-none font-semibold">
                Adjust Pricing
              </Button>
            </CardContent>
          </Card>

          {/* Owner Details */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <Key className="h-5 w-5 text-muted-foreground" />
                Assignment & Keys
              </CardTitle>
            </CardHeader>
            <CardContent>
              {vehicle.owner ? (
                <div className="flex items-center justify-between border border-border p-3 rounded-lg mb-4 bg-muted/20">
                  <div className="flex items-center gap-3">
                     <div className="h-10 w-10 rounded-full bg-blue-100 dark:bg-blue-900/50 flex items-center justify-center text-blue-600 dark:text-blue-400 font-bold">
                       {vehicle.owner.full_name?.charAt(0) || "U"}
                     </div>
                     <div>
                      <p className="font-semibold text-sm">{vehicle.owner.full_name}</p>
                      <p className="text-xs text-muted-foreground">{vehicle.owner.email}</p>
                    </div>
                  </div>
                  <Button variant="ghost" size="sm" className="h-8" asChild>
                    <Link to={`/users/${vehicle.owner.id}`}>Profile</Link>
                  </Button>
                </div>
              ) : (
                <div className="p-4 rounded-lg border border-dashed text-center text-sm text-muted-foreground mb-4">
                  Unassigned Vehicle
                </div>
              )}
              
              <div className="space-y-3 pt-2">
                <div className="flex items-start text-sm">
                  <MapPin className="h-4 w-4 mr-3 mt-0.5 text-muted-foreground shrink-0" />
                  <div>
                    <span className="block font-medium">Main Depo Location</span>
                    <span className="block text-muted-foreground text-xs mt-0.5">Terminal B, Spot 42</span>
                  </div>
                </div>
                <div className="flex items-start text-sm">
                  <Route className="h-4 w-4 mr-3 mt-0.5 text-muted-foreground shrink-0" />
                  <div>
                    <span className="block font-medium">Delivery Zone</span>
                    <span className="block text-muted-foreground text-xs mt-0.5">North City District, Airport</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

           {/* Quick History */}
           <Card>
            <CardHeader className="pb-3">
              <div className="space-y-1">
                <CardTitle className="text-lg flex items-center gap-2">
                  <CalendarDays className="h-5 w-5 text-muted-foreground" />
                  Recent Activity
                </CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col gap-4">
                {/* Mock timeline items */}
                <div className="flex gap-4">
                  <div className="flex flex-col items-center">
                    <div className="h-2 w-2 rounded-full bg-emerald-500 mt-1.5" />
                    <div className="w-[1px] h-full bg-border mt-1" />
                  </div>
                  <div className="pb-4">
                    <p className="text-sm font-medium">Returned successfully</p>
                    <p className="text-xs text-muted-foreground mt-0.5">By Alice Williams • 2 days ago</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="flex flex-col items-center">
                    <div className="h-2 w-2 rounded-full bg-blue-500 mt-1.5" />
                    <div className="w-[1px] h-full bg-border mt-1" />
                  </div>
                  <div className="pb-4">
                    <p className="text-sm font-medium">Rented</p>
                    <p className="text-xs text-muted-foreground mt-0.5">By Alice Williams • 5 days ago</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="flex flex-col items-center">
                    <div className="h-2 w-2 rounded-full bg-muted-foreground mt-1.5" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Maintenance completed</p>
                    <p className="text-xs text-muted-foreground mt-0.5">Systems check ok • 12 days ago</p>
                  </div>
                </div>

                <Button variant="outline" className="w-full mt-2 text-xs h-8">View Full Log</Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

function DollarSignIcon(props: React.ComponentProps<"svg">) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <line x1="12" x2="12" y1="2" y2="22" />
      <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
    </svg>
  )
}
