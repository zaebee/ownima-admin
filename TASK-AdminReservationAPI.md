# Task: Implement Admin Reservation API Endpoints (List & Details)

**Role:** Backend AI Teammate (Golang/PostgreSQL/OpenSearch)
**Context:** We are continuing to build out the Admin dashboard for our fleet management platform. The frontend team has completed the "Reservations List" grid and the "Reservation Details" page. 
We need you to implement the backend API endpoints to retrieve this reservation data.

Please provide two new endpoints protected by admin authorization.

---

## 1. `GET /api/v1/admin/reservations`

**Purpose:** Returns a paginated list of reservations for the admin grid view.

**Request Parameters:**
- `skip` (int): Offset for pagination.
- `limit` (int): Items per page.
- `q_search` (string, optional): Text search query. Should search across reservation ID, vehicle info (brand/model), and rider/owner names.
- `status` (string, optional): Filter by reservation status (e.g., `Confirmed`, `Active`, `Cancelled`).
- `sort_by` (string, optional): E.g., `created_at_desc`, `total_asc`, `status_desc`.

**Response Format:**
```json
{
  "data": [
    {
      "id": "RES-101",
      "status": "Confirmed",
      "vehicle": "BMW 420d Cabriolet 2018",
      "rider": "Alice Williams",
      "owner": "Demo Account",
      "dates": "Nov 15 - Nov 18", // Or send standard ISO timestamps and we format on UI
      "total": 39100,
      "created_at": "2023-11-01T10:23:00Z"
    }
  ],
  "count": 1,
  "error": ""
}
```

*Note: For the list endpoint, you can either construct the display string for `dates` or pass the start/end timestamps. Returning a flattened representation like the above schema is ideal for our table.*

---

## 2. `GET /api/v1/admin/reservations/:id`

**Purpose:** Returns the complete document for a single reservation for the details view.

**Path Parameters:**
- `id` (string): The Reservation ID.

**Response Format:**
```json
{
  "data": {
    "id": "RES-101",
    "status": "Confirmed",
    "created_at": "2023-11-01T10:23:00Z",
    "dates": {
      "start": "2023-11-15T14:00:00Z",
      "end": "2023-11-18T10:00:00Z",
      "duration_days": 3
    },
    "vehicle": {
      "id": "bmw_420d_cabriolet_2018",
      "name": "BMW 420d Cabriolet 2018",
      "reg_number": "SHOW-0015",
      "image": "https://..."
    },
    "rider": {
      "id": "rider-123",
      "name": "Alice Williams",
      "email": "alice.w@example.com",
      "phone": "+1 555-019-2834",
      "rating": 4.9
    },
    "owner": {
      "id": "5fd5a990-756d-45e4-b4ae-8ade802f11c7",
      "name": "Demo Account",
      "email": "demo@ownima.com"
    },
    "location": {
      "pickup": "Main Depo, Terminal B, Spot 42",
      "dropoff": "Main Depo, Terminal B, Spot 42"
    },
    "financials": {
      "currency": "THB",
      "base_rate": 13000,
      "base_total": 39000,
      "extras": [
        { "id": "delivery", "name": "Delivery within the city", "price": 0 },
        { "id": "baby_seat", "name": "Baby Seat/Booster", "price": 100 }
      ],
      "extras_total": 100,
      "deposit": 30000,
      "grand_total": 39100,
      "payment_status": "Paid"
    }
  },
  "error": ""
}
```

## Considerations for the Backend AI Teammate:
1. **Aggregations / Joins:** The details payload involves merging data from Reservations, Vehicles, and Users (Rider/Owner). Ensure your queries are optimized (using native SQL JOINs or pulling from an enriched index) so that n+1 query issues are avoided.
2. **Permissions:** Return `403 Forbidden` if the caller doesn't have an admin token. Return `404 Not Found` for invalid IDs.
3. **Data Integrity:** The financial fields (`base_total`, `grand_total`, etc.) should accurately reflect the calculated invoice snapshot stored at the time of booking, rather than being recalculated on the fly. 
