import { useState, useMemo, useEffect } from "react"
import { Link } from "react-router-dom"
import { Card, CardContent } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Skeleton } from "@/components/ui/skeleton"
import { PaginationControls } from "@/components/ui/pagination-controls"
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

  const [hasMoreBackend, setHasMoreBackend] = useState(false)

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
            params: { 
              page: currentPage, 
              size: 50,
              limit: 50,
              skip: (currentPage - 1) * 50
            },
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
          
          if (loopCount === 0 && data.length > 0) {
            console.log("SAMPLE RESERVATION:", data[0]);
          }
          
          // Deduplicate items just in case the API returned duplicates
          const newItems = data.filter((item: any) => {
            const idToMatch = item.id || item._id || item.humanized?.id;
            if (!idToMatch) return true; // If no id, just keep it rather than filtering out everything randomly
            return !fetchedData.find(f => (f.id || f._id || f.humanized?.id) === idToMatch);
          })
          fetchedData = [...fetchedData, ...newItems]
          
          if (rawData?.total_pages) {
            if (currentPage >= rawData.total_pages) {
              hasMore = false
            } else {
              currentPage++
            }
          } else if (rawData?.count) {
            if (fetchedData.length >= rawData.count || data.length === 0) {
              hasMore = false
            } else {
              currentPage++
            }
          } else {
            // fallback
            if (data.length < 50) hasMore = false
            else currentPage++
          }
          loopCount++
        }
        
        setHasMoreBackend(hasMore)
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
      result = result.filter(r => {
        // Deep search check
        const idMatches = String(r.id || '').toLowerCase().includes(q) || 
                          String(r.humanized?.id || '').toLowerCase().includes(q)
                          
        const vNameMatches = String(typeof r.vehicle === 'object' && r.vehicle ? (r.vehicle.name || r.vehicle.model || r.vehicle.id || '') : (r.vehicle || '')).toLowerCase().includes(q)
        
        const rNameMatches = String(typeof r.rider === 'object' && r.rider ? (r.rider.name || r.rider.full_name || r.rider.email || r.rider.phone || r.rider.id || '') : (r.rider || '')).toLowerCase().includes(q)
        
        const sourceMatches = String(r.source || '').toLowerCase().includes(q) || 
                              String(r.humanized?.source || '').toLowerCase().includes(q)
                              
        const statusMatches = String(r.status || '').toLowerCase().includes(q) || 
                              String(r.humanized?.status || '').toLowerCase().includes(q)
                              
        const ownerMatches = String(typeof r.owner === 'object' && r.owner ? (r.owner.name || r.owner.full_name || r.owner.email || r.owner.phone || r.owner.id || '') : (r.owner || '')).toLowerCase().includes(q)
        
        return idMatches || vNameMatches || rNameMatches || sourceMatches || statusMatches || ownerMatches
      })
    }

    result.sort((a, b) => {
      const isDesc = sortBy.endsWith('_desc')
      const key = sortBy.replace(/_desc$|_asc$/, '')
      let comp = 0
      
      const valA = key === 'total' ? (a.total_amount || a.total_price || a.total || a.grand_total || 0) : 
                   key === 'dates' ? (a.date_from || a.start_date || a.dates?.start || a.created_at || '') : 
                   key === 'vehicle' ? (typeof a.vehicle === 'object' && a.vehicle ? (a.vehicle.name || a.vehicle.model || a.vehicle.id) : a.vehicle || '') : 
                   key === 'rider' ? (typeof a.rider === 'object' && a.rider ? (a.rider.name || a.rider.full_name || a.rider.id) : a.rider || '') : 
                   key === 'status' ? (a.humanized?.status || a.status || '') :
                   key === 'id' ? (a.humanized?.id || a.id || '') :
                   a[key]
      
      const valB = key === 'total' ? (b.total_amount || b.total_price || b.total || b.grand_total || 0) : 
                   key === 'dates' ? (b.date_from || b.start_date || b.dates?.start || b.created_at || '') : 
                   key === 'vehicle' ? (typeof b.vehicle === 'object' && b.vehicle ? (b.vehicle.name || b.vehicle.model || b.vehicle.id) : b.vehicle || '') : 
                   key === 'rider' ? (typeof b.rider === 'object' && b.rider ? (b.rider.name || b.rider.full_name || b.rider.id) : b.rider || '') : 
                   key === 'status' ? (b.humanized?.status || b.status || '') :
                   key === 'id' ? (b.humanized?.id || b.id || '') :
                   b[key]

      if (key === 'id') comp = String(valA || '').localeCompare(String(valB || ''))
      else if (key === 'vehicle') comp = String(valA || '').localeCompare(String(valB || ''))
      else if (key === 'rider') comp = String(valA || '').localeCompare(String(valB || ''))
      else if (key === 'status') comp = String(valA || '').localeCompare(String(valB || ''))
      else if (key === 'total') comp = Number(valA || 0) - Number(valB || 0)
      else if (key === 'created_at' || key === 'dates') comp = new Date(valA || 0).getTime() - new Date(valB || 0).getTime()
      
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

  const formatDateLabel = (dateString: string, humanizedString?: string) => {
    try {
      if (dateString) {
        const date = new Date(dateString)
        if (!isNaN(date.getTime())) {
          return date.toLocaleDateString('en-US', { timeZone: 'UTC', day: 'numeric', month: 'short', year: 'numeric' })
        }
      }
    } catch {}

    if (humanizedString) {
      // It might be like "29 апр." or "7 май."
      let s = humanizedString.replace(/\./g, '').trim()
      const ruMonths = {
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

    return ""
  }

  return (
    <div className="flex flex-col gap-6 max-w-7xl mx-auto animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Manage Reservations</h1>
          <p className="text-muted-foreground mt-1 text-sm">View, search, and manage all platform bookings.</p>
        </div>
      </div>

      <Card className="overflow-hidden border-none shadow-sm min-h-[400px]">
        <div className="px-6 py-4 border-b flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-muted/20">
          <div className="relative w-full max-w-sm">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input 
              type="search"
              placeholder="Search by ID, vehicle, or rider..." 
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
                  <SortableHead label="Booking" sortKey="id" />
                  <SortableHead label="Dates" sortKey="dates" className="hidden sm:table-cell" />
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
                  let startStr = formatDateLabel(rawStart, res.humanized?.date_from) || "N/A"
                  let endStr = formatDateLabel(rawEnd, res.humanized?.date_to) || ""

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
                            <Badge className={cn("rounded-md text-[10px] uppercase font-bold tracking-wider px-2", getReservationStatusColor(res.status, statusStr))}>
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
                        <Badge className={cn("rounded-md text-[10px] uppercase font-bold tracking-wider px-2", getReservationStatusColor(res.status, statusStr))}>
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
          {!loading && totalFiltered > 0 && (
            <PaginationControls
              currentPage={page}
              totalPages={totalPages}
              totalItems={totalFiltered}
              currentItemsCount={paginatedData.length}
              onPageChange={setPage}
              disabled={loading}
            />
          )}
        </Card>
    </div>
  )
}

