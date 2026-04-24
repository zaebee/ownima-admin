import { useParams, Link } from "react-router-dom"
import { ArrowLeft, ArrowDownRight, ArrowUpRight, DollarSign, ShieldAlert, Receipt, CheckCircle2, Clock, FileText, CreditCard, ExternalLink } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"

export function TransactionDetailPage() {
  const { id } = useParams()

  // Mock data for the specific transaction
  const txn = {
    id: id || "TXN-101",
    date: "2023-11-01T10:25:00Z",
    type: "Payment",
    amount: 39100,
    currency: "THB",
    status: "Completed",
    entity: "RES-101",
    party: "Alice Williams",
    party_type: "Rider",
    party_id: "USR-082",
    net_impact: "positive",
    payment_method: "**** **** **** 4242",
    stripe_charge_id: "ch_3P4vX2J....",
    description: "Reservation Payment for Toyota Camry (Oct 2 - Oct 5)",
    fee_breakdown: [
      { label: "Rental Total (3 days)", amount: 30000 },
      { label: "Platform Fee (15%)", amount: 4500 },
      { label: "Insurance Premium", amount: 3000 },
      { label: "VAT (7%)", amount: 1600 }
    ],
    timeline: [
      { state: "Created", date: "2023-11-01T10:24:10Z" },
      { state: "Authorized", date: "2023-11-01T10:24:15Z" },
      { state: "Captured", date: "2023-11-01T10:25:00Z" }
    ]
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "Completed":
      case "Processed":
      case "Released":
        return <Badge className="bg-emerald-500 hover:bg-emerald-600 text-white font-medium border-transparent">✓ {status}</Badge>
      case "Pending":
      case "Active":
        return <Badge className="bg-amber-500 hover:bg-amber-600 text-white font-medium border-transparent">{status}</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  const getTypeIcon = (type: string, impact: string, className = "h-4 w-4") => {
    if (type === "Hold") return <ShieldAlert className={className} />
    if (type === "Fine") return <Receipt className={className} />
    if (impact === "positive") return <ArrowDownRight className={className} />
    if (impact === "negative") return <ArrowUpRight className={className} />
    return <DollarSign className={className} />
  }

  const impactColor = txn.net_impact === "positive" ? "text-emerald-500" : txn.net_impact === "negative" ? "text-rose-500" : "text-slate-500"
  
  return (
    <div className="flex flex-col gap-6 w-full max-w-5xl mx-auto pb-10 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link to="/billing">
            <ArrowLeft className="h-5 w-5" />
          </Link>
        </Button>
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold tracking-tight">Transaction {txn.id}</h1>
            {getStatusBadge(txn.status)}
          </div>
          <p className="text-muted-foreground mt-1 text-sm">
            {new Date(txn.date).toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' })}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Main Details */}
        <div className="md:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Amount Details</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-4 mb-6">
                <div className={`p-4 rounded-full bg-slate-100 dark:bg-slate-800 ${impactColor}`}>
                  {getTypeIcon(txn.type, txn.net_impact, "h-8 w-8")}
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">{txn.type}</p>
                  <h2 className="text-4xl font-bold tracking-tight">
                    {txn.net_impact === 'positive' ? '+' : txn.net_impact === 'negative' ? '-' : ''}
                    {txn.amount.toLocaleString()} <span className="text-xl text-muted-foreground font-medium">{txn.currency}</span>
                  </h2>
                </div>
              </div>

              <div className="space-y-3">
                <h4 className="text-sm font-medium text-slate-900 dark:text-slate-100">Fee Breakdown</h4>
                <div className="rounded-lg border bg-slate-50/50 dark:bg-slate-900/50 p-4 space-y-3">
                  {txn.fee_breakdown.map((fee, i) => (
                    <div key={i} className="flex justify-between items-center text-sm">
                      <span className="text-muted-foreground">{fee.label}</span>
                      <span className="font-medium">{fee.amount.toLocaleString()} {txn.currency}</span>
                    </div>
                  ))}
                  <Separator className="my-2" />
                  <div className="flex justify-between items-center font-medium text-base">
                    <span>Total</span>
                    <span>{txn.amount.toLocaleString()} {txn.currency}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
             <CardHeader>
               <CardTitle>Description</CardTitle>
             </CardHeader>
             <CardContent>
               <p className="text-slate-700 dark:text-slate-300">{txn.description}</p>
             </CardContent>
          </Card>
        </div>

        {/* Sidebar Info */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Related Entities</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-xs text-muted-foreground font-medium mb-1 uppercase tracking-wider">Party</p>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="h-8 w-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-xs">
                      {txn.party.charAt(0)}
                    </div>
                    <div>
                      <p className="text-sm font-medium">{txn.party}</p>
                      <p className="text-xs text-muted-foreground">{txn.party_type}</p>
                    </div>
                  </div>
                  <Button variant="ghost" size="icon" asChild>
                    <Link to={`/${txn.party_type === 'Rider' ? 'riders' : 'owners'}/${txn.party_id}`}>
                      <ExternalLink className="h-4 w-4 text-muted-foreground" />
                    </Link>
                  </Button>
                </div>
              </div>
              <Separator />
              <div>
                <p className="text-xs text-muted-foreground font-medium mb-1 uppercase tracking-wider">Entity</p>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4 text-slate-500" />
                    <p className="text-sm font-medium">{txn.entity}</p>
                  </div>
                  {txn.entity.startsWith("RES-") && (
                    <Button variant="ghost" size="icon" asChild>
                      <Link to={`/reservations/${txn.entity}`}>
                        <ExternalLink className="h-4 w-4 text-muted-foreground" />
                      </Link>
                    </Button>
                  )}
                </div>
              </div>
              <Separator />
              <div>
                <p className="text-xs text-muted-foreground font-medium mb-1 uppercase tracking-wider">Payment Method</p>
                <div className="flex items-center gap-2">
                  <CreditCard className="h-4 w-4 text-slate-500" />
                  <p className="text-sm font-medium">{txn.payment_method}</p>
                </div>
                <p className="text-xs text-muted-foreground mt-1 font-mono">{txn.stripe_charge_id}</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Timeline</CardTitle>
            </CardHeader>
            <CardContent>
               <div className="space-y-4">
                  {txn.timeline.map((event, i) => (
                    <div key={i} className="flex gap-3">
                      <div className="flex flex-col items-center">
                        <div className="h-2 w-2 rounded-full bg-blue-500 mt-1.5" />
                        {i < txn.timeline.length - 1 && <div className="w-px h-full bg-border my-1" />}
                      </div>
                      <div>
                        <p className="text-sm font-medium">{event.state}</p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(event.date).toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' })}
                        </p>
                      </div>
                    </div>
                  ))}
               </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
