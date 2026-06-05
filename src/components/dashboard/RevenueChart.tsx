import { useState, useEffect } from "react"
import { DollarSign, Loader2, HelpCircle } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer } from "recharts"
import { api } from "@/lib/api"
import { REVENUE_DATA } from "@/lib/mockData"
import { Badge } from "@/components/ui/badge"
import { useTranslation } from "@/contexts/LanguageContext"

export function RevenueChart() {
  const { t, language } = useTranslation()
  const [data, setData] = useState<any[]>(REVENUE_DATA)
  const [loading, setLoading] = useState(false)
  const [isMock, setIsMock] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        const response = await api.get('/admin/analytics/revenue', { params: { days: 7 } })
        if (response.data && response.data.length > 0) {
          setData(response.data)
          setIsMock(false)
        } else {
          setIsMock(true)
        }
      } catch (e) {
        console.info("Revenue API not yet available, falling back to mock data.")
        setIsMock(true)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  return (
    <Card className="md:col-span-5 flex flex-col hover:shadow-md transition-shadow">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base font-semibold flex items-center gap-2 group cursor-help"
                     title={t('desc', 'revenue')}>
            <DollarSign className="h-5 w-5 text-emerald-500" />
            {t('title', 'revenue')}
            <HelpCircle className="h-4 w-4 text-muted-foreground/60 group-hover:text-amber-500 transition-colors" />
          </CardTitle>
          <div className="flex items-center gap-2">
            {loading && <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />}
            <Badge variant="outline" className={`text-[9px] font-semibold tracking-wide px-1.5 py-0 ${isMock ? "text-amber-600 dark:text-amber-400 border-amber-500/20" : "text-emerald-600 dark:text-emerald-400 border-emerald-500/20"}`}>
              {isMock ? t('sandboxBadge') : "Live Real-Time Data"}
            </Badge>
          </div>
        </div>
        <CardDescription className="text-xs">
          {t('desc', 'revenue')}
        </CardDescription>
      </CardHeader>
      <CardContent className="h-[300px] flex-1 mt-4">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
              </linearGradient>
              <linearGradient id="colorFee" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.2}/>
                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" className="dark:stroke-slate-800" />
            <XAxis 
              dataKey={data[0]?.date ? "date" : "day"} 
              axisLine={false} 
              tickLine={false} 
              tick={{ fontSize: 11, fill: '#6b7280' }} 
              dy={10} 
              tickFormatter={(val) => {
                if (!val) return "";
                if (typeof val === 'string' && val.includes('-')) {
                  try {
                    const d = new Date(val);
                    return d.toLocaleDateString(language === 'ru' ? "ru-RU" : "en-US", { month: "short", day: "numeric" });
                  } catch {
                    return val;
                  }
                }
                return val;
              }}
            />
            <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#6b7280' }} width={80} tickFormatter={(v: number) => `$${v}`} />
            <RechartsTooltip 
              contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
              formatter={(value: number, name: string) => {
                const formattedName = name === 'platform_fee' ? t('platformFees', 'revenue') : t('tooltipName', 'revenue');
                return [`$${value.toLocaleString()}`, formattedName];
              }}
              labelFormatter={(label) => `${language === 'ru' ? 'Дата' : 'Date'}: ${label}`}
            />
            <Area type="monotone" dataKey="revenue" name="revenue" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#colorRevenue)" />
            <Area type="monotone" dataKey="platform_fee" name="platform_fee" stroke="#3b82f6" strokeWidth={2} fillOpacity={1} fill="url(#colorFee)" />
          </AreaChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}
