import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Users, Car, CalendarDays, Key, PieChart as PieChartIcon, DollarSign, ShieldAlert, TrendingUp, Percent, AlertCircle, Activity, Search as SearchIcon, Server } from "lucide-react"
import { BarChart, Bar, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from "recharts"
import { Skeleton } from "@/components/ui/skeleton"
import { api } from "@/lib/api"
import { subDays, format } from "date-fns"

interface MetricsData {
  users: {
    owners: {
      total: number;
      internal: number;
      external: number;
      online_last_30_days: number;
      logins_today: number;
      verified: number;
      with_vehicles: number;
      with_active_rentals: number;
    };
    riders: {
      total: number;
      internal: number;
      external: number;
      online_last_30_days: number;
      logins_today: number;
      with_bookings: number;
      with_completed_trips: number;
      with_active_bookings: number;
    };
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

// Mock Data representing the missing Prometheus/OpenSearch backend metrics
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

const SEARCH_LATENCY_DATA = Array.from({ length: 20 }).map((_, i) => ({
  time: i,
  latency: Math.floor(Math.random() * 30) + 20,
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
      <div className="flex flex-col gap-6 pb-10 w-full animate-in fade-in duration-500">
        <div className="flex flex-col gap-2 border-b pb-4">
          <Skeleton className="h-10 w-[300px]" />
          <Skeleton className="h-5 w-[450px]" />
        </div>
        
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={`kpi-skel-${i}`}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-4 w-4 rounded-full" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-16 mb-2" />
                <Skeleton className="h-3 w-32" />
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          <Card className="md:col-span-2 h-[350px]">
            <CardHeader>
              <Skeleton className="h-5 w-40" />
            </CardHeader>
            <CardContent>
              <Skeleton className="w-full h-[250px] rounded-md" />
            </CardContent>
          </Card>
          <Card className="h-[350px]">
            <CardHeader>
              <Skeleton className="h-5 w-40" />
            </CardHeader>
            <CardContent className="flex justify-center items-center h-[250px]">
              <Skeleton className="h-[200px] w-[200px] rounded-full" />
            </CardContent>
          </Card>
        </div>
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

  const totalSearches = 8420
  const authAttempts = 15320
  const authFailures = 421
  const rateLimitHits = 89

  return (
    <div className="flex flex-col gap-8 pb-10 max-w-7xl mx-auto w-full animate-in fade-in duration-500">
      
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b pb-4">
        <div className="flex flex-col gap-2">
          <h2 className="text-3xl font-bold tracking-tight">Control Center</h2>
          <p className="text-muted-foreground">Platform operations, analytics, and security.</p>
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground bg-muted/30 px-3 py-1.5 rounded-md border">
          <Activity className="h-4 w-4 text-green-500 animate-pulse" />
          <span>System Healthy</span>
        </div>
      </div>

      {/* ========================================================= */}
      {/* SECTION 1: LIVE OPERATIONS (BENTO BOX) ================== */}
      {/* ========================================================= */}
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

      <div className="grid gap-4 md:grid-cols-7">
        
        {/* REVENUE CHART */}
        <Card className="md:col-span-5 flex flex-col hover:shadow-md transition-shadow">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-emerald-500" />
              Revenue Flow (Last 7 Days)
            </CardTitle>
            <CardDescription>Daily gross volume across all processed payments (Mock)</CardDescription>
          </CardHeader>
          <CardContent className="h-[300px] flex-1 mt-4">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={REVENUE_DATA} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6b7280' }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6b7280' }} width={80} tickFormatter={(v) => `$${v}`} />
                <RechartsTooltip 
                  contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  formatter={(value: number) => [`$${value}`, 'Revenue']}
                />
                <Area type="monotone" dataKey="revenue" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#colorRevenue)" />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* ALERTS / EXCEPTIONS */}
        <Card className="md:col-span-2 flex flex-col bg-slate-50 dark:bg-slate-900 border-none relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-5">
            <ShieldAlert className="h-32 w-32" />
          </div>
          <CardHeader className="pb-2 relative z-10">
            <CardTitle className="text-base font-semibold flex items-center gap-2 text-rose-600 dark:text-rose-400">
              <AlertCircle className="h-5 w-5" />
              Action Required
            </CardTitle>
            <CardDescription>Operational exceptions</CardDescription>
          </CardHeader>
          <CardContent className="flex-1 relative z-10 pt-4">
            <ul className="space-y-4">
              <li className="flex items-center justify-between border-b border-border/50 pb-3">
                <span className="text-sm font-medium text-slate-700 dark:text-slate-200">Overdue Reservations</span>
                <span className="text-sm font-bold bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-400 px-2 py-0.5 rounded-full">{metrics.reservations.overdue}</span>
              </li>
              <li className="flex items-center justify-between border-b border-border/50 pb-3">
                <span className="text-sm font-medium text-slate-700 dark:text-slate-200">Booking Conflicts</span>
                <span className="text-sm font-bold bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-400 px-2 py-0.5 rounded-full">{metrics.reservations.conflict}</span>
              </li>
              <li className="flex items-center justify-between border-b border-border/50 pb-3">
                <span className="text-sm font-medium text-slate-700 dark:text-slate-200">No Responses</span>
                <span className="text-sm font-bold bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400 px-2 py-0.5 rounded-full">{metrics.reservations.no_response}</span>
              </li>
              <li className="flex items-center justify-between pb-1">
                <span className="text-sm font-medium text-slate-700 dark:text-slate-200">Auth Failures (24h)</span>
                <span className="text-sm font-bold bg-slate-200 text-slate-700 dark:bg-slate-800 dark:text-slate-300 px-2 py-0.5 rounded-full">{authFailures}</span>
              </li>
            </ul>
          </CardContent>
        </Card>
      </div>

      {/* USER ACTIVITY & ENGAGEMENT */}
      <Card className="hover:shadow-md transition-shadow">
        <CardHeader className="pb-2">
          <CardTitle className="text-base font-semibold flex items-center gap-2">
            <Activity className="h-5 w-5 text-blue-500" />
            User Engagement
          </CardTitle>
          <CardDescription>Live active users and session metrics</CardDescription>
        </CardHeader>
        <CardContent className="mt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* 30 Days Active Card */}
            <div className="flex flex-col gap-2 p-5 rounded-xl bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-800">
              <span className="text-sm font-medium text-slate-500">Active (Last 30 Days)</span>
              <div className="flex items-end justify-between mt-2">
                <span className="text-4xl font-bold text-slate-900 dark:text-slate-50">
                  {((metrics.users.owners.online_last_30_days || 0) + (metrics.users.riders.online_last_30_days || 0)).toLocaleString()}
                </span>
                <span className="text-sm text-emerald-600 dark:text-emerald-400 flex items-center bg-emerald-500/10 px-2 py-0.5 rounded-full">
                  <TrendingUp className="w-3 w-3 mr-1"/>
                  Trending
                </span>
              </div>
              <div className="h-2 w-full bg-slate-200 dark:bg-slate-800 flex mt-6 overflow-hidden rounded-full">
                <div 
                  className="bg-blue-500 h-full transition-all duration-500" 
                  style={{ width: `${((metrics.users.owners.online_last_30_days || 0) / Math.max((metrics.users.owners.online_last_30_days || 0) + (metrics.users.riders.online_last_30_days || 0), 1)) * 100}%` }}
                ></div>
                <div 
                  className="bg-emerald-500 h-full transition-all duration-500" 
                  style={{ width: `${((metrics.users.riders.online_last_30_days || 0) / Math.max((metrics.users.owners.online_last_30_days || 0) + (metrics.users.riders.online_last_30_days || 0), 1)) * 100}%` }}
                ></div>
              </div>
              <div className="flex justify-between text-xs mt-3 text-slate-500">
                <span className="flex items-center gap-1.5 font-medium"><div className="w-2 h-2 rounded-full bg-blue-500"></div> Owners: {metrics.users.owners.online_last_30_days || 0}</span>
                <span className="flex items-center gap-1.5 font-medium"><div className="w-2 h-2 rounded-full bg-emerald-500"></div> Riders: {metrics.users.riders.online_last_30_days || 0}</span>
              </div>
            </div>

            {/* Logins Today Card */}
            <div className="flex flex-col gap-2 p-5 rounded-xl bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-800">
              <span className="text-sm font-medium text-slate-500">Logins Today</span>
              <div className="flex items-end justify-between mt-2">
                <span className="text-4xl font-bold text-slate-900 dark:text-slate-50">
                  {((metrics.users.owners.logins_today || 0) + (metrics.users.riders.logins_today || 0)).toLocaleString()}
                </span>
                <span className="text-sm text-blue-600 dark:text-blue-400 flex items-center bg-blue-500/10 px-2 py-0.5 rounded-full">
                  24h window
                </span>
              </div>
              <div className="h-2 w-full bg-slate-200 dark:bg-slate-800 flex mt-6 overflow-hidden rounded-full">
                <div 
                  className="bg-blue-500 h-full transition-all duration-500" 
                  style={{ width: `${((metrics.users.owners.logins_today || 0) / Math.max((metrics.users.owners.logins_today || 0) + (metrics.users.riders.logins_today || 0), 1)) * 100}%` }}
                ></div>
                <div 
                  className="bg-emerald-500 h-full transition-all duration-500" 
                  style={{ width: `${((metrics.users.riders.logins_today || 0) / Math.max((metrics.users.owners.logins_today || 0) + (metrics.users.riders.logins_today || 0), 1)) * 100}%` }}
                ></div>
              </div>
              <div className="flex justify-between text-xs mt-3 text-slate-500">
                <span className="flex items-center gap-1.5 font-medium"><div className="w-2 h-2 rounded-full bg-blue-500"></div> Owners: {metrics.users.owners.logins_today || 0}</span>
                <span className="flex items-center gap-1.5 font-medium"><div className="w-2 h-2 rounded-full bg-emerald-500"></div> Riders: {metrics.users.riders.logins_today || 0}</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-3">
        {/* Vehicles Status Pie */}
        <Card>
          <CardHeader className="pb-0">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <Car className="h-4 w-4 text-blue-500" />
              Fleet Status
            </CardTitle>
          </CardHeader>
          <CardContent className="h-[240px]">
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
                    formatter={(value: number) => [`${value}`, 'Vehicles']}
                    contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  />
                  <Legend verticalAlign="bottom" height={36} iconType="circle" wrapperStyle={{ fontSize: '11px' }}/>
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-muted-foreground text-sm">
                No data available
              </div>
            )}
          </CardContent>
        </Card>

        {/* OPENSEARCH / INFRASTRUCTURE SECTION */}
        <Card className="bg-slate-900 text-slate-50 border-slate-800 hover:shadow-lg transition-all">
          <CardHeader className="pb-2 text-slate-50">
            <CardTitle className="text-sm font-semibold flex items-center gap-2 text-indigo-400">
              <Server className="h-4 w-4" />
              OpenSearch Analytics
              <span className="text-[9px] uppercase tracking-wider bg-indigo-500/20 text-indigo-300 px-1.5 py-0.5 rounded-sm ml-auto">Core Backend</span>
            </CardTitle>
            <CardDescription className="text-slate-400 text-xs">Search engine metrics & throughput</CardDescription>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="grid grid-cols-2 gap-4 mb-5">
              <div>
                <p className="text-xs text-slate-400 mb-1">Searches (24h)</p>
                <div className="flex items-baseline gap-1">
                  <span className="text-2xl font-mono text-emerald-400">{totalSearches.toLocaleString()}</span>
                </div>
              </div>
              <div>
                <p className="text-xs text-slate-400 mb-1">Avg Latency</p>
                <div className="flex items-baseline gap-1">
                  <span className="text-2xl font-mono text-blue-400">42</span>
                  <span className="text-xs text-slate-500">ms</span>
                </div>
              </div>
              <div>
                <p className="text-xs text-slate-400 mb-1">Index Size</p>
                <div className="flex items-baseline gap-1">
                  <span className="text-xl font-mono text-slate-200">1.84</span>
                  <span className="text-xs text-slate-500">GB</span>
                </div>
              </div>
              <div>
                <p className="text-xs text-slate-400 mb-1">Total Docs</p>
                <div className="flex items-baseline gap-1">
                  <span className="text-xl font-mono text-slate-200">284.1K</span>
                </div>
              </div>
            </div>
            
            <div className="space-y-2 pt-3 border-t border-slate-800">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-400">Live Traffic (Req/s)</span>
                <span className="text-indigo-400 font-mono">1.2</span>
              </div>
              <div className="h-10 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={SEARCH_LATENCY_DATA} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorLatency" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#818cf8" stopOpacity={0.5}/>
                        <stop offset="95%" stopColor="#818cf8" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <Area type="step" dataKey="latency" stroke="#818cf8" strokeWidth={1.5} fillOpacity={1} fill="url(#colorLatency)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Reservations Status Pie */}
        <Card>
          <CardHeader className="pb-0">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <CalendarDays className="h-4 w-4 text-purple-500" />
              Booking Status
            </CardTitle>
          </CardHeader>
          <CardContent className="h-[240px]">
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
                    formatter={(value: number) => [`${value}`, 'Bookings']}
                    contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  />
                  <Legend verticalAlign="bottom" height={36} iconType="circle" wrapperStyle={{ fontSize: '11px' }}/>
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-muted-foreground text-sm">
                No data available
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Secondary BI Row */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card className="hover:shadow-md transition-shadow">
          <CardHeader>
            <CardTitle className="text-base">Reservations / Hour (Today)</CardTitle>
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

        <Card className="hover:shadow-md transition-shadow">
          <CardHeader>
            <CardTitle className="text-base">Demand by Vehicle Type</CardTitle>
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
  )
}

