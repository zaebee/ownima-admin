import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Search, MoreHorizontal } from "lucide-react"

const mockVehicles = [
  { id: "1", name: "Tesla Model 3", owner: "John Doe", status: "Available", type: "Car", price: 120 },
  { id: "2", name: "Ford F-150", owner: "Jane Smith", status: "Rented", type: "Truck", price: 150 },
  { id: "3", name: "Honda Civic", owner: "Bob Johnson", status: "Maintenance", type: "Car", price: 80 },
]

export function VehiclesPage() {
  const [search, setSearch] = useState("")

  return (
    <div className="flex flex-col gap-8">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Vehicles</h2>
        <Button>Add Vehicle</Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Manage Vehicles</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center py-4">
            <div className="relative w-72">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search vehicles..."
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
                <TableHead>Owner</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Price/Day</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {mockVehicles.map((vehicle) => (
                <TableRow key={vehicle.id}>
                  <TableCell className="font-medium">{vehicle.name}</TableCell>
                  <TableCell>{vehicle.owner}</TableCell>
                  <TableCell>
                    <Badge variant={
                      vehicle.status === "Available" ? "success" : 
                      vehicle.status === "Rented" ? "default" : "destructive"
                    }>
                      {vehicle.status}
                    </Badge>
                  </TableCell>
                  <TableCell>{vehicle.type}</TableCell>
                  <TableCell>${vehicle.price}</TableCell>
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
