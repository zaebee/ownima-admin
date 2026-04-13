import { useState } from "react"
import { Link } from "react-router-dom"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Search, MoreHorizontal } from "lucide-react"

const mockOwners = [
  { id: "1", name: "John Doe", email: "john@example.com", status: "Active", vehicles: 12, rating: 4.8 },
  { id: "2", name: "Jane Smith", email: "jane@example.com", status: "Active", vehicles: 5, rating: 4.9 },
  { id: "3", name: "Bob Johnson", email: "bob@example.com", status: "Inactive", vehicles: 0, rating: 3.5 },
]

export function UsersPage() {
  const [search, setSearch] = useState("")

  return (
    <div className="flex flex-col gap-8">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Owners</h2>
        <Button>Add Owner</Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Manage Owners</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center py-4">
            <div className="relative w-72">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search owners..."
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
                <TableHead>Vehicles</TableHead>
                <TableHead>Rating</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {mockOwners.map((owner) => (
                <TableRow key={owner.id}>
                  <TableCell className="font-medium">
                    <Link to={`/owners/${owner.id}`} className="hover:underline text-primary">
                      {owner.name}
                    </Link>
                  </TableCell>
                  <TableCell>{owner.email}</TableCell>
                  <TableCell>
                    <Badge variant={owner.status === "Active" ? "success" : "secondary"}>
                      {owner.status}
                    </Badge>
                  </TableCell>
                  <TableCell>{owner.vehicles}</TableCell>
                  <TableCell>{owner.rating}</TableCell>
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
