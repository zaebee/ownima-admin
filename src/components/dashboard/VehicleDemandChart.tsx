import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { PieChart, Pie, Cell, Legend, ResponsiveContainer, Tooltip as RechartsTooltip } from "recharts"
import { VEHICLE_TYPE_DATA } from "@/lib/mockData"

export function VehicleDemandChart() {
  return (
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
  )
}
