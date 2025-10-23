# Feature Plan: Admin Dashboard Activity Feed

**Status:** ✅ Backend Complete - Production Ready
**Last Updated:** 2025-10-23 (v2.1 - Bug Fixes Applied)
**Backend Team:** Ownima Backend Team
**Related Docs:** [Event Tracking](../app/core/events.py), [MetricsService](../app/services/metrics_service.py)

---

## Recent Updates (2025-10-23)

### ✅ Bug Fixes Applied
- **Fixed:** Validation errors in production/staging environments
- **Fixed:** Missing `user_id` field in user activities response
- **Fixed:** Null/empty values in vehicle and reservation activities
- **Added:** Intelligent fallback handling for missing fields
- **Status:** All validation errors resolved, tested and deployed

---

## 1. Objective

To implement a comprehensive and user-friendly activity feed on the admin dashboard. This feature will consume the new, paginated activity endpoints to provide administrators with a clear, real-time overview of key events happening on the platform across different categories (Users, Vehicles, Reservations).

## 2. Key Features

- **Unified Dashboard Panel:** A new "Recent Activity" panel on the main dashboard displaying a mix of the 5-10 most recent activities from all categories.
- **Categorized Activity Views:** The main `ActivityTimeline` component will be enhanced with tabs or filters to allow viewing activities by specific categories: "All", "Users", "Vehicles", and "Reservations".
- **Pagination / Infinite Scroll:** Each activity feed will feature a "Load More" button to fetch and display older activities, ensuring good performance by not loading all events at once.
- **Dynamic Activity Items:** A reusable component will be created to render individual activity items. It will dynamically display a relevant icon, a human-readable description, and a timestamp for each event.

## 3. Backend Implementation Status

✅ **All activity endpoints are implemented and tested:**
- `GET /api/v1/admin/activity/users` - Returns user registrations and logins
- `GET /api/v1/admin/activity/vehicles` - Returns vehicle events from OpenSearch
- `GET /api/v1/admin/activity/reservations` - Returns reservation events from OpenSearch

✅ **Features:**
- Full pagination support (skip/limit parameters)
- UI-ready response format with consistent schemas
- Support for both Owner and Rider activities
- Integration with OpenSearch events for vehicles/reservations
- PostgreSQL queries for user activities (real-time)
- Comprehensive test coverage (22 tests passing)
- **Robust error handling with intelligent fallbacks**
- **Production-tested validation (no Pydantic errors)**

✅ **Performance:**
- User activities: Real-time from PostgreSQL
- Vehicle/Reservation activities: Near real-time (~1s delay via OpenSearch events index)
- Recommended: 5-second client-side polling or manual refresh

✅ **Data Quality:**
- All required fields guaranteed present (no null/empty values)
- Fallback values for missing data (maintains stability)
- Backwards compatible with existing event structures

## 4. API Endpoints

The frontend will integrate with the following backend endpoints:

### Base URL
`/api/v1/admin/activity/`

### Endpoints

#### `GET /api/v1/admin/activity/users`
Returns recent user activities (registrations and logins) for both Owners and Riders.

**Query Parameters:**
- `skip` (integer, optional, default: 0) - Number of activities to skip for pagination
- `limit` (integer, optional, default: 10, max: 100) - Number of activities to return

**Authentication:** Requires admin/superuser role

**Response:** `PaginatedActivityResponse` (see schema below)

#### `GET /api/v1/admin/activity/vehicles`
Returns recent vehicle activities from OpenSearch events.

**Query Parameters:**
- `skip` (integer, optional, default: 0) - Number of activities to skip for pagination
- `limit` (integer, optional, default: 10, max: 100) - Number of activities to return

**Authentication:** Requires admin/superuser role

**Response:** `PaginatedActivityResponse` (see schema below)

#### `GET /api/v1/admin/activity/reservations`
Returns recent reservation activities from OpenSearch events.

