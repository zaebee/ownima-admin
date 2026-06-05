import { CalendarDays, HelpCircle } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip } from "recharts"
import { MetricsData } from "@/types/dashboard"
import { Badge } from "@/components/ui/badge"
import { useTranslation } from "@/contexts/LanguageContext"

interface Props {
  metrics: MetricsData;
}

const COLORS = ['#10b981', '#3b82f6', '#ef4444', '#8b5cf6', '#f97316'];

export function BookingStatusChart({ metrics }: Props) {
  const { t, language } = useTranslation()
  const calculatedTotal = metrics.reservations.completed + 
                          metrics.reservations.confirmed + 
                          metrics.reservations.cancelled + 
                          metrics.reservations.collected + 
                          metrics.reservations.overdue

  const totalReservations = metrics.reservations.total || calculatedTotal || 1

  const reservationChartData = [
    { name: 'Completed', localName: t('completedName', 'booking'), value: metrics.reservations.completed, color: '#10b981', desc: t('completedDesc', 'booking') },
    { name: 'Collected', localName: t('collectedName', 'booking'), value: metrics.reservations.collected, color: '#8b5cf6', desc: t('collectedDesc', 'booking') },
    { name: 'Confirmed', localName: t('confirmedName', 'booking'), value: metrics.reservations.confirmed, color: '#3b82f6', desc: t('confirmedDesc', 'booking') },
    { name: 'Overdue', localName: t('overdueName', 'booking'), value: metrics.reservations.overdue, color: '#f97316', desc: t('overdueDesc', 'booking') },
    { name: 'Cancelled', localName: t('cancelledName', 'booking'), value: metrics.reservations.cancelled, color: '#ef4444', desc: t('cancelledDesc', 'booking') }
  ]

  const activeChartData = reservationChartData.filter(d => d.value > 0)

  return (
    <Card className="flex flex-col h-full hover:shadow-md transition-shadow">
      <CardHeader className="pb-1">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-semibold flex items-center gap-1.5 text-foreground group cursor-help"
                     title={t('desc', 'booking')}>
            <CalendarDays className="h-4 w-4 text-purple-500" />
            {t('title', 'booking')}
            <HelpCircle className="h-3.5 w-3.5 text-muted-foreground/60 group-hover:text-amber-500 transition-colors" />
          </CardTitle>
          <Badge variant="secondary" className="text-[10px] font-mono px-1.5 py-0">
            {metrics.reservations.total || calculatedTotal} {language === 'ru' ? 'всего' : 'total bookings'}
          </Badge>
        </div>
        <CardDescription className="text-xs">
          {t('desc', 'booking')}
        </CardDescription>
      </CardHeader>
      
      <CardContent className="flex flex-col justify-between flex-1 pt-2">
        {/* Pie Chart container with smaller height so we have space underneath */}
        <div className="h-[140px] w-full relative my-1">
          {activeChartData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={activeChartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={42}
                  outerRadius={62}
                  paddingAngle={3}
                  dataKey="value"
                  animationDuration={1000}
                >
                  {activeChartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <RechartsTooltip 
                  formatter={(value: number) => [`${value} ${language === 'ru' ? 'зак.' : 'bk.'}`, language === 'ru' ? 'Количество' : 'Count']}
                  contentStyle={{ borderRadius: '6px', border: '1px solid #e2e8f0', fontSize: '11px', padding: '6px' }}
                />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-full flex items-center justify-center text-muted-foreground text-xs">
              {language === 'ru' ? 'Нет активных бронирований' : 'No active bookings'}
            </div>
          )}
        </div>

        {/* Customized high-fidelity list legend making use of vertical space */}
        <div className="space-y-1.5 pt-3 border-t">
          <div className="flex items-center justify-between text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-1">
            <span>{t('statusHeader', 'booking')}</span>
            <span>{t('shareHeader', 'booking')}</span>
          </div>
          
          <div className="space-y-1.5">
            {reservationChartData.map(item => {
              const sharePercent = totalReservations > 0 ? ((item.value / totalReservations) * 100).toFixed(1) : "0"
              
              return (
                <div 
                  key={item.name} 
                  className="flex items-center justify-between text-[11px] p-2 rounded-md bg-muted/20 border border-border/40 hover:bg-muted/40 transition-colors group relative cursor-help"
                  title={item.desc}
                >
                  <div className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full shrink-0" style={{ backgroundColor: item.color }} />
                    <span className="font-medium text-foreground">{item.localName}</span>
                    <span className="text-[10px] text-muted-foreground font-mono hidden sm:inline">({item.name})</span>
                  </div>
                  <div className="flex items-center gap-2 font-mono text-[11px]">
                    <span className="font-bold text-foreground">{item.value} {language === 'ru' ? 'шт.' : 'un.'}</span>
                    <span className="text-muted-foreground font-semibold text-[10px] min-w-[38px] text-right">{sharePercent}%</span>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

