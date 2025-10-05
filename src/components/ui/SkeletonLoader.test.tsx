import { describe, it, expect } from 'vitest'
import { render } from '@testing-library/react'
import {
  Skeleton,
  SkeletonCard,
  SkeletonMetricCard,
  SkeletonTable,
  SkeletonList,
  SkeletonMetricBlock,
  SkeletonHeader,
  SkeletonStats,
} from './SkeletonLoader'

describe('SkeletonLoader', () => {
  describe('Skeleton', () => {
    it('renders base skeleton', () => {
      const { container } = render(<Skeleton />)
      
      const skeleton = container.querySelector('.animate-pulse')
      expect(skeleton).toBeInTheDocument()
    })

    it('applies custom className', () => {
      const { container } = render(<Skeleton className="h-10 w-20" />)
      
      const skeleton = container.querySelector('.h-10')
      expect(skeleton).toBeInTheDocument()
      expect(skeleton).toHaveClass('w-20')
    })

    it('has gradient background', () => {
      const { container } = render(<Skeleton />)
      
      const skeleton = container.querySelector('.from-gray-200')
      expect(skeleton).toBeInTheDocument()
    })

    it('has rounded corners', () => {
      const { container } = render(<Skeleton />)
      
      const skeleton = container.querySelector('.rounded')
      expect(skeleton).toBeInTheDocument()
    })
  })

  describe('SkeletonCard', () => {
    it('renders card skeleton', () => {
      const { container } = render(<SkeletonCard />)
      
      const card = container.querySelector('.bg-white')
      expect(card).toBeInTheDocument()
    })

    it('has rounded corners', () => {
      const { container } = render(<SkeletonCard />)
      
      const card = container.querySelector('.rounded-xl')
      expect(card).toBeInTheDocument()
    })

    it('has shadow', () => {
      const { container } = render(<SkeletonCard />)
      
      const card = container.querySelector('.shadow-sm')
      expect(card).toBeInTheDocument()
    })

    it('contains multiple skeleton elements', () => {
      const { container } = render(<SkeletonCard />)
      
      const skeletons = container.querySelectorAll('.animate-pulse')
      expect(skeletons.length).toBeGreaterThan(1)
    })
  })

  describe('SkeletonMetricCard', () => {
    it('renders metric card skeleton', () => {
      const { container } = render(<SkeletonMetricCard />)
      
      const card = container.querySelector('.bg-white')
      expect(card).toBeInTheDocument()
    })

    it('has proper structure', () => {
      const { container } = render(<SkeletonMetricCard />)
      
      const skeletons = container.querySelectorAll('.animate-pulse')
      expect(skeletons.length).toBeGreaterThan(2)
    })

    it('has padding', () => {
      const { container } = render(<SkeletonMetricCard />)
      
      const card = container.querySelector('.p-6')
      expect(card).toBeInTheDocument()
    })
  })

  describe('SkeletonTable', () => {
    it('renders table skeleton with default rows', () => {
      const { container } = render(<SkeletonTable />)
      
      const rows = container.querySelectorAll('.divide-y > div')
      expect(rows.length).toBe(5) // Default 5 rows
    })

    it('renders table with custom row count', () => {
      const { container } = render(<SkeletonTable rows={10} />)
      
      const rows = container.querySelectorAll('.divide-y > div')
      expect(rows.length).toBe(10)
    })

    it('has table header', () => {
      const { container } = render(<SkeletonTable />)
      
      const header = container.querySelector('.bg-gray-50')
      expect(header).toBeInTheDocument()
    })

    it('has dividers between rows', () => {
      const { container } = render(<SkeletonTable />)
      
      const dividers = container.querySelector('.divide-y')
      expect(dividers).toBeInTheDocument()
    })

    it('has rounded corners', () => {
      const { container } = render(<SkeletonTable />)
      
      const table = container.querySelector('.rounded-xl')
      expect(table).toBeInTheDocument()
    })
  })

  describe('SkeletonList', () => {
    it('renders list skeleton with default items', () => {
      const { container } = render(<SkeletonList />)
      
      const items = container.querySelectorAll('.bg-white.rounded-xl')
      expect(items.length).toBe(3) // Default 3 items
    })

    it('renders list with custom item count', () => {
      const { container } = render(<SkeletonList items={5} />)
      
      const items = container.querySelectorAll('.bg-white.rounded-xl')
      expect(items.length).toBe(5)
    })

    it('has spacing between items', () => {
      const { container } = render(<SkeletonList />)
      
      const list = container.querySelector('.space-y-4')
      expect(list).toBeInTheDocument()
    })

    it('each item has icon placeholder', () => {
      const { container } = render(<SkeletonList items={2} />)
      
      const icons = container.querySelectorAll('.h-12.w-12')
      expect(icons.length).toBe(2)
    })
  })

  describe('SkeletonMetricBlock', () => {
    it('renders metric block skeleton', () => {
      const { container } = render(<SkeletonMetricBlock />)
      
      const block = container.querySelector('.bg-white')
      expect(block).toBeInTheDocument()
    })

    it('has header section', () => {
      const { container } = render(<SkeletonMetricBlock />)
      
      const header = container.querySelectorAll('.h-10.w-10')
      expect(header.length).toBeGreaterThan(0)
    })

    it('has multiple metric rows', () => {
      const { container } = render(<SkeletonMetricBlock />)
      
      const rows = container.querySelectorAll('.py-3')
      expect(rows.length).toBe(4) // 4 metric rows
    })

    it('has dividers between rows', () => {
      const { container } = render(<SkeletonMetricBlock />)
      
      const dividers = container.querySelectorAll('.border-b')
      expect(dividers.length).toBeGreaterThan(0)
    })
  })

  describe('SkeletonHeader', () => {
    it('renders header skeleton', () => {
      const { container } = render(<SkeletonHeader />)
      
      const skeletons = container.querySelectorAll('.animate-pulse')
      expect(skeletons.length).toBe(2) // Title and subtitle
    })

    it('has title skeleton', () => {
      const { container } = render(<SkeletonHeader />)
      
      const title = container.querySelector('.h-8')
      expect(title).toBeInTheDocument()
    })

    it('has subtitle skeleton', () => {
      const { container } = render(<SkeletonHeader />)
      
      const subtitle = container.querySelector('.h-4')
      expect(subtitle).toBeInTheDocument()
    })

    it('has spacing', () => {
      const { container } = render(<SkeletonHeader />)
      
      const header = container.querySelector('.mb-8')
      expect(header).toBeInTheDocument()
    })
  })

  describe('SkeletonStats', () => {
    it('renders stats grid', () => {
      const { container } = render(<SkeletonStats />)
      
      const grid = container.querySelector('.grid')
      expect(grid).toBeInTheDocument()
    })

    it('renders 4 metric cards', () => {
      const { container } = render(<SkeletonStats />)
      
      const cards = container.querySelectorAll('.bg-white.rounded-xl')
      expect(cards.length).toBe(4)
    })

    it('has responsive grid', () => {
      const { container } = render(<SkeletonStats />)
      
      const grid = container.querySelector('.grid-cols-1')
      expect(grid).toHaveClass('md:grid-cols-2', 'lg:grid-cols-4')
    })

    it('has gap between cards', () => {
      const { container } = render(<SkeletonStats />)
      
      const grid = container.querySelector('.gap-6')
      expect(grid).toBeInTheDocument()
    })
  })

  describe('Accessibility', () => {
    it('skeleton elements are decorative', () => {
      const { container } = render(<Skeleton />)
      
      // Skeleton loaders should not have interactive elements
      const buttons = container.querySelectorAll('button')
      const links = container.querySelectorAll('a')
      
      expect(buttons.length).toBe(0)
      expect(links.length).toBe(0)
    })

    it('does not interfere with screen readers', () => {
      const { container } = render(<SkeletonCard />)
      
      // Should not have ARIA labels that would be read
      const ariaLabels = container.querySelectorAll('[aria-label]')
      expect(ariaLabels.length).toBe(0)
    })
  })

  describe('Visual Consistency', () => {
    it('all skeletons use consistent colors', () => {
      const { container: card } = render(<SkeletonCard />)
      const { container: table } = render(<SkeletonTable />)
      const { container: list } = render(<SkeletonList />)
      
      // All should use gray-200 gradient
      expect(card.querySelector('.from-gray-200')).toBeInTheDocument()
      expect(table.querySelector('.from-gray-200')).toBeInTheDocument()
      expect(list.querySelector('.from-gray-200')).toBeInTheDocument()
    })

    it('all skeletons use consistent animation', () => {
      const { container: card } = render(<SkeletonCard />)
      const { container: table } = render(<SkeletonTable />)
      const { container: list } = render(<SkeletonList />)
      
      // All should have animate-pulse
      expect(card.querySelector('.animate-pulse')).toBeInTheDocument()
      expect(table.querySelector('.animate-pulse')).toBeInTheDocument()
      expect(list.querySelector('.animate-pulse')).toBeInTheDocument()
    })

    it('all containers use consistent styling', () => {
      const { container: card } = render(<SkeletonCard />)
      const { container: table } = render(<SkeletonTable />)
      const { container: list } = render(<SkeletonList />)
      
      // All should have white background and rounded corners
      expect(card.querySelector('.bg-white.rounded-xl')).toBeInTheDocument()
      expect(table.querySelector('.bg-white.rounded-xl')).toBeInTheDocument()
      expect(list.querySelector('.bg-white.rounded-xl')).toBeInTheDocument()
    })
  })

  describe('Edge Cases', () => {
    it('handles zero rows in table', () => {
      const { container } = render(<SkeletonTable rows={0} />)
      
      const rows = container.querySelectorAll('.divide-y > div')
      expect(rows.length).toBe(0)
    })

    it('handles zero items in list', () => {
      const { container } = render(<SkeletonList items={0} />)
      
      const items = container.querySelectorAll('.space-y-4 > div')
      expect(items.length).toBe(0)
    })

    it('handles large row count', () => {
      const { container } = render(<SkeletonTable rows={100} />)
      
      const rows = container.querySelectorAll('.divide-y > div')
      expect(rows.length).toBe(100)
    })

    it('handles large item count', () => {
      const { container } = render(<SkeletonList items={50} />)
      
      const items = container.querySelectorAll('.space-y-4 > div')
      expect(items.length).toBe(50)
    })
  })

  describe('Performance', () => {
    it('renders quickly with many elements', () => {
      const startTime = performance.now()
      render(<SkeletonTable rows={50} />)
      const endTime = performance.now()
      
      // Should render in less than 100ms
      expect(endTime - startTime).toBeLessThan(100)
    })

    it('does not cause memory leaks', () => {
      const { unmount } = render(<SkeletonStats />)
      
      // Should unmount cleanly
      expect(() => unmount()).not.toThrow()
    })
  })
})
