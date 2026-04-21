import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Loader2, CalendarDays, Eye } from "lucide-react"
import { api } from "@/lib/api"

export function UserReservations({ userId, userType }: { userId: string, userType: "OWNER" | "RIDER" }) {
  const [reservations, setReservations] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchReservations = async () => {
      try {
        setLoading(true)
        const endpoint = userType === "OWNER" 
          ? `/admin/users/${userId}/reservations` 
          : `/admin/riders/${userId}/reservations`
          
        const response = await api.get(endpoint, {
          params: { limit: 100, skip: 0 }
        })
        setReservations(response.data.data || [])
      } catch (error) {
        console.error("Failed to fetch reservations:", error)
      } finally {
        setLoading(false)
      }
    }
    
    if (userId) fetchReservations()
  }, [userId, userType])

  const formatDate = (dateStr: string) => {
    if (!dateStr) return "N/A";
    return new Date(dateStr).toLocaleDateString(undefined, { 
      year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' 
    })
  }

  const getStatusColor = (status: number) => {
    switch(status) {
      case 2: return "success"  // Completed / Confirmed
      case 3: return "default"  // Ongoing / Collected
      case 5: return "secondary" // Completed
      case 9: return "destructive" // Cancelled
      default: return "outline"
    }
  }

  if (loading) {
    return (
      <Card>
        <CardContent className="flex h-[300px] items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    )
  }

  if (reservations.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col h-[300px] items-center justify-center gap-2">
          <CalendarDays className="h-10 w-10 text-muted-foreground opacity-50" />
          <p className="text-lg font-medium text-muted-foreground">No reservations found</p>
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
              <TableHead>Booking</TableHead>
              <TableHead>Dates</TableHead>
              <TableHead>Status & Source</TableHead>
              <TableHead>Total Price</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {reservations.map((res) => (
              <TableRow key={res.id} className="hover:bg-muted/20">
                <TableCell>
                  <div className="flex flex-col">
                    <span className="font-mono text-xs font-semibold tracking-wider text-muted-foreground mb-1">
                      #{res.humanized?.id || res.id.substring(0, 8)}
                    </span>
                    <span className="text-sm font-medium">
                      {res.vehicle?.name || "Unknown Vehicle"}
                    </span>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex flex-col text-sm">
                    <span>{res.humanized?.date_from || formatDate(res.date_from)}</span>
                    <span className="text-xs text-muted-foreground">to {res.humanized?.date_to || formatDate(res.date_to)}</span>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex flex-col items-start gap-1.5">
                    <Badge variant={getStatusColor(res.status) as any} className="rounded-md">
                      {res.humanized?.status?.replace('RESERVATION_', '') || `Status: ${res.status}`}
                    </Badge>
                    {res.humanized?.source && (
                      <span className="text-[10px] uppercase text-muted-foreground font-semibold tracking-wider">
                        {res.humanized.source.replace('SOURCE_', '').replace(/_/g, ' ')}
                      </span>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  <span className="font-medium">
                    {Number(res.total_price || 0).toLocaleString()} {res.currency || "RUB"}
                  </span>
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
