import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Loader2, Car, MapPin, Eye } from "lucide-react"
import { api } from "@/lib/api"
import { getMediaUrl } from "@/lib/utils"

export function UserVehicles({ userId }: { userId: string }) {
  const [vehicles, setVehicles] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchVehicles = async () => {
      try {
        setLoading(true)
        const response = await api.get(`/admin/users/${userId}/vehicles`, {
          params: { limit: 100, skip: 0 }
        })
        setVehicles(response.data.data || [])
      } catch (error) {
        console.error("Failed to fetch vehicles:", error)
      } finally {
        setLoading(false)
      }
    }
    
    if (userId) fetchVehicles()
  }, [userId])

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

  // Frontend Status mapping for clarity if backend returns integers mapping to statuses
  const getStatusString = (status: number) => {
    // According to mock, status looks to be an integer. Mapping roughly.
    switch (status) {
      case 1: return "ACTIVE";
      case 2: return "MAINTENANCE";
      case 0: return "INACTIVE";
      default: return `STATUS_${status}`;
    }
  }

  const getStatusVariant = (status: number) => {
    switch (status) {
      case 1: return "success";
      case 2: return "destructive";
      default: return "secondary";
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
                    {Number(v.price || 0).toLocaleString()} <span className="text-xs text-muted-foreground">{v.currency || "RUB"}/day</span>
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
    </Card>
  )
}
