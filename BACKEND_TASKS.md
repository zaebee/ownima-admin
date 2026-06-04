# Backend Tasks

## 1. Admin Impersonate
Allows an admin to get an auth token for a specific user to log in as them and troubleshoot issues.
- **Endpoint:** `POST /admin/users/{id}/impersonate`
- **Request:** (Requires SUPERUSER or ADMIN role)
- **Response:** `{ "access_token": "..." }`

## 2. Admin Activity Feed
A global activity feed/audit trail for admin observability.
- **Endpoint:** `GET /admin/activities` or `GET /admin/audit-logs`
- **Parameters:** pagination (`skip`, `limit`), filtering by `user_id` or `type`.
- **Response:** List of activity models containing `user_id`, `action`, `metadata`, `timestamp`.

## 3. View Deleted Accounts
Extend the user list endpoint to allow fetching suspended/deleted accounts.
- **Endpoint Change:** `GET /admin/users` and `GET /admin/riders`
- **Addition:** Add query parameter `include_deleted=true` or filter `status=DELETED`.

## 4. Track Last Online Effectively
Ensure that user `last_login_at` or `last_active_at` is updated properly during token generation or token usage securely without degrading API performance.

## 5. Revenue Flow Chart API
Provides data to render "Revenue Flow (Last 7 Days)" dashboard widget.
- **Endpoint:** `GET /admin/analytics/revenue`
- **Parameters:** `days=7`
- **Response:** Array of data points `[{ date: "2026-04-20", revenue: 1500, platform_fee: 150 }, ...]`

## 6. Bugfix: Vehicle List API Pagination
- **Issue:** `GET /admin/vehicles` is returning static pagination numbers (`page: 1, size: 50, total_pages: 3`) regardless of provided `limit`/`skip` combinations.
- **Fix:** Properly calculate pagination bounds and total count from database query in the `/admin/vehicles` endpoint.

## 7. Rider Stats (Reservations & Completion Rate)
- **Issue:** The UI needs total reservations, completed reservations, and a completion rate for riders.
- **Fix:** Embed `total_reservations`, `completed_reservations`, and `completion_rate` in the Rider object schema (`GET /admin/riders` and `GET /admin/riders/{id}`).

## 8. Rider's Reservations List
- **Issue:** Ensure we have an endpoint to list reservations for a given rider.
- **Expected Endpoint:** `GET /admin/riders/{id}/reservations` 
*(Alternatively, update `GET /admin/reservations` to accept the query parameter `rider_id={id}` and inform frontend)*.
