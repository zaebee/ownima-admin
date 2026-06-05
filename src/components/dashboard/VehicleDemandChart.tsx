import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { PieChart, Pie, Cell, Legend, ResponsiveContainer, Tooltip as RechartsTooltip } from "recharts"
import { VEHICLE_TYPE_DATA } from "@/lib/mockData"
import { HelpCircle } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { useTranslation } from "@/contexts/LanguageContext"

export function VehicleDemandChart() {
  const { t, language } = useTranslation()

  const translatedData = VEHICLE_TYPE_DATA.map(item => {
    let localName = item.name
    if (language === 'ru') {
      if (item.name === 'Sedan') localName = 'Седан'
      if (item.name === 'SUV') localName = 'Внедорожник'
      if (item.name === 'Scooter') localName = 'Самокат / Скутер'
      if (item.name === 'Convertible') localName = 'Кабриолет'
    }
    return { ...item, name: localName }
  })

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base font-semibold flex items-center gap-1.5 group cursor-help"
                     title={t('desc', 'demand')}>
            {t('title', 'demand')}
            <HelpCircle className="h-4 w-4 text-muted-foreground/60 group-hover:text-amber-500 transition-colors" />
          </CardTitle>
          <Badge variant="outline" className="text-[9px] font-semibold text-amber-600 dark:text-amber-400 border-amber-500/20 px-1.5 py-0">
            {t('sandboxStatic')}
          </Badge>
        </div>
        <CardDescription className="text-xs">
          {t('desc', 'demand')}
        </CardDescription>
      </CardHeader>
      <CardContent className="h-[250px]">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={translatedData}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={90}
              paddingAngle={5}
              dataKey="value"
              animationDuration={1000}
            >
              {translatedData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <RechartsTooltip 
              formatter={(value: number) => [`${value} ${t('tooltipValue', 'demand')}`, t('countLabel', 'demand')]}
              contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
            />
            <Legend verticalAlign="bottom" height={36} iconType="circle" wrapperStyle={{ fontSize: '12px' }}/>
          </PieChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}
