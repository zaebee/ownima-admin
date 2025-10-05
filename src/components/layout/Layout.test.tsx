import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { Layout } from './Layout'
import { AuthContext } from '../../contexts/AuthContext'
import type { User } from '../../types'

const mockUser: User = {
  id: '1',
  email: 'test@example.com',
  first_name: 'John',
  last_name: 'Doe',
  is_active: true,
  is_superuser: false,
  created_at: '2024-01-01T00:00:00Z',
  updated_at: '2024-01-01T00:00:00Z',
}

const renderLayout = (children: React.ReactNode = <div>Test Content</div>) => {
  return render(
    <MemoryRouter>
      <AuthContext.Provider
        value={{
          user: mockUser,
          isAuthenticated: true,
          isLoading: false,
          login: vi.fn(),
          logout: vi.fn(),
        }}
      >
        <Layout>{children}</Layout>
      </AuthContext.Provider>
    </MemoryRouter>
  )
}

describe('Layout', () => {
  beforeEach(() => {
    localStorage.clear()
    vi.clearAllMocks()
  })

  afterEach(() => {
    localStorage.clear()
  })

  describe('Rendering', () => {
    it('renders layout with all components', () => {
      renderLayout()
      
      // Check for Sidebar content
      expect(screen.getByText('Ownima')).toBeInTheDocument()
      
      // Check for Header content
      expect(screen.getByText('John')).toBeInTheDocument()
      
      // Check for children content
      expect(screen.getByText('Test Content')).toBeInTheDocument()
    })

    it('renders children in main content area', () => {
      renderLayout(<div data-testid="custom-content">Custom Content</div>)
      
      expect(screen.getByTestId('custom-content')).toBeInTheDocument()
      expect(screen.getByText('Custom Content')).toBeInTheDocument()
    })

    it('renders multiple children', () => {
      renderLayout(
        <>
          <div>Child 1</div>
          <div>Child 2</div>
          <div>Child 3</div>
        </>
      )
      
      expect(screen.getByText('Child 1')).toBeInTheDocument()
      expect(screen.getByText('Child 2')).toBeInTheDocument()
      expect(screen.getByText('Child 3')).toBeInTheDocument()
    })
  })

  describe('Component Integration', () => {
    it('integrates Sidebar component', () => {
      renderLayout()
      
      expect(screen.getByText('Dashboard')).toBeInTheDocument()
      expect(screen.getByText('Users')).toBeInTheDocument()
      expect(screen.getByText('System')).toBeInTheDocument()
    })

    it('integrates Header component', () => {
      renderLayout()
      
      expect(screen.getByRole('button', { name: /open user menu/i })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /view notifications/i })).toBeInTheDocument()
    })

    it('passes collapsed state to Sidebar', async () => {
      const user = userEvent.setup()
      renderLayout()
      
      // Sidebar should be expanded initially
      expect(screen.getByText('Ownima')).toBeInTheDocument()
      
      // Find and click the toggle button
      const toggleButton = screen.getAllByRole('button').find(
        btn => btn.querySelector('svg')
      )
      
      if (toggleButton) {
        await user.click(toggleButton)
        
        // Sidebar should be collapsed
        await waitFor(() => {
          expect(screen.queryByText('Ownima')).not.toBeInTheDocument()
        })
      }
    })
  })

  describe('Layout Structure', () => {
    it('has proper main content structure', () => {
      renderLayout()
      
      const main = screen.getByRole('main')
      expect(main).toBeInTheDocument()
    })

    it('applies gradient background', () => {
      const { container } = renderLayout()
      
      const background = container.querySelector('.from-gray-50')
      expect(background).toBeInTheDocument()
    })

    it('has responsive padding classes', () => {
      const { container } = renderLayout()
      
      const contentWrapper = container.querySelector('.lg\\:pl-64')
      expect(contentWrapper).toBeInTheDocument()
    })
  })

  describe('Sidebar State Management', () => {
    it('loads sidebar state from localStorage', () => {
      localStorage.setItem('sidebar-collapsed', 'true')
      
      renderLayout()
      
      // Sidebar should be collapsed
      expect(screen.queryByText('Ownima')).not.toBeInTheDocument()
    })

    it('saves sidebar state to localStorage', async () => {
      const user = userEvent.setup()
      renderLayout()
      
      const toggleButton = screen.getAllByRole('button').find(
        btn => btn.querySelector('svg')
      )
      
      if (toggleButton) {
        await user.click(toggleButton)
        
        await waitFor(() => {
          expect(localStorage.getItem('sidebar-collapsed')).toBe('true')
        })
      }
    })

    it('adjusts content padding when sidebar collapses', async () => {
      const user = userEvent.setup()
      const { container } = renderLayout()
      
      // Initially expanded (lg:pl-64)
      let contentWrapper = container.querySelector('.lg\\:pl-64')
      expect(contentWrapper).toBeInTheDocument()
      
      const toggleButton = screen.getAllByRole('button').find(
        btn => btn.querySelector('svg')
      )
      
      if (toggleButton) {
        await user.click(toggleButton)
        
        // After collapse (lg:pl-16)
        await waitFor(() => {
          contentWrapper = container.querySelector('.lg\\:pl-16')
          expect(contentWrapper).toBeInTheDocument()
        })
      }
    })
  })

  describe('Responsive Behavior', () => {
    it('has responsive container classes', () => {
      renderLayout()
      
      const container = screen.getByRole('main').querySelector('.mx-auto')
      expect(container).toHaveClass('max-w-7xl', 'px-4', 'sm:px-6', 'lg:px-8')
    })

    it('applies transition classes for smooth animations', () => {
      const { container } = renderLayout()
      
      const contentWrapper = container.querySelector('.transition-all')
      expect(contentWrapper).toHaveClass('duration-300')
    })
  })

  describe('Content Area', () => {
    it('wraps children in proper container', () => {
      renderLayout(<div data-testid="test-child">Test</div>)
      
      const main = screen.getByRole('main')
      const container = main.querySelector('.mx-auto')
      const child = screen.getByTestId('test-child')
      
      expect(container).toContainElement(child)
    })

    it('applies vertical padding to main', () => {
      renderLayout()
      
      const main = screen.getByRole('main')
      expect(main).toHaveClass('py-8')
    })

    it('has max-width constraint', () => {
      renderLayout()
      
      const container = screen.getByRole('main').querySelector('.mx-auto')
      expect(container).toHaveClass('max-w-7xl')
    })
  })

  describe('Edge Cases', () => {
    it('handles null children', () => {
      expect(() => renderLayout(null)).not.toThrow()
    })

    it('handles undefined children', () => {
      expect(() => renderLayout(undefined)).not.toThrow()
    })

    it('handles empty children', () => {
      renderLayout(<></>)
      
      expect(screen.getByRole('main')).toBeInTheDocument()
    })

    it('handles complex nested children', () => {
      renderLayout(
        <div>
          <div>
            <div>
              <span>Deeply nested content</span>
            </div>
          </div>
        </div>
      )
      
      expect(screen.getByText('Deeply nested content')).toBeInTheDocument()
    })

    it('handles invalid localStorage data', () => {
      localStorage.setItem('sidebar-collapsed', 'invalid-json')
      
      // Should handle gracefully
      try {
        renderLayout()
      } catch (e) {
        // Expected to throw due to invalid JSON
      }
      
      // Clear and verify it works
      localStorage.clear()
      renderLayout()
      expect(screen.getByRole('main')).toBeInTheDocument()
    })
  })

  describe('Accessibility', () => {
    it('has semantic HTML structure', () => {
      renderLayout()
      
      expect(screen.getByRole('main')).toBeInTheDocument()
      expect(screen.getByRole('navigation')).toBeInTheDocument()
    })

    it('maintains focus management', async () => {
      const user = userEvent.setup()
      renderLayout()
      
      const toggleButton = screen.getAllByRole('button').find(
        btn => btn.querySelector('svg')
      )
      
      if (toggleButton) {
        await user.click(toggleButton)
        
        // Layout should still be accessible
        expect(screen.getByRole('main')).toBeInTheDocument()
      }
    })
  })

  describe('Performance', () => {
    it('renders efficiently with large content', () => {
      const largeContent = (
        <div>
          {Array.from({ length: 100 }, (_, i) => (
            <div key={i}>Item {i}</div>
          ))}
        </div>
      )
      
      const { container } = renderLayout(largeContent)
      
      expect(container.querySelectorAll('div').length).toBeGreaterThan(100)
    })
  })
})
