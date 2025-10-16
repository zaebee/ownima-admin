# System Errors API Documentation

## Overview

This document describes the API endpoint for retrieving system errors to be displayed in the admin dashboard's System Monitoring page.

**Frontend Implementation Status:** ✅ Complete  
**Backend Implementation Status:** ⏳ Pending  
**Current State:** Using mock data

---

## Endpoint

### Get System Errors

Retrieves a list of recent system errors with filtering and pagination support.

```
GET /api/v1/admin/system/errors
```

**Authentication:** Required (Admin JWT token)

**Query Parameters:**

| Parameter    | Type              | Required | Default | Description                                                                                |
| ------------ | ----------------- | -------- | ------- | ------------------------------------------------------------------------------------------ |
| `limit`      | integer           | No       | 50      | Maximum number of errors to return (1-100)                                                 |
| `offset`     | integer           | No       | 0       | Number of errors to skip for pagination                                                    |
| `level`      | string            | No       | all     | Filter by error level: `CRITICAL`, `ERROR`, `WARNING`, `INFO`, or `all`                    |
| `resolved`   | boolean           | No       | -       | Filter by resolution status. `true` = resolved only, `false` = unresolved only, omit = all |
| `source`     | string            | No       | -       | Filter by error source (e.g., "Database", "API Gateway")                                   |
| `start_date` | string (ISO 8601) | No       | -       | Filter errors after this date                                                              |
| `end_date`   | string (ISO 8601) | No       | -       | Filter errors before this date                                                             |

---

## Data Structure

### SystemError Object

```typescript
interface SystemError {
  id: string; // Unique identifier for the error
  timestamp: string; // ISO 8601 datetime when error occurred
  level: 'CRITICAL' | 'ERROR' | 'WARNING' | 'INFO'; // Severity level
  source: string; // System component that generated the error
  message: string; // Human-readable error message
  error_code?: string; // Machine-readable error code (e.g., "DB_POOL_EXHAUSTED")
  stack_trace?: string; // Stack trace for debugging (optional)
  user_id?: string; // User ID if error is user-specific
  request_id?: string; // Request ID for tracing
  resolved: boolean; // Whether the error has been resolved
  resolution_time?: string; // ISO 8601 datetime when error was resolved
  affected_users?: number; // Number of users affected by this error
  tags?: string[]; // Tags for categorization (e.g., ["database", "performance"])
  metadata?: Record<string, any>; // Additional context-specific data
}
```

### Response Format

```typescript
interface SystemErrorsResponse {
  data: SystemError[];
  total: number; // Total number of errors matching filters
  limit: number; // Limit used in request
  offset: number; // Offset used in request
  statistics?: {
    // Optional statistics summary
    total: number;
    critical: number;
    errors: number;
    warnings: number;
    info: number;
    resolved: number;
    unresolved: number;
    resolution_rate: string; // Percentage as string (e.g., "75.5")
  };
}
```

---

## Request Examples

### Basic Request

```bash
GET /api/v1/admin/system/errors
Authorization: Bearer <admin_jwt_token>
```

### Filtered Request

```bash
GET /api/v1/admin/system/errors?level=CRITICAL&resolved=false&limit=20
Authorization: Bearer <admin_jwt_token>
```

### Date Range Request

```bash
GET /api/v1/admin/system/errors?start_date=2025-01-01T00:00:00Z&end_date=2025-01-31T23:59:59Z
Authorization: Bearer <admin_jwt_token>
```

---

## Response Examples

### Success Response (200 OK)

```json
{
  "data": [
    {
      "id": "err_abc123",
      "timestamp": "2025-01-15T14:30:00Z",
      "level": "CRITICAL",
      "source": "Database",
      "message": "Connection pool exhausted - maximum connections reached",
      "error_code": "DB_POOL_EXHAUSTED",
      "stack_trace": "at ConnectionPool.acquire (pool.js:234)\nat Database.query (db.js:89)",
      "resolved": false,
      "affected_users": 45,
      "tags": ["database", "performance", "urgent"],
      "metadata": {
        "pool_size": 100,
        "active_connections": 100,
        "waiting_requests": 23
      }
    },
    {
      "id": "err_def456",
      "timestamp": "2025-01-15T14:15:00Z",
      "level": "ERROR",
      "source": "API Gateway",
      "message": "Rate limit exceeded for IP 192.168.1.100",
      "error_code": "RATE_LIMIT_EXCEEDED",
      "user_id": "user_12345",
      "request_id": "req_abc123",
      "resolved": true,
      "resolution_time": "2025-01-15T14:20:00Z",
      "tags": ["rate-limiting", "security"],
      "metadata": {
        "ip_address": "192.168.1.100",
        "requests_per_minute": 150,
        "limit": 100
      }
    }
  ],
  "total": 2,
  "limit": 50,
  "offset": 0,
  "statistics": {
    "total": 10,
    "critical": 2,
    "errors": 3,
    "warnings": 4,
    "info": 1,
    "resolved": 6,
    "unresolved": 4,
    "resolution_rate": "60.0"
  }
}
```