**Query Parameters:**
- `skip` (integer, optional, default: 0) - Number of activities to skip for pagination
- `limit` (integer, optional, default: 10, max: 100) - Number of activities to return

**Authentication:** Requires admin/superuser role

**Response:** `PaginatedActivityResponse` (see schema below)

## 5. API Response Schema

All endpoints return the same consistent structure:

### TypeScript Interface

```typescript
interface PaginatedActivityResponse {
  data: Activity[];
  total: number;  // Total count of activities returned
}

interface Activity {
  id: string;              // Entity ID (vehicle_id, reservation_id, or user_id)
  timestamp: string;       // ISO 8601 format: "2025-10-23T12:34:56Z"
  user_id: string;         // Who performed the action
  activity_type: string;   // One of the activity type enums (see below)
  details: ActivityDetails; // Activity-specific details
}

interface ActivityDetails {
  [key: string]: any;      // See detailed schemas below
}
```

### Example Response

```json
{
  "data": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "timestamp": "2025-10-23T12:34:56Z",
      "user_id": "123e4567-e89b-12d3-a456-426614174000",
      "activity_type": "vehicle_created",
      "details": {
        "event_type": "vehicle_created",
        "vehicle_id": "550e8400-e29b-41d4-a716-446655440000",
        "name": "Tesla Model 3",
        "status": "draft",
        "vehicle_type": "sedan",
        "brand": "Tesla",
        "model": "Model 3",
        "entity_id": "550e8400-e29b-41d4-a716-446655440000",
        "user_id": "123e4567-e89b-12d3-a456-426614174000"
      }
    }
  ],
  "total": 42
}
```

### Field Guarantees & Fallback Behavior

**All responses are guaranteed to have valid, non-null values for required fields:**

| Field | Type | Guarantee | Fallback Value |
|-------|------|-----------|----------------|
| `id` | string | Always present | Falls back to activity ID, then `"unknown"` |
| `timestamp` | string | Always present | ISO 8601 format |
| `user_id` | string | Always present | Falls back to `"system"` for system activities |
| `activity_type` | string | Always present | One of the defined enum values |
| `details` | object | Always present | May be empty `{}` for system events |

**Fallback Scenarios:**

1. **Missing Entity ID:**
   - Vehicle activities: `entity_id` → `vehicle_id` → activity's own `id` → `"unknown"`
   - Reservation activities: `entity_id` → `reservation_id` → activity's own `id` → `"unknown"`

2. **Missing User ID:**
   - First tries `details.user_id`
   - Then falls back to top-level `user_id`
   - Finally uses `"system"` for system-generated events

3. **System Activities:**
   - Automated events (e.g., scheduled tasks) may have `user_id: "system"`
   - Frontend should handle these gracefully (e.g., show "System" instead of user name)

**Why This Matters:**
- ✅ No Pydantic validation errors
- ✅ TypeScript types always satisfied
- ✅ Frontend can safely access all fields without null checks
- ✅ Backwards compatible with old and new event formats

## 6. Proposed UI/UX Flow

### Component Structure
- The existing `ActivityTimeline.tsx` component on the `DashboardPage.tsx` will be the central point for this feature.
- It will be updated to include tabs for filtering by category: "All", "Users", "Vehicles", "Reservations".

### Initial Load
- The component will initially fetch the first page of activities for the "All" category.
- For "All" tab: Make 3 parallel requests to user, vehicle, and reservation endpoints.
- For specific tabs: Make single request to the appropriate endpoint.

### Tab Switching
- Clicking a category tab will fetch the first page of activities for that specific stream.
- Reset pagination state (skip = 0) when switching tabs.
- Show loading state during fetch.

### Pagination
- Scrolling to the bottom of the list and clicking "Load More" will fetch the next page.
- Increment `skip` by `limit` for each load more action.
- Append new activities to existing list.
- Disable "Load More" button when no more activities are available.

### Error Handling
- Show error message if any endpoint fails.
- For "All" tab: Show partial results if some endpoints succeed.
- Provide retry button for failed requests.

