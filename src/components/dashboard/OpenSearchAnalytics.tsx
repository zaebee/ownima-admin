import { useState, useEffect } from "react"
import { Server, Loader2, HelpCircle } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { AreaChart, Area, ResponsiveContainer, Tooltip } from "recharts"
import { SEARCH_LATENCY_DATA } from "@/lib/mockData"
import { api } from "@/lib/api"
import { Badge } from "@/components/ui/badge"

export function OpenSearchAnalytics() {
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [isMock, setIsMock] = useState(true)

  useEffect(() => {
    const fetchOpenSearchData = async () => {
      try {
        setLoading(true)
        const response = await api.get('/admin/analytics/opensearch')
        if (response.data) {
          setData(response.data)
          setIsMock(false)
        } else {
          setIsMock(true)
        }
      } catch (e) {
        console.info("OpenSearch API not yet active or returned error, using fallback dashboard stats.")
        setIsMock(true)
      } finally {
        setLoading(false)
      }
    }
    fetchOpenSearchData()
  }, [])

  const searches24h = data?.searches_24h ?? 8420
  const avgLatency = data?.avg_latency_ms ?? 42.5
  const indexSizeGB = data?.index_size_bytes 
    ? (data.index_size_bytes / (1024 * 1024 * 1024)).toFixed(2) 
    : "1.84"
  const totalDocs = data?.total_docs 
    ? (data.total_docs >= 1000 ? `${(data.total_docs / 1000).toFixed(1)}K` : data.total_docs)
    : "284.1K"
  const liveTraffic = data?.live_traffic_req_s ?? 1.2
  const series = data?.traffic_series ?? SEARCH_LATENCY_DATA
  
  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between gap-1">
          <CardTitle className="text-sm font-semibold flex items-center gap-1 text-indigo-600 dark:text-indigo-400 group cursor-help"
                     title="Метрики работы поискового движка OpenSearch: скорость поиска машин клиентами, объем проиндексированных документов и нагрузка на поисковую ноду.">
            <Server className="h-4 w-4 text-indigo-500" />
            OpenSearch Telemetry
            <HelpCircle className="h-3.5 w-3.5 text-muted-foreground/60 group-hover:text-amber-500 transition-colors" />
          </CardTitle>
          <div className="flex items-center gap-1.5 shrink-0">
            {loading && <Loader2 className="h-3 w-3 animate-spin text-muted-foreground" />}
            <Badge variant="outline" className={`text-[8.5px] font-semibold px-1 py-0 ${isMock ? "text-amber-600 dark:text-amber-400 border-amber-500/20 bg-amber-50/5" : "text-emerald-600 dark:text-emerald-400 border-emerald-500/20 bg-emerald-50/5"}`}>
              {isMock ? "API Sandbox Derived" : "Core Backend"}
            </Badge>
          </div>
        </div>
        <CardDescription className="text-xs">
          Производительность поиска предложений аренды и индексы базы XML/JSON
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-4">
        <div className="grid grid-cols-2 gap-4 mb-5">
          <div>
            <p className="text-xs text-muted-foreground mb-1">Searches (24h)</p>
            <div className="flex items-baseline gap-1">
              <span className="text-2xl font-mono font-bold text-emerald-600 dark:text-emerald-400">{searches24h.toLocaleString()}</span>
            </div>
          </div>
          <div>
            <p className="text-xs text-muted-foreground mb-1">Avg Latency</p>
            <div className="flex items-baseline gap-1">
              <span className="text-2xl font-mono font-bold text-blue-600 dark:text-blue-400">{avgLatency}</span>
              <span className="text-xs text-muted-foreground">ms</span>
            </div>
          </div>
          <div>
            <p className="text-xs text-muted-foreground mb-1">Index Size</p>
            <div className="flex items-baseline gap-1">
              <span className="text-xl font-mono font-semibold text-foreground">{indexSizeGB}</span>
              <span className="text-xs text-muted-foreground">GB</span>
            </div>
          </div>
          <div>
            <p className="text-xs text-muted-foreground mb-1">Total Docs</p>
            <div className="flex items-baseline gap-1">
              <span className="text-xl font-mono font-semibold text-foreground">{totalDocs}</span>
            </div>
          </div>
        </div>
        
        <div className="space-y-2 pt-3 border-t">
          <div className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground">Live Traffic (Req/s)</span>
            <span className="text-indigo-600 dark:text-indigo-400 font-mono font-semibold">{liveTraffic}</span>
          </div>
          <div className="h-10 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={series} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorLatency" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#818cf8" stopOpacity={0.5}/>
                    <stop offset="95%" stopColor="#818cf8" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <Tooltip 
                  contentStyle={{ fontSize: '10px', padding: '4px' }} 
                  formatter={(val: any) => [`${val}ms`, 'Latency']}
                  labelFormatter={(lbl) => `Time: ${lbl}`}
                />
                <Area type="monotone" dataKey="latency" stroke="#818cf8" strokeWidth={1.5} fillOpacity={1} fill="url(#colorLatency)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
