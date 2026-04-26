import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer } from "recharts"
import { RESERVATIONS_HR_DATA } from "@/lib/mockData"

export function ReservationsVelocityChart() {
  return (
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
  )
}