### Real-time Updates
- No WebSocket/SSE support currently.
- **Recommendation:** Implement one of:
  1. Poll every 5 seconds when dashboard is visible
  2. Manual refresh button
  3. Auto-refresh on page focus

## 7. Data Mapping & Display Logic

The frontend will parse the `PaginatedActivityResponse` from the API. For each activity item:

### Activity Type
- `activity_type`: This string determines which icon to display and how to construct the descriptive text.
- Use a switch/case or mapping object to handle all types (see complete list below).
- Fallback to generic display for unknown types.

### Details Object
- `details`: Contains activity-specific data for rich descriptions.
- Always check for optional fields before accessing.
- Use the `changes` field (when present) to show before/after values.
- Use `entity_id` for linking to detail pages.

### Timestamp
- `timestamp`: ISO 8601 format string.
- Format into user-friendly, relative time string (e.g., "2 minutes ago").
- Use library like `date-fns` for consistent formatting.

### User Information
- `user_id`: Can be used to link to user profile.
- Additional user details are in the `details` object (name, email, role).

## 8. Complete Activity Types & Details Schemas

### User Activities (PostgreSQL-based)

#### `user_registered` - Owner account registration
```json
{
  "user_id": "uuid",
  "user_email": "john@example.com",
  "user_name": "John Doe",
  "user_role": "OWNER"
}
```

#### `user_login` - Owner login
```json
{
  "user_id": "uuid",
  "user_email": "john@example.com",
  "user_name": "John Doe",
  "user_role": "OWNER",
  "login_count": 5
}
```

#### `rider_registered` - Rider account registration
```json
{
  "user_id": "uuid",
  "user_email": "jane@example.com",
  "user_name": "Jane Smith",
  "user_role": "RIDER"
}
```

#### `rider_login` - Rider login
```json
{
  "user_id": "uuid",
  "user_email": "jane@example.com",
  "user_name": "Jane Smith",
  "user_role": "RIDER",
  "login_count": 12
}
```

### Vehicle Activities (OpenSearch events)

#### `vehicle_created` - New vehicle added
```json
{
  "event_type": "vehicle_created",
  "vehicle_id": "uuid",
  "name": "Tesla Model 3",
  "status": "draft",
  "vehicle_type": "sedan",
  "brand": "Tesla",
  "model": "Model 3",
  "entity_id": "vehicle-uuid",
  "user_id": "owner-uuid"
}
```

#### `vehicle_updated` - Vehicle details changed
```json
{
  "event_type": "vehicle_updated",
  "vehicle_id": "uuid",
  "name": "Tesla Model 3",
  "status": "free",
  "changes": {
    "status": {"from": "draft", "to": "free"},
    "name": {"from": "Tesla Model S", "to": "Tesla Model 3"}
  },
  "entity_id": "vehicle-uuid",
  "user_id": "owner-uuid"
}
```

#### `vehicle_published` - Vehicle made available for booking
```json
{
  "event_type": "vehicle_published",
  "vehicle_id": "uuid",
  "name": "Tesla Model 3",
  "status": "free",
  "changes": {
    "status": {"from": "draft", "to": "free"}
  },
  "entity_id": "vehicle-uuid",
  "user_id": "owner-uuid"
}
```

#### `vehicle_archived` - Vehicle archived
```json
{
  "event_type": "vehicle_archived",
  "vehicle_id": "uuid",
  "name": "Tesla Model 3",
  "status": "archived",
  "changes": {
    "status": {"from": "free", "to": "archived"}
  },
  "entity_id": "vehicle-uuid",
  "user_id": "owner-uuid"
}
```

#### `vehicle_deleted` - Single vehicle deleted
```json
{
  "event_type": "vehicle_deleted",
  "vehicle_id": "uuid",
  "name": "Deleted Vehicle",
  "status": "deleted",
  "entity_id": "vehicle-uuid",
  "user_id": "owner-uuid"
}
```

