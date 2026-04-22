import { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Loader2, Car, Search, Eye, Filter, Plus } from "lucide-react"
import { api } from "@/lib/api"
import { getMediaUrl } from "@/lib/utils"

// Fallback mock data in case backend endpoint is not ready yet
const MOCK_VEHICLES = [
  {
    id: "mock-v-1",
    name: "Tesla Model 3 Standard Range",
    general_info: { reg_number: "AA 1234 CT", year: 2023, vehicle_class: "Sedan", brand: "Tesla", model: "Model 3" },
    status: 2, // FREE
    price: 3500,
    currency: "THB",
    owner: { id: "5fd5a990-756d-45e4-b4ae-8ade802f11c7", full_name: "Demo Account" }
  },
  {
    id: "mock-v-2",
    name: null,
    general_info: { reg_number: "BC 9988 XZ", year: 2021, vehicle_class: "SUV", brand: "Toyota", model: "Fortuner" },
    status: 4, // COLLECTED
    price: 1800,
    currency: "THB",
    owner: { id: "mock-owner-2", full_name: "John Doe" }
  },
  {
    id: "mock-v-3",
    name: "Yamaha NMAX 155",
    general_info: { reg_number: "PKT 555", year: 2022, vehicle_class: "Scooter", brand: "Yamaha", model: "NMAX" },
    status: 3, // MAINTENANCE
    price: 300,
    currency: "THB",
    owner: { id: "mock-owner-3", full_name: "Phuket Rentals" }
  }
]

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

export function VehiclesPage() {
  const [vehicles, setVehicles] = useState<any[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")

  useEffect(() => {
    const fetchVehicles = async () => {
      try {
        setLoading(true)
        // Attempt reaching backend, fallback if 404
        const response = await api.get('/admin/vehicles', { params: { limit: 20, skip: 0 } })
        setVehicles(response.data.data || [])
        setTotal(response.data.count || 0)
      } catch (error: any) {
        if (error?.response?.status === 404 || error?.response?.status === 403) {
          console.log("Endpoint not found or forbidden, using mock data")
          setVehicles(MOCK_VEHICLES)
          setTotal(MOCK_VEHICLES.length)
        } else {
          console.error("Failed to fetch vehicles:", error)
        }
      } finally {
        setLoading(false)
      }
    }
    
    fetchVehicles()
  }, [])

  return (
    <div className="flex flex-col gap-6 max-w-7xl mx-auto w-full pb-10">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground flex items-center gap-2">
            Global Fleet
          </h1>
          <p className="text-muted-foreground mt-1">
            Manage all vehicles, track statuses, and view owner assignments.
          </p>
        </div>
        
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Button variant="outline" className="hidden sm:flex">
            <Filter className="mr-2 h-4 w-4" />
            Filters
          </Button>
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Add Vehicle
          </Button>
        </div>
      </div>

      <Card>
        <div className="px-6 py-4 border-b flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-muted/20">
          <div className="relative w-full max-w-sm">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search by name, reg number, or VIN..."
              className="pl-9 bg-background"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-muted/30">
              <TableRow>
                <TableHead className="w-[80px]">Photo</TableHead>
                <TableHead>Vehicle Details</TableHead>
                <TableHead>License Plate</TableHead>
                <TableHead>Owner</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Pricing</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={7} className="h-32 text-center">
                    <Loader2 className="h-6 w-6 animate-spin mx-auto text-muted-foreground" />
                  </TableCell>
                </TableRow>
              ) : vehicles.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="h-32 text-center text-muted-foreground">
                    No vehicles found matching your criteria.
                  </TableCell>
                </TableRow>
              ) : (
                vehicles.map((v) => (
                  <TableRow key={v.id} className="hover:bg-muted/20">
                    <TableCell>
                      <div className="h-10 w-14 overflow-hidden rounded-md bg-muted flex items-center justify-center">
                        {v.picture?.cover ? (
                          <img 
                            src={getMediaUrl(v.picture.cover)} 
                            alt={v.name || "Vehicle"} 
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <Car className="h-5 w-5 text-muted-foreground/50" />
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="font-semibold text-foreground">
                          {v.name || `${v.general_info?.brand} ${v.general_info?.model}`}
                        </span>
                        <span className="text-xs text-muted-foreground mt-0.5">
                          {v.general_info?.year} • {v.general_info?.vehicle_class || 'Unknown Class'}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="font-mono text-xs font-semibold tracking-wider">
                        {v.general_info?.reg_number || 'N/A'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {v.owner ? (
                        <Link to={`/owners/${v.owner.id}`} className="text-sm font-medium hover:underline text-blue-600">
                          {v.owner.full_name || 'Owner Name'}
                        </Link>
                      ) : (
                        <span className="text-sm text-muted-foreground">No Owner</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge 
                        variant={getStatusVariant(v.status) as any}
                        className="rounded-md"
                      >
                        {getStatusString(v.status)}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1 text-sm font-medium">
                        {Number(v.price || 0).toLocaleString()} 
                        <span className="text-[10px] uppercase text-muted-foreground border border-border/50 px-1 py-0.5 rounded ml-1">
                          {v.currency || "RUB"}/d
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="sm" asChild>
                        <Link to={`/vehicles/${v.id}`}>
                          <Eye className="h-4 w-4 mr-1.5" />
                          View
                        </Link>
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
        {!loading && total > 0 && (
          <div className="px-6 py-4 border-t bg-muted/10 text-xs text-muted-foreground flex justify-between items-center">
            <span>Showing {vehicles.length} of {total} vehicles</span>
            {/* Minimal pagination mock */}
            <div className="flex gap-1">
              <Button variant="outline" size="sm" disabled>Previous</Button>
              <Button variant="outline" size="sm" disabled>Next</Button>
            </div>
          </div>
        )}
      </Card>
    </div>
  )
}
