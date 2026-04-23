import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { LineChart, Line, BarChart, Bar, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from "recharts"
import { DollarSign, ShieldAlert, Car, TrendingUp, CalendarDays, Percent } from "lucide-react"

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
  // Normally this would fetch from /api/v1/admin/metrics or similar
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Simulate API load
    setTimeout(() => setLoading(false), 500)
  }, [])

  if (loading) {
    return (
      <div className="flex h-[80vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    )
  }

  // Derived metrics mocks
  const totalRevenue = REVENUE_DATA.reduce((acc, curr) => acc + curr.revenue, 0)
  const totalPayments = REVENUE_DATA.reduce((acc, curr) => acc + curr.payments, 0)
  const utilizationRate = 68.4
  const activeVehicles = 1120
  const totalSearches = 8420
  const cancellationRate = 4.2
  
  // Security Mocks
  const authAttempts = 15320
  const authFailures = 421
  const rateLimitHits = 89

  return (
    <div className="flex flex-col gap-8 pb-10">
      <div className="flex flex-col gap-2 border-b pb-4">
        <h2 className="text-3xl font-bold tracking-tight">Business Intelligence</h2>
        <p className="text-muted-foreground">Real-time platform performance and security metrics.</p>
      </div>
      
      {/* KPI Row 1: Executive Summary */}
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
              <span className="text-foreground font-medium">{activeVehicles}</span> active vehicles
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Cancellation Rate</CardTitle>
            <CalendarDays className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{cancellationRate}%</div>
            <p className="text-xs text-muted-foreground mt-1">
              Target: &lt; 5.0%
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Charts Row */}
      <div className="grid gap-6 md:grid-cols-7">
        <Card className="md:col-span-4">
          <CardHeader>
            <CardTitle>Revenue Flow (Last 7 Days)</CardTitle>
            <CardDescription>Daily gross volume across all processed payments</CardDescription>
          </CardHeader>
          <CardContent className="h-[350px]">
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

        <Card className="md:col-span-3">
          <CardHeader>
            <CardTitle>Vehicle Utilization by Type</CardTitle>
            <CardDescription>Breakdown of active reservations</CardDescription>
          </CardHeader>
          <CardContent className="h-[350px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={VEHICLE_TYPE_DATA}
                  cx="50%"
                  cy="50%"
                  innerRadius={80}
                  outerRadius={110}
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
                <Legend verticalAlign="bottom" height={36} iconType="circle" />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Secondary Metrics Row */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Reservations / Hour (Today)</CardTitle>
            <CardDescription>Velocity of incoming bookings</CardDescription>
          </CardHeader>
          <CardContent className="h-[300px]">
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

        {/* Security & Health */}
        <Card className="bg-slate-900 text-slate-50 border-slate-800">
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

    </div>
  )
}