#### `vehicle_drafts_deleted` - Bulk draft deletion
```json
{
  "event_type": "vehicle_drafts_deleted",
  "deleted_count": 5,
  "entity_id": "bulk-operation-uuid",
  "user_id": "owner-uuid"
}
```

### Reservation Activities (OpenSearch events)

#### `reservation_created` - New booking made
```json
{
  "event_type": "reservation_created",
  "reservation_id": "uuid",
  "status": "pending",
  "total_price": 250.00,
  "start_date": "2025-10-25",
  "end_date": "2025-10-27",
  "vehicle_id": "vehicle-uuid",
  "entity_id": "reservation-uuid",
  "user_id": "rider-uuid"
}
```

#### `reservation_status_updated_collected` - Vehicle picked up
```json
{
  "event_type": "reservation_status_updated_collected",
  "reservation_id": "uuid",
  "status": "collected",
  "total_price": 250.00,
  "changes": {
    "status": {"from": "confirmed", "to": "collected"}
  },
  "entity_id": "reservation-uuid",
  "user_id": "rider-uuid"
}
```

#### `reservation_status_updated_completed` - Rental completed
```json
{
  "event_type": "reservation_status_updated_completed",
  "reservation_id": "uuid",
  "status": "completed",
  "total_price": 250.00,
  "changes": {
    "status": {"from": "collected", "to": "completed"}
  },
  "entity_id": "reservation-uuid",
  "user_id": "rider-uuid"
}
```

#### `reservation_status_updated_cancelled` - Booking cancelled
```json
{
  "event_type": "reservation_status_updated_cancelled",
  "reservation_id": "uuid",
  "status": "cancelled",
  "total_price": 250.00,
  "changes": {
    "status": {"from": "pending", "to": "cancelled"}
  },
  "entity_id": "reservation-uuid",
  "user_id": "rider-uuid"
}
```

## 9. "All" Category Implementation

### Backend Decision
❌ **No unified `/admin/activity/all` endpoint**

### Reason
Better performance and flexibility with client-side merge.

### Frontend Implementation (Recommended)

```typescript
async function fetchAllActivities(skip: number = 0, limit: number = 10) {
  // Fetch all 3 activity streams in parallel
  const [usersRes, vehiclesRes, reservationsRes] = await Promise.all([
    fetch(`/api/v1/admin/activity/users?skip=${skip}&limit=${limit}`),
    fetch(`/api/v1/admin/activity/vehicles?skip=${skip}&limit=${limit}`),
    fetch(`/api/v1/admin/activity/reservations?skip=${skip}&limit=${limit}`)
  ]);

  // Parse responses
  const [users, vehicles, reservations] = await Promise.all([
    usersRes.json(),
    vehiclesRes.json(),
    reservationsRes.json()
  ]);

  // Merge and sort by timestamp (newest first)
  const allActivities = [
    ...users.data,
    ...vehicles.data,
    ...reservations.data
  ]
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
    .slice(0, limit);  // Take only the top N after sorting

  return {
    data: allActivities,
    total: users.total + vehicles.total + reservations.total
  };
}
```

### Benefits
✅ Parallel requests (faster than sequential server-side merge)
✅ Flexible limit per category
✅ Simpler backend maintenance
✅ Easier debugging
✅ No additional backend endpoint needed

## 10. Frontend Implementation Guidance

### Icon Mapping

