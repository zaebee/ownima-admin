export const REVENUE_DATA = [
  { day: "Mon", revenue: 4200, payments: 14 },
  { day: "Tue", revenue: 5100, payments: 18 },
  { day: "Wed", revenue: 3800, payments: 12 },
  { day: "Thu", revenue: 6400, payments: 24 },
  { day: "Fri", revenue: 8900, payments: 38 },
  { day: "Sat", revenue: 11200, payments: 52 },
  { day: "Sun", revenue: 10500, payments: 48 },
]

export const RESERVATIONS_HR_DATA = Array.from({ length: 24 }).map((_, i) => ({
  time: `${i}:00`,
  bookings: Math.floor(Math.random() * 15) + (i > 8 && i < 20 ? 10 : 2)
}))

export const SEARCH_LATENCY_DATA = Array.from({ length: 20 }).map((_, i) => ({
  time: i,
  latency: Math.floor(Math.random() * 30) + 20,
}))

export const VEHICLE_TYPE_DATA = [
  { name: 'Sedan', value: 340, color: '#3b82f6' },
  { name: 'SUV', value: 215, color: '#10b981' },
  { name: 'Scooter', value: 480, color: '#f59e0b' },
  { name: 'Convertible', value: 85, color: '#8b5cf6' },
]
