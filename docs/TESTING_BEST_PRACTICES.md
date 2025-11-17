# Testing Best Practices

**Last Updated:** 2025-11-16
**Status:** Active Reference Guide

This document contains testing patterns, structures, and best practices for the Ownima Admin Dashboard project.

---

## 🏗️ Test Structure

All test files follow this consistent structure:

```typescript
describe('ComponentName', () => {
  describe('Rendering', () => {
    it('renders with default props', () => { ... });
  });

  describe('Props', () => {
    // Test different prop combinations
  });

  describe('User Interactions', () => {
    // Test click handlers, etc.
  });

  describe('Edge Cases', () => {
    // Test null values, boundaries
  });

  describe('Integration: Real-world scenarios', () => {
    // Test complete use cases
  });
});
```

**Benefits:**
- Scannable test organization
- Logical grouping by concern
- Easy to locate specific test types
- Consistent across the codebase

---

## 🔧 Key Testing Utilities

### From test-utils
```typescript
import { render, screen } from '../../test-utils';
```
- `render()` - Renders component with all providers (AuthContext, QueryClient, Router)

### From React Testing Library
```typescript
import { screen } from '@testing-library/react';
```
- `screen` - Query rendered elements
- `screen.getByRole()` - Most accessible way to query
- `screen.getByText()` - Query by text content
- `screen.queryBy*()` - Returns null if not found (for negative assertions)

### User Interactions
```typescript
import { userEvent } from '@testing-library/user-event';

const user = userEvent.setup();
await user.click(screen.getByRole('button'));
await user.type(screen.getByRole('textbox'), 'Hello');
```

### Mocking with Vitest
```typescript
import { vi } from 'vitest';

const mockFn = vi.fn();
const spy = vi.spyOn(object, 'method');
vi.useFakeTimers(); // For time-based tests
```

---

## 📝 Common Test Patterns

### Testing Component Visibility

**Pattern: Conditional Rendering**
```typescript
it('renders when condition is true', () => {
  render(<Component show={true} />);
  expect(screen.getByText('Content')).toBeInTheDocument();
});

it('does not render when condition is false', () => {
  render(<Component show={false} />);
  expect(screen.queryByText('Content')).not.toBeInTheDocument();
});
```

**Note:** Use `queryBy*` for negative assertions (expects element NOT to exist).

---

### Testing Button Clicks

```typescript
it('calls onClick when clicked', async () => {
  const user = userEvent.setup();
  const mockOnClick = vi.fn();

  render(<Button onClick={mockOnClick}>Click me</Button>);
  await user.click(screen.getByRole('button'));

  expect(mockOnClick).toHaveBeenCalledTimes(1);
});
```

**Key Points:**
- Always use `async/await` with userEvent
- Mock functions with `vi.fn()`
- Use `getByRole('button')` for accessibility

---

### Testing Disabled States

```typescript
it('is disabled when loading', () => {
  render(<Button isLoading={true}>Submit</Button>);
  expect(screen.getByRole('button')).toBeDisabled();
});
```

---

### Testing DOM Queries

```typescript
// Get button element from text
const button = screen.getByText('Clear').closest('button');

// Query for specific class (use sparingly)
const { container } = render(<Component />);
const element = container.querySelector('.bg-green-500');

// Query all SVG icons
const icons = container.querySelectorAll('svg');
```

**Prefer:** Role-based queries → Text queries → Test IDs → CSS selectors

---

### Testing Forms

```typescript
it('submits form with user input', async () => {
  const user = userEvent.setup();
  const mockSubmit = vi.fn();

  render(<Form onSubmit={mockSubmit} />);

  await user.type(screen.getByLabelText('Username'), 'john');
  await user.type(screen.getByLabelText('Password'), 'secret');
  await user.click(screen.getByRole('button', { name: /submit/i }));

  expect(mockSubmit).toHaveBeenCalledWith({
    username: 'john',
    password: 'secret'
  });
});
```

---

### Testing Loading States

```typescript
it('shows loading spinner while fetching', () => {
  render(<DataComponent isLoading={true} />);
  expect(screen.getByRole('status')).toBeInTheDocument();
});

it('shows data when loaded', () => {
  render(<DataComponent isLoading={false} data={mockData} />);
  expect(screen.queryByRole('status')).not.toBeInTheDocument();
  expect(screen.getByText('Data Title')).toBeInTheDocument();
});
```

---

### Testing Error States

```typescript
it('displays error message when fetch fails', () => {
  render(<DataComponent error="Failed to load" />);
  expect(screen.getByRole('alert')).toHaveTextContent('Failed to load');
});
```

---

## 🎯 Testing Philosophy

