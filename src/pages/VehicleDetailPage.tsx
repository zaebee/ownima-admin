import { useState } from "react"
import { useParams, Link } from "react-router-dom"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { ArrowLeft, Car, FileText, Wrench, Plus, X, Calendar, DollarSign, User } from "lucide-react"

// Mock data for the vehicle
const mockVehicle = {
  id: "1",
  name: "Tesla Model 3",
  owner: "John Doe",
  status: "Available",
  type: "Car",
  price: 120,
  license_plate: "XYZ-1234",
  year: 2023,
  mileage: 15000,
  color: "Pearl White",
}

// Mock data for inspection reports
const initialReports = [
  {
    id: "REP-001",
    date: "2025-11-10",
    type: "Pre-rental",
    inspector: "Admin User",
    status: "Completed",
    damage_notes: "Minor scratch on the rear bumper. Otherwise in perfect condition.",
  },
  {
    id: "REP-002",
    date: "2025-11-15",
    type: "Post-rental",
    inspector: "Admin User",
    status: "Pending",
    damage_notes: "Awaiting final wash to check for new damages.",
  },
]

export function VehicleDetailPage() {
  const { id } = useParams()
  const vehicle = mockVehicle // In a real app, fetch vehicle by id
  
  const [reports, setReports] = useState(initialReports)
  const [isModalOpen, setIsModalOpen] = useState(false)
  
  // Form state
  const [newReport, setNewReport] = useState({
    type: "Pre-rental",
    status: "Pending",
    inspector: "Admin User",
    date: new Date().toISOString().split('T')[0],
    damage_notes: "",
  })

  const handleAddReport = (e: React.FormEvent) => {
    e.preventDefault()
    const report = {
      id: `REP-00${reports.length + 1}`,
      ...newReport
    }
    setReports([report, ...reports])
    setIsModalOpen(false)
    setNewReport({
      type: "Pre-rental",
      status: "Pending",
      inspector: "Admin User",
      date: new Date().toISOString().split('T')[0],
      damage_notes: "",
    })
  }

  return (
    <div className="flex flex-col gap-8 max-w-6xl mx-auto">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" asChild>
            <Link to="/vehicles">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <h2 className="text-3xl font-bold tracking-tight">Vehicle Details</h2>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">Edit Vehicle</Button>
          <Button variant={vehicle.status === "Available" ? "destructive" : "default"}>
            {vehicle.status === "Available" ? "Set Maintenance" : "Make Available"}
          </Button>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {/* Vehicle Info Card */}
        <Card className="md:col-span-1">
          <CardHeader>
            <div className="flex items-center justify-between mb-2">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <Car className="h-6 w-6" />
              </div>
              <Badge variant={
                vehicle.status === "Available" ? "success" : 
                vehicle.status === "Rented" ? "default" : "destructive"
              }>
                {vehicle.status}
              </Badge>
            </div>
            <CardTitle className="text-2xl">{vehicle.name}</CardTitle>
            <CardDescription>{vehicle.license_plate} • {vehicle.year}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3 text-sm">
              <div className="flex items-center gap-3 text-muted-foreground">
                <User className="h-4 w-4" />
                <span className="text-foreground">Owner: {vehicle.owner}</span>
              </div>
              <div className="flex items-center gap-3 text-muted-foreground">
                <DollarSign className="h-4 w-4" />
                <span className="text-foreground">${vehicle.price} / day</span>
              </div>
              <div className="flex items-center gap-3 text-muted-foreground">
                <Wrench className="h-4 w-4" />
                <span className="text-foreground">{vehicle.type} • {vehicle.color}</span>
              </div>
              <div className="flex items-center gap-3 text-muted-foreground">
                <Calendar className="h-4 w-4" />
                <span className="text-foreground">{vehicle.mileage.toLocaleString()} miles</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Inspection Reports Section */}
        <div className="md:col-span-2 space-y-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <div>
                <CardTitle className="text-lg flex items-center gap-2">
                  <FileText className="h-5 w-5 text-primary" />
                  Inspection Reports
                </CardTitle>
                <CardDescription>Manage pre-rental and post-rental inspections</CardDescription>
              </div>
              <Button size="sm" onClick={() => setIsModalOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                New Report
              </Button>
            </CardHeader>
            <CardContent>
              {reports.length === 0 ? (
                <div className="py-8 text-center text-muted-foreground">
                  No inspection reports found for this vehicle.
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>ID</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Inspector</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {reports.map((report) => (
                      <TableRow key={report.id}>
                        <TableCell className="font-medium">{report.id}</TableCell>
                        <TableCell>{report.date}</TableCell>
                        <TableCell>{report.type}</TableCell>
                        <TableCell>
                          <Badge variant={report.status === "Completed" ? "success" : "warning"}>
                            {report.status}
                          </Badge>
                        </TableCell>
                        <TableCell>{report.inspector}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
          
          {/* Detailed View of Latest Report */}
          {reports.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-md">Latest Report Details ({reports[0].id})</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <h4 className="text-sm font-semibold">Damage Notes</h4>
                  <p className="text-sm text-muted-foreground bg-muted/30 p-3 rounded-md border">
                    {reports[0].damage_notes || "No damage notes provided."}
                  </p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Simple Modal for New Inspection Report */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <Card className="w-full max-w-lg shadow-xl">
            <CardHeader className="flex flex-row items-center justify-between border-b pb-4">
              <CardTitle>New Inspection Report</CardTitle>
              <Button variant="ghost" size="icon" onClick={() => setIsModalOpen(false)} className="-mr-2">
                <X className="h-4 w-4" />
              </Button>
            </CardHeader>
            <form onSubmit={handleAddReport}>
              <CardContent className="space-y-4 pt-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Inspection Type</label>
                    <select 
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                      value={newReport.type}
                      onChange={(e) => setNewReport({...newReport, type: e.target.value})}
                      required
                    >
                      <option value="Pre-rental">Pre-rental</option>
                      <option value="Post-rental">Post-rental</option>
                      <option value="Maintenance">Maintenance</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Status</label>
                    <select 
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                      value={newReport.status}
                      onChange={(e) => setNewReport({...newReport, status: e.target.value})}
                      required
                    >
                      <option value="Pending">Pending</option>
                      <option value="Completed">Completed</option>
                    </select>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Date</label>
                    <Input 
                      type="date" 
                      value={newReport.date}
                      onChange={(e) => setNewReport({...newReport, date: e.target.value})}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Inspector</label>
                    <Input 
                      value={newReport.inspector}
                      onChange={(e) => setNewReport({...newReport, inspector: e.target.value})}
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Damage Notes</label>
                  <Textarea 
                    placeholder="Describe any scratches, dents, or issues..."
                    value={newReport.damage_notes}
                    onChange={(e) => setNewReport({...newReport, damage_notes: e.target.value})}
                    className="min-h-[100px]"
                  />
                </div>
              </CardContent>
              <div className="flex items-center justify-end gap-2 border-t p-4 bg-muted/20 rounded-b-xl">
                <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit">
                  Save Report
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}
    </div>
  )
}