```typescript
import {
  UserPlusIcon,
  LoginIcon,
  PlusCircleIcon,
  EditIcon,
  CheckCircleIcon,
  ArchiveIcon,
  TrashIcon,
  CalendarIcon,
  TruckIcon,
  CheckIcon,
  XCircleIcon
} from '@heroicons/react/24/outline';

const activityIcons: Record<string, React.ComponentType> = {
  // Users
  'user_registered': UserPlusIcon,
  'user_login': LoginIcon,
  'rider_registered': UserPlusIcon,
  'rider_login': LoginIcon,

  // Vehicles
  'vehicle_created': PlusCircleIcon,
  'vehicle_updated': EditIcon,
  'vehicle_published': CheckCircleIcon,
  'vehicle_archived': ArchiveIcon,
  'vehicle_deleted': TrashIcon,
  'vehicle_drafts_deleted': TrashIcon,

  // Reservations
  'reservation_created': CalendarIcon,
  'reservation_status_updated_collected': TruckIcon,
  'reservation_status_updated_completed': CheckIcon,
  'reservation_status_updated_cancelled': XCircleIcon,
};

function getActivityIcon(activityType: string) {
  return activityIcons[activityType] || CalendarIcon; // Fallback
}
```

### Display Text Formatting

```typescript
// Helper to get user display name (handles system activities)
function getUserDisplayName(activity: Activity): string {
  if (activity.user_id === 'system') {
    return 'System';
  }
  return activity.details.user_name || 'Unknown User';
}

function formatActivityMessage(activity: Activity): string {
  const { activity_type, details } = activity;
  const userName = getUserDisplayName(activity);

  switch (activity_type) {
    // User activities
    case 'user_registered':
      return `${userName} registered as ${details.user_role}`;
    case 'user_login':
      return `${userName} logged in (${details.login_count} logins)`;
    case 'rider_registered':
      return `${userName} registered as Rider`;
    case 'rider_login':
      return `${userName} logged in (${details.login_count} logins)`;

    // Vehicle activities
    case 'vehicle_created':
      return `${details.name} created by owner`;
    case 'vehicle_updated':
      const changes = Object.keys(details.changes || {}).join(', ');
      return `${details.name} updated (${changes})`;
    case 'vehicle_published':
      return `${details.name} published and available for booking`;
    case 'vehicle_archived':
      return `${details.name} archived`;
    case 'vehicle_deleted':
      return `${details.name} deleted`;
    case 'vehicle_drafts_deleted':
      return `${details.deleted_count} draft vehicles deleted`;

    // Reservation activities
    case 'reservation_created':
      return `New booking for €${details.total_price}`;
    case 'reservation_status_updated_collected':
      return `Vehicle picked up for reservation ${details.reservation_id.slice(0, 8)}`;
    case 'reservation_status_updated_completed':
      return `Rental completed (€${details.total_price})`;
    case 'reservation_status_updated_cancelled':
      return `Booking cancelled (€${details.total_price})`;

    // Fallback
    default:
      return activity_type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  }
}
```

### Timestamp Formatting

```typescript
import { formatDistanceToNow } from 'date-fns';

function formatTimestamp(timestamp: string): string {
  const date = new Date(timestamp);
  return formatDistanceToNow(date, { addSuffix: true });
  // Result: "2 minutes ago", "3 hours ago", "5 days ago"
}

// Alternative: Show exact time for older activities
function formatTimestampSmart(timestamp: string): string {
  const date = new Date(timestamp);
  const now = new Date();
  const hoursDiff = (now.getTime() - date.getTime()) / (1000 * 60 * 60);

  if (hoursDiff < 24) {
    return formatDistanceToNow(date, { addSuffix: true });
  } else {
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }
}
```

### Pagination Implementation

```typescript
function ActivityFeed({ category }: { category: 'all' | 'users' | 'vehicles' | 'reservations' }) {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [skip, setSkip] = useState(0);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const limit = 10;

  const loadActivities = async (reset: boolean = false) => {
    setLoading(true);
    const currentSkip = reset ? 0 : skip;

    try {
      let data;

      if (category === 'all') {
        data = await fetchAllActivities(currentSkip, limit);
      } else {
        const response = await fetch(
          `/api/v1/admin/activity/${category}?skip=${currentSkip}&limit=${limit}`
        );
        data = await response.json();
      }

      if (reset) {
        setActivities(data.data);
        setSkip(limit);
      } else {
        setActivities([...activities, ...data.data]);
        setSkip(currentSkip + limit);
      }

      setHasMore(data.data.length === limit);
    } catch (error) {
      console.error('Failed to load activities:', error);
      // Show error toast/message
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadActivities(true); // Reset and load on category change
  }, [category]);

  return (
    <div>
      {activities.map(activity => (
        <ActivityItem key={`${activity.activity_type}-${activity.id}`} activity={activity} />
      ))}

      {hasMore && (
        <button onClick={() => loadActivities()} disabled={loading}>
          {loading ? 'Loading...' : 'Load More'}
        </button>
      )}
    </div>
  );
}
```

