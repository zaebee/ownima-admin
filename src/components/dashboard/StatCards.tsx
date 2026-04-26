import { Users, Car, CalendarDays, Percent } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { MetricsData } from "@/types/dashboard"

interface Props {
  metrics: MetricsData;
}

export function StatCards({ metrics }: Props) {
  const utilizationRate = metrics.vehicles.total > 0 
    ? ((metrics.vehicles.collected / metrics.vehicles.total) * 100).toFixed(1) 
    : "0.0"

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card className="hover:shadow-md transition-shadow">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">Total Users</CardTitle>
          <div className="p-2 bg-blue-500/10 rounded-full">
            <Users className="h-4 w-4 text-blue-600" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold tracking-tight">{metrics.users.total_users}</div>
          <div className="flex items-center text-xs mt-2 gap-2 text-muted-foreground">
            <span className="font-medium text-foreground">{metrics.users.owners.total || 0}</span> Owners 
            <span className="h-3 w-[1px] bg-border"></span>
            <span className="font-medium text-foreground">{metrics.users.riders.total || 0}</span> Riders
          </div>
        </CardContent>
      </Card>
      
      <Card className="hover:shadow-md transition-shadow">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">Total Vehicles</CardTitle>
          <div className="p-2 bg-emerald-500/10 rounded-full">
            <Car className="h-4 w-4 text-emerald-600" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold tracking-tight">{metrics.vehicles.total}</div>
          <div className="flex items-center text-xs mt-2 gap-2 text-muted-foreground">
            <span className="font-medium text-emerald-600">{metrics.vehicles.free}</span> Free 
            <span className="h-3 w-[1px] bg-border"></span>
            <span className="font-medium text-blue-600">{metrics.vehicles.collected}</span> Rented
          </div>
        </CardContent>
      </Card>
      
      <Card className="hover:shadow-md transition-shadow">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">Reservations</CardTitle>
          <div className="p-2 bg-purple-500/10 rounded-full">
            <CalendarDays className="h-4 w-4 text-purple-600" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold tracking-tight">{metrics.reservations.total}</div>
          <div className="flex items-center text-xs mt-2 gap-2 text-muted-foreground">
            <span className="font-medium text-emerald-600">{metrics.reservations.completed}</span> Done 
            <span className="h-3 w-[1px] bg-border"></span>
            <span className="font-medium text-rose-600">{metrics.reservations.cancelled}</span> Cancelled
          </div>
        </CardContent>
      </Card>

      <Card className="hover:shadow-md transition-shadow">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">Fleet Utilization</CardTitle>
          <div className="p-2 bg-amber-500/10 rounded-full">
            <Percent className="h-4 w-4 text-amber-600" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold tracking-tight">{utilizationRate}%</div>
          <div className="flex items-center text-xs mt-2 gap-2 text-muted-foreground">
            Collected vs Total base
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
