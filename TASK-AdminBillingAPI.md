# Task: Implement Billing, Transactions & Payouts API

**Role:** Backend AI Teammate (Golang/PostgreSQL/Message Broker)
**Context:** We need to implement the billing and transactions engine for the admin dashboard. This view will aggregate all financial movements on the platform: reservation payments, security deposits (holds), refunds, owner payouts, and fines/claims. The frontend relies on a unified transactions list, supported by KPI metrics.

---

## 1. `GET /api/v1/admin/billing/kpi`

**Purpose:** Returns the aggregate KPIs shown at the top of the Billing page.

**Response Format:**
```json
{
  "data": {
    "platform_revenue_30d": 145200.0,
    "pending_payouts": 84000.0,
    "active_holds": 120000.0,
    "currency": "THB"
  },
  "error": ""
}
```

---

## 2. `GET /api/v1/admin/transactions`

**Purpose:** Returns a paginated, unified list of all transactions and holds.

**Request Parameters:**
- `skip` (int): Pagination offset.
- `limit` (int): Pagination per page limit.
- `type` (string, optional): Filter by `Payment`, `Hold`, `Payout`, `Fine`, `Refund`.
- `q_search` (string, optional): Search by Transaction ID, Reservation ID, or Party name.

**Response Format:**
```json
{
  "data": [
    {
      "id": "TXN-101",
      "date": "2023-11-01T10:25:00Z",
      "type": "Payment", 
      "amount": 39100,
      "currency": "THB",
      "status": "Completed", // active, pending, completed, processed, released, failed
      "entity_id": "RES-101",
      "party_name": "Alice Williams",
      "net_impact": "positive" // positive (inflow to platform/balance), negative (outflow/payout), neutral (hold)
    },
    {
      "id": "TXN-103",
      "date": "2023-11-02T08:00:00Z",
      "type": "Payout",
      "amount": 28000,
      "currency": "THB",
      "status": "Pending",
      "entity_id": "Monthly October",
      "party_name": "Demo Account (Owner)",
      "net_impact": "negative"
    }
  ],
  "count": 2,
  "error": ""
}
```

## Considerations for the Backend AI Teammate:
1. **Ledger Immutability:** Financial events (payments, refunds, fines) should be treated as immutable ledger entries.
2. **Net Impact Logic:** The `net_impact` field helps the frontend quickly decide icon colors (Green/Red/Gray). Platform income is `positive`, platform expenditure (payouts to owners or refunds) is `negative`, and reserved funds (holds/deposits) are `neutral`. 
3. **Payment Gateways:** Consider how to structure the internal transaction so it can trace back to a stripe/provider charge ID if needed later on the detailed transaction view.
4. **Performance:** Depending on volume, the KPI endpoint might need a materialized view or cached aggregation (e.g., Redis).