### Complete Activity Item Component

```typescript
interface ActivityItemProps {
  activity: Activity;
}

function ActivityItem({ activity }: ActivityItemProps) {
  const Icon = getActivityIcon(activity.activity_type);
  const message = formatActivityMessage(activity);
  const timeAgo = formatTimestamp(activity.timestamp);

  return (
    <div className="flex items-start space-x-3 p-4 hover:bg-gray-50">
      {/* Icon */}
      <div className="flex-shrink-0">
        <Icon className="w-6 h-6 text-gray-600" />
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <p className="text-sm text-gray-900">{message}</p>

        {/* Show changes if available */}
        {activity.details.changes && (
          <div className="mt-1 text-xs text-gray-500">
            {Object.entries(activity.details.changes).map(([field, change]) => (
              <div key={field}>
                {field}: <span className="line-through">{change.from}</span> → <span className="font-medium">{change.to}</span>
              </div>
            ))}
          </div>
        )}

        <p className="mt-1 text-xs text-gray-500">{timeAgo}</p>
      </div>

      {/* Link to entity */}
      {activity.details.entity_id && (
        <a
          href={getEntityUrl(activity)}
          className="text-sm text-blue-600 hover:text-blue-800"
        >
          View →
        </a>
      )}
    </div>
  );
}

function getEntityUrl(activity: Activity): string {
  const { activity_type, details } = activity;

  if (activity_type.startsWith('vehicle_')) {
    return `/admin/vehicles/${details.vehicle_id}`;
  } else if (activity_type.startsWith('reservation_')) {
    return `/admin/reservations/${details.reservation_id}`;
  } else if (activity_type.startsWith('user_') || activity_type.startsWith('rider_')) {
    return `/admin/users/${details.user_id}`;
  }

  return '#';
}
```

## 11. Testing Recommendations

### Test Cases

1. **Empty State**
   - Test with no activities
   - Show proper empty state message

2. **Pagination**
   - Test "Load More" button
   - Verify skip/limit parameters
   - Test reaching end of activities

3. **Tab Switching**
   - Switch between "All", "Users", "Vehicles", "Reservations"
   - Verify state resets on switch
   - Test loading states

4. **Timestamp Formatting**
   - Test various time ranges (minutes, hours, days ago)
   - Test edge cases (just now, very old)

5. **Activity with Changes**
   - Test activities with before/after changes
   - Verify changes display correctly

6. **Mixed Activity Types**
   - Test "All" view with mixed types
   - Verify sorting by timestamp
   - Test icon and message rendering

7. **Error Handling**
   - Test API failures
   - Test partial failures in "All" view
   - Test retry functionality

8. **Performance**
   - Test with large number of activities
   - Verify no memory leaks on pagination
   - Test rapid tab switching

### Mock Data for Testing

