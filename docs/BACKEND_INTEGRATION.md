# Backend Integration Guide - Rider Management Feature

**Last Updated:** 2025-11-14
**Frontend Team Contact:** Admin Dashboard Team
**Related Frontend PR:** [Link to PR when available]

## Executive Summary

This document outlines critical API issues, schema inconsistencies, and enhancement requests discovered during implementation of the rider management feature in the admin dashboard. The frontend team has implemented workarounds for current API limitations, but several backend changes are needed for optimal functionality.

---

## 🚨 Critical Issues Requiring Backend Fixes

### Issue #1: Missing `role` Field in RiderUserAdmin Schema

**Severity:** HIGH
**Impact:** Breaks self-describing API design, requires context-dependent parsing

**Current Situation:**
- The `/admin/riders` endpoint returns `RiderUserAdmin` objects without a `role` field
- The general `/admin/users` endpoint returns objects WITH a `role` field
- Frontend cannot determine user type from API response alone

**Current Frontend Workaround:**
```typescript
// src/pages/UsersPage.tsx:198-199
user_type: apiUser.role || (userTypeFilter === 'RIDER' ? 'RIDER' : apiUser.role)
```

Frontend compensates by:
1. Checking if `role` exists in response
2. If missing, inferring from context (which endpoint was called)
3. This assumes knowledge of which API endpoint was used

**Requested Fix:**
Add required `role` field to RiderUserAdmin schema:

```python
# Backend schema update needed
class RiderUserAdmin(BaseModel):
    id: UUID
    email: str
    role: str = "RIDER"  # ← ADD THIS FIELD (always "RIDER" for riders)
    full_name: Optional[str] = None
    # ... rest of fields
```

**OpenAPI Schema Change:**
```yaml
RiderUserAdmin:
  type: object
  required:
    - id
    - email
    - role  # ← ADD THIS
  properties:
    role:
      type: string
      enum: [RIDER]
      default: RIDER
      description: User role, always RIDER for this endpoint
```

**Benefits:**
- API responses become self-describing
- Removes context dependency
- Aligns with AdminUser schema design
- Prevents routing bugs

---

### Issue #2: Missing Rating & Metrics Fields in RiderUserAdmin Schema ✅ RESOLVED

**Severity:** HIGH → **Status: RESOLVED** (as of API update)
**Impact:** Rider rating and metrics features now fully functional

**Resolution:**
The backend team has added comprehensive rating and reservation metrics to both `RiderUserAdmin` and `OwnerUserAdmin` schemas. The following fields are now available:

**Added Fields:**
- `average_rating?: number | null` - Average rating from reviews (0-5 stars)
- `rating_count: number` - Total number of ratings received
- `total_reservations: number` - All-time reservation count
- `completed_reservations: number` - Successfully completed reservations
- `cancelled_reservations: number` - Cancelled reservation count
- `completion_rate: number` - Percentage of completed reservations
- `cancel_rate: number` - Percentage of cancelled reservations

**Frontend Alignment:**
```typescript
// src/pages/RiderDetailPage.tsx now can use:
rider.average_rating        // Instead of non-existent rider.rating
rider.rating_count          // Show number of reviews
rider.total_reservations    // Display total bookings
rider.completed_reservations // Show completion stats
rider.completion_rate       // Pre-calculated by backend
```

**Note:** The field name is `average_rating`, not `rating`. Frontend code using type casting workarounds should be updated to use the proper field (see Phase 3 of implementation plan).

**OpenAPI Schema (Current):**
```yaml
RiderUserAdmin:
  properties:
    average_rating:
      type: number
      format: float
      minimum: 0
      maximum: 5
      nullable: true
      description: Average rating from reviews
    rating_count:
      type: integer
      description: Total number of ratings received
    total_reservations:
      type: integer
      description: Total reservation count
    completed_reservations:
      type: integer
      description: Successfully completed reservations count
    completion_rate:
      type: number
      format: float
      minimum: 0
      maximum: 1
      description: Completion rate (0-1, e.g., 0.85 = 85%)
```

**Verification Status:**
- ✅ Fields added to `RiderUserAdmin` schema
- ✅ Fields added to `OwnerUserAdmin` schema
- ✅ `UserMetrics` schema includes all reservation metrics
- ⚠️ Frontend needs update to use `average_rating` instead of type casting
- ✅ RiderDetailPage metrics display already uses correct field names

