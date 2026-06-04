export interface GroupedActivityItem {
  id: string
  timestamp: string
  user_id: string
  activity_type: string
  details: Record<string, any>
  count: number
  latest_timestamp: string
  earliest_timestamp: string
}

export function groupActivities(items: any[]): GroupedActivityItem[] {
  const grouped: GroupedActivityItem[] = []
  
  for (const item of items) {
    const prev = grouped[grouped.length - 1]
    
    if (!prev) {
      grouped.push({ ...item, count: 1, latest_timestamp: item.timestamp, earliest_timestamp: item.timestamp })
      continue
    }
    
    if (prev.activity_type === item.activity_type && prev.user_id === item.user_id) {
       const entityId1 = item.details?.entity_id || item.details?.vehicle_id || item.details?.reservation_id
       const entityId2 = prev.details?.entity_id || prev.details?.vehicle_id || prev.details?.reservation_id
       
       if (entityId1 === entityId2) {
          const t1 = new Date(prev.latest_timestamp).getTime()
          const t2 = new Date(item.timestamp).getTime()
          
          if (Math.abs(t1 - t2) < 24 * 60 * 60 * 1000) {
            prev.count = prev.count + 1
            prev.earliest_timestamp = item.timestamp
            continue
          }
       }
    }
    
    grouped.push({ ...item, count: 1, latest_timestamp: item.timestamp, earliest_timestamp: item.timestamp })
  }
  
  return grouped
}
