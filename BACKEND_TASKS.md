# Backend Tasks

## 1. Admin Impersonate
Allows an admin to get an auth token for a specific user to log in as them and troubleshoot issues.
- **Endpoint:** `POST /api/v1/admin/users/{id}/impersonate`
- **Request:** (Requires SUPERUSER or ADMIN role)
- **Response:** `{ "access_token": "..." }`

## 2. View Deleted Accounts
Extend the user list endpoint to allow fetching suspended/deleted accounts.
- **Endpoint Change:** `GET /api/v1/admin/users` and `GET /api/v1/admin/riders`
- **Addition:** Add query parameter `include_deleted=true` or filter `status=DELETED`.

## 3. Track Last Online Effectively
Ensure that user `last_login_at` is updated properly during token generation or token usage securely without degrading API performance.

## 4. Revenue Flow Chart API
Provides data to render "Revenue Flow (Last 7 Days)" dashboard widget.
- **Endpoint:** `GET /api/v1/admin/analytics/revenue`
- **Parameters:** `days=7`
- **Response:** Array of data points `[{ date: "2026-04-20", revenue: 1500, platform_fee: 150 }, ...]`

## 5. Bugfix: Vehicle List API Pagination
- **Issue:** `GET /api/v1/admin/vehicles` is returning static pagination numbers (`page: 1, size: 50, total_pages: 3`) regardless of provided `limit`/`skip` combinations.
- **Fix:** Properly calculate pagination bounds and total count from database query in the `/api/v1/admin/vehicles` endpoint.

## 6. Rider Stats (Reservations & Completion Rate)
- **Issue:** The UI needs total reservations, completed reservations, and a completion rate for riders.
- **Fix:** Embed `total_reservations`, `completed_reservations`, and `completion_rate` in the Rider object schema (`GET /api/v1/admin/riders` and `GET /api/v1/admin/riders/{id}`).

## 7. Rider's Reservations List
- **Issue:** Ensure we have an endpoint to list reservations for a given rider to display in the rider's details page.
- **Expected Endpoint:** `GET /api/v1/admin/riders/{id}/reservations` 
*(Alternatively, update `GET /api/v1/admin/reservations` to accept the query parameter `rider_id={id}` and inform frontend)*.

## 8. Unified Activity Feed
- **Issue:** The UI now requires an endpoint that aggregates all activities (users, vehicles, reservations) across the platform sorted globally by timestamp.
- **Endpoint:** `GET /api/v1/admin/activity/all`
- **Parameters:** `skip`, `limit`
- **Response:** Paginated list combining any `ActivityItem` record across the platform, exactly matching the schema of partial `/users`, `/vehicles` endpoints.

## 9. Admin Audit Trail
- **Issue:** Now that Admins can impersonate users and reset showcase data, we must log admin-initiated actions in a separate audit trail.
- **Endpoint:** `GET /api/v1/admin/audit-logs`
- **Response:** Similar to Activity Feed but strictly tracks `ADMIN` role actions (Impersonation started, Dashboard viewed, Data deleted, User suspended).

## 10. OpenSearch Analytics API
Provides real-time index metrics and request volumes for the admin "OpenSearch Analytics" bento widget.
- **Endpoint:** `GET /api/v1/admin/analytics/opensearch`
- **Response Schema:**
```json
{
  "searches_24h": 8420,
  "avg_latency_ms": 42.5,
  "index_size_bytes": 1975684110,
  "total_docs": 284100,
  "live_traffic_req_s": 1.2,
  "traffic_series": [
    { "time": "12:00", "latency": 38 },
    { "time": "12:05", "latency": 45 }
  ]
}
```
- **How to retrieve from OpenSearch cluster:**
  1. **Document Count & Index Size:**
     Use the OpenSearch Index Stats API:
     `GET /_stats/docs,store` or `GET /<index_pattern>/_stats`
     - Extract document count from `indices.<index_name>.primaries.docs.count`
     - Extract size from `indices.<index_name>.primaries.store.size_in_bytes`
  2. **Avg Latency & Searches (24h):**
     Use Node Stats API:
     `GET /_nodes/stats/indices/search`
     - Get `query_total` and `query_time_in_millis` from `nodes.<node_id>.indices.search`
     - `avg_latency = query_time_in_millis / query_total`
     - For historical trends or 24-hour aggregates, query your dedicated system logging index (e.g. `api-requests-*` or `opensearch-metrics-*` index if using an ELK/fluentd shipper), or fall back to high-resolution interval calculation via background scheduler.

## 11. Reservations Hourly Velocity API
Provides 24-hour interval reservation statistics for the current day to populate the "Reservations / Hour (Today)" dashboard widget.
- **Endpoint:** `GET /api/v1/admin/analytics/reservations-velocity`
- **Parameters:** `date` (optional, defaults to today's date in YYYY-MM-DD format)
- **Response Schema:**
```json
[
  { "hour": "00:00", "bookings": 3 },
  { "hour": "01:00", "bookings": 16 },
  { "hour": "02:00", "bookings": 12 },
  { "hour": "03:00", "bookings": 3 },
  { "hour": "23:00", "bookings": 13 }
]
```
- **How to retrieve from database:**
  1. Filter `reservations` table where `created_at` timestamp falls within the targeted 24-hour day boundaries (e.g., `>= 2026-06-04 00:00:00` and `< 2026-06-05 00:00:00` in the application's target timezone/UTC).
  2. Map/group the record counts using DB-specific timing features (for PostgreSQL: `EXTRACT(HOUR FROM created_at)` or `date_trunc('hour', created_at)`).
  3. **Crucial Alignment:** The query must backfill/zero-pad any hour buckets that have 0 entries so that the API always returns a consistent array of exactly 24 data points representing `00:00` through `23:00`.

## Future Insights & Improvement Ideas (For Discussion)
- **WebSockets for Live Dashboard:** Integrating websockets/SSE so the Activity Feed and Dashboard charts update in true real-time.
- **Bulk Actions:** Add functionality for Admin to bulk-verify users or bulk suspend/deactivate accounts to improve operation speed.
- **Dynamic Date Range Analytics:** Currently, widgets like Revenue Flow hardcode '7 days'. Allowing `start_date` and `end_date` parameters will allow admin date-picker filtering.
- **Refund & Dispute Management:** Need endpoints to initiate, track, and log stripe refunds/disputes for reservations directly from Admin panel (e.g. `POST /api/v1/admin/reservations/{id}/refund`).
- **KYC Document Viewer Engine:** For KYC verifications, generating secure, short-lived signed URLs for reviewing driver licenses without downloading.