---

### Issue #3: Inconsistent Pagination Response Format

**Severity:** MEDIUM
**Impact:** Complex normalization logic required in frontend

**Current Situation:**
Multiple response formats across different endpoints:
```typescript
// Format 1: Direct array
AdminUser[]

// Format 2: Paginated with count
{data: RiderUserAdmin[], count: number}

// Format 3: Standard paginated
PaginatedResponse<AdminUser>
```

**Current Frontend Workaround:**
```typescript
// src/pages/UsersPage.tsx:188-229
// Complex normalization with Array.isArray() checks
const normalizedData = Array.isArray(data) ? data :
                       (data as any).data ? (data as any).data :
                       data.results || [];
```

**Requested Standardization:**
Unified pagination format for all admin endpoints:

```python
class PaginatedResponse(BaseModel, Generic[T]):
    data: List[T]
    count: int
    page: int
    size: int
    total_pages: int
```

**Apply to endpoints:**
- `GET /admin/users` → PaginatedResponse[AdminUser]
- `GET /admin/riders` → PaginatedResponse[RiderUserAdmin]
- `GET /admin/vehicles` → PaginatedResponse[VehicleAdmin]
- `GET /admin/reservations` → PaginatedResponse[ReservationAdmin]

---

## 📋 Schema Comparison & Field Mapping

### AdminUser vs RiderUserAdmin Field Comparison

| Field | AdminUser | RiderUserAdmin | Status | Notes |
|-------|-----------|----------------|--------|-------|
| **Identity** |
| `id` | ✅ Required | ✅ Required | ✅ Consistent | UUID type |
| `email` | ✅ Required | ✅ Required | ✅ Consistent | Email format |
| `role` | ✅ Required | ❌ **MISSING** | 🚨 **FIX NEEDED** | Should be 'RIDER' |
| `full_name` | ✅ Optional | ✅ Optional | ✅ Consistent | String |
| **Status Flags** |
| `is_active` | ✅ Required | ✅ Required | ✅ Consistent | Boolean |
| `is_superuser` | ✅ Required | ✅ Required | ✅ Consistent | Boolean |
| `is_beta_tester` | ✅ Required | ✅ Required | ✅ Consistent | Boolean |
| **Profile Data** |
| `phone_number` | ✅ Optional | ✅ Optional | ✅ Consistent | String |
| `avatar` | ✅ Optional | ✅ Optional | ✅ Consistent | URL string |
| `location` | ✅ Optional | ✅ Optional | ✅ Consistent | String |
| `bio` | ✅ Optional | ✅ Optional | ✅ Consistent | Max 500 chars |
| `date_of_birth` | ✅ Optional | ✅ Optional | ✅ Consistent | Date string |
| **Preferences** |
| `currency` | ✅ Optional | ✅ Optional | ✅ Consistent | Enum: EUR, USD, GBP, JPY |
| `language` | ✅ Optional | ✅ Optional | ✅ Consistent | Enum: en, es, fr, de, it, ja |
| **Activity Tracking** |
| `created_at` | ✅ Required | ✅ Required | ✅ Consistent | ISO datetime |
| `last_login_at` | ✅ Optional | ✅ Optional | ✅ Consistent | ISO datetime |
| `login_count` | ✅ Required | ✅ Required | ✅ Consistent | Integer |
| **Metrics & Ratings** (✅ Added in Recent API Update) |
| `average_rating` | ✅ Optional | ✅ Optional | ✅ Consistent | Float 0-5, nullable |
| `rating_count` | ✅ Required | ✅ Required | ✅ Consistent | Integer |
| `total_reservations` | ✅ Required | ✅ Required | ✅ Consistent | Integer |
| `completed_reservations` | ✅ Required | ✅ Required | ✅ Consistent | Integer |
| `cancelled_reservations` | ✅ Required | ✅ Required | ✅ Consistent | Integer |
| `completion_rate` | ✅ Required | ✅ Required | ✅ Consistent | Float 0-1 |
| `cancel_rate` | ✅ Required | ✅ Required | ✅ Consistent | Float 0-1 |

### Frontend Field Name Mapping

The frontend renames several fields for UI consistency:

```typescript
// src/pages/UsersPage.tsx:200-203
{
  phone: apiUser.phone_number,           // Rename for UI
  login_count: apiUser.login_count || 0, // Ensure not null
  last_login: apiUser.last_login_at,     // Rename for UI
  registration_date: apiUser.created_at, // Rename for UI
}
```

