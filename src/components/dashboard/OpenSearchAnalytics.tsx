import { Server } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { AreaChart, Area, ResponsiveContainer } from "recharts"
import { SEARCH_LATENCY_DATA } from "@/lib/mockData"

export function OpenSearchAnalytics() {
  const totalSearches = 8420
  
  return (
    <Card className="bg-slate-900 text-slate-50 border-slate-800 hover:shadow-lg transition-all">
      <CardHeader className="pb-2 text-slate-50">
        <CardTitle className="text-sm font-semibold flex items-center gap-2 text-indigo-400">
          <Server className="h-4 w-4" />
          OpenSearch Analytics
          <span className="text-[9px] uppercase tracking-wider bg-indigo-500/20 text-indigo-300 px-1.5 py-0.5 rounded-sm ml-auto">Core Backend</span>
        </CardTitle>
        <CardDescription className="text-slate-400 text-xs">Search engine metrics & throughput</CardDescription>
      </CardHeader>
      <CardContent className="pt-4">
        <div className="grid grid-cols-2 gap-4 mb-5">
          <div>
            <p className="text-xs text-slate-400 mb-1">Searches (24h)</p>
            <div className="flex items-baseline gap-1">
              <span className="text-2xl font-mono text-emerald-400">{totalSearches.toLocaleString()}</span>
            </div>
          </div>
          <div>
            <p className="text-xs text-slate-400 mb-1">Avg Latency</p>
            <div className="flex items-baseline gap-1">
              <span className="text-2xl font-mono text-blue-400">42</span>
              <span className="text-xs text-slate-500">ms</span>
            </div>
          </div>
          <div>
            <p className="text-xs text-slate-400 mb-1">Index Size</p>
            <div className="flex items-baseline gap-1">
              <span className="text-xl font-mono text-slate-200">1.84</span>
              <span className="text-xs text-slate-500">GB</span>
            </div>
          </div>
          <div>
            <p className="text-xs text-slate-400 mb-1">Total Docs</p>
            <div className="flex items-baseline gap-1">
              <span className="text-xl font-mono text-slate-200">284.1K</span>
            </div>
          </div>
        </div>
        
        <div className="space-y-2 pt-3 border-t border-slate-800">
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-400">Live Traffic (Req/s)</span>
            <span className="text-indigo-400 font-mono">1.2</span>
          </div>
          <div className="h-10 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={SEARCH_LATENCY_DATA} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorLatency" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#818cf8" stopOpacity={0.5}/>
                    <stop offset="95%" stopColor="#818cf8" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <Area type="step" dataKey="latency" stroke="#818cf8" strokeWidth={1.5} fillOpacity={1} fill="url(#colorLatency)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
