import '@testing-library/jest-dom/vitest'
import { afterAll, afterEach, beforeAll, vi } from 'vitest'
import { cleanup } from '@testing-library/react'
import { server } from './src/mocks/server'

// Set up window.location for tests
Object.defineProperty(window, 'location', {
  writable: true,
  value: {
    hostname: 'localhost',
    href: 'http://localhost:5173',
    origin: 'http://localhost:5173',
    protocol: 'http:',
    host: 'localhost:5173',
    port: '5173',
    pathname: '/',
    search: '',
    hash: '',
  },
})

// Start MSW server
beforeAll(() => {
  server.listen({ 
    onUnhandledRequest: 'warn'
  })
})

// Reset handlers and cleanup after each test
afterEach(() => {
  server.resetHandlers()
  cleanup()
  vi.clearAllMocks()
  localStorage.clear()
})

// Close server after all tests
afterAll(() => {
  server.close()
})

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
})

// Mock IntersectionObserver
global.IntersectionObserver = class IntersectionObserver {
  constructor() {}
  disconnect() {}
  observe() {}
  takeRecords() {
    return []
  }
  unobserve() {}
} as unknown as typeof IntersectionObserver

// Mock ResizeObserver
global.ResizeObserver = class ResizeObserver {
  constructor() {}
  disconnect() {}
  observe() {}
  unobserve() {}
} as unknown as typeof ResizeObserver
