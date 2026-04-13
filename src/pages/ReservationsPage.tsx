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
                <TableHead>ID</TableHead>
                <TableHead>Vehicle</TableHead>
                <TableHead>Rider</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Dates</TableHead>
                <TableHead>Total</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {mockReservations.map((res) => (
                <TableRow key={res.id}>
                  <TableCell className="font-medium">{res.id}</TableCell>
                  <TableCell>{res.vehicle}</TableCell>
                  <TableCell>{res.rider}</TableCell>
                  <TableCell>
                    <Badge variant={
                      res.status === "Confirmed" ? "success" : 
                      res.status === "Active" ? "default" : "destructive"
                    }>
                      {res.status}
                    </Badge>
                  </TableCell>
                  <TableCell>{res.dates}</TableCell>
                  <TableCell>${res.total}</TableCell>
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
