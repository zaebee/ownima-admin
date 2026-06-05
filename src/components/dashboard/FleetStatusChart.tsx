import { Car, HelpCircle } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip } from "recharts"
import { MetricsData } from "@/types/dashboard"
import { Badge } from "@/components/ui/badge"

interface Props {
  metrics: MetricsData;
}

const COLORS = ['#10b981', '#3b82f6', '#94a3b8', '#f59e0b', '#ef4444'];

export function FleetStatusChart({ metrics }: Props) {
  const totalVehicles = metrics.vehicles.total || 1

  const vehicleChartData = [
    { name: 'Free', russian: 'Свободно', value: metrics.vehicles.free, color: '#10b981', desc: 'Машины готовы к аренде и видны клиентам в приложении' },
    { name: 'Rented', russian: 'В аренде', value: metrics.vehicles.collected, color: '#3b82f6', desc: 'Автомобили находятся у арендаторов на руках' },
    { name: 'Draft', russian: 'Черновик', value: metrics.vehicles.draft, color: '#94a3b8', desc: 'Новые машины в процессе модерации/добавления' },
    { name: 'Maintenance', russian: 'В ремонте', value: metrics.vehicles.maintenance, color: '#f59e0b', desc: 'На сервисе, недоступны для бронирования' },
    { name: 'Archived', russian: 'В архиве', value: metrics.vehicles.archived, color: '#ef4444', desc: 'Списанные или временно удаленные автомобили' }
  ]

  const activeChartData = vehicleChartData.filter(d => d.value > 0)

  return (
    <Card className="flex flex-col h-full hover:shadow-md transition-shadow">
      <CardHeader className="pb-1">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-semibold flex items-center gap-1.5 text-foreground group cursor-help"
                     title="Общее состояние и распределение автомобилей нашего парка по эксплуатационным статусам.">
            <Car className="h-4 w-4 text-blue-500" />
            Fleet Status
            <HelpCircle className="h-3.5 w-3.5 text-muted-foreground/60 group-hover:text-amber-500 transition-colors" />
          </CardTitle>
          <Badge variant="secondary" className="text-[10px] font-mono px-1.5 py-0">
            {metrics.vehicles.total} cars total
          </Badge>
        </div>
        <CardDescription className="text-xs">
          Текущая утилизация и техническое состояние автопарка машинного пула
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
                  formatter={(value: number) => [`${value} шт`, 'Количество']}
                  contentStyle={{ borderRadius: '6px', border: '1px solid #e2e8f0', fontSize: '11px', padding: '6px' }}
                />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-full flex items-center justify-center text-muted-foreground text-xs">
              Нет доступных автомобилей
            </div>
          )}
        </div>

        {/* Customized high-fidelity list legend making use of vertical space */}
        <div className="space-y-1.5 pt-3 border-t">
          <div className="flex items-center justify-between text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-1">
            <span>Статус авто</span>
            <span>Доля / Кол-во</span>
          </div>
          
          <div className="space-y-1.5">
            {vehicleChartData.map(item => {
              const sharePercent = totalVehicles > 0 ? ((item.value / totalVehicles) * 100).toFixed(1) : "0"
              
              return (
                <div 
                  key={item.name} 
                  className="flex items-center justify-between text-[11px] p-2 rounded-md bg-muted/20 border border-border/40 hover:bg-muted/40 transition-colors group relative cursor-help"
                  title={item.desc}
                >
                  <div className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full shrink-0" style={{ backgroundColor: item.color }} />
                    <span className="font-medium text-foreground">{item.russian}</span>
                    <span className="text-[10px] text-muted-foreground font-mono hidden sm:inline">({item.name})</span>
                  </div>
                  <div className="flex items-center gap-2 font-mono text-[11px]">
                    <span className="font-bold text-foreground">{item.value} шт.</span>
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

