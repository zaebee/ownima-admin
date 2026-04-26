import { Car } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { PieChart, Pie, Cell, Legend, ResponsiveContainer, Tooltip as RechartsTooltip } from "recharts"
import { MetricsData } from "@/types/dashboard"

interface Props {
  metrics: MetricsData;
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

export function FleetStatusChart({ metrics }: Props) {
  const vehicleChartData = [
    { name: 'Free', value: metrics.vehicles.free, color: '#10b981' },
    { name: 'Rented (Collected)', value: metrics.vehicles.collected, color: '#3b82f6' },
    { name: 'Draft', value: metrics.vehicles.draft, color: '#94a3b8' },
    { name: 'Maintenance', value: metrics.vehicles.maintenance, color: '#f59e0b' },
    { name: 'Archived', value: metrics.vehicles.archived, color: '#ef4444' }
  ].filter(d => d.value > 0)

  return (
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
  )
}
