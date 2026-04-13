import { useState } from "react"
import { Link } from "react-router-dom"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Search, MoreHorizontal } from "lucide-react"

const mockRiders = [
  { id: "1", name: "Alice Williams", email: "alice@example.com", status: "Active", bookings: 3, rating: 4.9 },
  { id: "2", name: "Charlie Brown", email: "charlie@example.com", status: "Active", bookings: 1, rating: 4.5 },
  { id: "3", name: "Eve Davis", email: "eve@example.com", status: "Inactive", bookings: 0, rating: 0 },
]

export function RidersPage() {
  const [search, setSearch] = useState("")

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
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Bookings</TableHead>
                <TableHead>Rating</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {mockRiders.map((rider) => (
                <TableRow key={rider.id}>
                  <TableCell className="font-medium">
                    <Link to={`/riders/${rider.id}`} className="hover:underline text-primary">
                      {rider.name}
                    </Link>
                  </TableCell>
                  <TableCell>{rider.email}</TableCell>
                  <TableCell>
                    <Badge variant={rider.status === "Active" ? "success" : "secondary"}>
                      {rider.status}
                    </Badge>
                  </TableCell>
                  <TableCell>{rider.bookings}</TableCell>
                  <TableCell>{rider.rating}</TableCell>
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
