import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer } from "recharts"
import { RESERVATIONS_HR_DATA } from "@/lib/mockData"
import { api } from "@/lib/api"
import { Calendar, Loader2 } from "lucide-react"

export function ReservationsVelocityChart() {
  const [selectedDate, setSelectedDate] = useState(() => {
    return new Date().toISOString().split('T')[0]
  })
  const [data, setData] = useState<any[]>(RESERVATIONS_HR_DATA)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const fetchVelocity = async () => {
      try {
        setLoading(true)
        const response = await api.get('/admin/analytics/reservations-velocity', {
          params: { date: selectedDate }
        })
        if (response.data && response.data.length > 0) {
          setData(response.data)
        }
      } catch (err) {
        console.info("Velocity API not fully available yet, using mock hourly telemetry.")
      } finally {
        setLoading(false)
      }
    }
    fetchVelocity()
  }, [selectedDate])

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <div>
          <CardTitle className="text-base font-semibold">Reservations / Hour</CardTitle>
          <CardDescription>Velocity of incoming bookings</CardDescription>
        </div>
        <div className="flex items-center gap-2">
          {loading && <Loader2 className="h-4 w-4 animate-spin text-muted-foreground mr-1" />}
          <div className="relative flex items-center">
            <Calendar className="absolute left-2.5 h-3.5 w-3.5 text-muted-foreground pointer-events-none" />
            <input 
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="pl-8 pr-2 py-1 text-xs font-semibold bg-background border rounded-md text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary cursor-pointer h-8"
            />
          </div>
        </div>
      </CardHeader>
      <CardContent className="h-[250px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" className="dark:stroke-slate-800" />
            <XAxis dataKey="time" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#6b7280' }} dy={10} minTickGap={15} />
            <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#6b7280' }} />
            <RechartsTooltip 
              cursor={{ fill: 'rgba(0, 0, 0, 0.05)' }}
              contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
              formatter={(value: number) => [`${value} bookings`, 'Velocity']}
              labelFormatter={(label) => `Hour: ${label}`}
            />
            <Bar dataKey="bookings" fill="#3b82f6" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}