```typescript
const mockActivities: Activity[] = [
  {
    id: "550e8400-e29b-41d4-a716-446655440000",
    timestamp: new Date(Date.now() - 1000 * 60 * 2).toISOString(), // 2 minutes ago
    user_id: "123e4567-e89b-12d3-a456-426614174000",
    activity_type: "vehicle_created",
    details: {
      event_type: "vehicle_created",
      vehicle_id: "550e8400-e29b-41d4-a716-446655440000",
      name: "Tesla Model 3",
      status: "draft",
      vehicle_type: "sedan",
      brand: "Tesla",
      model: "Model 3",
      entity_id: "550e8400-e29b-41d4-a716-446655440000",
      user_id: "123e4567-e89b-12d3-a456-426614174000"
    }
  },
  {
    id: "123e4567-e89b-12d3-a456-426614174001",
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 3).toISOString(), // 3 hours ago
    user_id: "456e7890-e89b-12d3-a456-426614174000",
    activity_type: "user_registered",
    details: {
      user_id: "456e7890-e89b-12d3-a456-426614174000",
      user_email: "john@example.com",
      user_name: "John Doe",
      user_role: "OWNER"
    }
  },
  // Add more mock activities for different types
];
```

## 12. Known Limitations & Considerations

### ✅ Recently Resolved Issues
- ~~Validation errors in production~~ **FIXED in v2.1**
- ~~Missing user_id field~~ **FIXED in v2.1**
- ~~Null/empty values in responses~~ **FIXED in v2.1**

### Current Limitations

1. **Total Count**
   - The `total` field shows count of activities in the response, not total in the system
   - For accurate total count across all pages, would need separate count endpoint

2. **Pagination**
   - Backend currently fetches `limit + skip` records and slices client-side
   - For very large skip values (>100), may be slower
   - Future improvement: Native OpenSearch offset support

3. **Real-time Updates**
   - No WebSocket or Server-Sent Events (SSE) support
   - Frontend must implement polling or manual refresh
   - Recommended: 5-second polling when dashboard is visible

4. **Activity Retention**
   - No defined retention policy - all events stored indefinitely
   - May need archival strategy in the future for performance

5. **Data Consistency**
   - User activities: Real-time from PostgreSQL
   - Vehicle/Reservation activities: Near real-time (~1s delay via OpenSearch)
   - Small time lag possible between action and appearance in feed

### Future Enhancements

- [ ] WebSocket/SSE support for real-time updates
- [ ] Activity filtering (date range, specific users, status)
- [ ] Activity search functionality
- [ ] Export activities to CSV/JSON
- [ ] Activity retention and archival policy
- [ ] Separate count endpoint for accurate pagination
- [ ] Native OpenSearch offset support for better pagination

## 13. Next Steps

### Frontend Tasks

1. ✅ **Review this document** - Understand all activity types and schemas
2. **Implement ActivityFeed Component** - Main container with tab navigation
3. **Implement ActivityItem Component** - Individual activity display
4. **Add Icon Mapping** - Import and map icons to activity types
5. **Add Message Formatting** - Implement formatActivityMessage function
6. **Add Timestamp Formatting** - Implement formatTimestamp with date-fns
7. **Implement Pagination** - Add "Load More" functionality
8. **Implement "All" Tab** - Client-side merge of 3 endpoints
9. **Add Error Handling** - Handle API failures gracefully
10. **Add Loading States** - Show spinners during fetches
11. **Add Empty States** - Show message when no activities
12. **Add Tests** - Unit and integration tests
13. **Add Polling/Refresh** - Implement update mechanism

### Backend Support

Backend team is available for:
- API clarifications
- Schema questions
- Bug reports
- Performance optimization
- Feature requests

**Contact:** [Your team contact information]

---

## Changelog

### Version 2.1 (2025-10-23)
- ✅ Fixed validation errors in production/staging
- ✅ Added `user_id` field to all user activities
- ✅ Implemented intelligent fallback handling for missing fields
- ✅ Added system activity support (`user_id: "system"`)
- ✅ Updated frontend guidance with fallback handling examples
- ✅ Production tested and verified

### Version 2.0 (2025-10-23)
- Initial comprehensive documentation
- Complete API schemas and examples
- Frontend implementation guidance
- Testing recommendations

---

**Document Version:** 2.1
**Last Updated:** 2025-10-23
**Status:** Production Ready - All Validation Errors Fixed ✅
