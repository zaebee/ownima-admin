import { Activity, TrendingUp } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { MetricsData } from "@/types/dashboard"

interface Props {
  metrics: MetricsData;
}

export function UserEngagementCard({ metrics }: Props) {
  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-semibold flex items-center gap-2">
          <Activity className="h-5 w-5 text-blue-500" />
          User Engagement
        </CardTitle>
        <CardDescription>Live active users and session metrics</CardDescription>
      </CardHeader>
      <CardContent className="mt-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* 30 Days Active Card */}
          <div className="flex flex-col gap-2 p-5 rounded-xl bg-slate-50 border border-slate-100 dark:bg-slate-900/50 dark:border-slate-800">
            <span className="text-sm font-medium text-slate-500">Active (Last 30 Days)</span>
            <div className="flex items-end justify-between mt-2">
              <span className="text-4xl font-bold text-slate-900 dark:text-white">
                {((metrics.users.owners.online_last_30_days || 0) + (metrics.users.riders.online_last_30_days || 0)).toLocaleString()}
              </span>
              <span className="text-sm text-emerald-600 flex items-center bg-emerald-500/10 px-2 py-0.5 rounded-full">
                <TrendingUp className="w-3 h-3 mr-1"/>
                Trending
              </span>
            </div>
            <div className="h-2 w-full bg-slate-200 dark:bg-slate-800 flex mt-6 overflow-hidden rounded-full">
              <div 
                className="bg-blue-500 h-full transition-all duration-500" 
                style={{ width: `${((metrics.users.owners.online_last_30_days || 0) / Math.max((metrics.users.owners.online_last_30_days || 0) + (metrics.users.riders.online_last_30_days || 0), 1)) * 100}%` }}
              ></div>
              <div 
                className="bg-emerald-500 h-full transition-all duration-500" 
                style={{ width: `${((metrics.users.riders.online_last_30_days || 0) / Math.max((metrics.users.owners.online_last_30_days || 0) + (metrics.users.riders.online_last_30_days || 0), 1)) * 100}%` }}
              ></div>
            </div>
            <div className="flex justify-between text-xs mt-3 text-slate-500">
              <span className="flex items-center gap-1.5 font-medium"><div className="w-2 h-2 rounded-full bg-blue-500"></div> Owners: {metrics.users.owners.online_last_30_days || 0}</span>
              <span className="flex items-center gap-1.5 font-medium"><div className="w-2 h-2 rounded-full bg-emerald-500"></div> Riders: {metrics.users.riders.online_last_30_days || 0}</span>
            </div>
          </div>

          {/* Logins Today Card */}
          <div className="flex flex-col gap-2 p-5 rounded-xl bg-slate-50 border border-slate-100 dark:bg-slate-900/50 dark:border-slate-800">
            <span className="text-sm font-medium text-slate-500">Logins Today</span>
            <div className="flex items-end justify-between mt-2">
              <span className="text-4xl font-bold text-slate-900 dark:text-white">
                {((metrics.users.owners.logins_today || 0) + (metrics.users.riders.logins_today || 0)).toLocaleString()}
              </span>
              <span className="text-sm text-blue-600 flex items-center bg-blue-500/10 px-2 py-0.5 rounded-full">
                24h window
              </span>
            </div>
            <div className="h-2 w-full bg-slate-200 dark:bg-slate-800 flex mt-6 overflow-hidden rounded-full">
              <div 
                className="bg-blue-500 h-full transition-all duration-500" 
                style={{ width: `${((metrics.users.owners.logins_today || 0) / Math.max((metrics.users.owners.logins_today || 0) + (metrics.users.riders.logins_today || 0), 1)) * 100}%` }}
              ></div>
              <div 
                className="bg-emerald-500 h-full transition-all duration-500" 
                style={{ width: `${((metrics.users.riders.logins_today || 0) / Math.max((metrics.users.owners.logins_today || 0) + (metrics.users.riders.logins_today || 0), 1)) * 100}%` }}
              ></div>
            </div>
            <div className="flex justify-between text-xs mt-3 text-slate-500">
              <span className="flex items-center gap-1.5 font-medium"><div className="w-2 h-2 rounded-full bg-blue-500"></div> Owners: {metrics.users.owners.logins_today || 0}</span>
              <span className="flex items-center gap-1.5 font-medium"><div className="w-2 h-2 rounded-full bg-emerald-500"></div> Riders: {metrics.users.riders.logins_today || 0}</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
