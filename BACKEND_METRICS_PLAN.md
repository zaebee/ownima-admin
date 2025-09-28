# Backend Metrics Plan: OpenSearch Implementation

## 🎯 Overview

This document outlines the complete backend API implementation plan for the **3-Block Admin Dashboard** based on team requirements and OpenSearch storage architecture.

### Team Requirements Recap
From team dialog (September 25, 2025):
- **3 блока**: Users (owner|rider), Vehicles (статусы), Reservations (статусы)
- **Filters**: dates, role, status
- **Main storage**: OpenSearch

---

## 📊 Complete Metrics Specification

### **Block 1: Users** 👥
| Metric | Description | OpenSearch Source |
|--------|-------------|-------------------|
| `total` | All registered users | `users` index count |
| `online_last_30_days` | Active users in last 30 days | `user-sessions` index with date filter |
| `internal` | Internal company users | `users` index where `user_type=internal` |
| `external` | External platform users | `users` index where `user_type=external` |
| `owners` | Vehicle owners | `users` index where `role=OWNER` |
| `riders` | Vehicle riders | `users` index where `role=RIDER` |
| `logins` | Login sessions (period-based) | `user-sessions` index with date range |

### **Block 2: Vehicles** 🚗
| Metric | Description | OpenSearch Source |
|--------|-------------|-------------------|
| `total` | All vehicles in system | `vehicles` index count |
| `draft` | Vehicles in draft state | `vehicles` index where `status=draft` |
| `free` | Available vehicles | `vehicles` index where `status=free` |
| `collected` | Currently rented vehicles | `vehicles` index where `status=collected` |
| `maintenance` | Vehicles under maintenance | `vehicles` index where `status=maintenance` |
| `archived` | Archived/inactive vehicles | `vehicles` index where `status=archived` |

### **Block 3: Reservations** 📅
| Metric | Description | OpenSearch Source |
|--------|-------------|-------------------|
| `total` | All reservations | `reservations` index count |
| `pending` | Awaiting confirmation | `reservations` index where `status=pending` |
| `confirmed` | Confirmed reservations | `reservations` index where `status=confirmed` |
| `collected` | Active/picked up reservations | `reservations` index where `status=collected` |
| `completed` | Finished reservations | `reservations` index where `status=completed` |
| `cancelled` | Cancelled reservations | `reservations` index where `status=cancelled` |
| `maintenance` | Maintenance-related reservations | `reservations` index where `status=maintenance` |

---

## 🗄️ OpenSearch Index Structure

### **1. Users Index (`users`)**
```json
{
  "mappings": {
    "properties": {
      "id": { "type": "keyword" },
      "email": { "type": "keyword" },
      "role": { "type": "keyword" }, // OWNER, RIDER
      "user_type": { "type": "keyword" }, // internal, external
      "is_active": { "type": "boolean" },
      "created_at": { "type": "date" },
      "updated_at": { "type": "date" },
      "last_login_at": { "type": "date" }
    }
  }
}
```

### **2. Vehicles Index (`vehicles`)**
```json
{
  "mappings": {
    "properties": {
      "id": { "type": "keyword" },
      "owner_id": { "type": "keyword" },
      "status": { "type": "keyword" }, // draft, free, collected, maintenance, archived
      "vehicle_type": { "type": "keyword" },
      "created_at": { "type": "date" },
      "updated_at": { "type": "date" },
      "location": { "type": "geo_point" }
    }
  }
}
```

### **3. Reservations Index (`reservations`)**
```json
{
  "mappings": {
    "properties": {
      "id": { "type": "keyword" },
      "user_id": { "type": "keyword" },
      "vehicle_id": { "type": "keyword" },
      "status": { "type": "keyword" }, // pending, confirmed, collected, completed, cancelled, maintenance
      "start_date": { "type": "date" },
      "end_date": { "type": "date" },
      "created_at": { "type": "date" },
      "updated_at": { "type": "date" }
    }
  }
}
```

### **4. User Sessions Index (`user-sessions`)**
```json
{
  "mappings": {
    "properties": {
      "id": { "type": "keyword" },
      "user_id": { "type": "keyword" },
      "login_at": { "type": "date" },
      "logout_at": { "type": "date" },
      "ip_address": { "type": "ip" },
      "user_agent": { "type": "text" }
    }
  }
}
```

---

## 🛠️ API Endpoint Specifications

