import { useState, useEffect, useMemo } from "react"
import { Link } from "react-router-dom"
import { Card, CardContent } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Skeleton } from "@/components/ui/skeleton"
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
  Search,
  Copy,
  Check,
  ArrowUpDown,
  ArrowDown,
  ArrowUp
} from "lucide-react"
import { Input } from "@/components/ui/input"
import { PaginationControls } from "@/components/ui/pagination-controls"
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

const InlineCopy = ({ text, title }: { text: string, title: string }) => {
  const [copied, setCopied] = useState(false)
  
  const handleCopy = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }
  
  return (
    <button 
      onClick={handleCopy} 
      className="p-1 rounded-md text-muted-foreground/30 hover:text-foreground hover:bg-muted transition-all opacity-0 group-hover:opacity-100"
      title={title}
    >
      {copied ? <Check className="h-3 w-3 text-green-500" /> : <Copy className="h-3 w-3" />}
    </button>
  )
}

const ActionCopyID = ({ id }: { id: string }) => {
  const [copied, setCopied] = useState(false)
  
  return (
    <Button 
      variant="ghost" 
      size="icon" 
      className="h-7 w-7 text-muted-foreground hover:text-foreground" 
      title="Copy Database ID"
      onClick={(e) => {
        e.preventDefault()
        e.stopPropagation()
        navigator.clipboard.writeText(id)
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
      }}
    >
      {copied ? <Check className="h-3.5 w-3.5 text-green-500" /> : <Copy className="h-3.5 w-3.5" />}
    </Button>
  )
}

