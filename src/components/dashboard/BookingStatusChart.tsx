import { CalendarDays } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { PieChart, Pie, Cell, Legend, ResponsiveContainer, Tooltip as RechartsTooltip } from "recharts"
import { MetricsData } from "@/types/dashboard"

interface Props {
  metrics: MetricsData;
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

export function BookingStatusChart({ metrics }: Props) {
  const reservationChartData = [
    { name: 'Completed', value: metrics.reservations.completed, color: '#10b981' },
    { name: 'Confirmed', value: metrics.reservations.confirmed, color: '#3b82f6' },
    { name: 'Cancelled', value: metrics.reservations.cancelled, color: '#ef4444' },
    { name: 'Collected', value: metrics.reservations.collected, color: '#8b5cf6' },
    { name: 'Overdue', value: metrics.reservations.overdue, color: '#f97316' },
  ].filter(d => d.value > 0)

  return (
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
  )
}
