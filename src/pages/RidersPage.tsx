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
                <TableHead className="hidden sm:table-cell">Email</TableHead>
                <TableHead className="hidden md:table-cell">Status</TableHead>
                <TableHead className="hidden sm:table-cell">Bookings</TableHead>
                <TableHead className="hidden sm:table-cell">Rating</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {mockRiders.map((rider) => (
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
