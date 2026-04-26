export interface MetricsData {
  users: {
    owners: {
      total: number;
      internal: number;
      external: number;
      online_last_30_days: number;
      logins_today: number;
      verified: number;
      with_vehicles: number;
      with_active_rentals: number;
    };
    riders: {
      total: number;
      internal: number;
      external: number;
      online_last_30_days: number;
      logins_today: number;
      with_bookings: number;
      with_completed_trips: number;
      with_active_bookings: number;
    };
    total_users: number;
  };
  vehicles: {
    total: number;
    unspecified: number;
    draft: number;
    free: number;
    maintenance: number;
    collected: number;
    archived: number;
  };
  reservations: {
    total: number;
    pending: number;
    confirmation_by_rider: number;
    confirmed: number;
    collected: number;
    maintenance: number;
    completed: number;
    cancelled: number;
    overdue: number;
    conflict: number;
    confirmation_by_owner: number;
    no_response: number;
    unspecified: number;
  }
}