### Error Response (401 Unauthorized)

```json
{
  "detail": "Authentication required"
}
```

### Error Response (403 Forbidden)

```json
{
  "detail": "Admin access required"
}
```

### Error Response (400 Bad Request)

```json
{
  "detail": "Invalid query parameter: level must be one of CRITICAL, ERROR, WARNING, INFO"
}
```

---

## Error Levels

### CRITICAL

- System-wide failures
- Service outages
- Data loss risks
- Security breaches
- **Examples:** Database down, authentication service failure, data corruption

### ERROR

- Significant failures affecting functionality
- Failed operations
- Integration failures
- **Examples:** API call failures, payment processing errors, file upload failures

### WARNING

- Potential issues that don't block functionality
- Performance degradation
- Deprecated feature usage
- **Examples:** Slow response times, high memory usage, deprecated API calls

### INFO

- Informational messages
- System state changes
- Monitoring alerts
- **Examples:** Cache miss rate high, scheduled maintenance, configuration changes

---

## Error Sources

Common error sources to use for consistency:

- `Database` - Database-related errors
- `API Gateway` - API gateway and routing errors
- `Authentication` - Auth and authorization errors
- `Payment Service` - Payment processing errors
- `Email Service` - Email delivery errors
- `File Storage` - File upload/download errors
- `Cache Service` - Redis/caching errors
- `Search Service` - Elasticsearch/search errors
- `Load Balancer` - Load balancing errors
- `Monitoring` - System monitoring alerts

---

## Error Codes

Recommended error code format: `COMPONENT_ERROR_TYPE`

**Examples:**

- `DB_POOL_EXHAUSTED`
- `DB_CONNECTION_TIMEOUT`
- `AUTH_INVALID_TOKEN`
- `AUTH_TOKEN_EXPIRED`
- `RATE_LIMIT_EXCEEDED`
- `PAYMENT_GATEWAY_TIMEOUT`
- `EMAIL_DELIVERY_FAILED`
- `STORAGE_QUOTA_EXCEEDED`
- `CACHE_MISS_HIGH`
- `LB_HEALTH_CHECK_FAILED`

---

## Tags

Recommended tags for categorization:

**By Component:**

- `database`, `api`, `authentication`, `payment`, `email`, `storage`, `cache`, `search`

**By Type:**

- `performance`, `security`, `availability`, `data-integrity`, `configuration`

**By Priority:**

- `urgent`, `high-priority`, `low-priority`

**By Impact:**

- `user-facing`, `internal`, `external-service`

---

## Implementation Guidelines

### 1. Data Storage

**Recommended Approach:**

- Store errors in a dedicated `system_errors` table
- Index on: `timestamp`, `level`, `resolved`, `source`
- Consider partitioning by date for large datasets
- Implement automatic cleanup of old errors (e.g., > 90 days)

**Schema Example (PostgreSQL):**

```sql
CREATE TABLE system_errors (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    level VARCHAR(20) NOT NULL CHECK (level IN ('CRITICAL', 'ERROR', 'WARNING', 'INFO')),
    source VARCHAR(100) NOT NULL,
    message TEXT NOT NULL,
    error_code VARCHAR(50),
    stack_trace TEXT,
    user_id VARCHAR(50),
    request_id VARCHAR(50),
    resolved BOOLEAN DEFAULT FALSE,
    resolution_time TIMESTAMPTZ,
    affected_users INTEGER,
    tags TEXT[],
    metadata JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_system_errors_timestamp ON system_errors(timestamp DESC);
CREATE INDEX idx_system_errors_level ON system_errors(level);
CREATE INDEX idx_system_errors_resolved ON system_errors(resolved);
CREATE INDEX idx_system_errors_source ON system_errors(source);
CREATE INDEX idx_system_errors_tags ON system_errors USING GIN(tags);
```

