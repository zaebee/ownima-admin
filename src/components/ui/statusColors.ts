// Status color palette matching the design system
export const STATUS_COLORS = {
  // Common status colors
  total: '#6366f1', // indigo
  pending: '#fbbf24', // yellow
  confirmed: '#10b981', // green
  collected: '#3b82f6', // blue
  completed: '#059669', // emerald
  cancelled: '#ef4444', // red
  maintenance: '#f97316', // orange

  // Vehicle specific
  draft: '#a855f7', // purple
  free: '#22c55e', // green-500
  archived: '#6b7280', // gray
  unspecified: '#94a3b8', // slate-400

  // Reservation specific
  confirmation_by_rider: '#f59e0b', // amber
  confirmation_by_owner: '#fb923c', // orange-400
  overdue: '#dc2626', // red-600
  conflict: '#be123c', // rose-700
  no_response: '#9333ea', // purple-600
};
