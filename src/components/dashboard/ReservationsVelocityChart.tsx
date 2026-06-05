import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer } from "recharts"
import { api } from "@/lib/api"
import { Calendar, Loader2, HelpCircle } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { useTranslation } from "@/contexts/LanguageContext"
import { cn } from "@/lib/utils"

const getMockDataForPeriod = (period: '1d' | '7d' | '30d', dateStr: string) => {
  if (period === '1d') {
    return Array.from({ length: 24 }).map((_, i) => ({
      time: `${String(i).padStart(2, '0')}:00`,
      bookings: Math.floor(Math.random() * 8) + (i > 8 && i < 20 ? 12 : 1)
    }))
  } else {
    const days = period === '7d' ? 7 : 30
    const anchor = new Date(dateStr || new Date().toISOString().split('T')[0])
    const list = []
    for (let i = days - 1; i >= 0; i--) {
      const d = new Date(anchor)
      d.setDate(d.getDate() - i)
      const formattedDate = d.toISOString().split('T')[0]
      list.push({
        time: formattedDate,
        bookings: Math.floor(Math.random() * 40) + 5
      })
    }
    return list
  }
}

export function ReservationsVelocityChart() {
  const { t, language } = useTranslation()
  const [selectedDate, setSelectedDate] = useState(() => {
    return new Date().toISOString().split('T')[0]
  })
  const [period, setPeriod] = useState<'1d' | '7d' | '30d'>('1d')
  const [data, setData] = useState<any[]>(() => getMockDataForPeriod('1d', new Date().toISOString().split('T')[0]))
  const [loading, setLoading] = useState(false)
  const [isMock, setIsMock] = useState(true)

  useEffect(() => {
    const fetchVelocity = async () => {
      try {
        setLoading(true)
        const response = await api.get('/admin/analytics/reservations-velocity', {
          params: { date: selectedDate, period }
        })
        if (response.data && response.data.length > 0) {
          setData(response.data)
          setIsMock(false)
        } else {
          setData(getMockDataForPeriod(period, selectedDate))
          setIsMock(true)
        }
      } catch (err) {
        console.info("Velocity API not fully available yet, using mock hourly telemetry.")
        setData(getMockDataForPeriod(period, selectedDate))
        setIsMock(true)
      } finally {
        setLoading(false)
      }
    }
    fetchVelocity()
  }, [selectedDate, period])

  const labelPrefix = language === 'ru' 
    ? (period === '1d' ? 'Час' : 'Дата')
    : (period === '1d' ? 'Hour' : 'Date')

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="flex flex-col sm:flex-row items-start justify-between pb-2 gap-4">
        <div className="space-y-1">
          <CardTitle className="text-base font-semibold flex items-center gap-1.5 group cursor-help"
                     title={t('desc', 'velocity')}>
            {t('title', 'velocity')}
            <HelpCircle className="h-4 w-4 text-muted-foreground/60 group-hover:text-amber-500 transition-colors" />
          </CardTitle>
          <CardDescription className="text-xs">
            {t('desc', 'velocity')}
          </CardDescription>
        </div>
        <div className="flex flex-wrap items-center gap-2 self-stretch sm:self-auto justify-between sm:justify-end">
          <div className="flex items-center gap-2">
            {loading && <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />}
            <Badge variant="outline" className={`text-[9.5px] font-semibold px-1.5 py-0 ${isMock ? "text-amber-600 dark:text-amber-400 border-amber-500/20" : "text-emerald-600 dark:text-emerald-400 border-emerald-500/20"}`}>
              {isMock ? t('sandboxBadge') : "Live"}
            </Badge>
          </div>
          
          <div className="flex items-center gap-2">
            {/* Period selector */}
            <div className="flex items-center gap-0.5 bg-muted p-0.5 rounded-lg border h-8">
              {(['1d', '7d', '30d'] as const).map((p) => (
                <button
                  key={p}
                  onClick={() => setPeriod(p)}
                  className={cn(
                    "px-2 py-1 text-[10px] font-bold rounded-md uppercase transition-colors h-full flex items-center justify-center min-w-[32px] cursor-pointer",
                    period === p 
                      ? "bg-background text-foreground shadow-sm" 
                      : "text-muted-foreground hover:bg-background/40 hover:text-foreground"
                  )}
                >
                  {p === '1d' ? '1D' : p === '7d' ? '7D' : '30D'}
                </button>
              ))}
            </div>

            {/* Date Picker */}
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
              formatter={(value: number) => {
                const label = language === 'ru' ? 'Заказов' : 'Bookings'
                return [value, label]
              }}
              labelFormatter={(label) => `${labelPrefix}: ${label}`}
            />
            <Bar dataKey="bookings" fill="#3b82f6" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}