### 2. Error Collection

**Automatic Error Logging:**

```python
# Example middleware for automatic error logging
async def log_system_error(
    level: str,
    source: str,
    message: str,
    error_code: str = None,
    stack_trace: str = None,
    user_id: str = None,
    request_id: str = None,
    tags: list = None,
    metadata: dict = None
):
    """Log a system error to the database"""
    error = SystemError(
        timestamp=datetime.utcnow(),
        level=level,
        source=source,
        message=message,
        error_code=error_code,
        stack_trace=stack_trace,
        user_id=user_id,
        request_id=request_id,
        resolved=False,
        tags=tags or [],
        metadata=metadata or {}
    )
    await db.system_errors.insert(error)

    # Optional: Send critical errors to monitoring service
    if level == "CRITICAL":
        await notify_monitoring_service(error)
```

### 3. Query Optimization

**Efficient Querying:**

```python
async def get_system_errors(
    limit: int = 50,
    offset: int = 0,
    level: str = None,
    resolved: bool = None,
    source: str = None,
    start_date: datetime = None,
    end_date: datetime = None
):
    """Retrieve system errors with filters"""
    query = db.system_errors.select()

    # Apply filters
    if level and level != "all":
        query = query.where(SystemError.level == level)
    if resolved is not None:
        query = query.where(SystemError.resolved == resolved)
    if source:
        query = query.where(SystemError.source == source)
    if start_date:
        query = query.where(SystemError.timestamp >= start_date)
    if end_date:
        query = query.where(SystemError.timestamp <= end_date)

    # Order by timestamp descending (newest first)
    query = query.order_by(SystemError.timestamp.desc())

    # Get total count
    total = await query.count()

    # Apply pagination
    errors = await query.limit(limit).offset(offset).all()

    return {
        "data": errors,
        "total": total,
        "limit": limit,
        "offset": offset
    }
```

### 4. Statistics Calculation

**Efficient Statistics:**

```python
async def get_error_statistics():
    """Calculate error statistics"""
    stats = await db.system_errors.aggregate([
        {
            "$group": {
                "_id": None,
                "total": {"$sum": 1},
                "critical": {
                    "$sum": {"$cond": [{"$eq": ["$level", "CRITICAL"]}, 1, 0]}
                },
                "errors": {
                    "$sum": {"$cond": [{"$eq": ["$level", "ERROR"]}, 1, 0]}
                },
                "warnings": {
                    "$sum": {"$cond": [{"$eq": ["$level", "WARNING"]}, 1, 0]}
                },
                "info": {
                    "$sum": {"$cond": [{"$eq": ["$level", "INFO"]}, 1, 0]}
                },
                "resolved": {
                    "$sum": {"$cond": ["$resolved", 1, 0]}
                },
                "unresolved": {
                    "$sum": {"$cond": ["$resolved", 0, 1]}
                }
            }
        }
    ])

    if stats:
        stats = stats[0]
        stats["resolution_rate"] = f"{(stats['resolved'] / stats['total'] * 100):.1f}"

    return stats
```

### 5. Performance Considerations

- **Caching:** Cache statistics for 30-60 seconds
- **Pagination:** Always use limit/offset for large datasets
- **Indexes:** Ensure proper indexes on frequently queried fields
- **Archiving:** Move old errors to archive table after 90 days
- **Aggregation:** Pre-calculate statistics periodically

### 6. Security

- **Authentication:** Require admin JWT token
- **Authorization:** Verify user has admin role
- **Rate Limiting:** Implement rate limiting (e.g., 100 requests/minute)
- **Sensitive Data:** Sanitize stack traces and metadata before storing
- **PII Protection:** Don't include sensitive user data in error messages

---

## Frontend Integration

### Current Implementation

The frontend is currently using mock data from `src/mocks/systemErrors.ts`. To switch to the real API:

1. Update `src/pages/SystemPage.tsx`:

   ```typescript
   // Change this line:
   const [useMockErrors] = useState(true);

   // To:
   const [useMockErrors] = useState(false);
   ```

2. Update `src/services/admin.ts` to implement the endpoint:
   ```typescript
   async getSystemErrors(params?: {
     limit?: number;
     offset?: number;
     level?: string;
     resolved?: boolean;
     source?: string;
     start_date?: string;
     end_date?: string;
   }): Promise<SystemError[]> {
     const response = await apiClient.get<SystemErrorsResponse>(
       '/admin/system/errors',
       params
     );
     return response.data;
   }
   ```

