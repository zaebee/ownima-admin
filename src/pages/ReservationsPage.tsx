import { useState, useMemo, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Skeleton } from "@/components/ui/skeleton"
import { Search, MoreHorizontal, ArrowUp, ArrowDown, ArrowUpDown } from "lucide-react"
import { cn } from "@/lib/utils"

const mockReservations = [
  { id: "RES-101", vehicle: "Tesla Model 3", rider: "Alice Williams", owner: "John Doe", status: "Confirmed", dates: "Nov 15 - Nov 18", total: 360, created_at: "2023-11-01" },
  { id: "RES-102", vehicle: "Ford F-150", rider: "Charlie Brown", owner: "Jane Smith", status: "Active", dates: "Nov 10 - Nov 20", total: 1500, created_at: "2023-11-05" },
  { id: "RES-103", vehicle: "Honda Civic", rider: "Eve Davis", owner: "Bob Johnson", status: "Cancelled", dates: "Nov 01 - Nov 05", total: 320, created_at: "2023-10-25" },
]

export function ReservationsPage() {
  const [search, setSearch] = useState("")
  const [sortBy, setSortBy] = useState("created_at_desc")
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false)
    }, 600)
    return () => clearTimeout(timer)
  }, [])

  const filteredAndSorted = useMemo(() => {
    let result = [...mockReservations]

    if (search.trim()) {
      const q = search.toLowerCase().trim()
      result = result.filter(r => 
        (r.id && r.id.toLowerCase().includes(q)) ||
        (r.vehicle && r.vehicle.toLowerCase().includes(q)) ||
        (r.rider && r.rider.toLowerCase().includes(q))
      )
    }

    result.sort((a, b) => {
      const isDesc = sortBy.endsWith('_desc')
      const key = sortBy.replace(/_desc$|_asc$/, '')
      let comp = 0
      
      if (key === 'id') comp = String(a.id || '').localeCompare(String(b.id || ''))
      else if (key === 'vehicle') comp = String(a.vehicle || '').localeCompare(String(b.vehicle || ''))
      else if (key === 'rider') comp = String(a.rider || '').localeCompare(String(b.rider || ''))
      else if (key === 'status') comp = String(a.status || '').localeCompare(String(b.status || ''))
      else if (key === 'total') comp = (a.total || 0) - (b.total || 0)
      else if (key === 'created_at') comp = new Date(a.created_at || 0).getTime() - new Date(b.created_at || 0).getTime()
      
      return isDesc ? -comp : comp
    })

    return result
  }, [search, sortBy])

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
              ) : filteredAndSorted.map((res) => (
                <TableRow key={res.id}>
                  <TableCell className="font-medium hidden sm:table-cell">{res.id}</TableCell>
                  <TableCell>
                    <div className="flex flex-col">
                      <span className="font-medium">{res.vehicle}</span>
                      <span className="text-xs text-muted-foreground sm:hidden">{res.dates}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col">
                      <span>{res.rider}</span>
                      <div className="flex items-center gap-2 mt-1 md:hidden">
                        <Badge variant={
                          res.status === "Confirmed" ? "success" : 
                          res.status === "Active" ? "default" : "destructive"
                        } className="text-[10px] px-1 py-0 h-4">
                          {res.status}
                        </Badge>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="hidden md:table-cell">
                    <Badge variant={
                      res.status === "Confirmed" ? "success" : 
                      res.status === "Active" ? "default" : "destructive"
                    }>
                      {res.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="hidden sm:table-cell">{res.dates}</TableCell>
                  <TableCell className="hidden sm:table-cell">${res.total}</TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="icon">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
