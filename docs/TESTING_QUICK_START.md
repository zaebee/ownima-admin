# Testing Quick Start Guide

Quick reference for running and writing tests in the Ownima Admin Dashboard.

## Running Tests

```bash
# Watch mode (recommended for development)
npm test

# Run once
npm run test:run

# With coverage
npm run test:coverage

# With UI (visual test runner)
npm run test:ui

# Run specific test file
npm test -- Button.test.tsx

# Run tests matching pattern
npm test -- --grep "LoginPage"
```

## Pre-Commit Checklist

Before committing code:

```bash
# 1. Run linter
npm run lint

# 2. Fix linting issues
npm run lint -- --fix

# 3. Run type check
npx tsc --noEmit

# 4. Run all tests
npm run test:run

# 5. Check coverage (optional)
npm run test:coverage
```

## Writing Tests

### Component Test Template

```typescript
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MyComponent } from './MyComponent'

describe('MyComponent', () => {
  it('renders correctly', () => {
    render(<MyComponent />)
    expect(screen.getByText('Hello')).toBeInTheDocument()
  })

  it('handles click', async () => {
    const user = userEvent.setup()
    const handleClick = vi.fn()
    
    render(<MyComponent onClick={handleClick} />)
    await user.click(screen.getByRole('button'))
    
    expect(handleClick).toHaveBeenCalledTimes(1)
  })
})
```

### Service Test Template

```typescript
import { describe, it, expect, vi } from 'vitest'
import { myService } from './myService'

vi.mock('./api', () => ({
  apiClient: {
    get: vi.fn(),
    post: vi.fn(),
  },
}))

describe('myService', () => {
  it('fetches data successfully', async () => {
    const mockData = { id: 1, name: 'Test' }
    vi.mocked(apiClient.get).mockResolvedValue(mockData)
    
    const result = await myService.getData()
    
    expect(result).toEqual(mockData)
    expect(apiClient.get).toHaveBeenCalledWith('/data')
  })
})
```

### Page Test Template

```typescript
import { render, screen, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { MemoryRouter } from 'react-router-dom'
import { MyPage } from './MyPage'

const createTestQueryClient = () =>
  new QueryClient({
    defaultOptions: { queries: { retry: false } },
  })

const renderPage = () => {
  return render(
    <QueryClientProvider client={createTestQueryClient()}>
      <MemoryRouter>
        <MyPage />
      </MemoryRouter>
    </QueryClientProvider>
  )
}

describe('MyPage', () => {
  it('loads and displays data', async () => {
    renderPage()
    
    await waitFor(() => {
      expect(screen.getByText('Page Title')).toBeInTheDocument()
    })
  })
})
```

## Common Patterns

### Testing Async Operations

```typescript
it('handles async data', async () => {
  render(<MyComponent />)
  
  await waitFor(() => {
    expect(screen.getByText('Loaded')).toBeInTheDocument()
  })
})
```

### Testing User Input

```typescript
it('updates input value', async () => {
  const user = userEvent.setup()
  render(<MyForm />)
  
  const input = screen.getByLabelText('Name')
  await user.type(input, 'John Doe')
  
  expect(input).toHaveValue('John Doe')
})
```

### Testing Form Submission

```typescript
it('submits form', async () => {
  const user = userEvent.setup()
  const onSubmit = vi.fn()
  
  render(<MyForm onSubmit={onSubmit} />)
  
  await user.type(screen.getByLabelText('Email'), 'test@example.com')
  await user.click(screen.getByRole('button', { name: /submit/i }))
  
  expect(onSubmit).toHaveBeenCalledWith({
    email: 'test@example.com'
  })
})
```

### Testing Loading States

```typescript
it('shows loading spinner', () => {
  render(<MyComponent isLoading={true} />)
  expect(screen.getByRole('status')).toBeInTheDocument()
})
```

### Testing Error States

```typescript
it('displays error message', () => {
  render(<MyComponent error="Something went wrong" />)
  expect(screen.getByText('Something went wrong')).toBeInTheDocument()
})
```

## Query Selectors

### Preferred (Accessible)

```typescript
// By role (best)
screen.getByRole('button', { name: /submit/i })
screen.getByRole('textbox', { name: /email/i })

// By label
screen.getByLabelText('Email')

// By placeholder
screen.getByPlaceholderText('Enter email')

// By text
screen.getByText('Welcome')
```

### Avoid (Less Accessible)

```typescript
// By test ID (use only when necessary)
screen.getByTestId('submit-button')

// By class name (brittle)
container.querySelector('.btn-primary')
```

## Mocking

### Mock API Calls

```typescript
vi.mock('../services/api', () => ({
  apiClient: {
    get: vi.fn(),
    post: vi.fn(),
  },
}))

// In test
vi.mocked(apiClient.get).mockResolvedValue({ data: 'test' })
```

### Mock React Router

```typescript
const mockNavigate = vi.fn()
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  }
})
```

### Mock Context

```typescript
const mockAuthContext = {
  user: { id: '1', email: 'test@example.com' },
  isAuthenticated: true,
  login: vi.fn(),
  logout: vi.fn(),
}

render(
  <AuthContext.Provider value={mockAuthContext}>
    <MyComponent />
  </AuthContext.Provider>
)
```

## Debugging Tests

### View Rendered Output

```typescript
import { screen } from '@testing-library/react'

// Print entire DOM
screen.debug()

// Print specific element
screen.debug(screen.getByRole('button'))
```

### Check What's Available

```typescript
// List all roles
screen.logTestingPlaygroundURL()

// Get all by role
screen.getAllByRole('button')
```

### Run Single Test

```bash
# Run specific test file
npm test -- LoginPage.test.tsx

# Run specific test case
npm test -- -t "handles login"
```

## Coverage Tips

### Check Coverage for Specific File

```bash
npm run test:coverage -- Button.test.tsx
```

### View Coverage Report

```bash
npm run test:coverage
open coverage/index.html
```

### Improve Coverage

1. Check uncovered lines in coverage report
2. Add tests for edge cases
3. Test error handling
4. Test loading states
5. Test user interactions

## CI/CD Integration

Tests run automatically on:
- Push to `main`, `develop`, or `tests/**`
- Pull requests to `main` or `develop`

View results:
- GitHub Actions tab
- Coverage reports on Coveralls/Codecov

## Troubleshooting

### Tests timeout

```typescript
// Increase timeout
await waitFor(() => {
  expect(screen.getByText('Loaded')).toBeInTheDocument()
}, { timeout: 5000 })
```

### Can't find element

```typescript
// Use query instead of get (returns null instead of throwing)
expect(screen.queryByText('Not Found')).not.toBeInTheDocument()

// Wait for element to appear
await waitFor(() => {
  expect(screen.getByText('Appears Later')).toBeInTheDocument()
})
```

### Act warnings

```typescript
// Wrap state updates in waitFor
await waitFor(() => {
  expect(screen.getByText('Updated')).toBeInTheDocument()
})
```

## Resources

- [Testing Library Docs](https://testing-library.com/)
- [Vitest Docs](https://vitest.dev/)
- [User Event Docs](https://testing-library.com/docs/user-event/intro)
- [Common Mistakes](https://kentcdodds.com/blog/common-mistakes-with-react-testing-library)

---

**Quick Links:**
- [Full Testing Plan](./TESTING_PLAN.md)
- [CI/CD Setup](./CI_CD_SETUP.md)
- [Testing Decision Tree](./TESTING_DECISION_TREE.md)