### **1. Get All Block Metrics**
```
GET /admin/metrics/blocks
```

**Query Parameters:**
- `date_start` (optional): ISO date string
- `date_end` (optional): ISO date string
- `role` (optional): OWNER, RIDER, ALL
- `user_status` (optional): active, inactive
- `vehicle_status` (optional): draft, free, collected, maintenance, archived
- `reservation_status` (optional): pending, confirmed, collected, completed, cancelled, maintenance

**Response:**
```json
{
  "users": {
    "total": 1234,
    "online_last_30_days": 567,
    "internal": 89,
    "external": 1145,
    "owners": 456,
    "riders": 778,
    "logins": 890
  },
  "vehicles": {
    "total": 456,
    "draft": 67,
    "free": 123,
    "collected": 234,
    "maintenance": 12,
    "archived": 20
  },
  "reservations": {
    "total": 2345,
    "pending": 45,
    "confirmed": 567,
    "collected": 234,
    "completed": 1234,
    "cancelled": 123,
    "maintenance": 12
  }
}
```

### **2. Individual Block Endpoints**
```
GET /admin/metrics/users       # Users block only
GET /admin/metrics/vehicles    # Vehicles block only
GET /admin/metrics/reservations # Reservations block only
```

---

## 🔧 AdminMetricsService Implementation

### **Core Service Class**
```python
from opensearchpy import OpenSearch
from datetime import datetime, timedelta
from typing import Dict, Optional, Any
import redis

class AdminMetricsService:
    def __init__(self, opensearch_client: OpenSearch, redis_client: redis.Redis):
        self.os_client = opensearch_client
        self.redis_client = redis_client
        self.cache_ttl = 300  # 5 minutes

    async def get_block_metrics(self, filters: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
        """Get all block metrics with caching"""
        cache_key = self._build_cache_key("blocks", filters)
        cached = self.redis_client.get(cache_key)

        if cached:
            return json.loads(cached)

        users_metrics = await self._get_users_metrics(filters)
        vehicles_metrics = await self._get_vehicles_metrics(filters)
        reservations_metrics = await self._get_reservations_metrics(filters)

        result = {
            "users": users_metrics,
            "vehicles": vehicles_metrics,
            "reservations": reservations_metrics
        }

        self.redis_client.setex(cache_key, self.cache_ttl, json.dumps(result))
        return result
```

### **Users Metrics Implementation**
```python
async def _get_users_metrics(self, filters: Optional[Dict[str, Any]] = None) -> Dict[str, int]:
    """Calculate users block metrics using OpenSearch aggregations"""

    # Base query with date filters
    base_query = self._build_base_query(filters)

    # Multi-aggregation query for efficiency
    agg_query = {
        "size": 0,
        "query": base_query,
        "aggs": {
            "total_users": {"value_count": {"field": "id"}},
            "owners": {
                "filter": {"term": {"role": "OWNER"}},
                "aggs": {"count": {"value_count": {"field": "id"}}}
            },
            "riders": {
                "filter": {"term": {"role": "RIDER"}},
                "aggs": {"count": {"value_count": {"field": "id"}}}
            },
            "internal_users": {
                "filter": {"term": {"user_type": "internal"}},
                "aggs": {"count": {"value_count": {"field": "id"}}}
            },
            "external_users": {
                "filter": {"term": {"user_type": "external"}},
                "aggs": {"count": {"value_count": {"field": "id"}}}
            }
        }
    }

    response = await self.os_client.search(index="users", body=agg_query)
    aggs = response["aggregations"]

    # Get online users (last 30 days) from sessions index
    online_30_days = await self._get_online_users_count(30)

    # Get login sessions count based on date filter
    logins_count = await self._get_login_sessions_count(filters)

    return {
        "total": aggs["total_users"]["value"],
        "online_last_30_days": online_30_days,
        "internal": aggs["internal_users"]["count"]["value"],
        "external": aggs["external_users"]["count"]["value"],
        "owners": aggs["owners"]["count"]["value"],
        "riders": aggs["riders"]["count"]["value"],
        "logins": logins_count
    }
```

