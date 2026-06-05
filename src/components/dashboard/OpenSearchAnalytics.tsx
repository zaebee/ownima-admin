import { useState, useEffect } from "react"
import { Server, Loader2, HelpCircle, Database, Cpu, Activity } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { api } from "@/lib/api"
import { Badge } from "@/components/ui/badge"
import { useTranslation } from "@/contexts/LanguageContext"

interface OpenSearchIndex {
  name: string;
  docs: number;
  size_bytes: number;
}

interface OpenSearchResponse {
  cluster_status: string;
  total_docs: number;
  index_size_bytes: number;
  avg_latency_ms: number;
  heap_used_percent: number;
  per_index: OpenSearchIndex[];
}

const MOCK_OPENSEARCH_DATA: OpenSearchResponse = {
  cluster_status: "green",
  total_docs: 284120,
  index_size_bytes: 1975680000, // ~1.84 GB
  avg_latency_ms: 42.5,
  heap_used_percent: 54.0,
  per_index: [
    { name: "vehicles", docs: 12410, size_bytes: 84000000 },
    { name: "reservations", docs: 4520, size_bytes: 35000000 },
    { name: "price-templates", docs: 310, size_bytes: 4000000 },
    { name: "events", docs: 260480, size_bytes: 1840000000 },
    { name: "extra-options", docs: 450, size_bytes: 5200000 },
    { name: "confirmations", docs: 1150, size_bytes: 7480000 }
  ]
}

