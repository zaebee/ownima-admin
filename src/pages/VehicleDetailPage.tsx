import { useState, useEffect } from "react"
import { useParams, Link } from "react-router-dom"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Loader2, Car, ChevronLeft, CalendarDays, Key, MapPin, Share2, Wrench } from "lucide-react"
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
      } catch (error: any) {
        if (error?.response?.status === 404 || error?.response?.status === 403) {
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
                engine: "Electric (0cc)"
              },
              status: 2, 
              price: 3500,
              currency: "THB",
              owner: { id: "5fd5a990-756d-45e4-b4ae-8ade802f11c7", full_name: "Demo Account", email: "demo@ownima.com" }
            })
            setLoading(false)
          }, 600)
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
      <div className="flex h-[50vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
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

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-6 pb-10">
      {/* Header Actions */}
      <div className="flex items-center justify-between">
        <Link 
          to="/vehicles" 
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ChevronLeft className="h-4 w-4" />
          Back to Fleet
        </Link>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <Share2 className="mr-2 h-4 w-4" />
            Share URL
          </Button>
          <Button variant="outline" size="sm">
            <Wrench className="mr-2 h-4 w-4" />
            Manage State
          </Button>
        </div>
      </div>

      {/* Main Title & Status */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-3xl font-bold tracking-tight text-foreground">
              {vehicle.name || `${vehicle.general_info?.brand} ${vehicle.general_info?.model}`}
            </h1>
            <Badge variant={getStatusVariant(vehicle.status) as any} className="text-sm px-2.5 py-0.5">
              {getStatusString(vehicle.status)}
            </Badge>
          </div>
          <p className="text-muted-foreground">
            VIN: <span className="font-mono text-foreground">{vehicle.general_info?.vin || "Unknown"}</span> • ID: <span className="font-mono text-foreground text-xs">{vehicle.id}</span>
          </p>
        </div>
      </div>

      {/* Grid Content */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* LEFT COLUMN */}
        <div className="md:col-span-2 flex flex-col gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Technical Specs</CardTitle>
            </CardHeader>
            <CardContent>
              <dl className="grid grid-cols-2 sm:grid-cols-3 gap-y-6 gap-x-4">
                <div>
                  <dt className="text-sm font-medium text-muted-foreground">Brand/Model</dt>
                  <dd className="mt-1 text-sm font-semibold">{vehicle.general_info?.brand} {vehicle.general_info?.model}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-muted-foreground">Year</dt>
                  <dd className="mt-1 text-sm font-semibold">{vehicle.general_info?.year}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-muted-foreground">License Plate</dt>
                  <dd className="mt-1">
                    <Badge variant="outline" className="font-mono">{vehicle.general_info?.reg_number}</Badge>
                  </dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-muted-foreground">Engine</dt>
                  <dd className="mt-1 text-sm">{vehicle.general_info?.engine || "N/A"}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-muted-foreground">Transmission</dt>
                  <dd className="mt-1 text-sm">{vehicle.general_info?.transmission || "N/A"}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-muted-foreground">Class</dt>
                  <dd className="mt-1 text-sm">{vehicle.general_info?.vehicle_class || "N/A"}</dd>
                </div>
              </dl>
            </CardContent>
          </Card>

           <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <div className="space-y-1">
                <CardTitle>Reservations History</CardTitle>
                <CardDescription>Recent bookings for this vehicle</CardDescription>
              </div>
              <CalendarDays className="h-5 w-5 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="flex h-32 items-center justify-center rounded-md border border-dashed text-sm text-muted-foreground">
                MOCK: Reservations matching this vehicle ID will load here.
              </div>
            </CardContent>
          </Card>
        </div>

        {/* RIGHT COLUMN */}
        <div className="flex flex-col gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Pricing</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-baseline gap-2">
                <span className="text-4xl font-bold tracking-tight">
                  {Number(vehicle.price || 0).toLocaleString()}
                </span>
                <span className="text-sm font-medium text-muted-foreground uppercase">
                  {vehicle.currency || "RUB"} / day
                </span>
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                Standard daily rental rate (excluding seasonal multipliers).
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Assigned Owner</CardTitle>
            </CardHeader>
            <CardContent>
              {vehicle.owner ? (
                <div className="flex items-center justify-between border-b pb-4 mb-4">
                  <div>
                    <p className="font-semibold">{vehicle.owner.full_name}</p>
                    <p className="text-sm text-muted-foreground">{vehicle.owner.email}</p>
                  </div>
                  <Button variant="outline" size="sm" asChild>
                    <Link to={`/owners/${vehicle.owner.id}`}>View</Link>
                  </Button>
                </div>
              ) : (
                <div className="py-4 text-center text-sm text-muted-foreground">
                  Unassigned
                </div>
              )}
              
              <div className="space-y-3">
                <div className="flex items-center text-sm">
                  <MapPin className="h-4 w-4 mr-2 text-muted-foreground" />
                  <span>Main Hub</span>
                </div>
                <div className="flex items-center text-sm">
                  <Key className="h-4 w-4 mr-2 text-muted-foreground" />
                  <span>Key Handover: MGR-12</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
