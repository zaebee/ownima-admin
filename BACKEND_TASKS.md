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

## Future Insights & Improvement Ideas (For Discussion)
- **WebSockets for Live Dashboard:** Integrating websockets/SSE so the Activity Feed and Dashboard charts update in true real-time.
- **Bulk Actions:** Add functionality for Admin to bulk-verify users or bulk suspend/deactivate accounts to improve operation speed.
- **Dynamic Date Range Analytics:** Currently, widgets like Revenue Flow hardcode '7 days'. Allowing `start_date` and `end_date` parameters will allow admin date-picker filtering.
- **Refund & Dispute Management:** Need endpoints to initiate, track, and log stripe refunds/disputes for reservations directly from Admin panel (e.g. `POST /api/v1/admin/reservations/{id}/refund`).
- **KYC Document Viewer Engine:** For KYC verifications, generating secure, short-lived signed URLs for reviewing driver licenses without downloading.
