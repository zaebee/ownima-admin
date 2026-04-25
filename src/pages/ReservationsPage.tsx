import { useState, useMemo, useEffect } from "react"
import { Link } from "react-router-dom"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Skeleton } from "@/components/ui/skeleton"
import { Search, MoreHorizontal, ArrowUp, ArrowDown, ArrowUpDown, Eye } from "lucide-react"
import { cn } from "@/lib/utils"
import { api } from "@/lib/api"

export function ReservationsPage() {
  const [reservations, setReservations] = useState<any[]>([])
  const [search, setSearch] = useState("")
  const [sortBy, setSortBy] = useState("created_at_desc")
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchReservations = async () => {
      try {
        setLoading(true)
        const response = await api.get("/admin/reservations")
        // Check if data is array or wrapped in an object like { items: [] }, { data: [] }
        const data = Array.isArray(response.data) ? response.data : 
                     (response.data?.items ? response.data.items : 
                     (response.data?.data ? response.data.data : []))
        setReservations(data)
      } catch (error) {
        console.error("Error fetching reservations:", error)
        // Fallback or empty array on error
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
        (r.vehicle && r.vehicle.toString().toLowerCase().includes(q)) || /* toString in case backend sends nested object */
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

  const SortableHead = ({ label, sortKey, className = "" }: { label: string, sortKey: string, className?: string }) => {
    const isActive = sortBy.startsWith(sortKey)
    const isDesc = sortBy.endsWith('_desc')
    
    return (
      <TableHead 
        className={cn("text-xs font-semibold text-muted-foreground h-10 cursor-pointer hover:text-foreground hover:bg-muted/50 transition-colors select-none whitespace-nowrap", className)}
        onClick={() => {
          if (isActive) {
            setSortBy(sortKey + (isDesc ? "_asc" : "_desc"))
          } else {
            setSortBy(sortKey + "_desc")
          }
        }}
      >
        <div className="flex items-center gap-1 text-[11px] uppercase tracking-wider">
          {label}
          {isActive ? (
            isDesc ? <ArrowDown className="h-3 w-3" /> : <ArrowUp className="h-3 w-3" />
          ) : (
            <ArrowUpDown className="h-3 w-3 opacity-30" />
          )}
        </div>
      </TableHead>
    )
  }

  return (
    <div className="flex flex-col gap-8">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Reservations</h2>
        <Button>Create Reservation</Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Manage Reservations</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center py-4">
            <div className="relative w-72">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search reservations..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-8"
              />
            </div>
          </div>
          <Table>
            <TableHeader className="bg-muted/30">
              <TableRow className="border-b">
                <SortableHead label="Booking" sortKey="vehicle" className="w-[300px] pl-4 text-[11px] select-none uppercase tracking-wider font-semibold text-muted-foreground h-10" />
                <SortableHead label="Rider" sortKey="rider" className="text-[11px] select-none uppercase tracking-wider font-semibold text-muted-foreground h-10" />
                <SortableHead label="Status" sortKey="status" className="hidden md:table-cell text-[11px] select-none uppercase tracking-wider font-semibold text-muted-foreground h-10" />
                <TableHead className="hidden sm:table-cell text-[11px] select-none uppercase tracking-wider font-semibold text-muted-foreground h-10">Dates</TableHead>
                <SortableHead label="Total" sortKey="total" className="hidden sm:table-cell text-[11px] select-none uppercase tracking-wider font-semibold text-muted-foreground h-10" />
                <TableHead className="text-right pr-4 text-[11px] select-none uppercase tracking-wider font-semibold text-muted-foreground h-10">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                Array.from({ length: 6 }).map((_, i) => (
                  <TableRow key={`skeleton-res-${i}`}>
                    <TableCell className="pl-4 py-4">
                      <div className="flex flex-col gap-1.5">
                        <Skeleton className="h-4 w-32" />
                        <Skeleton className="h-4 w-48" />
                      </div>
                    </TableCell>
                    <TableCell className="py-4">
                      <Skeleton className="h-4 w-28" />
                    </TableCell>
                    <TableCell className="hidden md:table-cell py-4">
                      <Skeleton className="h-6 w-20 rounded-full" />
                    </TableCell>
                    <TableCell className="hidden sm:table-cell py-4">
                      <div className="flex flex-col gap-1.5">
                        <Skeleton className="h-4 w-24" />
                        <Skeleton className="h-4 w-24" />
                      </div>
                    </TableCell>
                    <TableCell className="hidden sm:table-cell py-4">
                      <Skeleton className="h-4 w-16" />
                    </TableCell>
                    <TableCell className="text-right py-4 pr-4">
                      <div className="flex justify-end">
                        <Skeleton className="h-8 w-8 rounded-md" />
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              ) : filteredAndSorted.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-10 text-muted-foreground">
                    No reservations found matching your search.
                  </TableCell>
                </TableRow>
              ) : filteredAndSorted.map((res) => {
                const vehicleName = typeof res.vehicle === 'object' && res.vehicle ? (res.vehicle.name || res.vehicle.model || 'Unknown Vehicle') : (res.vehicle || 'Unknown Vehicle')
                const riderName = typeof res.rider === 'object' && res.rider ? (res.rider.name || res.rider.full_name || 'Unknown Rider') : (res.rider || 'Unknown Rider')
                
                const formatDate = (dateString: string) => {
                  try {
                    const date = new Date(dateString);
                    return new Intl.DateTimeFormat('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' }).format(date);
                  } catch (e) {
                    return "";
                  }
                }

                let datesStr = 'Date not set'
                let datesStrMobile = 'Date not set'
                if (typeof res.dates === 'string') {
                  datesStr = res.dates
                  datesStrMobile = res.dates
                } else if (res.dates?.start && res.dates?.end) {
                  datesStr = `${formatDate(res.dates.start)}\n- ${formatDate(res.dates.end)}`
                  datesStrMobile = `${formatDate(res.dates.start)} - ${formatDate(res.dates.end)}`
                } else if (res.start_date && res.end_date) {
                  datesStr = `${formatDate(res.start_date)}\n- ${formatDate(res.end_date)}`
                  datesStrMobile = `${formatDate(res.start_date)} - ${formatDate(res.end_date)}`
                }

                const totalAmount = res.total_amount || res.total || res.grand_total || 0
                const currency = res.currency || res.financials?.currency || 'USD'
                const status = (res.status || 'Pending').toUpperCase()

                const getStatusStyle = (s: string) => {
                  switch(s) {
                    case "CONFIRMED": return "bg-emerald-100/80 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800"
                    case "COMPLETED": return "bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-300 border border-slate-200 dark:border-slate-700"
                    case "PENDING": return "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border border-slate-200 dark:border-slate-700"
                    case "ACTIVE": return "bg-blue-100/80 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400 border border-blue-200 dark:border-blue-800"
                    case "COLLECTED": return "bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-300 border border-slate-200 dark:border-slate-700"
                    case "CANCELLED": return "bg-rose-100/80 text-rose-800 dark:bg-rose-900/30 dark:text-rose-400 border border-rose-200 dark:border-rose-800"
                    default: return "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400 border border-slate-200 dark:border-slate-700"
                  }
                }

                const shortId = res.id?.split('-')[0] || res.id?.substring(0, 8) || '...'

                return (
                 <TableRow key={res.id} className="hover:bg-muted/10 border-b border-muted/50 group">
                  <TableCell className="pl-4 py-5">
                    <div className="flex flex-col gap-1.5">
                      <span className="text-[11px] text-muted-foreground font-mono">{res.id}</span>
                      <span className="font-medium text-foreground">{vehicleName}</span>
                      <span className="text-xs text-muted-foreground sm:hidden whitespace-pre-line">{datesStrMobile}</span>
                      <div className="flex items-center gap-2 mt-1 md:hidden">
                        <Badge variant="outline" className={cn("text-[10px] px-2 py-0 font-medium tracking-wide border-transparent", getStatusStyle(status))}>
                          {status}
                        </Badge>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="py-5">
                    <div className="flex flex-col">
                      <span className="text-slate-700 dark:text-slate-300">{riderName}</span>
                    </div>
                  </TableCell>
                  <TableCell className="hidden md:table-cell py-5">
                    <span className={cn("text-[11px] px-2.5 py-1 rounded-full font-bold tracking-wider", getStatusStyle(status))}>
                      {status.charAt(0).toUpperCase() + status.slice(1).toLowerCase()}
                    </span>
                  </TableCell>
                  <TableCell className="hidden sm:table-cell py-5">
                    <span className="text-sm text-slate-600 dark:text-slate-400 whitespace-pre-line leading-relaxed">
                      {datesStr}
                    </span>
                  </TableCell>
                  <TableCell className="hidden sm:table-cell py-5">
                    <div className="flex flex-col">
                      <span className="text-sm">{totalAmount.toLocaleString()}</span>
                      <span className="text-[11px] text-muted-foreground">{currency}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-right py-5 pr-4">
                    <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground" asChild>
                      <Link to={`/reservations/${res.id}`}>
                        <MoreHorizontal className="h-5 w-5" />
                      </Link>
                    </Button>
                  </TableCell>
                </TableRow>
               )
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
