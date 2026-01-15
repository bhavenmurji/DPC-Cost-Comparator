/**
 * Global Test Setup
 * Runs before all tests
 */
import { expect, afterEach, vi } from 'vitest'
import { cleanup } from '@testing-library/react'
import '@testing-library/jest-dom'

// Cleanup after each test
afterEach(() => {
  cleanup()
  vi.clearAllMocks()
})

// Mock environment variables
process.env.NODE_ENV = 'test'
process.env.DATABASE_URL = 'postgresql://localhost:5432/test_db'
process.env.JWT_SECRET = 'test-secret-key'

// Mock console methods to reduce noise in tests
global.console = {
  ...console,
  // Keep error and warn for debugging
  error: vi.fn(),
  warn: vi.fn(),
  // Silent log and debug in tests
  log: vi.fn(),
  debug: vi.fn(),
  info: vi.fn(),
}

// Mock fetch for API tests
global.fetch = vi.fn()

// Mock window.matchMedia for responsive tests
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation((query) => ({
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
  constructor() { }
  disconnect() { }
  observe() { }
  takeRecords() {
    return []
  }
  unobserve() { }
} as any