**Backend Consideration:**
Consider standardizing field names to match frontend expectations in future API versions (v2).

---

## 🎯 Validation Requirements

### Email Validation
**Frontend Regex:** `/^[^\s@]+@[^\s@]+\.[^\s@]+$/`

**Backend Should Enforce:**
- Valid email format
- Email uniqueness across all users (riders + owners)
- Case-insensitive uniqueness check
- Normalize to lowercase before storing

### Phone Number Validation
**Frontend Regex:** `/^\+?[\d\s-()]{10,}$/`

**Accepts:**
- International format: `+1 (555) 123-4567`
- Local format: `555-123-4567`
- Spaces and parentheses allowed
- Minimum 10 digits

**Backend Should:**
- Store in normalized format (remove spaces/parentheses)
- Validate minimum length
- Optional: Use library like `phonenumbers` for strict validation
- Allow null for optional field

### Date of Birth Validation
**Frontend Checks:**
1. Valid date format (ISO 8601)
2. Not in the future
3. Realistic year (>= 1900)

**Backend Should Enforce:**
- Date format validation
- Not future date
- Minimum age requirement (e.g., 18 years for rentals)
- Maximum realistic age (e.g., < 120 years)

```python
from datetime import datetime, timedelta

def validate_date_of_birth(dob: date) -> bool:
    today = datetime.now().date()
    min_age = 18
    max_age = 120

    # Not in future
    if dob > today:
        raise ValueError("Date of birth cannot be in the future")

    # Minimum age
    age = (today - dob).days / 365.25
    if age < min_age:
        raise ValueError(f"Must be at least {min_age} years old")

    # Realistic age
    if age > max_age:
        raise ValueError("Invalid date of birth")

    return True
```

### Bio Validation
**Frontend Limit:** 500 characters (defined in `src/constants/validation.ts`)

**Backend Should:**
- Enforce max length: 500 characters
- Sanitize HTML/script tags
- Strip leading/trailing whitespace
- Allow null for optional field

```python
from bleach import clean

def validate_bio(bio: Optional[str]) -> Optional[str]:
    if not bio:
        return None

    # Strip whitespace
    bio = bio.strip()

    # Enforce length
    if len(bio) > 500:
        raise ValueError("Bio cannot exceed 500 characters")

    # Sanitize HTML
    bio = clean(bio, tags=[], strip=True)

    return bio
```

### Currency & Language Validation
**Valid Values:**
```python
class Currency(str, Enum):
    EUR = "EUR"
    USD = "USD"
    GBP = "GBP"
    JPY = "JPY"

class Language(str, Enum):
    EN = "en"
    ES = "es"
    FR = "fr"
    DE = "de"
    IT = "it"
    JA = "ja"
```

**Backend Should:**
- Validate enum values on PATCH requests
- Reject invalid values with clear error message
- Default to sensible values (EUR, en) if not provided

---

## 🆕 New Endpoints Needed

### 1. Rider Activities (Per-Rider Filtering)

**Endpoint:** `GET /admin/riders/{rider_id}/activities`

**Purpose:** View activity timeline for specific rider

**Query Parameters:**
```typescript
{
  activity_type?: 'login' | 'booking' | 'payment' | 'profile_update'
  date_from?: string  // ISO datetime
  date_to?: string    // ISO datetime
  limit?: number      // Default: 10
  offset?: number     // Default: 0
}
```

**Response:**
```json
{
  "data": [
    {
      "id": "uuid",
      "type": "BOOKING",
      "description": "Created booking #12345",
      "timestamp": "2025-11-14T10:30:00Z",
      "metadata": {
        "booking_id": "uuid",
        "vehicle_id": "uuid"
      }
    }
  ],
  "count": 42,
  "page": 1,
  "size": 10
}
```

**Frontend Usage:**
- RiderDetailPage Activity tab (line 637 - currently shows placeholder)
- Real-time activity monitoring
- Audit trail for support issues

---

### 2. Rider Rating & Reviews

**Endpoint:** `GET /admin/riders/{rider_id}/reviews`

**Purpose:** View detailed reviews and ratings from owners

