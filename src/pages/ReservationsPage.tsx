import { useState, useMemo, useEffect } from "react"
import { Link } from "react-router-dom"
import { Card, CardContent } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Skeleton } from "@/components/ui/skeleton"
import { Search, ArrowUp, ArrowDown, ArrowUpDown, Eye, CalendarDays, ChevronLeft, ChevronRight } from "lucide-react"
import { cn, getReservationStatusColor } from "@/lib/utils"
import { api } from "@/lib/api"

export function ReservationsPage() {
  const [reservations, setReservations] = useState<any[]>([])
  const [search, setSearch] = useState("")
  const [sortBy, setSortBy] = useState("created_at_desc")
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const limit = 20

  useEffect(() => {
    const fetchReservations = async () => {
      try {
        setLoading(true)
        
        let fetchedData: any[] = []
        let currentPage = 1
        let hasMore = true
        let loopCount = 0

        while (hasMore && loopCount < 10) {
          const response = await api.get("/admin/reservations", {
            params: { page: currentPage, size: 50 },
            validateStatus: () => true
          })
          
          if (response.status >= 400) {
            console.error("API error", response.data)
            hasMore = false
            break;
          }

          const rawData = response.data
          const data = Array.isArray(rawData) ? rawData : 
                       (rawData?.data ? rawData.data : 
                       (rawData?.items ? rawData.items : []))
          
          fetchedData = [...fetchedData, ...data]
          
          if (rawData?.total_pages) {
            if (currentPage >= rawData.total_pages) {
              hasMore = false
            } else {
              currentPage++
            }
          } else {
            // fallback if total_pages not present
            if (data.length < 50) hasMore = false
            else currentPage++
          }
          loopCount++
        }
        
        setReservations(fetchedData)
      } catch (error) {
        console.error("Error fetching reservations:", error)
        setReservations([])
      } finally {
        setLoading(false)
      }
    }
    fetchReservations()
  }, [])

  const filteredAndSorted = useMemo(() => {
    let result = [...reservations]

    if (search.trim()) {
      const q = search.toLowerCase().trim()
      result = result.filter(r => 
        (r.id && String(r.id).toLowerCase().includes(q)) ||
        (r.humanized?.id && String(r.humanized.id).toLowerCase().includes(q)) ||
        (r.vehicle?.name && String(r.vehicle.name).toLowerCase().includes(q)) ||
        (r.rider?.name && String(r.rider.name).toLowerCase().includes(q)) ||
        (r.rider?.full_name && String(r.rider.full_name).toLowerCase().includes(q))
      )
    }

    result.sort((a, b) => {
      const isDesc = sortBy.endsWith('_desc')
      const key = sortBy.replace(/_desc$|_asc$/, '')
      let comp = 0
      
      const valA = key === 'total' ? (a.total_amount || a.total_price || a.total || 0) : 
                   key === 'vehicle' ? (a.vehicle?.name || a.vehicle || '') : 
                   key === 'rider' ? (a.rider?.name || a.rider?.full_name || a.rider || '') : 
                   key === 'status' ? (a.humanized?.status || a.status || '') :
                   a[key]
      
      const valB = key === 'total' ? (b.total_amount || b.total_price || b.total || 0) : 
                   key === 'vehicle' ? (b.vehicle?.name || b.vehicle || '') : 
                   key === 'rider' ? (b.rider?.name || b.rider?.full_name || b.rider || '') : 
                   key === 'status' ? (b.humanized?.status || b.status || '') :
                   b[key]

      if (key === 'id') comp = String(valA || '').localeCompare(String(valB || ''))
      else if (key === 'vehicle') comp = String(valA || '').localeCompare(String(valB || ''))
      else if (key === 'rider') comp = String(valA || '').localeCompare(String(valB || ''))
      else if (key === 'status') comp = String(valA || '').localeCompare(String(valB || ''))
      else if (key === 'total') comp = Number(valA || 0) - Number(valB || 0)
      else if (key === 'created_at') comp = new Date(valA || 0).getTime() - new Date(valB || 0).getTime()
      
      return isDesc ? -comp : comp
    })

    return result
  }, [search, sortBy, reservations])

  const totalFiltered = filteredAndSorted.length
  const totalPages = Math.ceil(totalFiltered / limit)
  const paginatedData = filteredAndSorted.slice((page - 1) * limit, page * limit)

  useEffect(() => {
    setPage(1)
  }, [search, sortBy])

  const SortableHead = ({ label, sortKey, className = "" }: { label: string, sortKey: string, className?: string }) => {
    const isActive = sortBy.startsWith(sortKey)
    const isDesc = sortBy === `${sortKey}_desc`
  
    return (
      <TableHead 
        className={cn("cursor-pointer select-none hover:bg-muted/50 transition-colors uppercase tracking-wider text-xs", className)}
        onClick={() => {
          if (isActive) {
            setSortBy(isDesc ? `${sortKey}_asc` : `${sortKey}_desc`)
          } else {
            setSortBy(`${sortKey}_desc`)
          }
        }}
      >
        <div className="flex items-center gap-1.5">
          {label}
          <div className="flex flex-col">
            {isActive ? (
              isDesc ? <ArrowDown className="h-3 w-3 text-primary" /> : <ArrowUp className="h-3 w-3 text-primary" />
            ) : (
              <ArrowUpDown className="h-3 w-3 text-muted-foreground/30" />
            )}
          </div>
        </div>
      </TableHead>
    )
  }

  const formatDateLabel = (dateString: string) => {
    if (!dateString) return ""
    try {
      const date = new Date(dateString)
      if (isNaN(date.getTime())) return ""
      return date.toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })
    } catch {
      return ""
    }
  }

  return (
    <div className="flex flex-col gap-6 max-w-7xl mx-auto animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Manage Reservations</h1>
          <p className="text-muted-foreground mt-1 text-sm">View, search, and manage all platform bookings.</p>
        </div>
      </div>

      <div className="flex flex-col gap-4">
        <div className="relative w-full md:w-96">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="Search by ID, vehicle, or rider..." 
            className="pl-9 bg-slate-50 border-slate-200 focus-visible:bg-white"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <Card className="overflow-hidden border-none shadow-sm min-h-[400px]">
          <CardContent className="p-0">
            <Table>
              <TableHeader className="bg-muted/30">
                <TableRow>
                  <SortableHead label="Booking" sortKey="id" />
                  <TableHead className="uppercase tracking-wider text-xs hidden sm:table-cell">Dates</TableHead>
                  <SortableHead label="Status & Source" sortKey="status" className="hidden md:table-cell" />
                  <SortableHead label="Total Price" sortKey="total" className="hidden sm:table-cell" />
                  <TableHead className="text-right uppercase tracking-wider text-xs">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  Array.from({ length: limit }).map((_, i) => (
                    <TableRow key={`skeleton-res-${i}`}>
                      <TableCell className="py-4">
                        <div className="flex flex-col gap-2">
                          <Skeleton className="h-3 w-16" />
                          <Skeleton className="h-4 w-40" />
                        </div>
                      </TableCell>
                      <TableCell className="py-4 hidden sm:table-cell">
                        <div className="flex flex-col gap-2">
                          <Skeleton className="h-4 w-24" />
                          <Skeleton className="h-3 w-32" />
                        </div>
                      </TableCell>
                      <TableCell className="py-4 hidden md:table-cell">
                        <Skeleton className="h-6 w-24 rounded-full" />
                      </TableCell>
                      <TableCell className="py-4 hidden sm:table-cell">
                        <Skeleton className="h-4 w-16" />
                      </TableCell>
                      <TableCell className="text-right py-4">
                        <div className="flex justify-end">
                          <Skeleton className="h-8 w-20 rounded-md" />
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                ) : paginatedData.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-16">
                      <div className="flex flex-col items-center justify-center gap-2">
                        <CalendarDays className="h-10 w-10 text-muted-foreground opacity-30" />
                        <p className="text-muted-foreground font-medium">No reservations found.</p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : paginatedData.map((res) => {
                  const vehicleName = typeof res.vehicle === 'object' && res.vehicle ? (res.vehicle.name || res.vehicle.model || 'Unknown Vehicle') : (res.vehicle || 'Unknown Vehicle')
                  const riderName = typeof res.rider === 'object' && res.rider ? (res.rider.name || res.rider.full_name || 'Unknown Rider') : (res.rider || 'Unknown Rider')
                  const source = res.humanized?.source || res.source || 'WEB PLATFORM'
                  const displaySource = source.replace('SOURCE_', '').replace(/_/g, ' ')
                  
                  let rawStart = res.date_from || res.dates?.start || res.start_date
                  let rawEnd = res.date_to || res.dates?.end || res.end_date
                  let startStr = formatDateLabel(rawStart) || res.humanized?.date_from || "N/A"
                  let endStr = formatDateLabel(rawEnd) || res.humanized?.date_to || ""

                  const totalAmount = res.total_price || res.total_amount || res.total || res.grand_total || 0
                  const currency = res.currency || res.financials?.currency || 'USD'
                  const statusStr = res.humanized?.status || (typeof res.status === 'string' ? res.status : 'PENDING')
                  const displayStatus = statusStr.replace('RESERVATION_', '')
                  const shortId = res.humanized?.id || res.id?.split('-')[0] || res.id?.substring(0, 8) || '...'

                  return (
                   <TableRow key={res.id} className="hover:bg-muted/20">
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="font-mono text-xs font-semibold tracking-wider text-muted-foreground mb-1 uppercase">#{shortId}</span>
                        <span className="text-sm font-medium">
                          {vehicleName}
                        </span>
                        <span className="text-xs text-muted-foreground mt-0.5">Rider: {riderName}</span>
                        <div className="md:hidden mt-2 flex flex-col gap-2">
                          <div className="flex items-center gap-1.5">
                            <Badge variant="outline" className={cn("rounded-md text-[10px] uppercase font-bold tracking-wider px-2 border-transparent", getReservationStatusColor(res.status, statusStr))}>
                              {displayStatus}
                            </Badge>
                          </div>
                          <span className="text-xs">{startStr} to {endStr}</span>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="hidden sm:table-cell">
                      <div className="flex flex-col text-sm">
                        <span>{startStr}</span>
                        {endStr && <span className="text-xs text-muted-foreground mt-0.5">to {endStr}</span>}
                      </div>
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                      <div className="flex flex-col items-start gap-1.5">
                        <Badge variant="outline" className={cn("rounded-md text-[10px] uppercase font-bold tracking-wider px-2 border-transparent", getReservationStatusColor(res.status, statusStr))}>
                          {displayStatus}
                        </Badge>
                        <span className="text-[10px] uppercase text-muted-foreground font-semibold tracking-wider">
                          {displaySource}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="hidden sm:table-cell">
                      <span className="font-medium">
                        {Number(totalAmount).toLocaleString()} <span className="text-xs text-muted-foreground ml-0.5 font-normal">{currency}</span>
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="sm" asChild>
                        <Link to={`/reservations/${res.id}`}>
                          <Eye className="h-4 w-4 mr-1.5" /> View
                        </Link>
                      </Button>
                    </TableCell>
                  </TableRow>
                 )
                })}
              </TableBody>
            </Table>
          </CardContent>
          
          {/* Pagination */}
          {!loading && totalFiltered > limit && (
            <div className="flex items-center justify-between px-4 py-3 border-t bg-muted/30">
              <div className="text-xs text-muted-foreground">
                Showing <span className="font-medium text-foreground">{Math.min(totalFiltered, (page - 1) * limit + 1)}</span> to{" "}
                <span className="font-medium text-foreground">{Math.min(totalFiltered, page * limit)}</span> of{" "}
                <span className="font-medium text-foreground">{totalFiltered}</span> entries
              </div>
              <div className="flex items-center gap-1">
                <Button 
                  variant="outline" 
                  size="icon" 
                  className="h-8 w-8"
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <div className="text-xs font-medium px-2">
                  Page {page} of {totalPages}
                </div>
                <Button 
                  variant="outline" 
                  size="icon" 
                  className="h-8 w-8"
                  onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </Card>
      </div>
    </div>
  )
}

