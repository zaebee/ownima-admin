import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Users, Car, CalendarDays, Key, Loader2, PieChart as PieChartIcon, DollarSign, ShieldAlert, TrendingUp, Percent, AlertCircle } from "lucide-react"
import { BarChart, Bar, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from "recharts"
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

// Mock Data representing the missing Prometheus/Grafana backend metrics
const REVENUE_DATA = [
  { day: "Mon", revenue: 4200, payments: 14 },
  { day: "Tue", revenue: 5100, payments: 18 },
  { day: "Wed", revenue: 3800, payments: 12 },
  { day: "Thu", revenue: 6400, payments: 24 },
  { day: "Fri", revenue: 8900, payments: 38 },
  { day: "Sat", revenue: 11200, payments: 52 },
  { day: "Sun", revenue: 10500, payments: 48 },
]

const RESERVATIONS_HR_DATA = Array.from({ length: 24 }).map((_, i) => ({
  time: `${i}:00`,
  bookings: Math.floor(Math.random() * 15) + (i > 8 && i < 20 ? 10 : 2)
}))

const VEHICLE_TYPE_DATA = [
  { name: 'Sedan', value: 340, color: '#3b82f6' },
  { name: 'SUV', value: 215, color: '#10b981' },
  { name: 'Scooter', value: 480, color: '#f59e0b' },
  { name: 'Convertible', value: 85, color: '#8b5cf6' },
]

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

  // --- Real Chart Data ---
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

  // --- Derived BI Mock Data ---
  const totalRevenue = REVENUE_DATA.reduce((acc, curr) => acc + curr.revenue, 0)
  const totalPayments = REVENUE_DATA.reduce((acc, curr) => acc + curr.payments, 0)
  const utilizationRate = metrics.vehicles.total > 0 
    ? ((metrics.vehicles.collected / metrics.vehicles.total) * 100).toFixed(1) 
    : 0
  const cancellationRate = metrics.reservations.total > 0 
    ? ((metrics.reservations.cancelled / metrics.reservations.total) * 100).toFixed(1) 
    : 0
  const totalSearches = 8420
  const authAttempts = 15320
  const authFailures = 421
  const rateLimitHits = 89

  return (
    <div className="flex flex-col gap-10 pb-10">
      
      {/* HEADER */}
      <div className="flex flex-col gap-2 border-b pb-4">
        <h2 className="text-3xl font-bold tracking-tight">Dashboard Overview</h2>
        <p className="text-muted-foreground">Combined live platform operations and real-time business intelligence.</p>
      </div>

      {/* ========================================================= */}
      {/* SECTION 1: LIVE OPERATIONS ============================== */}
      {/* ========================================================= */}
      <div className="space-y-6">
        <h3 className="text-xl font-semibold flex items-center gap-2">
          <span className="relative flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
          </span>
          Live Operations (30d)
        </h3>
        
        {/* Real KPI Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Users</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{metrics.users.total_users}</div>
              <p className="text-xs text-muted-foreground mt-1">
                <span className="font-medium text-foreground">{metrics.users.owners.total || 0}</span> Owners • {" "}
                <span className="font-medium text-foreground">{metrics.users.riders.total || 0}</span> Riders
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
                {(metrics.users.owners.online_last_30_days || 0) + (metrics.users.riders.online_last_30_days || 0)} Active
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                <span className="font-medium text-foreground">
                  {(metrics.users.owners.logins_today || 0) + (metrics.users.riders.logins_today || 0)}
                </span> logins today
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Real Charts & Alerts */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {/* Vehicles Status Pie */}
          <Card className="lg:col-span-1">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <PieChartIcon className="h-4 w-4" />
                Fleet Status
              </CardTitle>
            </CardHeader>
            <CardContent className="h-[250px]">
              {vehicleChartData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={vehicleChartData}
                      cx="50%"
                      cy="50%"
                      innerRadius={55}
                      outerRadius={80}
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
                    <Legend verticalAlign="bottom" height={36} iconType="circle" wrapperStyle={{ fontSize: '12px' }}/>
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-muted-foreground text-sm">
                  No data available
                </div>
              )}
            </CardContent>
          </Card>

          {/* Reservations Status Pie */}
          <Card className="lg:col-span-1">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <PieChartIcon className="h-4 w-4" />
                Booking Status
              </CardTitle>
            </CardHeader>
            <CardContent className="h-[250px]">
              {reservationChartData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={reservationChartData}
                      cx="50%"
                      cy="50%"
                      innerRadius={55}
                      outerRadius={80}
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
                    <Legend verticalAlign="bottom" height={36} iconType="circle" wrapperStyle={{ fontSize: '12px' }}/>
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-muted-foreground text-sm">
                  No data available
                </div>
              )}
            </CardContent>
          </Card>

          {/* Real Operational Alerts */}
          <Card className="lg:col-span-1 bg-red-50/50 border-red-100 dark:bg-red-950/20 dark:border-red-900/30">
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2 text-red-700 dark:text-red-400">
                <AlertCircle className="h-4 w-4" />
                Attention Required
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-4">
                <li className="flex items-center justify-between border-b border-red-100 dark:border-red-900/30 pb-2">
                  <span className="text-sm font-medium text-muted-foreground">Overdue Reservations</span>
                  <span className="text-sm font-bold text-red-600">{metrics.reservations.overdue}</span>
                </li>
                <li className="flex items-center justify-between border-b border-red-100 dark:border-red-900/30 pb-2">
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

      {/* ========================================================= */}
      {/* SECTION 2: BUSINESS INTELLIGENCE ========================= */}
      {/* ========================================================= */}
      <div className="space-y-6 pt-4">
        <h3 className="text-xl font-semibold flex items-center gap-2 text-primary">
          Business Intelligence & Security
          <span className="text-xs font-normal bg-primary/10 text-primary px-2 py-0.5 rounded-full ml-2">Preview</span>
        </h3>

        {/* BI KPI Row */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Weekly Revenue</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${totalRevenue.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground mt-1">
                <span className="text-green-500 font-medium">+12.5%</span> from last week
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Payments Processed</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalPayments}</div>
              <p className="text-xs text-muted-foreground mt-1">
                Averaging ${(totalRevenue / totalPayments).toFixed(0)} per transaction
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Fleet Utilization Rate</CardTitle>
              <Percent className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{utilizationRate}%</div>
              <p className="text-xs text-muted-foreground mt-1">
                <span className="text-foreground font-medium">{metrics.vehicles.total}</span> total vehicles
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Cancellation Rate</CardTitle>
              <CalendarDays className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-500">{cancellationRate}%</div>
              <p className="text-xs text-muted-foreground mt-1">
                Target: &lt; 5.0%
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Big BI Charts Row */}
        <div className="grid gap-6 md:grid-cols-7">
          <Card className="md:col-span-4 flex flex-col">
            <CardHeader>
              <CardTitle>Revenue Flow (Last 7 Days)</CardTitle>
              <CardDescription>Daily gross volume across all processed payments</CardDescription>
            </CardHeader>
            <CardContent className="h-[300px] flex-1">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={REVENUE_DATA} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                  <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6b7280' }} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6b7280' }} width={60} tickFormatter={(v) => `$${v}`} />
                  <RechartsTooltip 
                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                    formatter={(value: number) => [`$${value}`, 'Revenue']}
                  />
                  <Area type="monotone" dataKey="revenue" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#colorRevenue)" />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Security & Health */}
          <Card className="md:col-span-3 bg-slate-900 text-slate-50 border-slate-800">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ShieldAlert className="h-5 w-5 text-indigo-400" />
                Platform Security Overview
              </CardTitle>
              <CardDescription className="text-slate-400">Authentication & Traffic Guard</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div>
                  <div className="flex items-center justify-between text-sm mb-2">
                    <span className="text-slate-300">Auth Attempts (24h)</span>
                    <span className="font-mono font-medium">{authAttempts.toLocaleString()}</span>
                  </div>
                  <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
                    <div className="h-full bg-indigo-500 w-[100%]" />
                  </div>
                </div>
                
                <div>
                  <div className="flex items-center justify-between text-sm mb-2">
                    <span className="text-slate-300">Authorization Failures</span>
                    <span className="font-mono font-medium text-amber-400">{authFailures.toLocaleString()}</span>
                  </div>
                  <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
                    <div className="h-full bg-amber-400" style={{ width: `${(authFailures / authAttempts) * 100 * 50}%` }} />
                  </div>
                  <p className="text-xs text-slate-500 mt-1">{(authFailures / authAttempts * 100).toFixed(1)}% failure rate</p>
                </div>

                <div>
                  <div className="flex items-center justify-between text-sm mb-2">
                    <span className="text-slate-300">Rate Limit Hits</span>
                    <span className="font-mono font-medium text-rose-400">{rateLimitHits.toLocaleString()}</span>
                  </div>
                  <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
                    <div className="h-full bg-rose-500" style={{ width: `${Math.min(rateLimitHits / 200 * 100, 100)}%` }} />
                  </div>
                  <p className="text-xs text-slate-500 mt-1">IP bans: 2</p>
                </div>

                <div className="pt-4 border-t border-slate-800">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-sm text-slate-300">
                      <Car className="h-4 w-4 text-emerald-400" />
                      Vehicle Searches (24h)
                    </div>
                    <span className="font-mono font-medium text-emerald-400">{totalSearches.toLocaleString()}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Secondary BI Row */}
        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Reservations / Hour (Today)</CardTitle>
              <CardDescription>Velocity of incoming bookings</CardDescription>
            </CardHeader>
            <CardContent className="h-[250px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={RESERVATIONS_HR_DATA} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                  <XAxis dataKey="time" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#6b7280' }} dy={10} minTickGap={15} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6b7280' }} />
                  <RechartsTooltip 
                    cursor={{ fill: 'rgba(0, 0, 0, 0.05)' }}
                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                  />
                  <Bar dataKey="bookings" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Demand by Vehicle Type</CardTitle>
              <CardDescription>Types of vehicles actively rented</CardDescription>
            </CardHeader>
            <CardContent className="h-[250px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={VEHICLE_TYPE_DATA}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={90}
                    paddingAngle={5}
                    dataKey="value"
                    animationDuration={1000}
                  >
                    {VEHICLE_TYPE_DATA.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <RechartsTooltip 
                    formatter={(value: number) => [`${value} Active`, 'Count']}
                    contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  />
                  <Legend verticalAlign="bottom" height={36} iconType="circle" wrapperStyle={{ fontSize: '12px' }}/>
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