### Expected Behavior

- **Auto-refresh:** Frontend refreshes data every 30 seconds
- **Filtering:** Users can filter by level and resolved status
- **Expandable Details:** Stack traces are shown in expandable sections
- **Statistics:** Summary statistics are displayed at the top
- **Responsive:** Works on mobile, tablet, and desktop

---

## Testing

### Test Cases

1. **Basic Retrieval**
   - Get all errors without filters
   - Verify pagination works correctly
   - Check response format matches schema

2. **Filtering**
   - Filter by each error level
   - Filter by resolved status
   - Filter by source
   - Filter by date range
   - Combine multiple filters

3. **Edge Cases**
   - Empty result set
   - Invalid query parameters
   - Large offset values
   - Invalid date formats

4. **Performance**
   - Response time < 500ms for 50 errors
   - Response time < 1s for 100 errors
   - Statistics calculation < 200ms

5. **Security**
   - Unauthorized access returns 401
   - Non-admin access returns 403
   - Rate limiting works correctly

### Sample Test Data

Use the mock data from `src/mocks/systemErrors.ts` as reference for creating test fixtures.

---

## Monitoring & Alerts

### Recommended Monitoring

1. **Error Rate Monitoring**
   - Alert if CRITICAL errors > 5 in 5 minutes
   - Alert if ERROR rate increases by 50%
   - Track resolution time for errors

2. **API Performance**
   - Monitor endpoint response time
   - Track query performance
   - Alert on slow queries (> 1s)

3. **Data Quality**
   - Ensure all required fields are populated
   - Validate error codes follow convention
   - Check for duplicate errors

---

## Migration Plan

### Phase 1: Backend Implementation

1. Create database schema
2. Implement error logging middleware
3. Create API endpoint with basic functionality
4. Add unit tests

### Phase 2: Integration

1. Test endpoint with Postman/curl
2. Update frontend to use real API
3. Test in development environment
4. Fix any data format mismatches

### Phase 3: Production

1. Deploy to staging
2. Monitor for issues
3. Deploy to production
4. Enable auto-refresh in frontend

---

## Support

For questions or issues:

- **Frontend Team:** Check `src/pages/SystemPage.tsx` and `src/components/SystemErrorsPanel.tsx`
- **Mock Data:** See `src/mocks/systemErrors.ts` for reference implementation
- **Tests:** See `src/pages/SystemPage.test.tsx` for expected behavior

---

## Changelog

| Date       | Version | Changes                   |
| ---------- | ------- | ------------------------- |
| 2025-01-15 | 1.0     | Initial API specification |

---

## Appendix

### Complete TypeScript Interfaces

```typescript
// Copy these interfaces to your backend type definitions

interface SystemError {
  id: string;
  timestamp: string;
  level: 'CRITICAL' | 'ERROR' | 'WARNING' | 'INFO';
  source: string;
  message: string;
  error_code?: string;
  stack_trace?: string;
  user_id?: string;
  request_id?: string;
  resolved: boolean;
  resolution_time?: string;
  affected_users?: number;
  tags?: string[];
  metadata?: Record<string, any>;
}

interface SystemErrorsResponse {
  data: SystemError[];
  total: number;
  limit: number;
  offset: number;
  statistics?: {
    total: number;
    critical: number;
    errors: number;
    warnings: number;
    info: number;
    resolved: number;
    unresolved: number;
    resolution_rate: string;
  };
}

interface SystemErrorQueryParams {
  limit?: number;
  offset?: number;
  level?: 'CRITICAL' | 'ERROR' | 'WARNING' | 'INFO' | 'all';
  resolved?: boolean;
  source?: string;
  start_date?: string;
  end_date?: string;
}
```

### Example cURL Commands

```bash
# Get all errors
curl -X GET "https://api.ownima.com/api/v1/admin/system/errors" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"

# Get unresolved critical errors
curl -X GET "https://api.ownima.com/api/v1/admin/system/errors?level=CRITICAL&resolved=false" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"

# Get errors with pagination
curl -X GET "https://api.ownima.com/api/v1/admin/system/errors?limit=20&offset=40" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"

# Get errors from specific source
curl -X GET "https://api.ownima.com/api/v1/admin/system/errors?source=Database" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```
