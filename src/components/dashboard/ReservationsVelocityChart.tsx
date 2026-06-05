import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer } from "recharts"
import { RESERVATIONS_HR_DATA } from "@/lib/mockData"
import { api } from "@/lib/api"
import { Calendar, Loader2, HelpCircle } from "lucide-react"
import { Badge } from "@/components/ui/badge"

export function ReservationsVelocityChart() {
  const [selectedDate, setSelectedDate] = useState(() => {
    return new Date().toISOString().split('T')[0]
  })
  const [data, setData] = useState<any[]>(RESERVATIONS_HR_DATA)
  const [loading, setLoading] = useState(false)
  const [isMock, setIsMock] = useState(true)

  useEffect(() => {
    const fetchVelocity = async () => {
      try {
        setLoading(true)
        const response = await api.get('/admin/analytics/reservations-velocity', {
          params: { date: selectedDate }
        })
        if (response.data && response.data.length > 0) {
          setData(response.data)
          setIsMock(false)
        } else {
          setIsMock(true)
        }
      } catch (err) {
        console.info("Velocity API not fully available yet, using mock hourly telemetry.")
        setIsMock(true)
      } finally {
        setLoading(false)
      }
    }
    fetchVelocity()
  }, [selectedDate])

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="flex flex-row items-start justify-between pb-2">
        <div className="space-y-1">
          <CardTitle className="text-base font-semibold flex items-center gap-1.5 group cursor-help"
                     title="Отображает скорость поступления новых заказов по часам в течение выбранного дня. Позволяет анализировать пиковые часы нагрузки на службу поддержки и операторов.">
            Reservations / Hour
            <HelpCircle className="h-4 w-4 text-muted-foreground/60 group-hover:text-amber-500 transition-colors" />
          </CardTitle>
          <CardDescription className="text-xs">
            Разбивка созданных бронирований клиентов по часам (Операционная активность поддержки)
          </CardDescription>
        </div>
        <div className="flex flex-col sm:flex-row items-end sm:items-center gap-2">
          {loading && <Loader2 className="h-4 w-4 animate-spin text-muted-foreground mr-1" />}
          <Badge variant="outline" className={`text-[9.5px] font-semibold px-1.5 py-0 ${isMock ? "text-amber-600 dark:text-amber-400 border-amber-500/20" : "text-emerald-600 dark:text-emerald-400 border-emerald-500/20"}`}>
            {isMock ? "API Sandbox Derived" : "Live Real-Time Data"}
          </Badge>
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
