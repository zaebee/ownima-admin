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
  Loader2
} from "lucide-react"
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
  // Простой детерминированный выбор цвета
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
  const [roleFilter, setRoleFilter] = useState<"OWNER" | "RIDER">("OWNER")
  const [selectedIds, setSelectedIds] = useState<string[]>([])

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setIsLoading(true)
        setSelectedIds([]) // Очищаем выбор при переключении вкладки
        const endpoint = roleFilter === "OWNER" ? "/admin/users" : "/admin/riders"
        const response = await api.get(endpoint, {
          params: { limit: 50, skip: 0 }
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
  }, [roleFilter])

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

  return (
    <div className="flex flex-col gap-6 pb-24">
      {/* Top Bar */}
      <div className="flex items-center justify-between">
        <div className="text-sm text-muted-foreground flex items-center gap-2">
          {isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
          <span>Showing {users.length} of {total} {roleFilter.toLowerCase()}s</span>
        </div>
        <div className="flex items-center gap-1 text-sm bg-muted/50 p-1 rounded-lg">
          <button 
            onClick={() => setRoleFilter("OWNER")}
            className={cn(
              "flex items-center gap-1.5 px-3 py-1.5 rounded-md transition-all font-medium",
              roleFilter === "OWNER" ? "bg-background shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground"
            )}
          >
            <div className="h-2 w-2 rounded-full bg-blue-500"></div>
            <span>Owners</span>
          </button>
          <button 
            onClick={() => setRoleFilter("RIDER")}
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

      <Card className="overflow-hidden border-none shadow-sm min-h-[400px]">
        <CardContent className="p-0 relative">
          <Table>
            <TableHeader className="bg-muted/30">
              <TableRow>
                <TableHead className="w-12 text-center">
                  <Checkbox 
                    checked={selectedIds.length === users.length && users.length > 0}
                    onChange={toggleSelectAll}
                  />
                </TableHead>
                <TableHead className="text-xs font-semibold text-muted-foreground">USER</TableHead>
                <TableHead className="text-xs font-semibold text-muted-foreground">STATUS</TableHead>
                <TableHead className="text-xs font-semibold text-muted-foreground">METRICS</TableHead>
                <TableHead className="text-xs font-semibold text-muted-foreground">JOINED</TableHead>
                <TableHead className="text-right text-xs font-semibold text-muted-foreground">ACTIONS</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((user) => (
                <TableRow key={user.id} className="hover:bg-muted/20">
                  <TableCell className="text-center">
                    <Checkbox 
                      checked={selectedIds.includes(user.id)}
                      onChange={() => toggleSelect(user.id)}
                    />
                  </TableCell>
                  
                  {/* USER COLUMN */}
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar className="h-10 w-10">
                        {user.avatar && <AvatarImage src={getMediaUrl(user.avatar)} alt={user.full_name || ""} />}
                        <AvatarFallback className={`text-white ${getColor(user.id)}`}>
                          {getInitials(user.full_name, user.email)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex flex-col">
                        <span className="font-medium text-foreground max-w-[200px] truncate">
                          {user.full_name || "Unnamed"}
                        </span>
                        <span className="text-sm text-muted-foreground">{user.email}</span>
                        {user.phone_number && (
                          <div className="flex items-center gap-1 text-xs text-muted-foreground mt-0.5">
                            <Phone className="h-3 w-3" />
                            <span>{user.phone_number}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </TableCell>

                  {/* STATUS COLUMN */}
                  <TableCell>
                    <Badge 
                      variant={user.is_active ? "success" : "secondary"} 
                      className="rounded-md px-2 py-0.5 font-medium"
                    >
                      {user.is_active ? (
                        <CheckCircle2 className="mr-1.5 h-3 w-3" />
                      ) : (
                        <XCircle className="mr-1.5 h-3 w-3" />
                      )}
                      {user.is_active ? "Active" : "Inactive"}
                    </Badge>
                  </TableCell>

                  {/* METRICS COLUMN */}
                  <TableCell>
                    <div className="flex flex-col gap-1.5 text-sm">
                      {roleFilter === "OWNER" && (
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Car className="h-4 w-4" />
                          <span><strong className="text-foreground font-medium">{user.total_vehicles || 0}</strong> vehicles</span>
                        </div>
                      )}
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Calendar className="h-4 w-4" />
                        <span><strong className="text-foreground font-medium">{user.total_reservations || 0}</strong> reservations</span>
                      </div>
                    </div>
                  </TableCell>

                  {/* JOINED COLUMN */}
                  <TableCell>
                    <span className="text-sm text-muted-foreground">
                      {user.created_at ? formatDate(user.created_at) : "Unknown"}
                    </span>
                  </TableCell>

                  {/* ACTIONS COLUMN */}
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground" asChild>
                        <Link to={`/${roleFilter.toLowerCase()}s/${user.id}`}>
                          <User className="h-4 w-4" />
                        </Link>
                      </Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-blue-600">
                        <Edit2 className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-red-600">
                        <Trash2 className="h-4 w-4" />
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
