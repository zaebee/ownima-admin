/**
 * Mock data for system errors
 * This will be replaced with real API data once backend is implemented
 */

export interface SystemError {
  id: string;
  timestamp: string;
  level: 'ERROR' | 'WARNING' | 'INFO' | 'CRITICAL';
  source: string;
  message: string;
  stack_trace?: string;
  user_id?: string;
  request_id?: string;
  resolved: boolean;
  error_code?: string;
  affected_users?: number;
  resolution_time?: string;
  tags?: string[];
}

export const mockSystemErrors: SystemError[] = [
  {
    id: '1',
    timestamp: new Date(Date.now() - 5 * 60 * 1000).toISOString(), // 5 minutes ago
    level: 'CRITICAL',
    source: 'Database',
    message: 'Connection pool exhausted - maximum connections reached',
    error_code: 'DB_POOL_EXHAUSTED',
    affected_users: 45,
    resolved: false,
    tags: ['database', 'performance', 'urgent'],
    stack_trace: 'at ConnectionPool.acquire (pool.js:234)\nat Database.query (db.js:89)',
  },
  {
    id: '2',
    timestamp: new Date(Date.now() - 15 * 60 * 1000).toISOString(), // 15 minutes ago
    level: 'ERROR',
    source: 'API Gateway',
    message: 'Rate limit exceeded for IP 192.168.1.100',
    error_code: 'RATE_LIMIT_EXCEEDED',
    user_id: 'user_12345',
    request_id: 'req_abc123',
    resolved: true,
    resolution_time: new Date(Date.now() - 10 * 60 * 1000).toISOString(),
    tags: ['rate-limiting', 'security'],
  },
  {
    id: '3',
    timestamp: new Date(Date.now() - 30 * 60 * 1000).toISOString(), // 30 minutes ago
    level: 'WARNING',
    source: 'Payment Service',
    message: 'Payment gateway response time exceeded 5 seconds',
    error_code: 'PAYMENT_SLOW_RESPONSE',
    affected_users: 3,
    resolved: true,
    resolution_time: new Date(Date.now() - 25 * 60 * 1000).toISOString(),
    tags: ['payment', 'performance'],
  },
  {
    id: '4',
    timestamp: new Date(Date.now() - 45 * 60 * 1000).toISOString(), // 45 minutes ago
    level: 'ERROR',
    source: 'Authentication',
    message: 'Failed to verify JWT token - invalid signature',
    error_code: 'AUTH_INVALID_TOKEN',
    user_id: 'user_67890',
    request_id: 'req_def456',
    resolved: false,
    tags: ['authentication', 'security'],
  },
  {
    id: '5',
    timestamp: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(), // 1 hour ago
    level: 'INFO',
    source: 'Cache Service',
    message: 'Redis cache miss rate above 30% threshold',
    error_code: 'CACHE_MISS_HIGH',
    resolved: true,
    resolution_time: new Date(Date.now() - 50 * 60 * 1000).toISOString(),
    tags: ['cache', 'performance'],
  },
  {
    id: '6',
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
    level: 'WARNING',
    source: 'Email Service',
    message: 'Email delivery delayed - SMTP server timeout',
    error_code: 'EMAIL_DELIVERY_DELAYED',
    affected_users: 12,
    resolved: true,
    resolution_time: new Date(Date.now() - 1.5 * 60 * 60 * 1000).toISOString(),
    tags: ['email', 'external-service'],
  },
  {
    id: '7',
    timestamp: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(), // 3 hours ago
    level: 'ERROR',
    source: 'File Storage',
    message: 'S3 bucket quota exceeded - unable to upload files',
    error_code: 'STORAGE_QUOTA_EXCEEDED',
    affected_users: 8,
    resolved: false,
    tags: ['storage', 'quota'],
  },
  {
    id: '8',
    timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(), // 4 hours ago
    level: 'CRITICAL',
    source: 'Load Balancer',
    message: 'Health check failed for backend server 3',
    error_code: 'LB_HEALTH_CHECK_FAILED',
    affected_users: 120,
    resolved: true,
    resolution_time: new Date(Date.now() - 3.5 * 60 * 60 * 1000).toISOString(),
    tags: ['infrastructure', 'availability'],
  },
  {
    id: '9',
    timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(), // 5 hours ago
    level: 'WARNING',
    source: 'Search Service',
    message: 'Elasticsearch cluster yellow status - replica shards unassigned',
    error_code: 'ES_CLUSTER_YELLOW',
    resolved: false,
    tags: ['search', 'infrastructure'],
  },
  {
    id: '10',
    timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(), // 6 hours ago
    level: 'INFO',
    source: 'Monitoring',
    message: 'CPU usage exceeded 80% threshold for 5 minutes',
    error_code: 'CPU_HIGH_USAGE',
    resolved: true,
    resolution_time: new Date(Date.now() - 5.5 * 60 * 60 * 1000).toISOString(),
    tags: ['monitoring', 'performance'],
  },
];

/**
 * Get mock system errors
 * Simulates API call delay
 */
export const getMockSystemErrors = async (): Promise<SystemError[]> => {
  // Simulate network delay
  await new Promise((resolve) => setTimeout(resolve, 500));
  return mockSystemErrors;
};

/**
 * Get error statistics
 */
export const getErrorStatistics = () => {
  const total = mockSystemErrors.length;
  const critical = mockSystemErrors.filter((e) => e.level === 'CRITICAL').length;
  const errors = mockSystemErrors.filter((e) => e.level === 'ERROR').length;
  const warnings = mockSystemErrors.filter((e) => e.level === 'WARNING').length;
  const resolved = mockSystemErrors.filter((e) => e.resolved).length;
  const unresolved = total - resolved;

  return {
    total,
    critical,
    errors,
    warnings,
    resolved,
    unresolved,
    resolutionRate: ((resolved / total) * 100).toFixed(1),
  };
};
