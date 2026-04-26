import { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import { Card, CardContent } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { 
  CheckCircle2, 
  XCircle,
  Clock,
  Search,
  Eye,
  AlertTriangle,
  User,
  ShieldCheck
} from "lucide-react"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"

interface VerificationRequest {
  id: string
  user_id: string
  full_name: string
  email: string
  document_type: string
  status: 'pending' | 'approved' | 'rejected'
  submitted_at: string
  risk_score: number
}

const mockVerifications: VerificationRequest[] = [
  {
    id: "ver_123456",
    user_id: "usr_88291",
    full_name: "Alexander Smith",
    email: "alex.smith@example.com",
    document_type: "Driver License",
    status: "pending",
    submitted_at: new Date(Date.now() - 1000 * 60 * 15).toISOString(), // 15 mins ago
    risk_score: 12,
  },
  {
    id: "ver_123457",
    user_id: "usr_99211",
    full_name: "Maria Garcia",
    email: "maria.g@example.com",
    document_type: "Passport",
    status: "pending",
    submitted_at: new Date(Date.now() - 1000 * 60 * 120).toISOString(), // 2 hours ago
    risk_score: 8,
  },
  {
    id: "ver_123458",
    user_id: "usr_77210",
    full_name: "Дмитрий Иванов",
    email: "d.ivanov@mail.ru",
    document_type: "Driver License",
    status: "approved",
    submitted_at: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(), // 1 day ago
    risk_score: 2,
  },
  {
    id: "ver_123459",
    user_id: "usr_55110",
    full_name: "John Doe",
    email: "john.d22@fake-email.com",
    document_type: "ID Card",
    status: "rejected",
    submitted_at: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(), // 2 days ago
    risk_score: 89,
  }
]

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  })
}

export function VerificationsPage() {
  const [verifications, setVerifications] = useState<VerificationRequest[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")

  useEffect(() => {
    // Simulate API fetch
    const fetchVerifications = async () => {
      setLoading(true)
      setTimeout(() => {
        setVerifications(mockVerifications)
        setLoading(false)
      }, 600)
    }
    fetchVerifications()
  }, [])

  const filteredVerifications = verifications.filter(v => 
    v.full_name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    v.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    v.id.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const pendingCount = verifications.filter(v => v.status === 'pending').length

  return (
    <div className="flex flex-col gap-6 max-w-7xl mx-auto animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            Identity Verifications
            {pendingCount > 0 && (
              <Badge variant="destructive" className="ml-2 rounded-full h-6 w-6 p-0 flex items-center justify-center">
                {pendingCount}
              </Badge>
            )}
          </h1>
          <p className="text-muted-foreground mt-1">Review driver licenses and identity documents (KYC).</p>
        </div>
      </div>

      <Card className="overflow-hidden border border-border shadow-sm min-h-[400px]">
        {/* Header/Controls */}
        <div className="px-6 py-4 border-b flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-muted/20">
          <div className="relative w-full max-w-sm">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input 
              type="search"
              placeholder="Search by name, email or ID..." 
              className="pl-9 bg-background"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

      {loading ? (
          <CardContent className="p-0">
            <div className="p-4 space-y-4">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="flex items-center gap-4">
                  <Skeleton className="h-12 w-12 rounded-lg" />
                  <div className="space-y-2 flex-1">
                    <Skeleton className="h-4 w-1/4" />
                    <Skeleton className="h-3 w-1/3" />
                  </div>
                  <Skeleton className="h-8 w-24 rounded-full" />
                </div>
              ))}
            </div>
          </CardContent>
      ) : (
          <CardContent className="p-0 relative">
            <Table className="text-sm">
              <TableHeader className="bg-muted/30">
                <TableRow className="border-b">
                  <TableHead className="w-[80px] pl-4 text-[11px] select-none uppercase tracking-wider font-semibold text-muted-foreground h-10">Status</TableHead>
                  <TableHead className="text-[11px] select-none uppercase tracking-wider font-semibold text-muted-foreground h-10">User / ID</TableHead>
                  <TableHead className="text-[11px] select-none uppercase tracking-wider font-semibold text-muted-foreground h-10">Document Type</TableHead>
                  <TableHead className="text-[11px] select-none uppercase tracking-wider font-semibold text-muted-foreground h-10">Submitted</TableHead>
                  <TableHead className="text-[11px] select-none uppercase tracking-wider font-semibold text-muted-foreground h-10">Risk Score</TableHead>
                  <TableHead className="text-right text-[11px] select-none uppercase tracking-wider font-semibold text-muted-foreground h-10 pr-4">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredVerifications.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="h-32 text-center text-muted-foreground">
                      No verifications found
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredVerifications.map((req) => (
                    <TableRow key={req.id} className="hover:bg-muted/10 border-b border-muted/50 group">
                      <TableCell className="pl-4 py-3">
                        {req.status === 'pending' && <Clock className="h-5 w-5 text-amber-500" />}
                        {req.status === 'approved' && <CheckCircle2 className="h-5 w-5 text-emerald-500" />}
                        {req.status === 'rejected' && <XCircle className="h-5 w-5 text-rose-500" />}
                      </TableCell>
                      <TableCell className="py-3">
                        <div className="flex flex-col">
                          <span className="font-semibold text-foreground group-hover:text-primary transition-colors">{req.full_name}</span>
                          <span className="text-xs text-muted-foreground">{req.email}</span>
                          <span className="text-[10px] text-muted-foreground/50 font-mono mt-0.5">{req.id}</span>
                        </div>
                      </TableCell>
                      <TableCell className="py-3">
                        <Badge variant="outline" className="bg-muted text-muted-foreground border-transparent font-normal">
                          {req.document_type}
                        </Badge>
                      </TableCell>
                      <TableCell className="py-3">
                        <span className="text-xs text-muted-foreground whitespace-nowrap">
                          {formatDate(req.submitted_at)}
                        </span>
                      </TableCell>
                      <TableCell className="py-3">
                        <div className="flex items-center gap-2">
                          <div className={cn(
                            "h-2 w-16 rounded-full overflow-hidden bg-muted",
                          )}>
                            <div 
                              className={cn(
                                "h-full",
                                req.risk_score < 20 ? "bg-emerald-500" : 
                                req.risk_score < 60 ? "bg-amber-500" : "bg-rose-500"
                              )} 
                              style={{ width: `${req.risk_score}%` }} 
                            />
                          </div>
                          <span className={cn(
                            "text-xs font-semibold",
                            req.risk_score >= 60 ? "text-rose-600 dark:text-rose-400" : "text-muted-foreground"
                          )}>
                            {req.risk_score}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="text-right py-3 pr-4">
                        <Button 
                          variant={req.status === 'pending' ? "default" : "secondary"} 
                          size="sm"
                          className={cn(
                            "gap-2",
                            req.status === 'pending' && "bg-blue-600 hover:bg-blue-700"
                          )}
                        >
                          <Eye className="w-4 h-4" />
                          Review
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
      )}
      </Card>
    </div>
  )
}
