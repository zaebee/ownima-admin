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
              <TableHead>Location</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {vehicles.map((v) => (
              <TableRow key={v.id} className="hover:bg-muted/20">
                <TableCell>
                  <div className="h-12 w-16 overflow-hidden rounded-md bg-muted flex items-center justify-center">
                    {v.media && v.media.length > 0 ? (
                      <img 
                        src={getMediaUrl(v.media[0].media_url)} 
                        alt={v.brand} 
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
                      {v.brand} {v.model}
                    </span>
                    <span className="text-xs text-muted-foreground">{v.year}</span>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant="outline" className="font-mono text-xs font-semibold tracking-wider">
                    {v.license_plate}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Badge 
                    variant={v.status === "ACTIVE" ? "success" : v.status === "MAINTENANCE" ? "destructive" : "secondary"}
                    className="rounded-md"
                  >
                    {v.status}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                    <MapPin className="h-3 w-3" />
                    <span className="truncate max-w-[150px]">
                      {v.location?.city || "Unknown"}
                    </span>
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
