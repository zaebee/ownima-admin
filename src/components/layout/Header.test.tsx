import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Header } from './Header'
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

const mockLogout = vi.fn()

const renderHeader = (user: User | null = mockUser) => {
  return render(
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading: false,
        login: vi.fn(),
        logout: mockLogout,
      }}
    >
      <Header />
    </AuthContext.Provider>
  )
}

describe('Header', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('Rendering', () => {
    it('renders header with user information', () => {
      renderHeader()
      
      expect(screen.getByText('John')).toBeInTheDocument()
    })

    it('displays user first name initial in avatar', () => {
      renderHeader()
      
      expect(screen.getByText('J')).toBeInTheDocument()
    })

    it('displays email when first name is not available', () => {
      const userWithoutName = { ...mockUser, first_name: '', last_name: '' }
      renderHeader(userWithoutName)
      
      expect(screen.getByText('test@example.com')).toBeInTheDocument()
    })

    it('displays email first letter in avatar when no first name', () => {
      const userWithoutName = { ...mockUser, first_name: '', last_name: '' }
      renderHeader(userWithoutName)
      
      expect(screen.getByText('T')).toBeInTheDocument()
    })

    it('displays default avatar when no user data', () => {
      const minimalUser = { ...mockUser, first_name: '', last_name: '', email: '' }
      renderHeader(minimalUser)
      
      expect(screen.getByText('U')).toBeInTheDocument()
    })

    it('renders mobile menu button', () => {
      renderHeader()
      
      expect(screen.getByRole('button', { name: /open sidebar/i })).toBeInTheDocument()
    })

    it('renders notifications button', () => {
      renderHeader()
      
      expect(screen.getByRole('button', { name: /view notifications/i })).toBeInTheDocument()
    })

    it('renders user menu button', () => {
      renderHeader()
      
      expect(screen.getByRole('button', { name: /open user menu/i })).toBeInTheDocument()
    })
  })

  describe('User Menu', () => {
    it('opens user menu on click', async () => {
      const user = userEvent.setup()
      renderHeader()
      
      const menuButton = screen.getByRole('button', { name: /open user menu/i })
      await user.click(menuButton)
      
      await waitFor(() => {
        expect(screen.getByText('Your profile')).toBeInTheDocument()
      })
      expect(screen.getByText('Settings')).toBeInTheDocument()
      expect(screen.getByText('Sign out')).toBeInTheDocument()
    })

    it('calls logout when sign out is clicked', async () => {
      const user = userEvent.setup()
      renderHeader()
      
      const menuButton = screen.getByRole('button', { name: /open user menu/i })
      await user.click(menuButton)
      
      await waitFor(() => {
        expect(screen.getByText('Sign out')).toBeInTheDocument()
      })
      
      const signOutButton = screen.getByText('Sign out')
      await user.click(signOutButton)
      
      expect(mockLogout).toHaveBeenCalledTimes(1)
    })

    it('displays all menu items', async () => {
      const user = userEvent.setup()
      renderHeader()
      
      const menuButton = screen.getByRole('button', { name: /open user menu/i })
      await user.click(menuButton)
      
      await waitFor(() => {
        expect(screen.getByText('Your profile')).toBeInTheDocument()
        expect(screen.getByText('Settings')).toBeInTheDocument()
        expect(screen.getByText('Sign out')).toBeInTheDocument()
      })
    })
  })

  describe('Responsive Behavior', () => {
    it('shows mobile menu button on small screens', () => {
      renderHeader()
      
      const mobileButton = screen.getByRole('button', { name: /open sidebar/i })
      expect(mobileButton).toBeInTheDocument()
      expect(mobileButton).toHaveClass('lg:hidden')
    })

    it('hides user name on small screens', () => {
      renderHeader()
      
      const userName = screen.getByText('John')
      expect(userName.parentElement).toHaveClass('hidden', 'lg:flex')
    })
  })

  describe('Accessibility', () => {
    it('has proper ARIA labels for buttons', () => {
      renderHeader()
      
      expect(screen.getByRole('button', { name: /open sidebar/i })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /view notifications/i })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /open user menu/i })).toBeInTheDocument()
    })

    it('has screen reader text for icons', () => {
      renderHeader()
      
      expect(screen.getByText('Open sidebar')).toBeInTheDocument()
      expect(screen.getByText('View notifications')).toBeInTheDocument()
      expect(screen.getByText('Open user menu')).toBeInTheDocument()
    })
  })

  describe('Edge Cases', () => {
    it('handles null user gracefully', () => {
      renderHeader(null)
      
      expect(screen.getByText('U')).toBeInTheDocument()
    })

    it('handles user with only email', () => {
      const emailOnlyUser = {
        ...mockUser,
        first_name: '',
        last_name: '',
      }
      renderHeader(emailOnlyUser)
      
      expect(screen.getByText('test@example.com')).toBeInTheDocument()
      expect(screen.getByText('T')).toBeInTheDocument()
    })

    it('handles very long names', () => {
      const longNameUser = {
        ...mockUser,
        first_name: 'VeryLongFirstNameThatShouldBeDisplayed',
      }
      renderHeader(longNameUser)
      
      expect(screen.getByText('VeryLongFirstNameThatShouldBeDisplayed')).toBeInTheDocument()
      expect(screen.getByText('V')).toBeInTheDocument()
    })
  })
})
