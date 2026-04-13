import { useState } from "react"
import { Link } from "react-router-dom"
import { Card, CardContent } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { 
  Phone, 
  Calendar, 
  LogOut, 
  BookOpen, 
  Car, 
  User, 
  Edit2, 
  Trash2, 
  CheckCircle2, 
  XCircle,
  X
} from "lucide-react"

const mockOwners = [
  { 
    id: "1", 
    name: "vvdsvsd svvsdvdssvd", 
    email: "titan-thai@yandex.ru", 
    phone: "29939393993933",
    role: "Owner", 
    status: "Active", 
    joined: "Apr 13, 2026",
    lastLogin: "Never",
    logins: 0,
    reservations: 0,
    vehicles: 0,
    initials: "V",
    color: "bg-blue-600"
  },
  { 
    id: "2", 
    name: "RUS IVAN", 
    email: "risoviyamlet@mail.ru", 
    phone: "0836832965",
    role: "Owner", 
    status: "Active", 
    joined: "Apr 7, 2026",
    lastLogin: "Never",
    logins: 0,
    reservations: 0,
    vehicles: 1,
    initials: "R",
    color: "bg-indigo-600"
  },
  { 
    id: "3", 
    name: "soto903226277", 
    email: "soto903226277@gmail.com", 
    phone: "",
    role: "Owner", 
    status: "Active", 
    joined: "Apr 7, 2026",
    lastLogin: "Never",
    logins: 0,
    reservations: 0,
    vehicles: 1,
    initials: "S",
    color: "bg-purple-600"
  },
  { 
    id: "4", 
    name: "Andrei Gromov", 
    email: "andrei@example.com", 
    phone: "1234567890",
    role: "Owner", 
    status: "Inactive", 
    joined: "Apr 3, 2026",
    lastLogin: "Apr 11, 2026 11:26",
    logins: 5,
    reservations: 2,
    vehicles: 3,
    initials: "A",
    color: "bg-teal-600"
  }
]

export function UsersPage() {
  const [selectedIds, setSelectedIds] = useState<string[]>([])

  const toggleSelectAll = () => {
    if (selectedIds.length === mockOwners.length) {
      setSelectedIds([])
    } else {
      setSelectedIds(mockOwners.map(o => o.id))
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
        <div className="text-sm text-muted-foreground">
          Showing {mockOwners.length} of 75 users
        </div>
        <div className="flex items-center gap-4 text-sm">
          <div className="flex items-center gap-1.5">
            <div className="h-3 w-3 rounded-full bg-blue-500"></div>
            <span>Owners: 20</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="h-3 w-3 rounded-full bg-green-500"></div>
            <span>Riders: 0</span>
          </div>
        </div>
      </div>

      <Card className="overflow-hidden border-none shadow-sm">
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-muted/30">
              <TableRow>
                <TableHead className="w-12 text-center">
                  <Checkbox 
                    checked={selectedIds.length === mockOwners.length && mockOwners.length > 0}
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
              {mockOwners.map((owner) => (
                <TableRow key={owner.id} className="hover:bg-muted/20">
                  <TableCell className="text-center">
                    <Checkbox 
                      checked={selectedIds.includes(owner.id)}
                      onChange={() => toggleSelect(owner.id)}
                    />
                  </TableCell>
                  
                  {/* USER COLUMN */}
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar className="h-10 w-10">
                        <AvatarFallback className={`text-white ${owner.color}`}>
                          {owner.initials}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex flex-col">
                        <span className="font-medium text-foreground">{owner.name}</span>
                        <span className="text-sm text-muted-foreground">{owner.email}</span>
                        {owner.phone && (
                          <div className="flex items-center gap-1 text-xs text-muted-foreground mt-0.5">
                            <Phone className="h-3 w-3" />
                            <span>{owner.phone}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </TableCell>

                  {/* STATUS COLUMN */}
                  <TableCell>
                    <Badge 
                      variant={owner.status === "Active" ? "success" : "secondary"} 
                      className="rounded-md px-2 py-0.5 font-medium"
                    >
                      {owner.status === "Active" ? (
                        <CheckCircle2 className="mr-1.5 h-3 w-3" />
                      ) : (
                        <XCircle className="mr-1.5 h-3 w-3" />
                      )}
                      {owner.status}
                    </Badge>
                  </TableCell>

                  {/* METRICS COLUMN */}
                  <TableCell>
                    <div className="flex flex-col gap-1.5 text-sm">
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Car className="h-4 w-4" />
                        <span><strong className="text-foreground font-medium">{owner.vehicles}</strong> vehicles</span>
                      </div>
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Calendar className="h-4 w-4" />
                        <span><strong className="text-foreground font-medium">{owner.reservations}</strong> reservations</span>
                      </div>
                    </div>
                  </TableCell>

                  {/* JOINED COLUMN */}
                  <TableCell>
                    <span className="text-sm text-muted-foreground">{owner.joined}</span>
                  </TableCell>

                  {/* ACTIONS COLUMN */}
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground" asChild>
                        <Link to={`/owners/${owner.id}`}>
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
            Select all {mockOwners.length}
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
          
          <Button variant="outline" size="sm" className="rounded-full border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700">
            <Trash2 className="mr-2 h-4 w-4" /> 
            Delete {selectedIds.length}
          </Button>
        </div>
      )}
    </div>
  )
}