### **Vehicles Metrics Implementation**
```python
async def _get_vehicles_metrics(self, filters: Optional[Dict[str, Any]] = None) -> Dict[str, int]:
    """Calculate vehicles block metrics"""

    vehicle_statuses = ["draft", "free", "collected", "maintenance", "archived"]

    # Build aggregation for all vehicle statuses
    agg_query = {
        "size": 0,
        "query": self._build_base_query(filters, index_type="vehicles"),
        "aggs": {
            "total_vehicles": {"value_count": {"field": "id"}},
            **{
                f"{status}_vehicles": {
                    "filter": {"term": {"status": status}},
                    "aggs": {"count": {"value_count": {"field": "id"}}}
                }
                for status in vehicle_statuses
            }
        }
    }

    response = await self.os_client.search(index="vehicles", body=agg_query)
    aggs = response["aggregations"]

    return {
        "total": aggs["total_vehicles"]["value"],
        "draft": aggs["draft_vehicles"]["count"]["value"],
        "free": aggs["free_vehicles"]["count"]["value"],
        "collected": aggs["collected_vehicles"]["count"]["value"],
        "maintenance": aggs["maintenance_vehicles"]["count"]["value"],
        "archived": aggs["archived_vehicles"]["count"]["value"]
    }
```

### **Reservations Metrics Implementation**
```python
async def _get_reservations_metrics(self, filters: Optional[Dict[str, Any]] = None) -> Dict[str, int]:
    """Calculate reservations block metrics"""

    reservation_statuses = ["pending", "confirmed", "collected", "completed", "cancelled", "maintenance"]

    agg_query = {
        "size": 0,
        "query": self._build_base_query(filters, index_type="reservations"),
        "aggs": {
            "total_reservations": {"value_count": {"field": "id"}},
            **{
                f"{status}_reservations": {
                    "filter": {"term": {"status": status}},
                    "aggs": {"count": {"value_count": {"field": "id"}}}
                }
                for status in reservation_statuses
            }
        }
    }

    response = await self.os_client.search(index="reservations", body=agg_query)
    aggs = response["aggregations"]

    return {
        "total": aggs["total_reservations"]["value"],
        "pending": aggs["pending_reservations"]["count"]["value"],
        "confirmed": aggs["confirmed_reservations"]["count"]["value"],
        "collected": aggs["collected_reservations"]["count"]["value"],
        "completed": aggs["completed_reservations"]["count"]["value"],
        "cancelled": aggs["cancelled_reservations"]["count"]["value"],
        "maintenance": aggs["maintenance_reservations"]["count"]["value"]
    }
```

---

## ⚡ Performance Optimization

### **1. Caching Strategy**
- **Redis Cache**: 5-minute TTL for frequently accessed metrics
- **Query-level Caching**: Cache individual aggregation results
- **Smart Invalidation**: Invalidate cache on data updates

### **2. OpenSearch Optimization**
```python
# Use time-based indices for better performance
def _get_index_pattern(self, date_range: Optional[Dict[str, str]] = None) -> str:
    """Generate optimized index pattern based on date range"""
    if not date_range:
        return "users-*"  # Query all indices

    start_date = datetime.fromisoformat(date_range["start"])
    end_date = datetime.fromisoformat(date_range["end"])

    # Generate monthly index pattern for efficiency
    indices = []
    current = start_date.replace(day=1)
    while current <= end_date:
        indices.append(f"users-{current.strftime('%Y-%m')}")
        current = current.replace(month=current.month + 1) if current.month < 12 else current.replace(year=current.year + 1, month=1)

    return ",".join(indices)
```

### **3. Query Optimization**
- **Aggregation Batching**: Combine multiple metrics in single query
- **Filter Optimization**: Push filters down to OpenSearch level
- **Field Selection**: Only fetch required fields

---

## 🔍 Filter Implementation

### **Date Range Filtering**
```python
def _build_date_filter(self, filters: Dict[str, Any], field: str = "created_at") -> Dict[str, Any]:
    """Build OpenSearch date range filter"""
    if not filters or not filters.get("date_start"):
        return {}

    date_filter = {"range": {field: {}}}

    if filters.get("date_start"):
        date_filter["range"][field]["gte"] = filters["date_start"]

    if filters.get("date_end"):
        date_filter["range"][field]["lte"] = filters["date_end"]

    return date_filter
```