export function UsersPage() {
  const [allUsers, setAllUsers] = useState<AdminUser[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isExporting, setIsExporting] = useState(false)
  const [roleFilter, setRoleFilter] = useState<"OWNER" | "RIDER">("OWNER")
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [page, setPage] = useState(1)
  const [sortBy, setSortBy] = useState("created_at_desc")
  const [searchQuery, setSearchQuery] = useState("")
  const limit = 20

  useEffect(() => {
    const fetchAllUsers = async () => {
      try {
        setIsLoading(true)
        setSelectedIds([]) 
        setPage(1)
        const endpoint = roleFilter === "OWNER" ? "/admin/users" : "/admin/riders"
        
        // Client-side fetching of all users for sorting/searching MVP
        let fetchedData: AdminUser[] = []
        let currentSkip = 0
        const fetchLimit = 1000
        let hasMore = true
        let loopCount = 0

        while (hasMore && loopCount < 10) { // Max 10k users limit for safety
          const response = await api.get(endpoint, {
            params: { limit: fetchLimit, skip: currentSkip }
          })
          const chunk = response.data.data || []
          fetchedData = [...fetchedData, ...chunk]
          
          if (chunk.length < fetchLimit) {
            hasMore = false
          } else {
            currentSkip += fetchLimit
            loopCount++
          }
        }
        
        setAllUsers(fetchedData)
      } catch (error) {
        console.error("Failed to fetch users:", error)
      } finally {
        setIsLoading(false)
      }
    }
    
    fetchAllUsers()
  }, [roleFilter])

  const filteredAndSorted = useMemo(() => {
    let result = [...allUsers]

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim()
      result = result.filter(u => 
        (u.full_name && u.full_name.toLowerCase().includes(q)) ||
        (u.email && u.email.toLowerCase().includes(q)) ||
        (u.phone_number && u.phone_number.includes(q))
      )
    }

    result.sort((a, b) => {
      const isDesc = sortBy.endsWith('_desc')
      const key = sortBy.replace(/_desc$|_asc$/, '')
      let comp = 0
      
      if (key === 'created_at') comp = new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
      else if (key === 'last_login_at') comp = (a.last_login_at ? new Date(a.last_login_at).getTime() : 0) - (b.last_login_at ? new Date(b.last_login_at).getTime() : 0)
      else if (key === 'total_vehicles') comp = (a.total_vehicles || 0) - (b.total_vehicles || 0)
      else if (key === 'total_reservations') comp = (a.total_reservations || 0) - (b.total_reservations || 0)
      else if (key === 'login_count') comp = (a.login_count || 0) - (b.login_count || 0)
      else if (key === 'email') comp = String(a.email || '').localeCompare(String(b.email || ''))
      
      return isDesc ? -comp : comp
    })

    return result
  }, [allUsers, searchQuery, sortBy])

  const displayedUsers = filteredAndSorted.slice((page - 1) * limit, page * limit)
  const total = filteredAndSorted.length

  useEffect(() => {
    setPage(1)
  }, [sortBy, searchQuery])

  const handleRoleChange = (role: "OWNER" | "RIDER") => {
    setRoleFilter(role)
    setPage(1)
    if (role === "RIDER" && sortBy.includes("vehicles")) {
      setSortBy("created_at_desc")
    }
  }

  const toggleSelectAll = () => {
    if (selectedIds.length === displayedUsers.length) {
      setSelectedIds([])
    } else {
      setSelectedIds(displayedUsers.map(o => o.id))
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
      
      if (filteredAndSorted.length === 0) return

      const isOwner = roleFilter === "OWNER"
      const headers = isOwner
        ? ["Internal ID", "Full Name", "Email", "Phone", "Is Active", "Joined Date", "Total Vehicles", "Total Reservations", "Login Count", "Last Login"]
        : ["Internal ID", "Full Name", "Email", "Phone", "Is Active", "Joined Date", "Total Reservations", "Login Count", "Last Login"]

      const csvContent = [
        headers.join(","),
        ...filteredAndSorted.map(u => {
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
    <div className="flex flex-col gap-6 pb-24">
      <Card className="overflow-hidden border-none shadow-sm min-h-[400px]">
        <div className="px-6 py-4 border-b flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-muted/20">
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
            <div className="text-sm text-muted-foreground flex items-center gap-2 min-w-[150px]">
              <span>Showing {displayedUsers.length} of {total} {roleFilter.toLowerCase()}s</span>
            </div>
            <div className="relative w-full max-w-sm sm:w-64">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input 
                type="search" 
                placeholder="Search by name or email..." 
                className="pl-9 bg-background"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
          <div className="flex items-center gap-3 self-end sm:self-auto">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={exportCSV} 
              disabled={isExporting || displayedUsers.length === 0}
              className="flex items-center gap-2 h-9"
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
        <CardContent className="p-0 relative">
          <Table className="text-sm">
            <TableHeader className="bg-muted/30">
              <TableRow className="border-b">
                <TableHead className="w-[40px] sm:w-[60px] pl-2 sm:pl-4">
                  <Checkbox 
                    checked={selectedIds.length === displayedUsers.length && displayedUsers.length > 0}
                    onChange={toggleSelectAll}
                  />
                </TableHead>
                <SortableHead label="USER" sortKey="email" />
                <TableHead className="hidden md:table-cell text-[11px] select-none uppercase tracking-wider font-semibold text-muted-foreground h-10">STATUS</TableHead>
                {roleFilter === "OWNER" && <SortableHead label="VEHICLES" sortKey="total_vehicles" className="hidden lg:table-cell" />}
                <SortableHead label="RESERVATIONS" sortKey="total_reservations" className="hidden sm:table-cell" />
                <SortableHead label="LOGINS" sortKey="login_count" className="hidden lg:table-cell" />
                <SortableHead label="JOINED" sortKey="created_at" className="hidden xl:table-cell" />
                <SortableHead label="LAST LOGIN" sortKey="last_login_at" className="hidden md:table-cell" />
                <TableHead className="text-right text-[11px] select-none uppercase tracking-wider font-semibold text-muted-foreground h-10">ACTIONS</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                Array.from({ length: 15 }).map((_, i) => (
                  <TableRow key={`skeleton-user-${i}`} className="border-b border-muted/50">
                    <TableCell className="pl-2 sm:pl-4 py-3"><Skeleton className="h-4 w-4 rounded" /></TableCell>
                    <TableCell className="py-3">
                      <div className="flex items-center gap-3">
                        <Skeleton className="h-9 w-9 rounded-full" />
                        <div className="flex flex-col gap-1.5">
                          <Skeleton className="h-4 w-32" />
                          <Skeleton className="h-3 w-40" />
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="py-3 hidden md:table-cell">
                      <div className="flex items-center gap-1.5">
                        <Skeleton className="h-2 w-2 rounded-full" />
                        <Skeleton className="h-3 w-12" />
                      </div>
                    </TableCell>
                    {roleFilter === "OWNER" && <TableCell className="py-3 hidden lg:table-cell"><Skeleton className="h-4 w-6" /></TableCell>}
                    <TableCell className="py-3 hidden sm:table-cell"><Skeleton className="h-4 w-6" /></TableCell>
                    <TableCell className="py-3 hidden lg:table-cell"><Skeleton className="h-4 w-6" /></TableCell>
                    <TableCell className="py-3 hidden xl:table-cell"><Skeleton className="h-4 w-20" /></TableCell>
                    <TableCell className="py-3 hidden md:table-cell">
                      <div className="flex flex-col gap-1.5">
                        <Skeleton className="h-4 w-20" />
                        <Skeleton className="h-3 w-12" />
                      </div>
                    </TableCell>
                    <TableCell className="py-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Skeleton className="h-7 w-7 rounded-sm" />
                        <Skeleton className="h-7 w-7 rounded-sm" />
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              ) : displayedUsers.map((user) => (
                <TableRow key={user.id} className="hover:bg-muted/10 border-b border-muted/50">
                  <TableCell className="pl-2 sm:pl-4 py-2">
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
                        <div className="flex flex-wrap items-center mt-0.5 -ml-1">
                          <div className="flex items-center pl-1 rounded">
                            <span className="text-xs text-muted-foreground leading-none">{user.email}</span>
                            <InlineCopy text={user.email} title="Copy Email" />
                          </div>
                          {user.phone_number && (
                            <>
                              <span className="text-muted-foreground/30 text-[10px] mx-1">•</span>
                              <div className="flex items-center gap-0.5 pl-1 rounded">
                                <span className="text-[10px] bg-muted/50 text-muted-foreground px-1.5 py-0.5 rounded-sm font-mono tracking-tight leading-none group-hover:bg-primary/5 transition-colors">
                                  {user.phone_number}
                                </span>
                                <InlineCopy text={user.phone_number} title="Copy Phone Number" />
                              </div>
                            </>
                          )}
                        </div>
                      </div>
                    </Link>
                  </TableCell>

                  {/* STATUS COLUMN */}
                  <TableCell className="py-2 hidden md:table-cell">
                    <div className="flex items-center gap-1.5">
                      <div className={cn("h-2 w-2 rounded-full", user.is_active ? "bg-green-500" : "bg-muted-foreground")} />
                      <span className="text-xs font-medium text-muted-foreground">
                        {user.is_active ? "Active" : "Inactive"}
                      </span>
                    </div>
                  </TableCell>

                  {/* VEHICLES COLUMN */}
                  {roleFilter === "OWNER" && (
                    <TableCell className="py-2 hidden lg:table-cell">
                       <span className="font-medium text-foreground text-xs">{user.total_vehicles || 0}</span>
                    </TableCell>
                  )}

                  {/* RESERVATIONS COLUMN */}
                  <TableCell className="py-2 hidden sm:table-cell">
                    <span className="font-medium text-foreground text-xs">{user.total_reservations || 0}</span>
                  </TableCell>

                  {/* LOGINS COLUMN */}
                  <TableCell className="py-2 hidden lg:table-cell">
                    <span className="font-medium text-blue-600 text-xs">{user.login_count || 0}</span>
                  </TableCell>

                  {/* JOINED COLUMN */}
                  <TableCell className="py-2 hidden xl:table-cell">
                    <span className="text-xs text-muted-foreground whitespace-nowrap">
                      {user.created_at ? formatDate(user.created_at) : "Unknown"}
                    </span>
                  </TableCell>

                  {/* LAST LOGIN COLUMN */}
                  <TableCell className="py-2 hidden md:table-cell">
                    <div className="flex flex-col">
                      <span className="text-xs font-medium text-foreground whitespace-nowrap">
                        {user.last_login_at ? formatDate(user.last_login_at) : "Never"}
                      </span>
                      {user.last_login_at && (
                        <span className="text-[10px] text-muted-foreground whitespace-nowrap mt-0.5">
                          {new Date(user.last_login_at).toLocaleTimeString("en-US", { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      )}
                    </div>
                  </TableCell>

                  {/* ACTIONS COLUMN */}
                  <TableCell className="text-right py-2">
                    <div className="flex items-center justify-end gap-1">
                      <ActionCopyID id={user.id} />
                      <Button variant="outline" size="icon" className="h-7 w-7 text-muted-foreground hover:text-foreground bg-muted/30" title="View Profile" asChild>
                        <Link to={`/${roleFilter.toLowerCase()}s/${user.id}`}>
                          <User className="h-3.5 w-3.5" />
                        </Link>
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              
              {displayedUsers.length === 0 && !isLoading && (
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
          <PaginationControls
            currentPage={page}
            totalPages={Math.ceil(total / limit) || 1}
            totalItems={total}
            currentItemsCount={displayedUsers.length}
            onPageChange={setPage}
            disabled={isLoading}
          />
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
