import { useState, useMemo, useEffect } from "react"
import { Link } from "react-router-dom"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Skeleton } from "@/components/ui/skeleton"
import { Search, MoreHorizontal, ArrowUp, ArrowDown, ArrowUpDown } from "lucide-react"
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
              <TableRow>
                <SortableHead label="ID" sortKey="id" className="hidden sm:table-cell" />
                <SortableHead label="Vehicle" sortKey="vehicle" />
                <SortableHead label="Rider" sortKey="rider" />
                <SortableHead label="Status" sortKey="status" className="hidden md:table-cell" />
                <TableHead className="hidden sm:table-cell text-xs font-semibold text-muted-foreground h-10 select-none uppercase tracking-wider">Dates</TableHead>
                <SortableHead label="Total" sortKey="total" className="hidden sm:table-cell" />
                <TableHead className="text-right text-xs font-semibold text-muted-foreground h-10 select-none uppercase tracking-wider">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                Array.from({ length: 6 }).map((_, i) => (
                  <TableRow key={`skeleton-res-${i}`}>
                    <TableCell className="hidden sm:table-cell py-3">
                      <Skeleton className="h-4 w-20" />
                    </TableCell>
                    <TableCell className="py-3">
                      <Skeleton className="h-4 w-28" />
                    </TableCell>
                    <TableCell className="py-3">
                      <div className="flex flex-col gap-1.5">
                        <Skeleton className="h-4 w-32" />
                        <Skeleton className="h-3 w-40 sm:hidden" />
                      </div>
                    </TableCell>
                    <TableCell className="hidden md:table-cell py-3">
                      <Skeleton className="h-5 w-20 rounded" />
                    </TableCell>
                    <TableCell className="hidden sm:table-cell py-3">
                      <Skeleton className="h-4 w-24" />
                    </TableCell>
                    <TableCell className="hidden sm:table-cell py-3">
                      <Skeleton className="h-4 w-16" />
                    </TableCell>
                    <TableCell className="text-right py-3">
                      <div className="flex justify-end">
                        <Skeleton className="h-8 w-8 rounded-sm" />
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              ) : filteredAndSorted.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-10 text-muted-foreground">
                    No reservations found matching your search.
                  </TableCell>
                </TableRow>
              ) : filteredAndSorted.map((res) => {
                const vehicleName = typeof res.vehicle === 'object' && res.vehicle ? (res.vehicle.name || res.vehicle.model || 'Unknown Vehicle') : (res.vehicle || 'Unknown Vehicle')
                const riderName = typeof res.rider === 'object' && res.rider ? (res.rider.name || res.rider.full_name || 'Unknown Rider') : (res.rider || 'Unknown Rider')
                let datesStr = 'Date not set'
                if (typeof res.dates === 'string') {
                  datesStr = res.dates
                } else if (res.dates?.start && res.dates?.end) {
                  datesStr = `${new Date(res.dates.start).toLocaleDateString()} - ${new Date(res.dates.end).toLocaleDateString()}`
                } else if (res.start_date && res.end_date) {
                  datesStr = `${new Date(res.start_date).toLocaleDateString()} - ${new Date(res.end_date).toLocaleDateString()}`
                }

                const totalAmount = res.total_amount || res.total || res.grand_total || 0
                const currency = res.currency || res.financials?.currency || 'USD'
                const status = (res.status || 'Pending').charAt(0).toUpperCase() + (res.status || 'Pending').slice(1).toLowerCase()

                return (
                 <TableRow key={res.id}>
                  <TableCell className="font-medium hidden sm:table-cell">{res.id}</TableCell>
                  <TableCell>
                    <div className="flex flex-col">
                      <span className="font-medium">{vehicleName}</span>
                      <span className="text-xs text-muted-foreground sm:hidden">{datesStr}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col">
                      <span>{riderName}</span>
                      <div className="flex items-center gap-2 mt-1 md:hidden">
                        <Badge variant={
                          status === "Confirmed" ? "success" : 
                          status === "Active" ? "default" : 
                          status === "Cancelled" ? "destructive" : "secondary"
                        } className="text-[10px] px-1 py-0 h-4">
                          {status}
                        </Badge>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="hidden md:table-cell">
                    <Badge variant={
                      status === "Confirmed" ? "success" : 
                      status === "Active" ? "default" : 
                      status === "Cancelled" ? "destructive" : "secondary"
                    }>
                      {status}
                    </Badge>
                  </TableCell>
                  <TableCell className="hidden sm:table-cell">{datesStr}</TableCell>
                  <TableCell className="hidden sm:table-cell">{totalAmount.toLocaleString()} {currency}</TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="icon" asChild>
                      <Link to={`/reservations/${res.id}`}>
                        <MoreHorizontal className="h-4 w-4" />
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
