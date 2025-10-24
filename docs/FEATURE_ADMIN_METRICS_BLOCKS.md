# Admin Metrics Blocks API v2.0 - Frontend Integration Guide

**Status:** ✅ Implemented & Tested
**Last Updated:** 2025-10-24
**Breaking Changes:** YES - Schema restructured from v1.0

---

## Quick Start

### Endpoint
```http
GET /api/v1/admin/metrics/blocks
```

### Key Changes from v1.0

```typescript
// OLD (v1.0) ❌
users: {
  owners: 145,           // Was a flat number
  riders: 305,           // Was a flat number (WRONG - queried User table)
  logins: 250            // Combined logins
}

// NEW (v2.0) ✅
users: {
  owners: {              // Now nested object with full metrics
    total: 145,
    online_last_30_days: 89,
    logins_today: 23,
    // ... more fields
  },
  riders: {              // Now nested object (CORRECT - queries RiderUser table)
    total: 305,
    online_last_30_days: 181,
    logins_today: 45,
    // ... more fields
  },
  total_users: 450       // NEW: Sum of both
}
```

---

## TypeScript Interfaces

```typescript
export interface OwnerMetrics {
  // Real data from User table
  total: number;
  online_last_30_days: number;
  logins_today: number;

  // Placeholder (returns 0 - not implemented yet)
  internal: number;
  external: number;
  verified: number;
  with_vehicles: number;
  with_active_rentals: number;
}

export interface RiderMetrics {
  // Real data from RiderUser table
  total: number;
  online_last_30_days: number;
  logins_today: number;

  // Placeholder (returns 0 - not implemented yet)
  internal: number;
  external: number;
  with_bookings: number;
  with_completed_trips: number;
  with_active_bookings: number;
}

export interface UserBlockMetrics {
  owners: OwnerMetrics;
  riders: RiderMetrics;
  total_users: number;
}

export interface VehicleBlockMetrics {
  total: number;
  draft: number;
  free: number;
  collected: number;
  maintenance: number;
  archived: number;
}

export interface ReservationBlockMetrics {
  total: number;
  pending: number;
  confirmed: number;
  collected: number;
  completed: number;
  cancelled: number;
  maintenance: number;
}

export interface BlockMetrics {
  users: UserBlockMetrics;
  vehicles: VehicleBlockMetrics;
  reservations: ReservationBlockMetrics;
}
```

---

## Migration Guide

### Step 1: Update Type Imports
```typescript
import type {
  BlockMetrics,
  OwnerMetrics,
  RiderMetrics
} from './types';
```

### Step 2: Update Component Code
```typescript
// Before
const ownerCount = data.users.owners;  // ❌ Breaks
const riderCount = data.users.riders;  // ❌ Breaks

// After
const ownerCount = data.users.owners.total;  // ✅ Works
const riderCount = data.users.riders.total;  // ✅ Works

// New metrics available
const ownersOnline = data.users.owners.online_last_30_days;
const ridersOnline = data.users.riders.online_last_30_days;
const ownerLoginsToday = data.users.owners.logins_today;
const riderLoginsToday = data.users.riders.logins_today;
```

### Step 3: Calculate Activity Rates
```typescript
const ownerActivityRate = data.users.owners.total > 0
  ? Math.round((data.users.owners.online_last_30_days / data.users.owners.total) * 100)
  : 0;

const riderActivityRate = data.users.riders.total > 0
  ? Math.round((data.users.riders.online_last_30_days / data.users.riders.total) * 100)
  : 0;
```

### Step 4: Update Tests
```typescript
// Before
expect(response.users.owners).toBe(145);  // ❌ Fails

// After
expect(response.users.owners.total).toBe(145);  // ✅ Passes
expect(response.users.owners.online_last_30_days).toBeGreaterThanOrEqual(0);
expect(response.users.total_users).toBe(450);
```

---

## Data Architecture

**Two-Table System:**
- **Owners** → `User` table (with role='OWNER')
- **Riders** → `RiderUser` table (separate table)

**Why this matters:**
- Same email can exist in both tables as different accounts
- Riders were incorrectly counted from User table in v1.0
- v2.0 fixes this by querying the correct table

---

## Real vs Placeholder Fields

### ✅ Real Data (Use Confidently)
| Field | Description |
|-------|-------------|
| `owners.total` | Total owner accounts |
| `owners.online_last_30_days` | Owners logged in last 30 days |
| `owners.logins_today` | Owners logged in today |
| `riders.total` | Total rider accounts |
| `riders.online_last_30_days` | Riders logged in last 30 days |
| `riders.logins_today` | Riders logged in today |
| `total_users` | Sum of owners + riders |

### ⚠️ Placeholder Data (Returns 0)
These fields are not yet implemented on backend:
- `internal` / `external` - Registration source tracking
- `verified` - Verification status
- `with_vehicles` / `with_bookings` - Relationship counts
- `with_active_rentals` / `with_active_bookings` - Active relationship counts

**Recommendation:** Hide these fields in UI or show as "Coming Soon"

---

## Performance

- **Response Time:** ~100-200ms
- **Cache:** 5-second server-side cache
- **Optimization:** Uses COUNT queries (10x faster than loading records)
- **Parallelization:** Vehicle and reservation queries run in parallel

---

## Example Response

```json
{
  "users": {
    "owners": {
      "total": 145,
      "online_last_30_days": 89,
      "logins_today": 23,
      "internal": 0,
      "external": 0,
      "verified": 0,
      "with_vehicles": 0,
      "with_active_rentals": 0
    },
    "riders": {
      "total": 305,
      "online_last_30_days": 181,
      "logins_today": 45,
      "internal": 0,
      "external": 0,
      "with_bookings": 0,
      "with_completed_trips": 0,
      "with_active_bookings": 0
    },
    "total_users": 450
  },
  "vehicles": {
    "total": 234,
    "draft": 45,
    "free": 123,
    "collected": 34,
    "maintenance": 12,
    "archived": 20
  },
  "reservations": {
    "total": 1567,
    "pending": 23,
    "confirmed": 45,
    "collected": 12,
    "completed": 1423,
    "cancelled": 56,
    "maintenance": 8
  }
}
```

---

## Frontend Implementation

```typescript
import { useQuery } from '@tanstack/react-query';
import { adminService } from '../services/admin';

export function useAdminMetrics() {
  return useQuery({
    queryKey: ['block-metrics'],
    queryFn: () => adminService.getBlockMetrics(),
    refetchInterval: 30000, // Refresh every 30 seconds
  });
}

// In component
const { data, isLoading, error } = useAdminMetrics();

if (data) {
  console.log('Owner Activity Rate:',
    Math.round((data.users.owners.online_last_30_days / data.users.owners.total) * 100)
  );
}
```

---

## Related Documentation

- Full backend spec: [Backend Team's FEATURE_ADMIN_METRICS_BLOCKS.md](https://beta.ownima.com/api/v1/docs)
- Activity Feed API: [FEATURE_PLAN_ACTIVITY_FEED.md](./FEATURE_PLAN_ACTIVITY_FEED.md)
- RBAC: [RBAC.md](./RBAC.md)

---

**Document Version:** 2.0 (Minified for Frontend)
**Migration Required:** YES
**Backend Support:** Available for questions and bug reports
