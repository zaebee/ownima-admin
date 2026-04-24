import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Search, MoreHorizontal } from "lucide-react"

const mockReservations = [
  { id: "RES-101", vehicle: "Tesla Model 3", rider: "Alice Williams", owner: "John Doe", status: "Confirmed", dates: "Nov 15 - Nov 18", total: 360 },
  { id: "RES-102", vehicle: "Ford F-150", rider: "Charlie Brown", owner: "Jane Smith", status: "Active", dates: "Nov 10 - Nov 20", total: 1500 },
  { id: "RES-103", vehicle: "Honda Civic", rider: "Eve Davis", owner: "Bob Johnson", status: "Cancelled", dates: "Nov 01 - Nov 05", total: 320 },
]

export function ReservationsPage() {
  const [search, setSearch] = useState("")

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
            <TableHeader>
              <TableRow>
                <TableHead className="hidden sm:table-cell">ID</TableHead>
                <TableHead>Vehicle</TableHead>
                <TableHead>Rider</TableHead>
                <TableHead className="hidden md:table-cell">Status</TableHead>
                <TableHead className="hidden sm:table-cell">Dates</TableHead>
                <TableHead className="hidden sm:table-cell">Total</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {mockReservations.map((res) => (
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
