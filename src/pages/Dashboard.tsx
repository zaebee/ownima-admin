import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Users, Car, CalendarDays, Key, Loader2, PieChart as PieChartIcon } from "lucide-react"
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip, Legend } from "recharts"
import { api } from "@/lib/api"
import { subDays, format } from "date-fns"

interface MetricsData {
  users: {
    owners: Record<string, number>;
    riders: Record<string, number>;
    total_users: number;
  };
  vehicles: {
    total: number;
    unspecified: number;
    draft: number;
    free: number;
    maintenance: number;
    collected: number;
    archived: number;
  };
  reservations: {
    total: number;
    pending: number;
    confirmation_by_rider: number;
    confirmed: number;
    collected: number;
    maintenance: number;
    completed: number;
    cancelled: number;
    overdue: number;
    conflict: number;
    confirmation_by_owner: number;
    no_response: number;
    unspecified: number;
  }
}

export function Dashboard() {
  const [metrics, setMetrics] = useState<MetricsData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        setLoading(true)
        // Defaulting to last 30 days for now
        const endDate = new Date()
        const startDate = subDays(endDate, 30)
        
        const response = await api.get('/admin/metrics/blocks', {
          params: {
            date_start: format(startDate, 'yyyy-MM-dd'),
            date_end: format(endDate, 'yyyy-MM-dd')
          }
        })
        
        setMetrics(response.data)
      } catch (error) {
        console.error("Failed to fetch dashboard metrics:", error)
      } finally {
        setLoading(false)
      }
    }
    
    fetchMetrics()
  }, [])

  if (loading || !metrics) {
    return (
      <div className="flex h-[80vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  // Prepare chart data
  const vehicleChartData = [
    { name: 'Free', value: metrics.vehicles.free, color: '#10b981' },
    { name: 'Rented (Collected)', value: metrics.vehicles.collected, color: '#3b82f6' },
    { name: 'Draft', value: metrics.vehicles.draft, color: '#94a3b8' },
    { name: 'Maintenance', value: metrics.vehicles.maintenance, color: '#f59e0b' },
    { name: 'Archived', value: metrics.vehicles.archived, color: '#ef4444' }
  ].filter(d => d.value > 0)

  const reservationChartData = [
    { name: 'Completed', value: metrics.reservations.completed, color: '#10b981' },
    { name: 'Confirmed', value: metrics.reservations.confirmed, color: '#3b82f6' },
    { name: 'Cancelled', value: metrics.reservations.cancelled, color: '#ef4444' },
    { name: 'Collected', value: metrics.reservations.collected, color: '#8b5cf6' },
    { name: 'Overdue', value: metrics.reservations.overdue, color: '#f97316' },
  ].filter(d => d.value > 0)

  // Colors array for pie chart components
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

  return (
    <div className="flex flex-col gap-8">
      <div className="flex items-center justify-between space-y-2 border-b pb-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Dashboard Overview</h2>
          <p className="text-muted-foreground">Platform metrics for the last 30 days.</p>
        </div>
      </div>
      
      {/* KPI Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.users.total_users}</div>
            <p className="text-xs text-muted-foreground mt-1">
              <span className="font-medium text-foreground">{metrics.users.owners.total}</span> Owners • {" "}
              <span className="font-medium text-foreground">{metrics.users.riders.total}</span> Riders
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Vehicles</CardTitle>
            <Car className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.vehicles.total}</div>
            <p className="text-xs text-muted-foreground mt-1">
              <span className="font-medium text-green-600">{metrics.vehicles.free}</span> Free • {" "}
              <span className="font-medium text-blue-600">{metrics.vehicles.collected}</span> Rented
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Reservations</CardTitle>
            <CalendarDays className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.reservations.total}</div>
            <p className="text-xs text-muted-foreground mt-1">
              <span className="font-medium text-green-600">{metrics.reservations.completed}</span> Completed • {" "}
              <span className="font-medium text-red-600">{metrics.reservations.cancelled}</span> Cancelled
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">User Activity (30d)</CardTitle>
            <Key className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {metrics.users.owners.online_last_30_days + metrics.users.riders.online_last_30_days} Active
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              <span className="font-medium text-foreground">{metrics.users.owners.logins_today + metrics.users.riders.logins_today}</span> logins today
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Distribution Charts */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Vehicles Breakdown */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PieChartIcon className="h-5 w-5" />
              Vehicle Fleet Distribution
            </CardTitle>
            <CardDescription>Breakdown by current vehicle status</CardDescription>
          </CardHeader>
          <CardContent className="h-[350px]">
            {vehicleChartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={vehicleChartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={70}
                    outerRadius={100}
                    paddingAngle={3}
                    dataKey="value"
                    animationDuration={1500}
                  >
                    {vehicleChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color || COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <RechartsTooltip 
                    formatter={(value: number) => [`${value} Vehicles`, 'Count']}
                    contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  />
                  <Legend verticalAlign="bottom" height={36} iconType="circle" />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-muted-foreground">
                No data available
              </div>
            )}
          </CardContent>
        </Card>

        {/* Reservations Breakdown */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PieChartIcon className="h-5 w-5" />
              Reservations Breakdown
            </CardTitle>
            <CardDescription>Breakdown by booking status</CardDescription>
          </CardHeader>
          <CardContent className="h-[350px]">
            {reservationChartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={reservationChartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={70}
                    outerRadius={100}
                    paddingAngle={3}
                    dataKey="value"
                    animationDuration={1500}
                  >
                    {reservationChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color || COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <RechartsTooltip 
                    formatter={(value: number) => [`${value} Bookings`, 'Count']}
                    contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  />
                  <Legend verticalAlign="bottom" height={36} iconType="circle" />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-muted-foreground">
                No data available
              </div>
            )}
          </CardContent>
        </Card>
      </div>
      
      {/* Extra Detail Summary */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card className="bg-muted/30 border-none shadow-none">
          <CardHeader>
            <CardTitle className="text-base">Operational Alerts</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3">
              <li className="flex items-center justify-between">
                <span className="text-sm font-medium text-muted-foreground">Overdue Reservations</span>
                <span className="text-sm font-bold text-red-600">{metrics.reservations.overdue}</span>
              </li>
              <li className="flex items-center justify-between">
                <span className="text-sm font-medium text-muted-foreground">Booking Conflicts</span>
                <span className="text-sm font-bold text-orange-600">{metrics.reservations.conflict}</span>
              </li>
              <li className="flex items-center justify-between">
                <span className="text-sm font-medium text-muted-foreground">No Response Bookings</span>
                <span className="text-sm font-bold text-amber-600">{metrics.reservations.no_response}</span>
              </li>
            </ul>
          </CardContent>
        </Card>
      </div>

    </div>
  )
}
