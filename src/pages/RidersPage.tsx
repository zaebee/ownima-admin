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

const mockRiders = [
  { id: "1", name: "Alice Williams", email: "alice@example.com", status: "Active", bookings: 3, rating: 4.9, registered: "2023-01-15" },
  { id: "2", name: "Charlie Brown", email: "charlie@example.com", status: "Active", bookings: 1, rating: 4.5, registered: "2023-05-12" },
  { id: "3", name: "Eve Davis", email: "eve@example.com", status: "Inactive", bookings: 0, rating: 0, registered: "2023-11-01" },
]

export function RidersPage() {
  const [search, setSearch] = useState("")
  const [sortBy, setSortBy] = useState("registered_desc")
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false)
    }, 600)
    return () => clearTimeout(timer)
  }, [])

  const filteredAndSorted = useMemo(() => {
    let result = [...mockRiders]

    if (search.trim()) {
      const q = search.toLowerCase().trim()
      result = result.filter(r => 
        (r.name && r.name.toLowerCase().includes(q)) ||
        (r.email && r.email.toLowerCase().includes(q))
      )
    }

    result.sort((a, b) => {
      const isDesc = sortBy.endsWith('_desc')
      const key = sortBy.replace(/_desc$|_asc$/, '')
      let comp = 0
      
      if (key === 'name') comp = String(a.name || '').localeCompare(String(b.name || ''))
      else if (key === 'email') comp = String(a.email || '').localeCompare(String(b.email || ''))
      else if (key === 'status') comp = String(a.status || '').localeCompare(String(b.status || ''))
      else if (key === 'bookings') comp = (a.bookings || 0) - (b.bookings || 0)
      else if (key === 'rating') comp = (a.rating || 0) - (b.rating || 0)
      else if (key === 'registered') comp = new Date(a.registered || 0).getTime() - new Date(b.registered || 0).getTime()
      
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
        <h2 className="text-3xl font-bold tracking-tight">Riders</h2>
        <Button>Add Rider</Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Manage Riders</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center py-4">
            <div className="relative w-72">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search riders..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-8"
              />
            </div>
          </div>
          <Table>
            <TableHeader className="bg-muted/30">
              <TableRow>
                <SortableHead label="Name" sortKey="name" />
                <SortableHead label="Email" sortKey="email" className="hidden sm:table-cell" />
                <SortableHead label="Status" sortKey="status" className="hidden md:table-cell" />
                <SortableHead label="Bookings" sortKey="bookings" className="hidden sm:table-cell" />
                <SortableHead label="Rating" sortKey="rating" className="hidden sm:table-cell" />
                <TableHead className="text-right text-xs font-semibold text-muted-foreground h-10 select-none uppercase tracking-wider">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                Array.from({ length: 6 }).map((_, i) => (
                  <TableRow key={`skeleton-rider-${i}`}>
                    <TableCell className="py-3">
                      <div className="flex flex-col gap-1.5">
                        <Skeleton className="h-4 w-32" />
                        <Skeleton className="h-3 w-40 sm:hidden" />
                      </div>
                    </TableCell>
                    <TableCell className="hidden sm:table-cell py-3">
                      <Skeleton className="h-4 w-40" />
                    </TableCell>
                    <TableCell className="hidden md:table-cell py-3">
                      <Skeleton className="h-5 w-16 rounded" />
                    </TableCell>
                    <TableCell className="hidden sm:table-cell py-3">
                      <Skeleton className="h-4 w-6" />
                    </TableCell>
                    <TableCell className="hidden sm:table-cell py-3">
                      <div className="flex items-center gap-1.5">
                        <Skeleton className="h-4 w-4 rounded-full" />
                        <Skeleton className="h-4 w-8" />
                      </div>
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
                  <TableCell colSpan={6} className="text-center py-10 text-muted-foreground">
                    No riders found matching your search.
                  </TableCell>
                </TableRow>
              ) : filteredAndSorted.map((rider) => (
                <TableRow key={rider.id}>
                  <TableCell className="font-medium">
                    <div className="flex flex-col">
                      <Link to={`/riders/${rider.id}`} className="hover:underline text-primary">
                        {rider.name}
                      </Link>
                      <span className="text-xs text-muted-foreground sm:hidden">{rider.email}</span>
                      <div className="md:hidden mt-1">
                        <Badge variant={rider.status === "Active" ? "success" : "secondary"} className="text-[10px] px-1 py-0 h-4">
                          {rider.status}
                        </Badge>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="hidden sm:table-cell">{rider.email}</TableCell>
                  <TableCell className="hidden md:table-cell">
                    <Badge variant={rider.status === "Active" ? "success" : "secondary"}>
                      {rider.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="hidden sm:table-cell">{rider.bookings}</TableCell>
                  <TableCell className="hidden sm:table-cell">{rider.rating}</TableCell>
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
