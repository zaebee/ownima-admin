# Testing Troubleshooting Guide

**Last Updated:** 2025-11-16
**Status:** Active Reference Guide

Common testing issues and their solutions for the Ownima Admin Dashboard project.

---

## 🐛 Common Issues & Solutions

### Issue 1: Component Treats 0 as Falsy

**Symptom:**
```typescript
<RatingStars rating={0} />
// Shows "No rating yet" instead of 0 stars
```

**Problem:**
JavaScript treats `0` as falsy in boolean contexts:
```typescript
if (!rating) {
  return <div>No rating yet</div>;
}
```

**Solution:**
Use explicit null/undefined checks:
```typescript
// ❌ Bad
if (!rating) { ... }

// ✅ Good
if (rating == null) { ... }
// or
if (rating === null || rating === undefined) { ... }
```

**Test Case:**
```typescript
it('displays 0 stars (not "No rating")', () => {
  render(<RatingStars rating={0} />);
  expect(screen.queryByText('No rating yet')).not.toBeInTheDocument();
  // Should show 0 stars
});

it('displays "No rating" for null', () => {
  render(<RatingStars rating={null} />);
  expect(screen.getByText('No rating yet')).toBeInTheDocument();
});
```

---

### Issue 2: Lint Error - Unused Variable

**Symptom:**
```
ESLint: 'container' is assigned a value but never used
```

**Code:**
```typescript
const { container } = render(<Component />);
// container not used
```

**Solution Option 1:** Remove the destructuring
```typescript
render(<Component />);
```

**Solution Option 2:** Use the variable
```typescript
const { container } = render(<Component />);
const icon = container.querySelector('svg');
expect(icon).toBeInTheDocument();
```

**Solution Option 3:** Disable lint for that line (rare)
```typescript
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const { container } = render(<Component />);
```

---

### Issue 3: Test Fails with "Element Not Found"

**Symptom:**
```
TestingLibraryElementError: Unable to find an element with the text: Clear
```

**Problem:**
Selecting `<span>` text when you need the `<button>` element:
```typescript
const clearButton = screen.getByText('Clear'); // Returns <span>
await user.click(clearButton); // Fails - can't click span
```

**Solution:**
Use `.closest('button')` to get parent element:
```typescript
const clearButton = screen.getByText('Clear').closest('button');
await user.click(clearButton);
```

**Better Solution:**
Query by role directly:
```typescript
const clearButton = screen.getByRole('button', { name: /clear/i });
await user.click(clearButton);
```

---

### Issue 4: URL.createObjectURL Not Available in Tests

**Symptom:**
```
TypeError: URL.createObjectURL is not a function
```

**Problem:**
`URL.createObjectURL` is a browser API not available in jsdom test environment.

**Solution:**
Mock it in your test:
```typescript
beforeEach(() => {
  global.URL.createObjectURL = vi.fn(() => 'blob:mock-url');
});

afterEach(() => {
  vi.restoreAllMocks();
});
```

**Or globally** in `vitest.setup.ts`:
```typescript
global.URL.createObjectURL = vi.fn(() => 'blob:mock-url');
global.URL.revokeObjectURL = vi.fn();
```

---

### Issue 5: Async Tests Failing Intermittently

**Symptom:**
Tests pass sometimes, fail other times with:
```
Unable to find an element
```

**Problem:**
Not waiting for async updates:
```typescript
render(<AsyncComponent />);
expect(screen.getByText('Data')).toBeInTheDocument(); // Fails - data not loaded yet
```

**Solution:**
Use `findBy*` queries (they wait) or `waitFor`:
```typescript
// Option 1: findBy queries (preferred)
const data = await screen.findByText('Data');
expect(data).toBeInTheDocument();

// Option 2: waitFor
await waitFor(() => {
  expect(screen.getByText('Data')).toBeInTheDocument();
});
```

**Key Difference:**
- `getBy*` - Sync, throws immediately if not found
- `queryBy*` - Sync, returns null if not found
- `findBy*` - Async, waits up to 1 second (configurable)

---

### Issue 6: Cannot Read Property of Undefined in Tests

**Symptom:**
```
TypeError: Cannot read property 'map' of undefined
```

**Problem:**
Component expects data but receives `undefined`:
```typescript
const UserList = ({ users }) => {
  return users.map(user => ...); // Crashes if users is undefined
};
```

**Solution in Code:**
Add defensive checks:
```typescript
const UserList = ({ users = [] }) => {
  if (!users?.length) {
    return <EmptyState />;
  }
  return users.map(user => ...);
};
```

**Solution in Tests:**
Always provide required props:
```typescript
// ❌ Bad
render(<UserList />);

// ✅ Good
render(<UserList users={[]} />);
render(<UserList users={mockUsers} />);
```

---

### Issue 7: Act Warning in Tests

**Symptom:**
```
Warning: An update to Component inside a test was not wrapped in act(...)
```

**Problem:**
State updates happening outside of React Testing Library's awareness.

**Common Causes:**
1. Not awaiting async operations
2. Timer-based updates
3. Effect cleanup functions

**Solutions:**

**For async operations:**
```typescript
// ❌ Bad
user.click(button);

// ✅ Good
await user.click(button);
```

**For timers:**
```typescript
vi.useFakeTimers();

render(<ComponentWithTimer />);
act(() => {
  vi.advanceTimersByTime(1000);
});

vi.useRealTimers();
```

