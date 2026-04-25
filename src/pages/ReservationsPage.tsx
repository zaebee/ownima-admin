import { useState, useMemo, useEffect } from "react"
import { Link } from "react-router-dom"
import { Card, CardContent } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Skeleton } from "@/components/ui/skeleton"
import { Search, ArrowUp, ArrowDown, ArrowUpDown, Eye, CalendarDays, ChevronLeft, ChevronRight } from "lucide-react"
import { cn } from "@/lib/utils"
import { api } from "@/lib/api"

export function ReservationsPage() {
  const [reservations, setReservations] = useState<any[]>([])
  const [search, setSearch] = useState("")
  const [sortBy, setSortBy] = useState("created_at_desc")
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const limit = 10

  useEffect(() => {
    const fetchReservations = async () => {
      try {
        setLoading(true)
        const response = await api.get("/admin/reservations")
        const data = Array.isArray(response.data) ? response.data : 
                     (response.data?.items ? response.data.items : 
                     (response.data?.data ? response.data.data : []))
        setReservations(data)
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
        (r.id && r.id.toLowerCase().includes(q)) ||
        (r.vehicle && r.vehicle.toString().toLowerCase().includes(q)) ||
        (r.rider && r.rider.toString().toLowerCase().includes(q)) ||
        (r.vehicle?.name && r.vehicle.name.toLowerCase().includes(q)) ||
        (r.rider?.name && r.rider.name.toLowerCase().includes(q))
      )
    }

    result.sort((a, b) => {
      const isDesc = sortBy.endsWith('_desc')
      const key = sortBy.replace(/_desc$|_asc$/, '')
      let comp = 0
      
      const valA = key === 'total' ? (a.total_amount || a.total || 0) : 
                   key === 'vehicle' ? (a.vehicle?.name || a.vehicle || '') : 
                   key === 'rider' ? (a.rider?.name || a.rider || '') : 
                   a[key]
      
      const valB = key === 'total' ? (b.total_amount || b.total || 0) : 
                   key === 'vehicle' ? (b.vehicle?.name || b.vehicle || '') : 
                   key === 'rider' ? (b.rider?.name || b.rider || '') : 
                   b[key]

      if (key === 'id') comp = String(valA || '').localeCompare(String(valB || ''))
      else if (key === 'vehicle') comp = String(valA || '').localeCompare(String(valB || ''))
      else if (key === 'rider') comp = String(valA || '').localeCompare(String(valB || ''))
      else if (key === 'status') comp = String(valA || '').localeCompare(String(valB || ''))
      else if (key === 'total') comp = (valA || 0) - (valB || 0)
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
        className={cn("cursor-pointer select-none hover:bg-muted/50 transition-colors", className)}
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

  const getStatusStyle = (s: string) => {
    switch(s.toUpperCase()) {
      case "CONFIRMED": return "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800"
      case "COMPLETED": return "bg-slate-900 text-slate-50 dark:bg-slate-100 dark:text-slate-900 border-transparent"
      case "COLLECTED": return "bg-slate-900 text-slate-50 dark:bg-slate-100 dark:text-slate-900 border-transparent"
      case "PENDING": return "bg-slate-900 text-slate-50 dark:bg-slate-100 dark:text-slate-900 border-transparent"
      case "ACTIVE": return "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400 border border-blue-200 dark:border-blue-800"
      case "CANCELLED": return "bg-rose-100 text-rose-800 dark:bg-rose-900/30 dark:text-rose-400 border border-rose-200 dark:border-rose-800"
      case "OVERDUE": return "bg-slate-900 text-slate-50 dark:bg-slate-100 dark:text-slate-900 border-transparent"
      default: return "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400 border border-slate-200 dark:border-slate-700"
    }
  }

  const formatDateLabel = (dateString: string) => {
    if (!dateString) return "N/A"
    try {
      const date = new Date(dateString)
      const day = date.getDate()
      const month = date.toLocaleString('default', { month: 'short' })
      let yearStr = ""
      if (date.getFullYear() !== new Date().getFullYear()) {
        yearStr = ` ${date.getFullYear()}`
      }
      return `${day} ${month}${yearStr}`
    } catch {
      return dateString
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
            <Table className="text-sm">
              <TableHeader className="bg-slate-50/80 dark:bg-slate-900/50">
                <TableRow className="border-b">
                  <SortableHead label="Booking" sortKey="id" className="w-[300px] pl-4 text-xs font-semibold text-muted-foreground h-11 uppercase tracking-wider" />
                  <TableHead className="text-xs font-semibold text-muted-foreground h-11 uppercase tracking-wider hidden sm:table-cell">Dates</TableHead>
                  <SortableHead label="Status & Source" sortKey="status" className="text-xs font-semibold text-muted-foreground h-11 uppercase tracking-wider hidden md:table-cell" />
                  <SortableHead label="Total Price" sortKey="total" className="text-xs font-semibold text-muted-foreground h-11 uppercase tracking-wider hidden sm:table-cell" />
                  <TableHead className="text-right pr-4 text-xs font-semibold text-muted-foreground h-11 uppercase tracking-wider">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  Array.from({ length: limit }).map((_, i) => (
                    <TableRow key={`skeleton-res-${i}`}>
                      <TableCell className="pl-4 py-4">
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
                      <TableCell className="text-right py-4 pr-4">
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
                  const source = res.source || res.humanized?.source?.replace('SOURCE_', '').replace(/_/g, ' ') || 'WEB PLATFORM'
                  
                  let rawStart = res.dates?.start || res.start_date
                  let rawEnd = res.dates?.end || res.end_date
                  let datesLines = []
                  if (typeof res.dates === 'string') {
                    datesLines = [res.dates, '']
                  } else if (rawStart && rawEnd) {
                    datesLines = [formatDateLabel(rawStart), `to ${formatDateLabel(rawEnd)}`]
                  } else {
                    datesLines = ['Date not set', '']
                  }

                  const totalAmount = res.total_amount || res.total || res.grand_total || 0
                  const currency = res.currency || res.financials?.currency || 'USD'
                  const status = typeof res.status === 'string' ? res.status.toUpperCase() : 'PENDING'
                  const shortId = res.id?.split('-')[0] || res.id?.substring(0, 8) || '...'

                  return (
                   <TableRow key={res.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/50 border-b border-muted transition-colors">
                    <TableCell className="pl-4 py-4">
                      <div className="flex flex-col">
                        <span className="text-[11px] font-mono text-muted-foreground mb-1 tracking-wider uppercase">#{shortId}</span>
                        <span className="font-medium text-slate-900 dark:text-slate-100">{vehicleName}</span>
                        <span className="text-xs text-muted-foreground mt-0.5">Rider: {riderName}</span>
                        <div className="md:hidden mt-2 flex flex-col gap-2">
                          <div className="flex items-center gap-1.5">
                            <Badge variant="outline" className={cn("text-[10px] uppercase tracking-wider px-2 py-0 border-transparent", getStatusStyle(status))}>
                              {status}
                            </Badge>
                          </div>
                          <span className="text-xs">{datesLines[0]} {datesLines[1]}</span>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="py-4 hidden sm:table-cell">
                      <div className="flex flex-col text-sm text-slate-700 dark:text-slate-300">
                        <span>{datesLines[0]}</span>
                        {datesLines[1] && <span className="text-xs text-muted-foreground mt-0.5">{datesLines[1]}</span>}
                      </div>
                    </TableCell>
                    <TableCell className="py-4 hidden md:table-cell">
                      <div className="flex flex-col items-start gap-1.5">
                        <Badge variant="outline" className={cn("text-[10.5px] uppercase tracking-wider px-2.5 py-0.5 font-bold shadow-none rounded-md", getStatusStyle(status))}>
                          {status}
                        </Badge>
                        <span className="text-[9.5px] uppercase text-muted-foreground font-semibold tracking-wider">
                          {source}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="py-4 hidden sm:table-cell">
                      <span className="font-medium text-slate-900 dark:text-slate-100">
                        {totalAmount.toLocaleString()} <span className="text-xs text-muted-foreground ml-0.5 font-normal">{currency}</span>
                      </span>
                    </TableCell>
                    <TableCell className="text-right py-4 pr-4">
                      <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground font-medium" asChild>
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
            <div className="flex items-center justify-between px-4 py-3 border-t bg-slate-50/50 dark:bg-slate-900/50">
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
