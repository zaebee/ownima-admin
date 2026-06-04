import { ActivityItem } from "@/types" // We will create or use inline types
import { CheckCircle2, XCircle, Calendar, Car, LogIn, Star, CreditCard, User, Bell } from "lucide-react"
import { Link } from "react-router-dom"

export const getActivityIcon = (type: string) => {
  const upperType = type.toUpperCase()
  if (upperType.includes("COMPLETED")) return <CheckCircle2 className="h-4 w-4" />
  if (upperType.includes("CANCELLED")) return <XCircle className="h-4 w-4" />
  if (upperType.includes("RESERVATION") || upperType.includes("BOOKING")) return <Calendar className="h-4 w-4" />
  if (upperType.includes("VEHICLE")) return <Car className="h-4 w-4" />
  if (upperType.includes("LOGIN") || upperType.includes("AUTH") || upperType.includes("PASSWORD")) return <LogIn className="h-4 w-4" />
  if (upperType.includes("RATING") || upperType.includes("REVIEW")) return <Star className="h-4 w-4" />
  if (upperType.includes("PAYMENT") || upperType.includes("WALLET")) return <CreditCard className="h-4 w-4" />
  if (upperType.includes("USER") || upperType.includes("PROFILE")) return <User className="h-4 w-4" />
  return <Bell className="h-4 w-4" />
}

export const getActivityColor = (type: string) => {
  const upperType = type.toUpperCase()
  if (upperType.includes("CREATE") || upperType.includes("COMPLETED") || upperType.includes("SUCCESS")) return "bg-green-500"
  if (upperType.includes("DELETE") || upperType.includes("CANCEL") || upperType.includes("FAIL") || upperType.includes("ERROR")) return "bg-red-500"
  if (upperType.includes("PUBLISHED")) return "bg-emerald-500"
  if (upperType.includes("UPDATE") || upperType.includes("EDIT")) return "bg-amber-500"
  if (upperType.includes("LOGIN")) return "bg-blue-500"
  if (upperType.includes("COLLECTED")) return "bg-purple-500"
  if (upperType.includes("RESERVATION") || upperType.includes("BOOKING")) return "bg-indigo-500"
  return "bg-slate-500"
}

export const getActivityDescription = (activity: any) => {
  const { activity_type, details } = activity
  
  const formattedType = activity_type.replace(/_/g, ' ').toLowerCase()
  const capitalizedType = formattedType.replace(/\b\w/g, (c: string) => c.toUpperCase())
  
  let context = []
  
  if (details.reservation_id) {
    context.push(
      <span key="res" className="font-medium flex items-center gap-1">
        Booking: <span className="font-mono text-xs bg-muted px-1 py-0.5 rounded text-foreground">{details.reservation_id.substring(0, 8)}</span>
      </span>
    )
  }
  
  if (details.vehicle_id) {
    const vehicleName = details.name || "Vehicle"
    context.push(
      <span key="veh" className="font-medium flex text-muted-foreground items-center gap-1">
        <Link to={`/vehicles/${details.vehicle_id}`} className="hover:underline text-primary flex items-center gap-1">
          {vehicleName} <span className="font-mono text-xs bg-muted/50 px-1 py-0.5 rounded text-primary">{details.vehicle_id.substring(0, 8)}</span>
        </Link>
      </span>
    )
  }
  
  if (details.changes?.status) {
    const from = String(details.changes.status.from || '').replace('VEHICLE_', '')
    const to = String(details.changes.status.to || '').replace('VEHICLE_', '')
    context.push(
      <span key="state_change" className="text-xs font-medium">
        Status: <span className="text-muted-foreground line-through">{from}</span> → <span className="text-foreground">{to}</span>
      </span>
    )
  }

  if (details.changes?.name) {
    const fromName = details.changes.name.from
    const toName = details.changes.name.to
    context.push(
      <span key="name_change" className="text-xs font-medium">
        Renamed to: <span className="text-foreground">{toName}</span>
      </span>
    )
  }
  
  return (
    <div className="flex flex-col">
      <span className="text-sm font-semibold text-foreground">{capitalizedType}</span>
      {context.length > 0 && (
        <div className="text-xs text-muted-foreground mt-1 flex flex-col gap-1">
          {context.map((curr, i) => <div key={i}>{curr}</div>)}
        </div>
      )}
      {context.length === 0 && Object.keys(details || {}).length > 0 && (
        <span className="text-xs text-muted-foreground mt-1 max-w-[400px] truncate font-mono bg-muted/50 p-1 rounded">
          {JSON.stringify(details).replace(/["{}]/g, '')}
        </span>
      )}
    </div>
  )
}