**Response:**
```json
{
  "data": [
    {
      "id": "uuid",
      "owner_id": "uuid",
      "owner_name": "John Doe",
      "rating": 4.5,
      "comment": "Great renter, very respectful",
      "booking_id": "uuid",
      "created_at": "2025-11-10T15:20:00Z",
      "is_flagged": false
    }
  ],
  "average_rating": 4.7,
  "total_reviews": 23,
  "rating_distribution": {
    "5": 15,
    "4": 6,
    "3": 2,
    "2": 0,
    "1": 0
  }
}
```

**Additional Endpoint:**
`PATCH /admin/riders/{rider_id}/rating`

**Purpose:** Manual rating adjustment by admin (with audit trail)

**Request Body:**
```json
{
  "rating": 4.5,
  "reason": "Adjusted due to fraudulent negative review",
  "admin_notes": "Verified with owner, review removed"
}
```

---

### 3. Rider Booking Statistics

**Endpoint:** `GET /admin/riders/{rider_id}/booking-stats`

**Purpose:** Dedicated endpoint for rider-specific booking metrics

**Current Situation:**
- Currently uses generic `/admin/users/{user_id}/metrics` (RiderDetailPage:62)
- Not optimized for rider-specific data

**Proposed Response:**
```json
{
  "total_bookings": 45,
  "pending_reservations": 2,
  "confirmed_reservations": 3,
  "completed_reservations": 38,
  "cancelled_reservations": 2,
  "completion_rate": 0.844,  // 38/45
  "average_booking_value": 125.50,
  "total_spent": 5647.50,
  "favorite_vehicle_type": "SUV",
  "average_rental_duration_days": 3.2
}
```

**Benefits:**
- Optimized for rider analytics
- Includes completion rate calculation
- Provides business intelligence metrics

---

### 4. Per-User Activity Feed (HIGH PRIORITY)

**Endpoints:**
- `GET /admin/riders/{rider_id}/activities`
- `GET /admin/users/{user_id}/activities`

**Priority:** HIGH
**Status:** ⏳ NOT IMPLEMENTED (Requested)

**Purpose:** Enable per-user activity filtering in detail pages

**Current Situation:**
- System-wide activity feed exists and works well (`ActivityTimeline` component)
- 14 activity types supported (user_registered, vehicle_created, reservation_created, etc.)
- RiderDetailPage shows placeholder: "Per-rider activity filtering will be available in a future update" (line 549)
- UserDetailPage lacks activity section entirely
- Users must navigate to system-wide activity page and manually find relevant items

**Requested Implementation:**

#### Endpoint: GET /admin/riders/{rider_id}/activities

**Query Parameters:**
```typescript
{
  category?: 'all' | 'reservations' | 'ratings' | 'auth';
  skip?: number;       // Default: 0
  limit?: number;      // Default: 20
}
```

**Response Format:**
```json
{
  "data": [
    {
      "id": "uuid",
      "type": "RESERVATION_CREATED",
      "user_type": "rider",
      "user_id": "uuid",
      "user_email": "rider@example.com",
      "description": "Rider created reservation #RES-12345",
      "timestamp": "2025-11-17T10:30:00Z",
      "metadata": {
        "reservation_id": "uuid",
        "vehicle_id": "uuid",
        "owner_id": "uuid"
      }
    },
    {
      "id": "uuid",
      "type": "USER_LOGIN",
      "user_type": "rider",
      "user_id": "uuid",
      "user_email": "rider@example.com",
      "description": "Rider logged in",
      "timestamp": "2025-11-16T14:20:00Z",
      "metadata": {}
    }
  ],
  "count": 127,
  "page": 1,
  "size": 20
}
```

#### Endpoint: GET /admin/users/{user_id}/activities

