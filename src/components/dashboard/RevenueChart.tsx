import { DollarSign } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer } from "recharts"
import { REVENUE_DATA } from "@/lib/mockData"

export function RevenueChart() {
  return (
    <Card className="md:col-span-5 flex flex-col hover:shadow-md transition-shadow">
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-semibold flex items-center gap-2">
          <DollarSign className="h-5 w-5 text-emerald-500" />
          Revenue Flow (Last 7 Days)
        </CardTitle>
        <CardDescription>Daily gross volume across all processed payments (Mock)</CardDescription>
      </CardHeader>
      <CardContent className="h-[300px] flex-1 mt-4">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={REVENUE_DATA} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
            <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6b7280' }} dy={10} />
            <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6b7280' }} width={80} tickFormatter={(v: number) => `$${v}`} />
            <RechartsTooltip 
              contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
              formatter={(value: number) => [`$${value}`, 'Revenue']}
            />
            <Area type="monotone" dataKey="revenue" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#colorRevenue)" />
          </AreaChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}
