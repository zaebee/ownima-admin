import { useState } from "react"
import { Link } from "react-router-dom"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Search, ArrowDownRight, ArrowUpRight, DollarSign, Wallet, ShieldAlert, Receipt, Filter } from "lucide-react"

// Mock Data
const MOCK_TRANSACTIONS = [
  { id: "TXN-101", date: "2023-11-01T10:25:00Z", type: "Payment", amount: 39100, currency: "THB", status: "Completed", entity: "RES-101", party: "Alice Williams", net_impact: "positive" },
  { id: "TXN-102", date: "2023-11-01T10:25:00Z", type: "Hold", amount: 30000, currency: "THB", status: "Active", entity: "RES-101", party: "Alice Williams", net_impact: "neutral" },
  { id: "TXN-103", date: "2023-11-02T08:00:00Z", type: "Payout", amount: 28000, currency: "THB", status: "Pending", entity: "Monthly October", party: "Demo Account (Owner)", net_impact: "negative" },
  { id: "TXN-104", date: "2023-10-28T14:30:00Z", type: "Fine", amount: 1500, currency: "THB", status: "Completed", entity: "Support Claim #42", party: "Bob Smith", net_impact: "positive" },
  { id: "TXN-105", date: "2023-10-25T09:15:00Z", type: "Refund", amount: 5000, currency: "THB", status: "Processed", entity: "RES-092", party: "Charlie Davis", net_impact: "negative" },
  { id: "TXN-106", date: "2023-10-20T11:00:00Z", type: "Payment", amount: 14500, currency: "THB", status: "Completed", entity: "RES-092", party: "Charlie Davis", net_impact: "positive" },
  { id: "TXN-107", date: "2023-10-20T11:00:00Z", type: "Hold", amount: 15000, currency: "THB", status: "Released", entity: "RES-092", party: "Charlie Davis", net_impact: "neutral" },
]

export function BillingPage() {
  const [searchTerm, setSearchTerm] = useState("")

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

  const getTypeIcon = (type: string, impact: string) => {
    if (type === "Hold") return <ShieldAlert className="h-4 w-4 text-slate-400" />
    if (type === "Fine") return <Receipt className="h-4 w-4 text-rose-500" />
    if (impact === "positive") return <ArrowDownRight className="h-4 w-4 text-emerald-500" />
    if (impact === "negative") return <ArrowUpRight className="h-4 w-4 text-rose-500" />
    return <DollarSign className="h-4 w-4 text-slate-500" />
  }

  const formatAmount = (amount: number, impact: string) => {
    const formatted = amount.toLocaleString()
    if (impact === "positive") return <span className="text-emerald-600 font-semibold">+{formatted}</span>
    if (impact === "negative") return <span className="text-rose-600 font-semibold">-{formatted}</span>
    return <span className="text-slate-600 font-semibold">{formatted}</span>
  }

  return (
    <div className="flex flex-col gap-6 w-full max-w-6xl mx-auto pb-10 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Billing & Payouts</h1>
          <p className="text-muted-foreground mt-1">Manage transactions, holds, refunds, and owner distributions.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
             Export CSV
          </Button>
          <Button>
             Process Payouts
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-6 flex items-center gap-4">
            <div className="p-3 bg-emerald-100 text-emerald-600 rounded-lg">
              <DollarSign className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Platform Revenue (30d)</p>
              <h3 className="text-2xl font-bold">145,200 THB</h3>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6 flex items-center gap-4">
            <div className="p-3 bg-blue-100 text-blue-600 rounded-lg">
              <Wallet className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Pending Payouts</p>
              <h3 className="text-2xl font-bold">84,000 THB</h3>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6 flex items-center gap-4">
            <div className="p-3 bg-amber-100 text-amber-600 rounded-lg">
               <ShieldAlert className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Active Holds (Deposits)</p>
              <h3 className="text-2xl font-bold">120,000 THB</h3>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="pb-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <CardTitle>Transactions Explorer</CardTitle>
            <div className="flex w-full sm:w-auto items-center gap-2">
              <div className="relative w-full sm:w-64">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Search TXN, user, reservations..."
                  className="pl-8 !ring-0"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <Button variant="outline" size="icon">
                <Filter className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <Tabs defaultValue="all" className="w-full">
          <div className="px-6 border-b">
            <TabsList className="bg-transparent h-12 p-0 -mb-px flex justify-start gap-6">
              <TabsTrigger 
                value="all" 
                className="data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none rounded-none px-0"
              >
                All Transactions
              </TabsTrigger>
              <TabsTrigger 
                value="payments" 
                className="data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none rounded-none px-0"
              >
                Payments & Refunds
              </TabsTrigger>
              <TabsTrigger 
                value="holds" 
                className="data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none rounded-none px-0"
              >
                Security Deposits (Holds)
              </TabsTrigger>
              <TabsTrigger 
                value="payouts" 
                className="data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none rounded-none px-0"
              >
                Owner Payouts
              </TabsTrigger>
              <TabsTrigger 
                value="fines" 
                className="data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none rounded-none px-0 text-rose-500 data-[state=active]:border-rose-500"
              >
                Fines & Claims
              </TabsTrigger>
            </TabsList>
          </div>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow className="border-b">
                  <TableHead className="w-[120px] font-medium">Txn ID</TableHead>
                  <TableHead className="font-medium">Date</TableHead>
                  <TableHead className="font-medium">Type</TableHead>
                  <TableHead className="font-medium">Party</TableHead>
                  <TableHead className="font-medium">Related Entity</TableHead>
                  <TableHead className="text-right font-medium">Amount</TableHead>
                  <TableHead className="text-right font-medium">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {MOCK_TRANSACTIONS.map((txn) => {
                  const date = new Date(txn.date)
                  return (
                    <TableRow key={txn.id}>
                      <TableCell className="font-mono text-xs">
                        <Link to={`/transactions/${txn.id}`} className="text-blue-600 hover:underline">
                          {txn.id}
                        </Link>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                        <span className="block text-xs">{date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}</span>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <div className="h-6 w-6 rounded-md bg-muted flex items-center justify-center">
                            {getTypeIcon(txn.type, txn.net_impact)}
                          </div>
                          <span className="font-medium text-sm">{txn.type}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="font-medium text-sm">{txn.party}</span>
                      </TableCell>
                      <TableCell>
                        {txn.entity.startsWith("RES-") ? (
                          <Link to={`/reservations/${txn.entity}`} className="text-blue-600 hover:underline text-sm font-medium">
                            {txn.entity}
                          </Link>
                        ) : (
                          <span className="text-sm text-muted-foreground">{txn.entity}</span>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        {formatAmount(txn.amount, txn.net_impact)} <span className="text-xs text-muted-foreground">{txn.currency}</span>
                      </TableCell>
                      <TableCell className="text-right">
                        {getStatusBadge(txn.status)}
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          </CardContent>
        </Tabs>
      </Card>
    </div>
  )
}
