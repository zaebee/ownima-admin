import { useState, useEffect } from "react"
import { useParams, Link } from "react-router-dom"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { ChevronLeft, CalendarDays, MapPin, CreditCard, User, Car, ShieldAlert, MessageSquare, CheckCircle2, History } from "lucide-react"
import { api } from "@/lib/api"
import { cn, getReservationStatusColor, getMediaUrl } from "@/lib/utils"

export function ReservationDetailPage() {
  const { id } = useParams()
  const [reservation, setReservation] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchReservation = async () => {
      try {
        setLoading(true)
        const response = await api.get(`/admin/reservations/${id}`)
        setReservation(response.data?.data || response.data)
      } catch (error) {
        console.error("Error fetching reservation:", error)
        setReservation(null)
      } finally {
        setLoading(false)
      }
    }

    if (id) {
      fetchReservation()
    }
  }, [id])

  if (loading) {
    return (
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-6 pb-10 animate-in fade-in duration-500">
        <Skeleton className="h-8 w-40 mb-4" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2 flex flex-col gap-6">
            <Skeleton className="w-full h-[300px] rounded-xl" />
            <Skeleton className="w-full h-[250px] rounded-xl" />
          </div>
          <div className="flex flex-col gap-6">
            <Skeleton className="w-full h-[400px] rounded-xl" />
            <Skeleton className="w-full h-[200px] rounded-xl" />
          </div>
        </div>
      </div>
    )
  }

  if (!reservation) return <div className="p-8 text-center text-muted-foreground">Reservation not found.</div>

  // Format dates securely
  const startDate = reservation.dates?.start ? new Date(reservation.dates.start) : new Date()
  const endDate = reservation.dates?.end ? new Date(reservation.dates.end) : new Date()
  const createdAt = reservation.created_at ? new Date(reservation.created_at) : new Date()

  const formatShort = (d: Date) => { try { return d.toLocaleDateString('en-US', { timeZone: 'UTC', month: 'short', day: 'numeric', year: 'numeric' }) } catch(e) { return "" } }
  const formatTime = (d: Date) => { try { return d.toLocaleTimeString('en-US', { timeZone: 'UTC', hour: '2-digit', minute: '2-digit' }) } catch(e) { return "" } }

  const status = (reservation.status || "Pending").charAt(0).toUpperCase() + (reservation.status || "Pending").slice(1).toLowerCase()
  
  const vehicleName = typeof reservation.vehicle === 'object' && reservation.vehicle ? (reservation.vehicle.name || reservation.vehicle.model || 'Unknown Vehicle') : (reservation.vehicle || 'Unknown Vehicle')
  const vehicleId = typeof reservation.vehicle === 'object' && reservation.vehicle ? reservation.vehicle.id : null
  const vehicleImageRaw = typeof reservation.vehicle === 'object' && reservation.vehicle ? (reservation.vehicle.image || reservation.vehicle?.picture?.cover) : null
  const vehicleImage = vehicleImageRaw ? getMediaUrl(vehicleImageRaw) : 'https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?auto=format&fit=crop&w=400&q=80'
  const vehicleReg = typeof reservation.vehicle === 'object' && reservation.vehicle ? reservation.vehicle.reg_number : ''

  const riderName = typeof reservation.rider === 'object' && reservation.rider ? (reservation.rider.name || reservation.rider.full_name || 'Unknown Rider') : (reservation.rider || 'Unknown Rider')
  const riderEmail = typeof reservation.rider === 'object' && reservation.rider ? reservation.rider.email : ''
  const riderPhone = typeof reservation.rider === 'object' && reservation.rider ? reservation.rider.phone : ''
  const riderRating = typeof reservation.rider === 'object' && reservation.rider ? reservation.rider.rating : null

  const ownerName = typeof reservation.owner === 'object' && reservation.owner ? (reservation.owner.name || reservation.owner.full_name || 'Unknown Owner') : (reservation.owner || 'Unknown Owner')
  const ownerEmail = typeof reservation.owner === 'object' && reservation.owner ? reservation.owner.email : ''

  const pickupLocation = reservation.location?.pickup || reservation.pickup_location || 'Not specified'
  const dropoffLocation = reservation.location?.dropoff || reservation.dropoff_location || 'Not specified'

  const durationDays = reservation.dates?.duration_days || 1
  const currency = reservation.currency || reservation.financials?.currency || 'USD'
  const baseTotal = reservation.total_amount || reservation.financials?.base_total || 0
  const grandTotal = reservation.grand_total || reservation.financials?.grand_total || baseTotal
  const extras = reservation.financials?.extras || []
  const deposit = reservation.deposit || reservation.financials?.deposit || 0
  const paymentStatus = reservation.payment_status || reservation.financials?.payment_status || 'Pending'

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-8 pb-10 animate-in fade-in duration-500">
      {/* Header Actions */}
      <div className="flex items-center justify-between">
        <Link 
          to="/reservations" 
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors group"
        >
          <ChevronLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
          Back to Reservations
        </Link>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="hidden sm:inline-flex text-rose-600 hover:text-rose-700 hover:bg-rose-50 border-rose-200">
            Cancel Booking
          </Button>
          <Button size="sm">
            Edit Details
          </Button>
        </div>
      </div>

      {/* Main Title & Status */}
      <div className="flex flex-col gap-1.5">
        <div className="flex items-center gap-3">
          <h1 className="text-3xl font-bold tracking-tight text-foreground">
            Reservation {reservation.id?.split('-')[0] || reservation.id}
          </h1>
          <span className={cn("px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider", getReservationStatusColor(reservation.status, status))}>
            {status}
          </span>
        </div>
        <p className="text-muted-foreground flex items-center gap-2 text-sm">
          <span>Booked on {formatShort(createdAt)} at {formatTime(createdAt)}</span>
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
        
        {/* LEFT COLUMN */}
        <div className="lg:col-span-2 flex flex-col gap-6 lg:gap-8">
          
          {/* Trip Timeline Details */}
          <Card>
            <CardHeader className="pb-4">
              <CardTitle className="text-lg flex items-center gap-2">
                <CalendarDays className="h-5 w-5 text-muted-foreground" />
                Trip Schedule & Location
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                <div className="flex flex-col gap-4">
                  <div className="flex flex-col">
                    <span className="text-sm font-semibold mb-1">Pick-up</span>
                    <span className="text-lg">{formatShort(startDate)}</span>
                    <span className="text-sm text-muted-foreground mb-3">{formatTime(startDate)}</span>
                    <div className="flex items-start gap-2 text-sm">
                      <MapPin className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />
                      <span className="text-muted-foreground">{pickupLocation}</span>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col gap-4 relative">
                  {/* Visual connector for desktop */}
                  <div className="hidden sm:block absolute left-[-2rem] top-2 bottom-6 w-[1px] bg-border" />
                  
                  <div className="flex flex-col">
                    <span className="text-sm font-semibold mb-1">Drop-off</span>
                    <span className="text-lg">{formatShort(endDate)}</span>
                    <span className="text-sm text-muted-foreground mb-3">{formatTime(endDate)}</span>
                    <div className="flex items-start gap-2 text-sm">
                      <MapPin className="h-4 w-4 text-rose-500 shrink-0 mt-0.5" />
                      <span className="text-muted-foreground">{dropoffLocation}</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Involved Parties */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <User className="h-4 w-4 text-muted-foreground" />
                  Rider Details
                </CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col gap-3">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-slate-100 flex items-center justify-center font-bold text-slate-600">
                    {riderName.charAt(0)}
                  </div>
                  <div>
                    <p className="font-semibold">{riderName}</p>
                    {riderRating && (
                      <div className="flex items-center text-xs text-amber-500 font-medium">
                        ★ {riderRating} Rating
                      </div>
                    )}
                  </div>
                </div>
                <div className="text-sm border-t pt-3 mt-1 flex flex-col gap-1.5 text-muted-foreground">
                  <p>{riderEmail}</p>
                  <p>{riderPhone}</p>
                </div>
                <Button variant="outline" className="w-full mt-2" size="sm">
                  <MessageSquare className="h-4 w-4 mr-2" />
                  Contact Rider
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <Car className="h-4 w-4 text-muted-foreground" />
                  Vehicle & Owner
                </CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col gap-3">
                {vehicleId ? (
                  <Link to={`/vehicles/${vehicleId}`} className="group">
                    <div className="flex items-center justify-between border border-border p-2 rounded-lg bg-muted/20 group-hover:border-blue-500/50 group-hover:bg-blue-50/50 transition-colors">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-14 rounded overflow-hidden">
                          <img src={vehicleImage} alt="car" className="w-full h-full object-cover" />
                        </div>
                        <div>
                          <p className="font-semibold text-sm group-hover:text-blue-600 transition-colors">{vehicleName}</p>
                          <p className="text-xs text-muted-foreground font-mono">{vehicleReg}</p>
                        </div>
                      </div>
                    </div>
                  </Link>
                ) : (
                  <div className="flex items-center justify-between border border-border p-2 rounded-lg bg-muted/20">
                    <div className="flex items-center gap-3">
                       <div className="h-10 w-14 rounded overflow-hidden">
                          <img src={vehicleImage} alt="car" className="w-full h-full object-cover" />
                       </div>
                       <div>
                         <p className="font-semibold text-sm">{vehicleName}</p>
                         <p className="text-xs text-muted-foreground font-mono">{vehicleReg}</p>
                       </div>
                    </div>
                  </div>
                )}
                <div className="text-sm mt-1 flex flex-col gap-1.5 text-muted-foreground">
                  <p><span className="font-medium text-foreground">Owner:</span> {ownerName}</p>
                  <p>{ownerEmail}</p>
                </div>
              </CardContent>
            </Card>
          </div>
          
        </div>

        {/* RIGHT COLUMN */}
        <div className="flex flex-col gap-6 lg:gap-8">
          
          {/* Financials */}
          <Card className="bg-slate-900 border-slate-800 text-slate-50 relative overflow-hidden">
            <div className="absolute -right-4 -top-4 opacity-5 pointer-events-none">
              <CreditCard className="w-32 h-32" />
            </div>
            <CardHeader className="pb-2 relative z-10">
              <CardTitle className="text-base flex items-center justify-between">
                Payment Summary
                {paymentStatus === "Paid" && (
                  <Badge className="bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/20 border-emerald-500/30">
                    <CheckCircle2 className="h-3 w-3 mr-1" /> Paid
                  </Badge>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent className="relative z-10 pt-4">
              <div className="flex flex-col gap-3 text-sm">
                
                <div className="flex justify-between items-center text-slate-300">
                  <span>Base Rate ({durationDays} days)</span>
                  <span>{baseTotal.toLocaleString()} {currency}</span>
                </div>
                
                {extras.map((extra: any) => (
                  <div key={extra.id || extra.name} className="flex justify-between items-center text-slate-400 text-xs pl-2 border-l border-slate-700">
                    <span>+ {extra.name}</span>
                    <span>{extra.price > 0 ? `${extra.price.toLocaleString()} ${currency}` : "Free"}</span>
                  </div>
                ))}
                
                <div className="border-t border-slate-800 my-2" />
                
                <div className="flex justify-between items-end">
                  <span className="text-sm font-medium text-slate-300">Grand Total</span>
                  <div className="flex items-baseline gap-1 text-emerald-400">
                     <span className="text-2xl font-bold">{grandTotal.toLocaleString()}</span>
                     <span className="text-xs uppercase">{currency}</span>
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t border-slate-800">
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-slate-400 flex items-center gap-1.5"><ShieldAlert className="h-3.5 w-3.5"/> Security Deposit</span>
                    <span className="font-medium text-slate-50">{deposit ? deposit.toLocaleString() : 0} {currency}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Action Log / Warning */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <History className="h-4 w-4 text-muted-foreground" />
                Activity Log
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col gap-4 text-sm">
                <div className="flex gap-4">
                  <div className="flex flex-col items-center">
                    <div className="h-2 w-2 rounded-full bg-emerald-500 mt-1.5" />
                    <div className="w-[1px] h-full bg-border mt-1" />
                  </div>
                  <div className="pb-4">
                    <p className="font-medium">Booking Confirmed</p>
                    <p className="text-xs text-muted-foreground mt-0.5">Payment processed successfully</p>
                    <p className="text-xs text-muted-foreground">Nov 1, 10:25 AM</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="flex flex-col items-center">
                    <div className="h-2 w-2 rounded-full bg-blue-500 mt-1.5" />
                  </div>
                  <div>
                    <p className="font-medium">Booking Created</p>
                    <p className="text-xs text-muted-foreground mt-0.5">By Alice Williams</p>
                    <p className="text-xs text-muted-foreground">Nov 1, 10:23 AM</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

        </div>
      </div>
    </div>
  )
}