### **Role and Status Filtering**
```python
def _build_base_query(self, filters: Optional[Dict[str, Any]] = None, index_type: str = "users") -> Dict[str, Any]:
    """Build base OpenSearch query with all filters"""
    must_clauses = []

    # Date filtering
    if filters and (filters.get("date_start") or filters.get("date_end")):
        date_field = "created_at"  # Default
        if index_type == "sessions":
            date_field = "login_at"
        elif index_type == "reservations":
            date_field = "start_date"

        date_filter = self._build_date_filter(filters, date_field)
        if date_filter:
            must_clauses.append(date_filter)

    # Role filtering (users only)
    if index_type == "users" and filters and filters.get("role") and filters["role"] != "ALL":
        must_clauses.append({"term": {"role": filters["role"]}})

    # Status filtering
    if filters and filters.get(f"{index_type}_status"):
        must_clauses.append({"term": {"status": filters[f"{index_type}_status"]}})

    if not must_clauses:
        return {"match_all": {}}

    return {"bool": {"must": must_clauses}}
```

---

## 📈 Real-time Data Considerations

### **1. Data Freshness**
- **Near Real-time**: OpenSearch refresh interval set to 1 second
- **Cache Strategy**: Short TTL (5 minutes) for balance between performance and freshness
- **Event-driven Updates**: Invalidate cache on critical data changes

### **2. Live Indicators**
- **WebSocket Updates**: Push metric updates to frontend
- **Change Detection**: Monitor OpenSearch for significant metric changes
- **Throttling**: Limit update frequency to prevent spam

---

## 🛡️ Error Handling & Fallbacks

### **1. Graceful Degradation**
```python
async def get_block_metrics_with_fallback(self, filters: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
    """Get metrics with fallback to cached or default values"""
    try:
        return await self.get_block_metrics(filters)
    except OpenSearchException as e:
        logger.error(f"OpenSearch error: {e}")
        # Return cached data if available
        cached = self._get_cached_metrics("blocks", filters)
        if cached:
            return cached
        # Return default structure with zeros
        return self._get_default_metrics()
    except Exception as e:
        logger.error(f"Unexpected error: {e}")
        return self._get_default_metrics()
```

### **2. Monitoring & Alerting**
- **Query Performance**: Monitor slow queries (>100ms)
- **Error Rates**: Alert on high error rates (>5%)
- **Cache Hit Ratio**: Monitor cache effectiveness (target >80%)

---

## 🚀 Implementation Phases

### **Phase 1: Core Metrics Endpoints (Week 1)**
- [ ] Implement basic `/admin/metrics/blocks` endpoint
- [ ] Set up OpenSearch indices and mappings
- [ ] Basic aggregation queries for all three blocks
- [ ] Simple date filtering

### **Phase 2: Advanced Filtering (Week 2)**
- [ ] Role-based filtering implementation
- [ ] Status filtering for vehicles and reservations
- [ ] Complex date range handling
- [ ] Individual block endpoints

### **Phase 3: Performance Optimization (Week 3)**
- [ ] Redis caching layer
- [ ] Query optimization and batching
- [ ] Time-based index patterns
- [ ] Performance monitoring

### **Phase 4: Real-time Features (Week 4)**
- [ ] WebSocket integration for live updates
- [ ] Cache invalidation strategies
- [ ] Error handling and fallbacks
- [ ] Production monitoring and alerting

---

## 🧪 Testing Strategy

### **1. Unit Tests**
- Test individual metric calculation functions
- Mock OpenSearch responses for consistent testing
- Validate filter logic and edge cases

### **2. Integration Tests**
- End-to-end API endpoint testing
- OpenSearch integration with real data
- Cache behavior validation

### **3. Performance Tests**
- Load testing with large datasets
- Query performance benchmarking
- Cache effectiveness measurement

---

## 📚 Dependencies

### **Backend Requirements**
```
opensearch-py>=2.0.0
redis>=4.0.0
fastapi>=0.100.0
pydantic>=2.0.0
python-dateutil>=2.8.0
```

### **OpenSearch Configuration**
- Minimum version: OpenSearch 2.0+
- Required plugins: none (using core functionality)
- Recommended settings: `refresh_interval: "1s"` for near real-time data

---

## 🔗 Integration Points

### **Frontend Integration**
- Uses TypeScript interfaces defined in `src/types/index.ts`
- Connects to admin service methods in `src/services/admin.ts`
- Supports all filter parameters defined in `FilterParams` interface

### **Existing Systems**
- Aligns with current authentication and authorization
- Follows existing API response patterns
- Maintains compatibility with Sacred Code Protection principles

---

**Document Status**: ✅ Complete Implementation Plan
**Last Updated**: September 28, 2025
**Version**: 1.0.0
**Sacred Compliance**: Trinity Score Compatible 🌟