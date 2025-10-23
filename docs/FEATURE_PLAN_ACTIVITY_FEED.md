# Feature Plan: Admin Dashboard Activity Feed

## 1. Objective

To implement a comprehensive and user-friendly activity feed on the admin dashboard. This feature will consume the new, paginated activity endpoints to provide administrators with a clear, real-time overview of key events happening on the platform across different categories (Users, Vehicles, Reservations).

## 2. Key Features

- **Unified Dashboard Panel:** A new "Recent Activity" panel on the main dashboard displaying a mix of the 5-10 most recent activities from all categories.
- **Categorized Activity Views:** The main `ActivityTimeline` component will be enhanced with tabs or filters to allow viewing activities by specific categories: "All", "Users", "Vehicles", and "Reservations".
- **Pagination / Infinite Scroll:** Each activity feed will feature a "Load More" button to fetch and display older activities, ensuring good performance by not loading all events at once.
- **Dynamic Activity Items:** A reusable component will be created to render individual activity items. It will dynamically display a relevant icon, a human-readable description, and a timestamp for each event.

## 3. API Endpoints to be Used

The frontend will integrate with the following new backend endpoints:

- `GET /api/v1/admin/recent-user-activities`
- `GET /api/v1/admin/recent-vehicle-activities`
- `GET /api/v1/admin/recent-reservation-activities`

**Query Parameters:**
- `skip` (number): To handle pagination by skipping a certain number of records.
- `limit` (number): To control the number of activities returned in each request.

## 4. Proposed UI/UX Flow

- The existing `ActivityTimeline.tsx` component on the `DashboardPage.tsx` will be the central point for this feature.
- It will be updated to include tabs for filtering by category.
- The component will initially fetch the first page of activities for the "All" category.
- Clicking a category tab will fetch the first page of activities for that specific stream.
- Scrolling to the bottom of the list and clicking "Load More" will fetch the next page of activities for the currently selected category and append them to the list.

## 5. Data Mapping & Display Logic

The frontend will parse the `PaginatedActivityResponse` from the API. For each activity item:
- `activity_type`: This string will be used to determine which icon to display (e.g., a user icon for `USER_REGISTERED`) and to construct the descriptive text.
- `details`: This object will contain the specific data needed for the description (e.g., `{ "userName": "John Doe" }`).
- `timestamp`: This will be formatted into a user-friendly, relative time string (e.g., "2 minutes ago").

## 6. Questions for the Backend Team

1.  **Activity Types:** Could you provide a complete list of all possible `activity_type` enum values for users, vehicles, and reservations? This is essential for mapping them to the correct icons and text on the frontend.
2.  **Details Schema:** What is the specific structure of the `details` JSON object for each `activity_type`? Knowing the available fields will allow us to create rich, informative descriptions.
3.  **"All" Category:** Is there a single endpoint to get a paginated mix of all recent activities, or should the frontend make separate calls to the user, vehicle, and reservation endpoints and combine them?

This document should provide a solid foundation for your discussion. What is the next step?
