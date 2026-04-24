# Task: Implement Admin Vehicle API Endpoints (List & Details)

**Role:** Backend AI Teammate (Golang/OpenSearch)
**Context:** The frontend team has completed the UI for the "Global Fleet" (Vehicles List) and "Vehicle Details" pages in the admin dashboard. We need you to implement the backend APIs to power these views. Since we use **OpenSearch** under the hood, please leverage its querying and aggregation capabilities for efficient searching, filtering, and sorting.

We need two new endpoints protected by admin authorization.

---

## 1. `GET /api/v1/admin/vehicles`

**Purpose:** Returns a paginated list of vehicles for the admin grid view.

**Request Parameters:**
- `skip` (int): Offset for pagination.
- `limit` (int): Items per page.
- `q_search` (string, optional): Text search query. Should search across `name`, `general_info.reg_number`, `general_info.vin`, `general_info.brand`, and `general_info.model`.
- `sort_by` (string, optional): E.g., `created_at_desc`, `price_asc`, `status_desc`, `name_asc`.

**Response Format:**
```json
{
  "data": [
    {
      "id": "bmw_420d_cabriolet_2018",
      "name": "BMW 420d Cabriolet 2018",
      "status": 2,
      "price": 13000.0,
      "currency": "THB",
      "general_info": {
        "reg_number": "SHOW-0015",
        "brand": "BMW",
        "model": "420d Cabriolet",
        "vehicle_class": "premium",
        "vin": "1G1YZ2C..."
      },
      "picture": {
        "cover": "/vehicles/showcase/bmw_420d_cabriolet_2018/cover.jpg"
      },
      "owner": {
        "id": "5fd5a990-756d-45e4-b4ae-8ade802f11c7",
        "full_name": "Demo Account",
        "email": "demo@ownima.com"
      },
      "price_templates": {
        "template_name": "Premium Template"
      },
      "created_at": "1970-01-01T00:00:00Z"
    }
  ],
  "count": 1,
  "error": ""
}
```

*Note: You don't need to return the entire vehicle document here, just the partial fields required for the table to keep responses fast.*

---

## 2. `GET /api/v1/admin/vehicles/:id`

**Purpose:** Returns the complete document for a single vehicle to populate the detailed control panel.

**Path Parameters:**
- `id` (string): The Vehicle ID.

**Response Format:**
```json
{
  "data": {
    "id": "bmw_420d_cabriolet_2018",
    "owner_id": "5fd5a990-756d-45e4-b4ae-8ade802f11c7",
    "type": 0,
    "sub_type": 0,
    "name": "BMW 420d Cabriolet 2018",
    "status": 2,
    "picture": { ... }, // Cover, extra, previews
    "general_info": {
      "reg_number": "SHOW-0015",
      "brand": "BMW",
      "model": "420d Cabriolet",
      "year": 2018,
      "environment": "LAND",
      "vehicle_class": "premium",
      "body_type": "sedan",
      "vin": "1G1YZ2C..."
    },
    "specification_info": {
      "number_of_seats": 5,
      "fuel_type": "FUEL_GASOLINE",
      "mileage": 45000,
      "doors": 4,
      "transmission": "auto",
      "engine_capacity": 2.0
    },
    "additional_info": {
      "insurance_included": true,
      "full_wheel_drive": false,
      "auto_transmission": true,
      ...
    },
    "price_templates": {
      "deposit_amount": 30000.0,
      "minimal_rent_period": 1,
      "template_name": "Premium Template"
    },
    "extra_options_details": [
      {
        "id": "baby_seat_100",
        "name": "Baby Seat/Booster",
        "price": 100.0,
        "is_mandatory": false,
        "description": "Optional baby seat/booster service"
      }
    ],
    "price": 13000.0,
    "currency": "THB",
    "rating_stats": {
      "average_rating": 4.8,
      "rating_count": 14
    },
    "owner": {
      "id": "5fd5a990-756d-45e4-b4ae-8ade802f11c7",
      "full_name": "Demo Account",
      "email": "demo@ownima.com"
    },
    "created_at": "1970-01-01T00:00:00Z"
  },
  "error": ""
}
```

## Considerations for the Backend AI Teammate:
1. **OpenSearch Indexing:** Ensure the `general_info` fields like `brand`, `model`, `vin`, and `reg_number` are properly indexed (preferably n-gram or standard tokens) to support the partial text searches in the list endpoint.
2. **Data Aggregation:** The list view returns the `Owner` object populated (with `full_name` and `email`), and the detail view expects populated `Owner` and joined `extra_options_details` array. Please handle the relations/joins (e.g. multi-index queries or denormalization whatever your architecture dictates) efficiently.
3. **Permissions:** Return `403 Forbidden` early if the caller lacks the required admin roles. Return `404 Not Found` for an invalid vehicle ID.

Let us know if any mappings need to be adjusted on the frontend!
