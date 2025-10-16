import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { LandingPage } from './LandingPage'

const renderLandingPage = () => {
  return render(
    <MemoryRouter>
      <LandingPage />
    </MemoryRouter>
  )
}

describe('LandingPage', () => {
  describe('Rendering', () => {
    it('renders landing page', () => {
      renderLandingPage()
      
      expect(screen.getByText('Ownima Admin Portal')).toBeInTheDocument()
    })

    it('displays main heading', () => {
      renderLandingPage()
      
      expect(screen.getByRole('heading', { name: /ownima admin portal/i })).toBeInTheDocument()
    })

    it('displays subtitle', () => {
      renderLandingPage()
      
      expect(screen.getByText(/internal administration and user management/i)).toBeInTheDocument()
    })

    it('displays administration access section', () => {
      renderLandingPage()
      
      expect(screen.getByRole('heading', { name: /administration access/i })).toBeInTheDocument()
    })

    it('displays description text', () => {
      renderLandingPage()
      
      expect(screen.getByText(/secure access to platform administration tools/i)).toBeInTheDocument()
    })

    it('displays sign in button', () => {
      renderLandingPage()
      
      expect(screen.getByRole('link', { name: /sign in to admin panel/i })).toBeInTheDocument()
    })

    it('displays security notice', () => {
      renderLandingPage()
      
      expect(screen.getByText(/internal use only/i)).toBeInTheDocument()
      expect(screen.getByText(/authorized personnel access required/i)).toBeInTheDocument()
    })

    it('displays copyright notice', () => {
      renderLandingPage()
      
      expect(screen.getByText(/© 2024 ownima/i)).toBeInTheDocument()
    })

    it('renders logo icon', () => {
      const { container } = renderLandingPage()
      
      const logo = container.querySelector('svg')
      expect(logo).toBeInTheDocument()
    })
  })

  describe('Navigation', () => {
    it('has link to login page', () => {
      renderLandingPage()
      
      const loginLink = screen.getByRole('link', { name: /sign in to admin panel/i })
      expect(loginLink).toHaveAttribute('href', '/login')
    })

    it('login button has proper styling', () => {
      renderLandingPage()
      
      const loginLink = screen.getByRole('link', { name: /sign in to admin panel/i })
      expect(loginLink).toHaveClass('from-primary-600', 'to-indigo-600')
    })
  })

  describe('Visual Elements', () => {
    it('has gradient background', () => {
      const { container } = renderLandingPage()
      
      const background = container.querySelector('.from-indigo-900')
      expect(background).toBeInTheDocument()
    })

    it('has animated floating shapes', () => {
      const { container } = renderLandingPage()
      
      const animatedElements = container.querySelectorAll('.animate-pulse, .animate-bounce')
      expect(animatedElements.length).toBeGreaterThan(0)
    })

    it('has backdrop blur effect on card', () => {
      const { container } = renderLandingPage()
      
      const card = container.querySelector('.backdrop-blur-sm')
      expect(card).toBeInTheDocument()
    })

    it('has shadow effects', () => {
      const { container } = renderLandingPage()
      
      const shadowElements = container.querySelectorAll('.shadow-2xl, .shadow-lg')
      expect(shadowElements.length).toBeGreaterThan(0)
    })
  })

  describe('Responsive Design', () => {
    it('has responsive text sizes', () => {
      renderLandingPage()
      
      const heading = screen.getByRole('heading', { name: /ownima admin portal/i })
      expect(heading).toHaveClass('text-4xl', 'md:text-5xl')
    })

    it('has responsive padding', () => {
      const { container } = renderLandingPage()
      
      const mainContainer = container.querySelector('.px-4')
      expect(mainContainer).toHaveClass('sm:px-6', 'lg:px-8')
    })

    it('has max-width constraint', () => {
      const { container } = renderLandingPage()
      
      const contentWrapper = container.querySelector('.max-w-md')
      expect(contentWrapper).toBeInTheDocument()
    })
  })

  describe('Accessibility', () => {
    it('has proper heading hierarchy', () => {
      renderLandingPage()
      
      const h1 = screen.getByRole('heading', { level: 1 })
      const h2 = screen.getByRole('heading', { level: 2 })
      
      expect(h1).toBeInTheDocument()
      expect(h2).toBeInTheDocument()
    })

    it('has accessible link', () => {
      renderLandingPage()
      
      const link = screen.getByRole('link', { name: /sign in to admin panel/i })
      expect(link).toBeInTheDocument()
    })

    it('has descriptive text for screen readers', () => {
      renderLandingPage()
      
      expect(screen.getByText(/internal use only/i)).toBeInTheDocument()
      expect(screen.getByText(/authorized personnel access required/i)).toBeInTheDocument()
    })
  })

  describe('Content Structure', () => {
    it('has proper layout structure', () => {
      const { container } = renderLandingPage()
      
      expect(container.querySelector('.min-h-screen')).toBeInTheDocument()
      expect(container.querySelector('.relative')).toBeInTheDocument()
    })

    it('has centered content', () => {
      const { container } = renderLandingPage()
      
      const centerContainer = container.querySelector('.flex.items-center.justify-center')
      expect(centerContainer).toBeInTheDocument()
    })

    it('has proper spacing between sections', () => {
      const { container } = renderLandingPage()
      
      const spacedElements = container.querySelectorAll('.space-y-8, .mb-12, .mt-12')
      expect(spacedElements.length).toBeGreaterThan(0)
    })
  })

  describe('Branding', () => {
    it('displays Ownima branding', () => {
      renderLandingPage()
      
      expect(screen.getByText('Ownima Admin Portal')).toBeInTheDocument()
      expect(screen.getByText(/© 2024 ownima/i)).toBeInTheDocument()
    })

    it('has branded logo with gradient', () => {
      const { container } = renderLandingPage()
      
      const logo = container.querySelector('.from-primary-400.to-indigo-600')
      expect(logo).toBeInTheDocument()
    })
  })

  describe('Security Messaging', () => {
    it('emphasizes internal use', () => {
      renderLandingPage()
      
      expect(screen.getByText(/internal use only/i)).toBeInTheDocument()
    })

    it('mentions authorization requirement', () => {
      renderLandingPage()
      
      expect(screen.getByText(/authorized personnel access required/i)).toBeInTheDocument()
    })

    it('describes secure access', () => {
      renderLandingPage()
      
      expect(screen.getByText(/secure access to platform administration tools/i)).toBeInTheDocument()
    })
  })
})