export function OpenSearchAnalytics() {
  const { t, language } = useTranslation()
  const [data, setData] = useState<OpenSearchResponse | null>(null)
  const [loading, setLoading] = useState(false)
  const [isMock, setIsMock] = useState(true)

  useEffect(() => {
    const fetchOpenSearchData = async () => {
      try {
        setLoading(true)
        const response = await api.get('/admin/analytics/opensearch')
        if (response.data && typeof response.data === 'object') {
          // Validate required structure
          const res = response.data
          if ('cluster_status' in res) {
            setData(res)
            setIsMock(false)
          } else {
            setIsMock(true)
          }
        } else {
          setIsMock(true)
        }
      } catch (e) {
        console.info("OpenSearch API returned error or is uninitialized, using fallback simulator.")
        setIsMock(true)
      } finally {
        setLoading(false)
      }
    }
    fetchOpenSearchData()
  }, [])

  const osData = isMock ? MOCK_OPENSEARCH_DATA : (data || MOCK_OPENSEARCH_DATA)

  const formatBytes = (bytes: number): string => {
    if (bytes === 0) return "0 B"
    const k = 1024
    const sizes = ["B", "KB", "MB", "GB", "TB"]
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`
  }

  const formatDocs = (count: number): string => {
    const docLabel = language === 'ru' ? 'док.' : 'docs'
    if (count >= 1000000) {
      return `${(count / 1000000).toFixed(1)}M ${docLabel}`
    }
    if (count >= 1000) {
      return `${(count / 1000).toFixed(1)}K ${docLabel}`
    }
    return `${count} ${docLabel}`
  }

  // Determine status color and text for indicator
  const getStatusConfig = (status: string) => {
    const s = status.toLowerCase()
    if (s === "green") {
      return {
        color: "text-emerald-500",
        bg: "bg-emerald-500/15 border-emerald-500/30 text-emerald-600 dark:text-emerald-400Icon",
        label: t('healthy', 'opensearch'),
        dot: "bg-emerald-500"
      }
    }
    if (s === "yellow") {
      return {
        color: "text-amber-500",
        bg: "bg-amber-500/15 border-amber-500/30 text-amber-600 dark:text-amber-400",
        label: t('re_sharding', 'opensearch'),
        dot: "bg-amber-500 animate-pulse"
      }
    }
    return {
      color: "text-rose-500",
      bg: "bg-rose-500/15 border-rose-500/30 text-rose-600 dark:text-rose-400",
      label: t('degraded', 'opensearch'),
      dot: "bg-rose-500 animate-bounce"
    }
  }

  const statusConfig = getStatusConfig(osData.cluster_status)

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between gap-1">
          <CardTitle className="text-sm font-semibold flex items-center gap-1.5 text-indigo-600 dark:text-indigo-400 group cursor-help"
                     title={t('desc', 'opensearch')}>
            <Server className="h-4 w-4 text-indigo-500" />
            {t('title', 'opensearch')}
            <HelpCircle className="h-3.5 w-3.5 text-muted-foreground/60 group-hover:text-amber-500 transition-colors" />
          </CardTitle>
          <div className="flex items-center gap-1.5 shrink-0">
            {loading && <Loader2 className="h-3 w-3 animate-spin text-muted-foreground" />}
            <Badge variant="outline" className={`text-[8.5px] font-semibold px-1 py-0 ${isMock ? "text-amber-600 dark:text-amber-400 border-amber-500/20 bg-amber-50/5" : "text-emerald-600 dark:text-emerald-400 border-emerald-500/20 bg-emerald-50/5"}`}>
              {isMock ? t('sandboxBadge') : "Live Cluster Node"}
            </Badge>
          </div>
        </div>
        <CardDescription className="text-xs">
          {t('desc', 'opensearch')}
        </CardDescription>
      </CardHeader>
      
      <CardContent className="pt-4">
        {/* Core Cluster Health Metrics Grid */}
        <div className="grid grid-cols-2 gap-3 mb-5">
          {/* Cluster Status */}
          <div className="p-3 rounded-lg bg-muted/40 border border-border/60">
            <span className="text-[10px] font-medium text-muted-foreground block uppercase tracking-wider">{t('statusHeader', 'opensearch')}</span>
            <div className="flex items-center gap-1.5 mt-1">
              <span className={`h-2.5 w-2.5 rounded-full ${statusConfig.dot}`} />
              <span className="text-sm font-mono font-bold tracking-tight text-foreground uppercase">{statusConfig.label}</span>
            </div>
            <span className="text-[10px] text-muted-foreground mt-1 block">{t('metricsSub', 'opensearch')}</span>
          </div>

          {/* Average Latency */}
          <div className="p-3 rounded-lg bg-muted/40 border border-border/60">
            <span className="text-[10px] font-medium text-muted-foreground block uppercase tracking-wider">{t('latencyHeader', 'opensearch')}</span>
            <div className="flex items-baseline gap-0.5 mt-1">
              <span className="text-base font-mono font-bold text-indigo-600 dark:text-indigo-400">{osData.avg_latency_ms.toFixed(2)}</span>
              <span className="text-xs font-semibold text-muted-foreground">{language === 'ru' ? 'мс' : 'ms'}</span>
            </div>
            <span className="text-[10px] text-muted-foreground mt-1 block">{t('latencySub', 'opensearch')}</span>
          </div>

          {/* Memory Heap */}
          <div className="p-3 rounded-lg bg-muted/40 border border-border/60 col-span-2">
            <div className="flex justify-between items-center text-[10px] font-medium text-muted-foreground uppercase tracking-wider mb-2">
              <span className="flex items-center gap-1">
                <Cpu className="h-3 w-3 text-indigo-500" /> {t('heapHeader', 'opensearch')}
              </span>
              <span className="font-mono text-foreground font-bold">{osData.heap_used_percent.toFixed(1)}%</span>
            </div>
            <div className="w-full bg-muted-foreground/10 rounded-full h-1.5 overflow-hidden">
              <div 
                className={`h-full transition-all duration-300 ${
                  osData.heap_used_percent > 85 ? 'bg-rose-500' : osData.heap_used_percent > 70 ? 'bg-amber-500' : 'bg-indigo-500'
                }`}
                style={{ width: `${osData.heap_used_percent}%` }}
              />
            </div>
            <div className="flex justify-between text-[9px] text-muted-foreground mt-1">
              <span>{t('heapSub', 'opensearch')}</span>
              <span>{t('totalSize', 'opensearch')}: {formatBytes(osData.index_size_bytes)}</span>
            </div>
          </div>
        </div>

        {/* Individual Indices registry list */}
        <div className="pt-3 border-t">
          <div className="flex items-center justify-between text-xs font-semibold text-muted-foreground mb-3">
            <span className="flex items-center gap-1">
              <Database className="h-3 w-3 text-indigo-500" /> {t('registriesHeader', 'opensearch')}
            </span>
            <span className="font-mono text-[10px]">
              {osData.per_index.length} {t('indexesCount', 'opensearch')} • {formatDocs(osData.total_docs)}
            </span>
          </div>

          <div className="space-y-2 max-h-[140px] overflow-y-auto pr-1">
            {osData.per_index.map((index, idx) => (
              <div 
                key={index.name} 
                className="flex items-center justify-between text-[11px] p-2 rounded-md bg-muted/30 border border-border/40 hover:bg-muted/50 transition-colors"
               >
                <span className="font-mono text-indigo-600 dark:text-indigo-400 font-semibold truncate max-w-[130px] sm:max-w-xs">{index.name}</span>
                <div className="flex items-center gap-2 shrink-0">
                  <Badge variant="secondary" className="bg-muted/60 text-[9.5px] px-1 py-0 pointer-events-none text-foreground font-mono">
                    {formatDocs(index.docs)}
                  </Badge>
                  <span className="text-[10px] font-mono text-muted-foreground w-[55px] text-right">
                    {formatBytes(index.size_bytes)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