Same structure as rider endpoint, but filters for owner-specific activities:
- `VEHICLE_CREATED`, `VEHICLE_UPDATED`, `VEHICLE_PUBLISHED`
- `RESERVATION_CREATED` (from owner's perspective)
- `USER_LOGIN`, `USER_REGISTERED`
- Rating activities related to this owner

**Activity Type Categories:**

| Category | Activity Types |
|----------|---------------|
| `reservations` | RESERVATION_CREATED, RESERVATION_STATUS_UPDATED_* |
| `ratings` | RATING_SUBMITTED, RATING_RECEIVED |
| `auth` | USER_LOGIN, RIDER_LOGIN, USER_REGISTERED, RIDER_REGISTERED |
| `all` | All activity types for this user |

**Frontend Integration:**

The frontend will use these endpoints in:

1. **RiderDetailPage.tsx** (line 543-556)
   - Replace placeholder with `<UserActivityTimeline userId={riderId} userType="RIDER" />`
   - Show last 10 activities with "Load More" button
   - Category filtering dropdown (All, Reservations, Ratings, Auth)

2. **UserDetailPage.tsx** (new section)
   - Add activity section similar to RiderDetailPage
   - Show owner-specific activities
   - Link to related entities (vehicles, reservations)

**Implementation Requirements:**

1. **Backend Filtering Logic:**
   - Filter activities WHERE user_id = {rider_id} OR metadata contains user reference
   - Example: Show reservation activities where rider is the renter
   - Example: Show rating activities where rider is rater or rated
   - Order by timestamp DESC

2. **Performance Considerations:**
   - Add database index on `user_id` in activities table
   - Add composite index on (`user_id`, `timestamp`)
   - Consider pagination with cursor-based approach for large datasets
   - Cache frequently accessed user activities (Redis)

3. **Response Consistency:**
   - Match existing ActivityTimeline component expectations
   - Include same metadata fields as system-wide activities
   - Support same timestamp format (ISO 8601)
   - Normalize activity type to UPPERCASE

**Example Use Cases:**

1. **Support Investigation:**
   - Admin views rider's activity to diagnose account issues
   - Track when rider last logged in, created bookings
   - Identify patterns in cancelled reservations

2. **User Behavior Analysis:**
   - See rider's booking frequency and patterns
   - Track rating submission behavior
   - Monitor login activity for dormant accounts

3. **Audit Trail:**
   - Complete history of user actions
   - Useful for dispute resolution
   - Compliance and data access requests

**Frontend Component Structure:**
```typescript
// New component: UserActivityTimeline
<UserActivityTimeline
  userId={riderId}
  userType="RIDER"  // or "OWNER"
  initialLimit={10}
  showCategories={true}
  onActivityClick={(activity) => navigateToEntity(activity)}
/>
```

**Testing Requirements:**

```python
def test_get_rider_activities_filters_correctly():
    """Ensure only rider's activities are returned"""
    response = client.get(f"/admin/riders/{rider_id}/activities")
    assert response.status_code == 200
    data = response.json()

    for activity in data['data']:
        assert activity['user_id'] == rider_id
        # or activity references rider in metadata

def test_get_rider_activities_category_filter():
    """Test category filtering works"""
    response = client.get(
        f"/admin/riders/{rider_id}/activities?category=reservations"
    )
    data = response.json()

    for activity in data['data']:
        assert activity['type'].startswith('RESERVATION_')
```

**Priority Justification:**
- HIGH: Enhances admin efficiency significantly
- Reduces time to investigate user issues
- Improves user support quality
- Relatively straightforward to implement (filter existing activities)
- Frontend already built (waiting for backend endpoint)

---

## ⭐ New Feature: Complete Ratings System

**Added:** Recent API update
**Status:** ✅ Fully Implemented

The backend has implemented a comprehensive bidirectional ratings system for the platform. This enables riders to rate owners and vehicles, owners to rate riders, and provides platform-wide rating analytics.

### Rating Schemas

#### 1. RatingResponse
Individual rating details returned from the API:

```typescript
interface RatingResponse {
  id: string;              // UUID
  rater_id: string;        // User who gave the rating
  rated_id: string;        // User/vehicle being rated
  score: number;           // 1-5 star rating
  feedback?: string;       // Optional text review
  rating_type: 'RIDER' | 'OWNER' | 'VEHICLE';
  rating_phase: 'COLLECT' | 'COMPLETE';
  reservation_id: string;  // Linked reservation
  created_at: string;      // ISO datetime
  updated_at: string;      // ISO datetime
}
```

#### 2. RatingStatistics
Platform-wide rating metrics for admin dashboard:

```typescript
interface RatingStatistics {
  total_ratings: number;
  avg_score: number;       // Overall platform average
  score_distribution: {    // Star breakdown
    1: number;
    2: number;
    3: number;
    4: number;
    5: number;
  };
  by_type: {
    RIDER: { total: number; avg: number };
    OWNER: { total: number; avg: number };
    VEHICLE: { total: number; avg: number };
  };
}
```

#### 3. RatingStats
Entity-specific rating statistics (for individual users/vehicles):

```typescript
interface RatingStats {
  average_rating: number;
  rating_count: number;
  five_star: number;
  four_star: number;
  three_star: number;
  two_star: number;
  one_star: number;
  last_updated: string;    // ISO datetime
}
```

### Rating Endpoints

| Endpoint | Method | Purpose | Status |
|----------|--------|---------|--------|
| `/api/v1/ratings` | GET | List ratings with filters | ✅ Available |
| `/api/v1/ratings/{rating_id}` | GET | Get single rating | ✅ Available |
| `/api/v1/ratings` | POST | Create new rating | ✅ Available |
| `/api/v1/ratings/{rating_id}` | PUT | Update rating | ✅ Available |
| `/api/v1/ratings/{rating_id}` | DELETE | Soft delete rating | ✅ Available |
| `/api/v1/admin/metrics/ratings` | GET | Platform rating statistics | ✅ Available |

### Query Parameters for GET /api/v1/ratings

```typescript
{
  rater_id?: string;       // Filter by who gave the rating
  rated_id?: string;       // Filter by who/what was rated
  rating_type?: 'RIDER' | 'OWNER' | 'VEHICLE';
  rating_phase?: 'COLLECT' | 'COMPLETE';
  reservation_id?: string;
  min_score?: number;      // Filter ratings >= this score
  max_score?: number;      // Filter ratings <= this score
  skip?: number;           // Pagination offset
  limit?: number;          // Pagination limit
}
```

### Bidirectional Rating Flow

The system supports three rating types:

1. **Owner → Rider**: Owner rates rider's behavior after rental
2. **Rider → Owner**: Rider rates owner's service/responsiveness
3. **Rider → Vehicle**: Rider rates vehicle condition/quality

Each rating is linked to a specific reservation and goes through phases:
- `COLLECT`: Rating submitted during collection
- `COMPLETE`: Rating submitted after completion

### Frontend Integration Points

**Admin Dashboard Metrics** (Future Enhancement):
- Platform-wide rating trends
- Rating distribution charts
- Flagged/disputed ratings review
- Average ratings by user type

**Rider Detail Page** (Current):
- Display `average_rating` from RiderUserAdmin schema
- Show `rating_count` next to stars
- Future: Show detailed rating breakdown

**Owner Detail Page** (Future):
- Similar rating display as riders
- Response time correlation with ratings
- Rating impact on booking success rate

### Rating Calculation Logic

**Average Rating Calculation:**
```python
# Backend automatically calculates and stores in user schemas
average_rating = sum(all_ratings.score) / len(all_ratings)
```

**Integration with User Schemas:**
- `RiderUserAdmin.average_rating` - Pre-calculated rider rating
- `RiderUserAdmin.rating_count` - Total ratings received
- `OwnerUserAdmin.average_rating` - Pre-calculated owner rating
- `OwnerUserAdmin.rating_count` - Total ratings received

**Performance Optimization:**
- Ratings are pre-calculated and cached in user schemas
- No need for real-time aggregation on user detail pages
- Updated via background job or trigger when new rating submitted

### Admin Moderation Capabilities

**Future Enhancement Request:**
```
GET /admin/riders/{rider_id}/ratings
- View all ratings for specific rider
- Flag inappropriate reviews
- Manually adjust ratings with audit trail
```

**Recommended Admin Features:**
- Filter flagged/disputed ratings
- Rating appeal workflow
- Fraud detection (rating manipulation)
- Automated flagging of extreme outliers

---

## 🔄 API Response Handling Improvements

### Current Frontend Normalization Logic

The frontend handles inconsistent API responses in `UsersPage.tsx:188-229`:

```typescript
// Handle multiple response formats
const normalizedData = useMemo(() => {
  if (!data) return [];

  // Format 1: Direct array
  if (Array.isArray(data)) {
    return data.map(apiUser => ({/* normalize */}));
  }

  // Format 2: {data: [], count: number}
  if ((data as any).data && Array.isArray((data as any).data)) {
    return (data as any).data.map(apiUser => ({/* normalize */}));
  }

  // Format 3: {results: []}
  if ((data as any).results) {
    return (data as any).results.map(apiUser => ({/* normalize */}));
  }

  return [];
}, [data, page, userTypeFilter]);
```

**Problems with Current Approach:**
- Type assertions (`as any`) bypass TypeScript safety
- Complex conditional logic prone to bugs
- Maintenance burden when adding new endpoints

**Recommended Backend Change:**
Standardize ALL admin endpoints to return:

```python
{
  "data": List[T],      # Array of items
  "count": int,         # Total items (for pagination)
  "page": int,          # Current page number
  "size": int,          # Items per page
  "total_pages": int    # Total pages available
}
```

This eliminates frontend normalization complexity entirely.

---

## 📊 Data Consistency Recommendations

### 1. Field Naming Conventions

**Issue:** Inconsistent naming between filter params and response fields

**Example:**
- Query param: `registration_date_from`, `registration_date_to`
- Response field: `created_at`

**Recommendation:**
Choose one convention and stick to it:

**Option A:** Use `created_at` everywhere
```python
GET /admin/users?created_at_from=2025-01-01&created_at_to=2025-12-31
```

**Option B:** Use `registration_date` everywhere
```python
class AdminUser(BaseModel):
    registration_date: datetime  # Instead of created_at
```

**Frontend Preference:** We recommend Option B (`registration_date`) as it's more semantically clear for user management context.

---

### 2. Enum Value Consistency

**Issue:** Activity types returned in lowercase, frontend expects uppercase

**Current Situation:**
```python
# Backend sends
{"type": "login"}

# Frontend normalizes to
{"type": "LOGIN"}  // src/pages/SystemPage.tsx:90
```

**Recommendation:**
Standardize on uppercase enum values across API:

```python
class ActivityType(str, Enum):
    LOGIN = "LOGIN"
    BOOKING = "BOOKING"
    PAYMENT = "PAYMENT"
    PROFILE_UPDATE = "PROFILE_UPDATE"
```

**Benefits:**
- Matches OpenAPI conventions
- Eliminates frontend normalization
- Clearer in logs and debugging

---

### 3. Null vs Empty String Handling

**Frontend Behavior:**
```typescript
// src/components/modals/RiderEditModal.tsx:148-152
// Converts empty strings to null before sending
const prepareFormData = () => ({
  ...formData,
  phone_number: formData.phone_number?.trim() || null,
  bio: formData.bio?.trim() || null,
  date_of_birth: formData.date_of_birth || null,
});
```

**Backend Should:**
- Accept both `null` and `""` (empty string) as "no value"
- Store as `NULL` in database (not empty string)
- Return `null` in API responses (not empty string)
- Document this behavior in OpenAPI schema

---

## 🧪 Testing Recommendations for Backend

### API Contract Tests

**Test /admin/riders endpoint:**
```python
def test_get_riders_includes_role_field():
    """Ensure all riders have role='RIDER' in response"""
    response = client.get("/admin/riders")
    assert response.status_code == 200
    data = response.json()

    for rider in data['data']:
        assert 'role' in rider
        assert rider['role'] == 'RIDER'

def test_get_riders_includes_rating_field():
    """Ensure rating field is present (null or float)"""
    response = client.get("/admin/riders")
    data = response.json()

    for rider in data['data']:
        assert 'rating' in rider
        assert rider['rating'] is None or isinstance(rider['rating'], float)
        if rider['rating'] is not None:
            assert 0 <= rider['rating'] <= 5
```

### Validation Tests

```python
def test_rider_update_validates_email_format():
    """Invalid email should return 400"""
    response = client.patch(f"/admin/riders/{rider_id}", json={
        "email": "invalid-email"
    })
    assert response.status_code == 400
    assert "email" in response.json()['detail'].lower()

def test_rider_update_validates_bio_length():
    """Bio > 500 chars should return 400"""
    response = client.patch(f"/admin/riders/{rider_id}", json={
        "bio": "x" * 501
    })
    assert response.status_code == 400
    assert "500" in response.json()['detail']

def test_rider_update_validates_date_of_birth():
    """Future date should return 400"""
    future_date = (datetime.now() + timedelta(days=1)).isoformat()
    response = client.patch(f"/admin/riders/{rider_id}", json={
        "date_of_birth": future_date
    })
    assert response.status_code == 400
```

---

## 📝 OpenAPI Schema Update Checklist

Apply these changes to your OpenAPI specification:

### RiderUserAdmin Schema Updates

```yaml
RiderUserAdmin:
  type: object
  required:
    - id
    - email
    - is_active
    - is_superuser
    - is_beta_tester
    - created_at
    - login_count
    - role  # ← ADD THIS
  properties:
    id:
      type: string
      format: uuid
    email:
      type: string
      format: email
    role:  # ← ADD THIS PROPERTY
      type: string
      enum: [RIDER]
      description: User role, always RIDER for riders endpoint
    rating:  # ← ADD THIS PROPERTY
      type: number
      format: float
      minimum: 0
      maximum: 5
      nullable: true
      description: Average rating from owner reviews
    full_name:
      type: string
      nullable: true
    phone_number:
      type: string
      nullable: true
      pattern: '^\+?[\d\s-()]{10,}$'
    bio:
      type: string
      nullable: true
      maxLength: 500
    date_of_birth:
      type: string
      format: date
      nullable: true
    # ... rest of properties
```

### Pagination Response Schema

```yaml
PaginatedRiderResponse:
  type: object
  required:
    - data
    - count
    - page
    - size
    - total_pages
  properties:
    data:
      type: array
      items:
        $ref: '#/components/schemas/RiderUserAdmin'
    count:
      type: integer
      description: Total number of items
    page:
      type: integer
      description: Current page number (1-indexed)
    size:
      type: integer
      description: Number of items per page
    total_pages:
      type: integer
      description: Total number of pages
```

---

## 🎯 Priority Matrix

| Issue | Severity | Implementation Effort | Frontend Impact | Status | Priority |
|-------|----------|----------------------|-----------------|--------|----------|
| ~~Add `rating` field to RiderUserAdmin~~ | ~~HIGH~~ | ~~Medium~~ | ~~High~~ | ✅ **RESOLVED** | ~~P0~~ |
| Add `role` field to RiderUserAdmin | HIGH | Low (1 line) | High - eliminates workaround | ⏳ Open | **P0** |
| Per-user activity feed endpoints | HIGH | Medium (2 endpoints) | High - enables feature | ⏳ Open | **P0** |
| Standardize pagination format | MEDIUM | Medium (all endpoints) | Medium - simplifies code | ⏳ Open | **P1** |
| Rider/owner rating details endpoint | MEDIUM | Medium (new endpoint) | Medium - future analytics | ⏳ Open | **P2** |
| Field naming consistency | LOW | Low (rename fields) | Low - minor improvement | ⏳ Open | **P3** |

**Recent Completions:**
- ✅ **Rating & Metrics Fields**: Added `average_rating`, `rating_count`, `total_reservations`, `completed_reservations`, `cancel_rate`, `completion_rate` to user schemas
- ✅ **Ratings System**: Complete bidirectional ratings implementation with 5 endpoints

**Recommended Implementation Order:**
1. **Sprint 1 (1 day):** Add `role` field to RiderUserAdmin schema (quick win)
2. **Sprint 2 (2-3 days):** Implement per-user activity feed endpoints (`/admin/riders/{id}/activities`, `/admin/users/{id}/activities`)
3. **Sprint 3 (3-4 days):** Standardize pagination across all admin endpoints
4. **Sprint 4 (1-2 weeks):** Rating moderation features (rating details, admin adjustment, flagging)

---

## 🤝 Communication & Coordination

### Frontend Team Contacts
- **Primary:** Admin Dashboard Team
- **Code Review:** [GitHub: @frontend-team]
- **Questions:** Use #admin-dashboard Slack channel

### Review Process
1. Backend implements changes
2. Update OpenAPI schema (run schema generation)
3. Frontend runs `npm run generate-types` to get new types
4. Frontend removes workarounds and adds new features
5. Joint testing in staging environment
6. Deploy backend → Deploy frontend

### Breaking Changes
If any response format changes are breaking:
1. Notify frontend team 48 hours in advance
2. Consider API versioning (v1 → v2)
3. Coordinate deployment timing
4. Update this document with migration guide

---

## 📚 Additional Resources

- **Frontend Repo:** [Link to repo]
- **API Documentation:** https://beta.ownima.com/api/v1/docs
- **OpenAPI Schema:** https://beta.ownima.com/api/v1/openapi.json
- **Type Generation:** `npm run generate-types` (see CLAUDE.md)

---

## Version History

| Date | Version | Changes | Author |
|------|---------|---------|--------|
| 2025-11-14 | 1.0 | Initial documentation | Frontend Team |

---

**Questions or Feedback?**
Please reach out to the frontend team via Slack or create a GitHub issue in the admin dashboard repository.