### 1. Focus on Reusable Components First
- **Why:** Shared components appear in multiple flows
- **Benefit:** High ROI on test coverage
- **Strategy:** Test utilities, UI components, then pages

### 2. Test Structure Matters
- Use consistent `describe` blocks
- Group related tests logically
- Write descriptive test names
- One assertion per test (when possible)

### 3. Edge Cases Are Critical

Always test:
- `null` values
- `undefined` values
- `0` (numeric zero)
- Empty strings `""`
- Empty arrays `[]`
- Boundaries (min/max values)
- Loading states
- Error states

**Example:**
```typescript
describe('Edge Cases', () => {
  it('handles null rating gracefully', () => {
    render(<RatingStars rating={null} />);
    expect(screen.getByText('No rating yet')).toBeInTheDocument();
  });

  it('handles 0 rating (not same as null)', () => {
    render(<RatingStars rating={0} />);
    // Should show 0 stars, not "No rating"
    expect(screen.queryByText('No rating yet')).not.toBeInTheDocument();
  });
});
```

### 4. Accessibility Should Be Tested
- Screen reader text (`sr-only`)
- ARIA attributes (`role`, `aria-label`)
- Keyboard navigation
- Focus management

```typescript
it('provides screen reader text for icons', () => {
  render(<IconButton icon={<TrashIcon />} />);
  expect(screen.getByLabelText('Delete')).toBeInTheDocument();
});
```

### 5. Mock External Dependencies

**Browser APIs:**
```typescript
global.URL.createObjectURL = vi.fn(() => 'blob:mock-url');
global.localStorage.setItem = vi.fn();
```

**Time:**
```typescript
vi.useFakeTimers();
// ... test time-based behavior
vi.useRealTimers();
```

**API calls:**
```typescript
// Already mocked via MSW in test-utils
// See src/mocks/handlers.ts for API mocks
```

---

## 📊 Coverage Goals

### By Category
- ✅ **Utilities:** 90%+ coverage (pure functions, easy to test)
- ✅ **UI Components:** 80%+ coverage (reusable, high value)
- ⚠️ **Services:** 70%+ coverage (API integration)
- ⚠️ **Pages:** 50%+ coverage (complex integration tests)
- ⚠️ **Modals:** 60%+ coverage (stateful, complex)

### Priority Order
1. **Utilities** - Highest ROI, pure functions
2. **UI Components** - Reusable across app
3. **Services** - Critical business logic
4. **Pages** - Integration-level testing
5. **Modals** - User interaction flows

---

## 🔍 Query Priority Guide

**Recommended Query Priority** (from React Testing Library docs):

1. **Accessible queries** (queries everyone can use):
   - `getByRole` - Best for buttons, inputs, etc.
   - `getByLabelText` - Best for form fields
   - `getByPlaceholderText` - Inputs without labels
   - `getByText` - Non-interactive elements
   - `getByDisplayValue` - Form inputs with current value

2. **Semantic queries**:
   - `getByAltText` - Images, areas
   - `getByTitle` - SVG title, elements with title

3. **Test IDs** (last resort):
   - `getByTestId` - Use sparingly when no semantic option

**Anti-pattern:**
```typescript
// ❌ Bad - fragile, not accessible
const button = container.querySelector('.btn-primary');

// ✅ Good - accessible, semantic
const button = screen.getByRole('button', { name: /submit/i });
```

---

## 🚀 Quick Reference

### Component Test Template

```typescript
import { describe, it, expect } from 'vitest';
import { render, screen } from '../../test-utils';
import { userEvent } from '@testing-library/user-event';
import { ComponentName } from './ComponentName';

describe('ComponentName', () => {
  describe('Rendering', () => {
    it('renders with default props', () => {
      render(<ComponentName />);
      expect(screen.getByRole('main')).toBeInTheDocument();
    });
  });

  describe('User Interactions', () => {
    it('handles button click', async () => {
      const user = userEvent.setup();
      const mockClick = vi.fn();

      render(<ComponentName onClick={mockClick} />);
      await user.click(screen.getByRole('button'));

      expect(mockClick).toHaveBeenCalled();
    });
  });

  describe('Edge Cases', () => {
    it('handles null data', () => {
      render(<ComponentName data={null} />);
      expect(screen.getByText('No data')).toBeInTheDocument();
    });
  });
});
```

---

## 📚 Additional Resources

- [React Testing Library Docs](https://testing-library.com/react)
- [Vitest Docs](https://vitest.dev)
- [Testing Library Queries Cheatsheet](https://testing-library.com/docs/queries/about)
- [Common Mistakes with React Testing Library](https://kentcdodds.com/blog/common-mistakes-with-react-testing-library)

---

**Maintained by:** Development Team
**Next Review:** When adding new testing patterns
