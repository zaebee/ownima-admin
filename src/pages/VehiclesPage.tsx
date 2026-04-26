import { useState, useEffect, useMemo } from "react"
import { Link } from "react-router-dom"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Car, Search, Eye, Filter, Plus, ArrowUp, ArrowDown, ArrowUpDown, ChevronLeft, ChevronRight } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"
import { api } from "@/lib/api"
import { getMediaUrl, cn } from "@/lib/utils"
import { VehicleListItem } from "@/types/vehicle"

const getStatusString = (status: number) => {
  switch (status) {
    case 1: return "DRAFT";
    case 2: return "FREE";
    case 3: return "MAINTENANCE";
    case 4: return "COLLECTED";
    case 5: return "ARCHIVED";
    case 0: return "UNSPECIFIED";
    default: return `STATUS_${status}`;
  }
}

const getStatusVariant = (status: number) => {
  switch (status) {
    case 1: return "secondary";   
    case 2: return "success";     
    case 3: return "warning";     
    case 4: return "info";        
    case 5: return "destructive"; 
    case 0:
    default: return "outline";    
  }
}

export function VehiclesPage() {
  const [vehicles, setVehicles] = useState<VehicleListItem[]>([])
  const [total, setTotal] = useState(0)
  const [totalPages, setTotalPages] = useState(1)
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize] = useState(25)
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [sortBy, setSortBy] = useState("created_at_desc")

  useEffect(() => {
    const fetchVehicles = async () => {
      try {
        setLoading(true)
        const response = await api.get('/api/v1/admin/vehicles', { 
          params: { page: currentPage, size: pageSize } 
        })
        setVehicles(response.data.data || [])
        setTotal(response.data.count || 0)
        setTotalPages(response.data.total_pages || 1)
      } catch (error: any) {
        console.error("Failed to fetch vehicles:", error)
        setVehicles([])
        setTotal(0)
      } finally {
        setLoading(false)
      }
    }
    
    fetchVehicles()
  }, [currentPage, pageSize])

  const filteredAndSorted = useMemo(() => {
    let result = [...vehicles]

    if (search.trim()) {
      const q = search.toLowerCase().trim()
      result = result.filter(v => 
        (v.name && v.name.toLowerCase().includes(q)) ||
        (v.general_info?.reg_number && v.general_info.reg_number.toLowerCase().includes(q)) ||
        (v.general_info?.vin && v.general_info.vin.toLowerCase().includes(q))
      )
    }

    result.sort((a, b) => {
      const isDesc = sortBy.endsWith('_desc')
      const key = sortBy.replace(/_desc$|_asc$/, '')
      let comp = 0
      
      const aName = a.name || `${a.general_info?.brand} ${a.general_info?.model}`;
      const bName = b.name || `${b.general_info?.brand} ${b.general_info?.model}`;

      if (key === 'name') comp = String(aName || '').localeCompare(String(bName || ''))
      else if (key === 'reg_number') comp = String(a.general_info?.reg_number || '').localeCompare(String(b.general_info?.reg_number || ''))
      else if (key === 'owner') comp = String(a.owner?.full_name || '').localeCompare(String(b.owner?.full_name || ''))
      else if (key === 'status') comp = (a.status || 0) - (b.status || 0)
      else if (key === 'price') comp = (a.price || 0) - (b.price || 0)
      else if (key === 'created_at') comp = new Date(a.created_at || 0).getTime() - new Date(b.created_at || 0).getTime()
      
      return isDesc ? -comp : comp
    })

    return result
  }, [vehicles, search, sortBy])

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
    <div className="flex flex-col gap-6 max-w-7xl mx-auto w-full pb-10">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground flex items-center gap-2">
            Global Fleet
          </h1>
          <p className="text-muted-foreground mt-1">
            Manage all vehicles, track statuses, and view owner assignments.
          </p>
        </div>
        
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Button variant="outline" className="hidden sm:flex">
            <Filter className="mr-2 h-4 w-4" />
            Filters
          </Button>
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Add Vehicle
          </Button>
        </div>
      </div>

      <Card>
        <div className="px-6 py-4 border-b flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-muted/20">
          <div className="relative w-full max-w-sm">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search by name, reg number, or VIN..."
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
                <TableHead className="w-[60px] sm:w-[80px] pl-2 sm:pl-4 text-xs font-semibold text-muted-foreground h-10 select-none uppercase tracking-wider">Photo</TableHead>
                <SortableHead label="Vehicle Details" sortKey="name" className="pl-2 sm:pl-4" />
                <SortableHead label="License Plate" sortKey="reg_number" className="hidden md:table-cell" />
                <SortableHead label="Owner" sortKey="owner" className="hidden sm:table-cell" />
                <SortableHead label="Status" sortKey="status" className="hidden sm:table-cell" />
                <SortableHead label="Pricing" sortKey="price" className="hidden md:table-cell" />
                <TableHead className="text-right pr-2 sm:pr-4 text-xs font-semibold text-muted-foreground h-10 select-none uppercase tracking-wider">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                Array.from({ length: 10 }).map((_, i) => (
                  <TableRow key={`skeleton-vehicle-${i}`} className="hover:bg-muted/20">
                    <TableCell className="pl-2 sm:pl-4 py-3">
                      <Skeleton className="h-10 w-14 rounded-md" />
                    </TableCell>
                    <TableCell className="py-3">
                      <div className="flex flex-col gap-1.5">
                        <Skeleton className="h-4 w-32" />
                        <div className="flex items-center gap-2">
                          <Skeleton className="h-3 w-16" />
                          <Skeleton className="h-4 w-12 rounded" />
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="hidden md:table-cell py-3">
                      <Skeleton className="h-5 w-24 rounded" />
                    </TableCell>
                    <TableCell className="hidden sm:table-cell py-3">
                      <div className="flex items-center gap-2">
                        <Skeleton className="h-6 w-6 rounded-full" />
                        <Skeleton className="h-4 w-24" />
                      </div>
                    </TableCell>
                    <TableCell className="hidden sm:table-cell py-3">
                      <Skeleton className="h-5 w-16" />
                    </TableCell>
                    <TableCell className="hidden md:table-cell py-3">
                      <div className="flex flex-col gap-1.5">
                        <Skeleton className="h-4 w-16" />
                        <Skeleton className="h-3 w-20" />
                      </div>
                    </TableCell>
                    <TableCell className="text-right pr-2 sm:pr-4 py-3">
                      <div className="flex justify-end gap-2">
                        <Skeleton className="h-8 w-8 rounded-sm" />
                        <Skeleton className="h-8 w-8 rounded-sm" />
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              ) : filteredAndSorted.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="h-32 text-center text-muted-foreground">
                    No vehicles found matching your criteria.
                  </TableCell>
                </TableRow>
              ) : (
                filteredAndSorted.map((v) => (
                  <TableRow key={v.id} className="hover:bg-muted/20">
                    <TableCell className="pl-2 sm:pl-4">
                      <div className="h-10 w-14 overflow-hidden rounded-md bg-muted flex items-center justify-center">
                        {v.picture?.cover ? (
                          <img 
                            src={getMediaUrl(v.picture.cover)} 
                            alt={v.name || "Vehicle"} 
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <Car className="h-5 w-5 text-muted-foreground/50" />
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="pl-2 sm:pl-4">
                      <div className="flex flex-col">
                        <span className="font-semibold text-foreground">
                          {v.name || `${v.general_info?.brand} ${v.general_info?.model}`}
                        </span>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="text-xs text-muted-foreground">
                            {v.general_info?.vehicle_class || 'Unknown Class'}
                          </span>
                          <span className="text-[10px] bg-primary/10 text-primary px-1.5 py-0.5 rounded font-medium truncate max-w-[120px]">
                            {v.price_templates?.template_name || 'demo'}
                          </span>
                        </div>
                        {/* Mobile info fallback */}
                        <div className="flex flex-wrap items-center gap-2 mt-1 sm:hidden">
                          <span className="text-[10px] font-mono bg-muted px-1 rounded">{v.general_info?.reg_number || 'N/A'}</span>
                          <span className="text-[10px] items-center flex gap-0.5">
                            <div className={cn("h-1.5 w-1.5 rounded-full", v.status === 2 ? "bg-green-500" : (v.status === 4 ? "bg-blue-500" : "bg-muted-foreground"))} />
                            {getStatusString(v.status)}
                          </span>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                      <Badge variant="outline" className="font-mono text-xs font-semibold tracking-wider">
                        {v.general_info?.reg_number || 'N/A'}
                      </Badge>
                    </TableCell>
                    <TableCell className="hidden sm:table-cell">
                      {v.owner ? (
                        <Link to={`/owners/${v.owner.id}`} className="text-sm font-medium hover:underline text-blue-600">
                          {v.owner.full_name || 'Owner Name'}
                        </Link>
                      ) : (
                        <span className="text-sm text-muted-foreground">No Owner</span>
                      )}
                    </TableCell>
                    <TableCell className="hidden sm:table-cell">
                      <Badge 
                        variant={getStatusVariant(v.status) as any}
                        className="rounded-md"
                      >
                        {getStatusString(v.status)}
                      </Badge>
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                      <div className="flex items-center gap-1 text-sm font-medium">
                        {Number(v.price || 0).toLocaleString()} 
                        <span className="text-[10px] uppercase text-muted-foreground border border-border/50 px-1 py-0.5 rounded ml-1">
                          {v.currency || "RUB"}/d
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="text-right pr-2 sm:pr-4">
                      <Button variant="ghost" size="sm" className="hidden sm:flex" asChild>
                        <Link to={`/vehicles/${v.id}`}>
                          <Eye className="h-4 w-4 mr-1.5" />
                          View
                        </Link>
                      </Button>
                      <Button variant="ghost" size="icon" className="sm:hidden h-8 w-8" asChild>
                        <Link to={`/vehicles/${v.id}`}>
                          <Eye className="h-4 w-4" />
                        </Link>
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
        {!loading && total > 0 && (
          <div className="px-6 py-4 border-t bg-muted/10 text-xs text-muted-foreground flex justify-between items-center">
            <span>Showing {vehicles.length} of {total} vehicles</span>
            <div className="flex gap-1 items-center">
              <span className="mr-2">Page {currentPage} of {totalPages}</span>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage <= 1}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage >= totalPages}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </Card>
    </div>
  )
}
