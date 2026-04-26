import { ShieldAlert, AlertCircle } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { MetricsData } from "@/types/dashboard"

interface Props {
  metrics: MetricsData;
}

export function ActionRequiredAlerts({ metrics }: Props) {
  const authFailures = 421 // Mock data

  return (
    <Card className="md:col-span-2 flex flex-col bg-slate-50 dark:bg-slate-900 border-none relative overflow-hidden">
      <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
        <ShieldAlert className="h-32 w-32" />
      </div>
      <CardHeader className="pb-2 relative z-10">
        <CardTitle className="text-base font-semibold flex items-center gap-2 text-rose-600 dark:text-rose-400">
          <AlertCircle className="h-5 w-5" />
          Action Required
        </CardTitle>
        <CardDescription>Operational exceptions</CardDescription>
      </CardHeader>
      <CardContent className="flex-1 relative z-10 pt-4">
        <ul className="space-y-4">
          <li className="flex items-center justify-between border-b border-border/50 pb-3">
            <span className="text-sm font-medium text-slate-700 dark:text-slate-200">Overdue Reservations</span>
            <span className="text-sm font-bold bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-400 px-2 py-0.5 rounded-full">{metrics.reservations.overdue}</span>
          </li>
          <li className="flex items-center justify-between border-b border-border/50 pb-3">
            <span className="text-sm font-medium text-slate-700 dark:text-slate-200">Booking Conflicts</span>
            <span className="text-sm font-bold bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-400 px-2 py-0.5 rounded-full">{metrics.reservations.conflict}</span>
          </li>
          <li className="flex items-center justify-between border-b border-border/50 pb-3">
            <span className="text-sm font-medium text-slate-700 dark:text-slate-200">No Responses</span>
            <span className="text-sm font-bold bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400 px-2 py-0.5 rounded-full">{metrics.reservations.no_response}</span>
          </li>
          <li className="flex items-center justify-between pb-1">
            <span className="text-sm font-medium text-slate-700 dark:text-slate-200">Auth Failures (24h)</span>
            <span className="text-sm font-bold bg-slate-200 text-slate-700 dark:bg-slate-800 dark:text-slate-300 px-2 py-0.5 rounded-full">{authFailures}</span>
          </li>
        </ul>
      </CardContent>
    </Card>
  )
}
