import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Loader2, Car, MapPin, Eye, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from "lucide-react"
import { api } from "@/lib/api"
import { getMediaUrl } from "@/lib/utils"

export function UserVehicles({ userId, ownerCurrency }: { userId: string, ownerCurrency?: string }) {
  const [vehicles, setVehicles] = useState<any[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const limit = 10

  useEffect(() => {
    const fetchVehicles = async () => {
      try {
        setLoading(true)
        const skip = (page - 1) * limit
        const response = await api.get(`/admin/users/${userId}/vehicles`, {
          params: { limit, skip }
        })
        setVehicles(response.data.data || [])
        setTotal(response.data.count || 0)
      } catch (error) {
        console.error("Failed to fetch vehicles:", error)
      } finally {
        setLoading(false)
      }
    }
    
    if (userId) fetchVehicles()
  }, [userId, page])

  if (loading) {
    return (
      <Card>
        <CardContent className="flex h-[300px] items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    )
  }

  if (vehicles.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col h-[300px] items-center justify-center gap-2">
          <Car className="h-10 w-10 text-muted-foreground opacity-50" />
          <p className="text-lg font-medium text-muted-foreground">No vehicles found</p>
        </CardContent>
      </Card>
    )
  }

  // Frontend Status mapping reflecting backend VehicleStatus enum
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
      case 1: return "secondary";   // DRAFT
      case 2: return "success";     // FREE
      case 3: return "warning";     // MAINTENANCE
      case 4: return "info";        // COLLECTED
      case 5: return "destructive"; // ARCHIVED
      case 0:
      default: return "outline";    // UNSPECIFIED
    }
  }

  return (
    <Card className="overflow-hidden border-none shadow-sm">
      <CardContent className="p-0">
        <Table>
          <TableHeader className="bg-muted/30">
            <TableRow>
              <TableHead className="w-[80px]">Photo</TableHead>
              <TableHead>Vehicle</TableHead>
              <TableHead>License Plate</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Price</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {vehicles.map((v) => (
              <TableRow key={v.id} className="hover:bg-muted/20">
                <TableCell>
                  <div className="h-12 w-16 overflow-hidden rounded-md bg-muted flex items-center justify-center">
                    {v.picture?.cover ? (
                      <img 
                        src={getMediaUrl(v.picture.cover)} 
                        alt={v.name || "Vehicle"} 
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <Car className="h-6 w-6 text-muted-foreground/50" />
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex flex-col">
                    <span className="font-medium text-foreground">
                      {v.name || `${v.general_info?.brand} ${v.general_info?.model}`}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {v.general_info?.year} • {v.general_info?.vehicle_class || 'Class Unknown'}
                    </span>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant="outline" className="font-mono text-xs font-semibold tracking-wider">
                    {v.general_info?.reg_number || 'N/A'}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Badge 
                    variant={getStatusVariant(v.status) as "default" | "secondary" | "destructive" | "outline" | "success"}
                    className="rounded-md"
                  >
                    {getStatusString(v.status)}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-1 text-sm font-medium">
                    {Number(v.price || 0).toLocaleString()} <span className="text-xs text-muted-foreground">{v.currency || ownerCurrency || "RUB"}/day</span>
                  </div>
                </TableCell>
                <TableCell className="text-right">
                  <Button variant="ghost" size="sm">
                    <Eye className="h-4 w-4 mr-1.5" />
                    View
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
      {total > limit && (
        <div className="flex items-center justify-between px-4 py-3 border-t bg-muted/10">
          <div className="text-xs text-muted-foreground">
            Showing <span className="font-medium text-foreground">{Math.min(total, (page - 1) * limit + 1)}</span> to{" "}
            <span className="font-medium text-foreground">{Math.min(total, page * limit)}</span> of{" "}
            <span className="font-medium text-foreground">{total}</span> entries
          </div>
          <div className="flex items-center gap-1">
            <Button 
              variant="outline" 
              size="icon" 
              className="h-7 w-7" 
              onClick={() => setPage(1)} 
              disabled={page === 1 || loading}
            >
              <ChevronsLeft className="h-3 w-3" />
            </Button>
            <Button 
              variant="outline" 
              size="icon" 
              className="h-7 w-7" 
              onClick={() => setPage(p => Math.max(1, p - 1))} 
              disabled={page === 1 || loading}
            >
              <ChevronLeft className="h-3 w-3" />
            </Button>
            <div className="text-xs font-medium px-2">
              Page {page} of {Math.ceil(total / limit) || 1}
            </div>
            <Button 
              variant="outline" 
              size="icon" 
              className="h-7 w-7" 
              onClick={() => setPage(p => Math.min(Math.ceil(total / limit), p + 1))} 
              disabled={page >= Math.ceil(total / limit) || loading}
            >
              <ChevronRight className="h-3 w-3" />
            </Button>
            <Button 
              variant="outline" 
              size="icon" 
              className="h-7 w-7" 
              onClick={() => setPage(Math.ceil(total / limit))} 
              disabled={page >= Math.ceil(total / limit) || loading}
            >
              <ChevronsRight className="h-3 w-3" />
            </Button>
          </div>
        </div>
      )}
    </Card>
  )
}
