import { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Loader2, CalendarDays, Eye, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from "lucide-react"
import { api } from "@/lib/api"
import { cn, getReservationStatusColor } from "@/lib/utils"

export function UserReservations({ userId, userType }: { userId: string, userType: "OWNER" | "RIDER" }) {
  const [reservations, setReservations] = useState<any[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const limit = 10

  useEffect(() => {
    const fetchReservations = async () => {
      try {
        setLoading(true)
        const endpoint = userType === "OWNER" 
          ? `/admin/users/${userId}/reservations` 
          : `/admin/riders/${userId}/reservations`
          
        const skip = (page - 1) * limit
        const response = await api.get(endpoint, {
          params: { limit, skip }
        })
        setReservations(response.data.data || [])
        setTotal(response.data.count || 0)
      } catch (error) {
        console.error("Failed to fetch reservations:", error)
      } finally {
        setLoading(false)
      }
    }
    
    if (userId) fetchReservations()
  }, [userId, userType, page])

  const formatDate = (dateStr: string, humanizedString?: string) => {
    try {
      if (dateStr) {
        const date = new Date(dateStr)
        if (!isNaN(date.getTime())) {
          return date.toLocaleDateString('en-US', { timeZone: 'UTC', day: 'numeric', month: 'short', year: 'numeric' })
        }
      }
    } catch {}

    if (humanizedString) {
      let s = humanizedString.replace(/\./g, '').trim()
      const ruMonths: Record<string, string> = {
        'янв': 'Jan', 'фев': 'Feb', 'мар': 'Mar', 'апр': 'Apr', 'май': 'May', 'июн': 'Jun',
        'июл': 'Jul', 'авг': 'Aug', 'сен': 'Sep', 'окт': 'Oct', 'ноя': 'Nov', 'дек': 'Dec'
      }
      for (const [ru, en] of Object.entries(ruMonths)) {
        if (s.toLowerCase().includes(ru)) {
          s = s.toLowerCase().replace(ru, en)
          break
        }
      }
      const parts = s.split(' ')
      if (parts.length >= 2) {
        return `${parts[0]} ${parts[1].charAt(0).toUpperCase() + parts[1].slice(1)}`
      }
      return humanizedString.replace(/\./g, '')
    }
    return "N/A";
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
                    <span>{formatDate(res.date_from, res.humanized?.date_from)}</span>
                    <span className="text-xs text-muted-foreground">to {formatDate(res.date_to, res.humanized?.date_to).replace("N/A", "")}</span>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex flex-col items-start gap-1.5">
                    <Badge className={cn("rounded-md text-[10px] uppercase font-bold tracking-wider px-2", getReservationStatusColor(res.status, res.humanized?.status || ''))}>
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
                  <Button variant="ghost" size="sm" asChild>
                    <Link to={`/reservations/${res.id}`}>
                      <Eye className="h-4 w-4 mr-1.5" />
                      View
                    </Link>
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