**For testing cleanup:**
```typescript
const { unmount } = render(<Component />);
unmount();
// Wait for cleanup effects
await waitFor(() => {
  expect(cleanupFunction).toHaveBeenCalled();
});
```

---

### Issue 8: MSW Handlers Not Working

**Symptom:**
```
Network request failed
```
or
```
GET http://localhost:8000/api/v1/users 404
```

**Problem:**
MSW handlers not configured or server not started in tests.

**Solution:**

**Check 1:** Verify MSW server is configured in `vitest.setup.ts`:
```typescript
import { server } from './src/mocks/server';

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());
```

**Check 2:** Verify handler matches the URL:
```typescript
// Handler
http.get('http://localhost:8000/api/v1/users', ...)

// Request in test must match exactly
await adminService.getUsers(); // Should call same URL
```

**Check 3:** Override handlers for specific tests:
```typescript
server.use(
  http.get('http://localhost:8000/api/v1/users', () => {
    return HttpResponse.json({ data: [], count: 0 });
  })
);
```

---

### Issue 9: Query Selector Returns Null

**Symptom:**
```
TypeError: Cannot read property 'click' of null
```

**Problem:**
```typescript
const button = container.querySelector('.submit-btn');
await user.click(button); // button is null
```

**Solutions:**

**Option 1:** Use better query (preferred):
```typescript
const button = screen.getByRole('button', { name: /submit/i });
```

**Option 2:** Assert existence first:
```typescript
const button = container.querySelector('.submit-btn');
expect(button).toBeInTheDocument();
await user.click(button!);
```

**Option 3:** Check before use:
```typescript
const button = container.querySelector('.submit-btn');
if (button) {
  await user.click(button);
}
```

---

### Issue 10: Test Timeout Errors

**Symptom:**
```
Timeout - Async callback was not invoked within 5000ms
```

**Common Causes:**
1. Infinite loops
2. Never-resolving promises
3. Missing mock responses

**Solutions:**

**Increase timeout (temporary):**
```typescript
it('loads data', async () => {
  // ... test
}, 10000); // 10 second timeout
```

**Fix the root cause:**
```typescript
// ❌ Bad - waits forever
await screen.findByText('Never appears');

// ✅ Good - add timeout
await screen.findByText('Appears', {}, { timeout: 2000 });

// ✅ Better - fix the mock
server.use(
  http.get('/api/data', () => HttpResponse.json({ data: 'Appears' }))
);
```

---

### Issue 11: UserEvent Not Working as Expected

**Symptom:**
```
onClick handler not called
```

**Problem:**
Forgetting to `await` or not setting up userEvent:
```typescript
// ❌ Bad
const user = userEvent.setup();
user.click(button); // Missing await
```

**Solution:**
```typescript
// ✅ Good
const user = userEvent.setup();
await user.click(button);
```

**Or use within test:**
```typescript
it('handles click', async () => {
  const user = userEvent.setup();
  const mockClick = vi.fn();

  render(<Button onClick={mockClick} />);
  await user.click(screen.getByRole('button'));

  expect(mockClick).toHaveBeenCalled();
});
```

---

### Issue 12: Stale Mocks Between Tests

**Symptom:**
Test passes when run alone, fails when run with others.

**Problem:**
Mocks not being reset between tests:
```typescript
const mockFn = vi.fn();
// Test 1 calls mockFn
// Test 2 expects mockFn not called, but it still has calls from Test 1
```

**Solution:**

**Global cleanup in `vitest.setup.ts`:**
```typescript
afterEach(() => {
  vi.clearAllMocks();
});
```

**Or manual cleanup:**
```typescript
beforeEach(() => {
  mockFn.mockClear();
  // or
  vi.clearAllMocks();
});
```

---

## 🔍 Debugging Tips

### 1. Use screen.debug()
```typescript
render(<Component />);
screen.debug(); // Prints DOM to console
```

### 2. Use screen.logTestingPlaygroundURL()
```typescript
render(<Component />);
screen.logTestingPlaygroundURL();
// Opens interactive playground in browser
```

### 3. Check what queries are available
```typescript
const { container } = render(<Component />);
console.log(container.innerHTML);
```

### 4. Run single test in watch mode
```bash
npm run test:watch -- path/to/test.tsx -t "test name pattern"
```

### 5. Enable verbose logging
```bash
DEBUG_PRINT_LIMIT=0 npm run test
```

---

## 📚 Quick Checklist

When tests fail, check:

- [ ] Are you awaiting async operations?
- [ ] Are you using the right query (`getBy` vs `queryBy` vs `findBy`)?
- [ ] Are mocks configured correctly?
- [ ] Are you waiting for side effects to complete?
- [ ] Is MSW server running?
- [ ] Are props being passed correctly?
- [ ] Are you testing implementation details instead of behavior?

---

## 🆘 Still Stuck?

1. **Read the error carefully** - The error message usually tells you exactly what's wrong
2. **Check the docs** - [React Testing Library](https://testing-library.com/) and [Vitest](https://vitest.dev)
3. **Isolate the problem** - Create a minimal reproduction
4. **Check existing tests** - Look for similar patterns in the codebase
5. **Ask for help** - Share the failing test and error message

---

**Maintained by:** Development Team
**Last Updated:** 2025-11-16
