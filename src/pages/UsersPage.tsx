import { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import { Card, CardContent } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { 
  Phone, 
  Calendar, 
  Car, 
  User, 
  Edit2, 
  Trash2, 
  CheckCircle2, 
  XCircle,
  X,
  Loader2,
  Download,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Search
} from "lucide-react"
import { Input } from "@/components/ui/input"
import { api } from "@/lib/api"
import { cn, getMediaUrl } from "@/lib/utils"

interface AdminUser {
  id: string
  full_name: string | null
  email: string
  phone_number: string | null
  role: string
  is_active: boolean
  created_at: string
  last_login_at: string | null
  login_count: number
  total_reservations: number
  total_vehicles: number
  avatar: string | null
}

const colors = ["bg-blue-600", "bg-indigo-600", "bg-purple-600", "bg-teal-600", "bg-rose-600", "bg-orange-600"]

const getInitials = (name: string | null, email: string) => {
  if (name) {
    return name.slice(0, 2).toUpperCase()
  }
  return email.slice(0, 2).toUpperCase()
}

const getColor = (id: string) => {
  const index = id.charCodeAt(0) % colors.length
  return colors[index]
}

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric"
  })
}

export function UsersPage() {
  const [users, setUsers] = useState<AdminUser[]>([])
  const [total, setTotal] = useState(0)
  const [isLoading, setIsLoading] = useState(false)
  const [isExporting, setIsExporting] = useState(false)
  const [roleFilter, setRoleFilter] = useState<"OWNER" | "RIDER">("OWNER")
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [page, setPage] = useState(1)
  const limit = 20

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setIsLoading(true)
        setSelectedIds([]) 
        const endpoint = roleFilter === "OWNER" ? "/admin/users" : "/admin/riders"
        const skip = (page - 1) * limit
        const response = await api.get(endpoint, {
          params: { limit, skip }
        })
        
        setUsers(response.data.data || [])
        setTotal(response.data.count || 0)
      } catch (error) {
        console.error("Failed to fetch users:", error)
      } finally {
        setIsLoading(false)
      }
    }
    
    fetchUsers()
  }, [roleFilter, page])

  const handleRoleChange = (role: "OWNER" | "RIDER") => {
    setRoleFilter(role)
    setPage(1)
  }

  const toggleSelectAll = () => {
    if (selectedIds.length === users.length) {
      setSelectedIds([])
    } else {
      setSelectedIds(users.map(o => o.id))
    }
  }

  const toggleSelect = (id: string) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter(i => i !== id))
    } else {
      setSelectedIds([...selectedIds, id])
    }
  }

  const exportCSV = async () => {
    try {
      setIsExporting(true)
      const endpoint = roleFilter === "OWNER" ? "/admin/users" : "/admin/riders"
      
      // Fetch results in chunks as backend limits max limit to 1000
      let allUsers: AdminUser[] = []
      let currentSkip = 0
      const fetchLimit = 1000
      let hasMore = true

      while (hasMore) {
        const response = await api.get(endpoint, { params: { limit: fetchLimit, skip: currentSkip } })
        const fetchedUsers = response.data.data || []
        allUsers = [...allUsers, ...fetchedUsers]
        
        if (fetchedUsers.length < fetchLimit) {
          hasMore = false
        } else {
          currentSkip += fetchLimit
        }
      }

      if (allUsers.length === 0) return

      const isOwner = roleFilter === "OWNER"
      const headers = isOwner
        ? ["Internal ID", "Full Name", "Email", "Phone", "Is Active", "Joined Date", "Total Vehicles", "Total Reservations", "Login Count", "Last Login"]
        : ["Internal ID", "Full Name", "Email", "Phone", "Is Active", "Joined Date", "Total Reservations", "Login Count", "Last Login"]

      const csvContent = [
        headers.join(","),
        ...allUsers.map(u => {
          const row: string[] = [
            `"${(u.id || '').replace(/"/g, '""')}"`,
            `"${(u.full_name || '').replace(/"/g, '""')}"`,
            `"${(u.email || '').replace(/"/g, '""')}"`,
            `"${(u.phone_number || '').replace(/"/g, '""')}"`,
            u.is_active ? "TRUE" : "FALSE",
            `"${u.created_at ? new Date(u.created_at).toISOString() : ''}"`
          ]
          
          if (isOwner) {
            row.push(String(u.total_vehicles || 0))
          }
          
          row.push(String(u.total_reservations || 0))
          row.push(String(u.login_count || 0))
          row.push(`"${u.last_login_at ? new Date(u.last_login_at).toISOString() : ''}"`)
          
          return row.join(",")
        })
      ].join("\n")

      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
      const url = URL.createObjectURL(blob)
      const link = document.createElement("a")
      link.setAttribute("href", url)
      link.setAttribute("download", `${roleFilter.toLowerCase()}s_export_${new Date().toISOString().split('T')[0]}.csv`)
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    } catch (error) {
      console.error("Failed to export users:", error)
    } finally {
      setIsExporting(false)
    }
  }

  return (
    <div className="flex flex-col gap-6 pb-24">
      {/* Top Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
          <div className="text-sm text-muted-foreground flex items-center gap-2 min-w-[200px]">
            {isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
            <span>Showing {users.length} of {total} {roleFilter.toLowerCase()}s</span>
          </div>
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input 
              type="text" 
              placeholder="Search by name or email..." 
              className="pl-9 h-9 w-full bg-background/50"
            />
          </div>
        </div>
        <div className="flex items-center gap-3 self-end sm:self-auto">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={exportCSV} 
            disabled={isExporting || users.length === 0}
            className="flex items-center gap-2"
          >
            {isExporting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
            Export CSV
          </Button>
          <div className="h-4 w-px bg-border hidden sm:block"></div>
          <div className="flex items-center gap-1 text-sm bg-muted/50 p-1 rounded-lg">
            <button 
              onClick={() => handleRoleChange("OWNER")}
              className={cn(
                "flex items-center gap-1.5 px-3 py-1.5 rounded-md transition-all font-medium",
                roleFilter === "OWNER" ? "bg-background shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground"
              )}
            >
              <div className="h-2 w-2 rounded-full bg-blue-500"></div>
              <span>Owners</span>
            </button>
            <button 
              onClick={() => handleRoleChange("RIDER")}
              className={cn(
                "flex items-center gap-1.5 px-3 py-1.5 rounded-md transition-all font-medium",
                roleFilter === "RIDER" ? "bg-background shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground"
              )}
            >
              <div className="h-2 w-2 rounded-full bg-green-500"></div>
              <span>Riders</span>
            </button>
          </div>
        </div>
      </div>

      <Card className="overflow-hidden border-none shadow-sm min-h-[400px]">
        <CardContent className="p-0 relative">
          <Table className="text-sm">
            <TableHeader className="bg-muted/30">
              <TableRow className="border-b">
                <TableHead className="w-12 text-center h-10 px-0">
                  <Checkbox 
                    checked={selectedIds.length === users.length && users.length > 0}
                    onChange={toggleSelectAll}
                  />
                </TableHead>
                <TableHead className="text-xs font-semibold text-muted-foreground h-10">USER</TableHead>
                <TableHead className="text-xs font-semibold text-muted-foreground h-10">STATUS</TableHead>
                <TableHead className="text-xs font-semibold text-muted-foreground h-10">METRICS</TableHead>
                <TableHead className="text-xs font-semibold text-muted-foreground h-10">JOINED</TableHead>
                <TableHead className="text-right text-xs font-semibold text-muted-foreground h-10">ACTIONS</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((user) => (
                <TableRow key={user.id} className="hover:bg-muted/10 border-b border-muted/50">
                  <TableCell className="text-center px-0 py-2">
                    <Checkbox 
                      checked={selectedIds.includes(user.id)}
                      onChange={() => toggleSelect(user.id)}
                    />
                  </TableCell>
                  
                  {/* USER COLUMN */}
                  <TableCell className="py-2">
                    <Link to={`/${roleFilter.toLowerCase()}s/${user.id}`} className="group flex items-center gap-3">
                      <Avatar className="h-9 w-9 border border-border group-hover:border-primary/50 transition-colors">
                        {user.avatar && <AvatarImage src={getMediaUrl(user.avatar)} alt={user.full_name || ""} />}
                        <AvatarFallback className={`text-white text-xs ${getColor(user.id)}`}>
                          {getInitials(user.full_name, user.email)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex flex-col">
                        <span className="font-semibold text-foreground max-w-[200px] truncate leading-tight group-hover:text-primary group-hover:underline transition-colors">
                          {user.full_name || "Unnamed"}
                        </span>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="text-xs text-muted-foreground leading-none">{user.email}</span>
                          {user.phone_number && (
                            <>
                              <span className="text-muted-foreground/30 text-[10px]">•</span>
                              <span className="text-[10px] bg-muted/50 text-muted-foreground px-1.5 py-0.5 rounded-sm font-mono tracking-tight leading-none group-hover:bg-primary/5 transition-colors">
                                {user.phone_number}
                              </span>
                            </>
                          )}
                        </div>
                      </div>
                    </Link>
                  </TableCell>

                  {/* STATUS COLUMN */}
                  <TableCell className="py-2">
                    <div className="flex items-center gap-1.5">
                      <div className={cn("h-2 w-2 rounded-full", user.is_active ? "bg-green-500" : "bg-muted-foreground")} />
                      <span className="text-xs font-medium text-muted-foreground">
                        {user.is_active ? "Active" : "Inactive"}
                      </span>
                    </div>
                  </TableCell>

                  {/* METRICS COLUMN */}
                  <TableCell className="py-2">
                    <div className="flex flex-wrap gap-4 text-xs">
                      {roleFilter === "OWNER" && (
                        <div className="flex flex-col text-muted-foreground">
                          <span className="font-medium text-foreground">{user.total_vehicles || 0}</span>
                          <span className="text-[10px] uppercase tracking-wider">Veh</span>
                        </div>
                      )}
                      <div className="flex flex-col text-muted-foreground">
                        <span className="font-medium text-foreground">{user.total_reservations || 0}</span>
                        <span className="text-[10px] uppercase tracking-wider">Res</span>
                      </div>
                      <div className="flex flex-col text-muted-foreground">
                        <span className="font-medium text-blue-600">{user.login_count || 0}</span>
                        <span className="text-[10px] uppercase tracking-wider">Logins</span>
                      </div>
                    </div>
                  </TableCell>

                  {/* JOINED COLUMN */}
                  <TableCell className="py-2">
                    <span className="text-xs text-muted-foreground whitespace-nowrap">
                      {user.created_at ? formatDate(user.created_at) : "Unknown"}
                    </span>
                  </TableCell>

                  {/* ACTIONS COLUMN */}
                  <TableCell className="text-right py-2">
                    <div className="flex items-center justify-end gap-0.5">
                      <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-foreground" asChild>
                        <Link to={`/${roleFilter.toLowerCase()}s/${user.id}`}>
                          <User className="h-3.5 w-3.5" />
                        </Link>
                      </Button>
                      <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-blue-600">
                        <Edit2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              
              {users.length === 0 && !isLoading && (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-10 text-muted-foreground">
                    No {roleFilter.toLowerCase()}s found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
        {total > 0 && (
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
                disabled={page === 1 || isLoading}
              >
                <ChevronsLeft className="h-3 w-3" />
              </Button>
              <Button 
                variant="outline" 
                size="icon" 
                className="h-7 w-7" 
                onClick={() => setPage(p => Math.max(1, p - 1))} 
                disabled={page === 1 || isLoading}
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
                disabled={page >= Math.ceil(total / limit) || isLoading}
              >
                <ChevronRight className="h-3 w-3" />
              </Button>
              <Button 
                variant="outline" 
                size="icon" 
                className="h-7 w-7" 
                onClick={() => setPage(Math.ceil(total / limit))} 
                disabled={page >= Math.ceil(total / limit) || isLoading}
              >
                <ChevronsRight className="h-3 w-3" />
              </Button>
            </div>
          </div>
        )}
      </Card>

      {/* Floating Bulk Actions Bar */}
      {selectedIds.length > 0 && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-background border shadow-xl rounded-full px-4 py-3 flex items-center gap-4 z-50 animate-in slide-in-from-bottom-10">
          <div className="flex items-center gap-2 px-2">
            <CheckCircle2 className="h-5 w-5 text-primary" />
            <span className="font-semibold text-sm">{selectedIds.length} selected</span>
          </div>
          
          <Button variant="ghost" size="sm" onClick={toggleSelectAll} className="text-blue-600 hover:text-blue-700">
            Select all
          </Button>
          
          <Button variant="ghost" size="sm" onClick={() => setSelectedIds([])} className="text-muted-foreground">
            <X className="mr-1.5 h-4 w-4" />
            Clear
          </Button>
          
          <div className="h-6 w-px bg-border mx-2"></div>
          
          <Button variant="outline" size="sm" className="rounded-full">
            <CheckCircle2 className="mr-2 h-4 w-4 text-green-600" /> 
            Activate
          </Button>
          
          <Button variant="outline" size="sm" className="rounded-full">
            <XCircle className="mr-2 h-4 w-4 text-muted-foreground" /> 
            Deactivate
          </Button>
        </div>
      )}
    </div>
  )
}
