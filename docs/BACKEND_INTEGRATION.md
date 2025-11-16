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

### Issue #2: Missing `rating` Field in RiderUserAdmin Schema

**Severity:** HIGH
**Impact:** Rider rating feature non-functional, always shows "No rating yet"

**Current Situation:**
- RiderDetailPage expects `rider.rating` field (line 246)
- RiderUserAdmin schema does not include `rating` field
- Frontend always renders "No rating yet" placeholder

**Current Frontend Code:**
```typescript
// src/pages/RiderDetailPage.tsx:246
const renderRatingStars = (rating?: number) => {
  if (rating === undefined || rating === null) {
    return <p className="text-gray-500">No rating yet</p>;
  }
  // ... star rendering
};

// Line 267: Always renders "No rating yet"
{renderRatingStars(rider?.rating)}  // ← rider.rating is always undefined
```

**Requested Fix:**
Add optional `rating` field to RiderUserAdmin schema:

```python
# Backend schema update needed
class RiderUserAdmin(BaseModel):
    # ... existing fields
    rating: Optional[float] = None  # ← ADD THIS FIELD
    # Rating from 0-5, calculated from owner reviews
```

**OpenAPI Schema Change:**
```yaml
RiderUserAdmin:
  properties:
    rating:
      type: number
      format: float
      minimum: 0
      maximum: 5
      nullable: true
      description: Average rating from owner reviews (0-5 stars)
```

**Calculation Logic Needed:**
- Average of all rider reviews from owners
- Null if no reviews exist
- Updated when new review is submitted
- Consider caching/pre-calculating for performance

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
| **Rider-Specific** |
| `rating` | ❌ Not in schema | ❌ **MISSING** | 🚨 **FIX NEEDED** | Should be float 0-5 |

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

| Issue | Severity | Implementation Effort | Frontend Impact | Priority |
|-------|----------|----------------------|-----------------|----------|
| Add `role` field to RiderUserAdmin | HIGH | Low (1 line) | High - eliminates workaround | **P0** |
| Add `rating` field to RiderUserAdmin | HIGH | Medium (calc logic) | High - enables feature | **P0** |
| Standardize pagination format | MEDIUM | Medium (all endpoints) | Medium - simplifies code | **P1** |
| Add rider activities endpoint | MEDIUM | Medium (new endpoint) | Medium - enables tab | **P1** |
| Add rider reviews endpoint | LOW | High (new feature) | Low - future feature | **P2** |
| Field naming consistency | LOW | Low (rename fields) | Low - minor improvement | **P3** |

**Recommended Implementation Order:**
1. **Sprint 1 (1-2 days):** Add `role` and `rating` fields to existing schema
2. **Sprint 2 (2-3 days):** Standardize pagination across all admin endpoints
3. **Sprint 3 (3-5 days):** Implement rider activities endpoint
4. **Sprint 4 (1 week):** Implement reviews/rating management endpoints

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
