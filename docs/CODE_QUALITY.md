# Code Quality Standards

Guidelines and tools for maintaining high code quality in the Ownima Admin Dashboard.

## Quick Reference

```bash
# Run all quality checks
npm run lint              # ESLint
npm run test:run          # Tests
npm run build             # TypeScript check + build

# Auto-fix issues
npx prettier --write .    # Format all files
npm run lint -- --fix     # Fix ESLint issues
```

## Automated Quality Checks

### Pre-commit Hooks

Automatically runs on `git commit`:

- **ESLint**: Lints staged TypeScript/React files
- **Prettier**: Formats staged files
- **Type Check**: Validates TypeScript types

### Pre-push Hooks

Automatically runs on `git push`:

- **Full Test Suite**: All 532 tests must pass
- **Coverage Check**: Ensures coverage doesn't decrease

## Linting

### ESLint Configuration

```javascript
// eslint.config.js
rules: {
  // Prevent console statements (warn level)
  'no-console': ['warn', { allow: ['warn', 'error'] }],

  // React hooks rules
  'react-hooks/rules-of-hooks': 'error',
  'react-hooks/exhaustive-deps': 'warn',
}
```

### Running ESLint

```bash
# Check all files
npm run lint

# Fix auto-fixable issues
npm run lint -- --fix

# Check specific file
npx eslint src/components/MyComponent.tsx
```

### Common ESLint Errors

#### Console Statements

```typescript
// ❌ Bad
console.log('Debug info');

// ✅ Good - Use toast notifications
toast.info('Debug info');

// ✅ Allowed in development
if (import.meta.env.DEV) {
  console.warn('Development warning');
}
```

#### Unused Variables

```typescript
// ❌ Bad
const [data, setData] = useState();

// ✅ Good
const [data] = useState();
// or
const [, setData] = useState();
```

## Code Formatting

### Prettier Configuration

```json
{
  "semi": true,
  "trailingComma": "es5",
  "singleQuote": true,
  "printWidth": 100,
  "tabWidth": 2,
  "useTabs": false,
  "arrowParens": "always",
  "endOfLine": "lf"
}
```

### Running Prettier

```bash
# Format all files
npx prettier --write .

# Check formatting
npx prettier --check .

# Format specific file
npx prettier --write src/components/MyComponent.tsx
```

## TypeScript

### Type Safety Rules

1. **No `any` types** - Use proper types or `unknown`
2. **Strict mode enabled** - All strict checks active
3. **Explicit return types** - For exported functions
4. **No implicit any** - All parameters must be typed

### Examples

```typescript
// ❌ Bad
function fetchData(id) {
  return api.get(`/users/${id}`);
}

// ✅ Good
async function fetchData(id: string): Promise<User> {
  const response = await api.get<User>(`/users/${id}`);
  return response.data;
}
```

### Type Checking

```bash
# Check types
npx tsc --noEmit

# Watch mode
npx tsc --noEmit --watch
```

## Testing Standards

### Coverage Requirements

- **Minimum**: 50% overall coverage
- **Target**: 70% overall coverage
- **Critical paths**: 80%+ coverage

### Test Quality Checklist

- [ ] Tests are isolated and independent
- [ ] Tests have clear descriptions
- [ ] Edge cases are covered
- [ ] Error scenarios are tested
- [ ] Accessibility is verified
- [ ] No console.log in tests

### Example Test Structure

```typescript
describe('ComponentName', () => {
  describe('Feature Group', () => {
    it('does something specific', () => {
      // Arrange
      const props = { ... };

      // Act
      render(<Component {...props} />);

      // Assert
      expect(screen.getByText('...')).toBeInTheDocument();
    });
  });
});
```

## Code Review Checklist

### Before Submitting PR

- [ ] All tests pass locally
- [ ] No lint errors or warnings
- [ ] Code is formatted with Prettier
- [ ] TypeScript compiles without errors
- [ ] No console.log statements
- [ ] New code has tests
- [ ] Documentation is updated

### Reviewer Checklist

- [ ] Code follows project patterns
- [ ] Tests are comprehensive
- [ ] No security vulnerabilities
- [ ] Performance considerations addressed
- [ ] Error handling is proper
- [ ] Accessibility is maintained

## Common Patterns

### Error Handling

```typescript
// ❌ Bad
try {
  await api.post('/users', data);
} catch (error) {
  console.error(error);
}

// ✅ Good
try {
  await api.post('/users', data);
  toast.success('User created');
} catch (error) {
  const message = error instanceof Error ? error.message : 'Failed to create user';
  toast.error('Error', message);
}
```

### Component Structure

```typescript
// Recommended order:
// 1. Imports
// 2. Types/Interfaces
// 3. Component definition
// 4. Hooks
// 5. Event handlers
// 6. Render helpers
// 7. Return JSX

interface Props {
  userId: string;
}

export const UserProfile: React.FC<Props> = ({ userId }) => {
  // Hooks
  const { data, isLoading } = useQuery(...);
  const [state, setState] = useState(...);

  // Event handlers
  const handleClick = () => { ... };

  // Render helpers
  const renderContent = () => { ... };

  // JSX
  return <div>...</div>;
};
```

### State Management

```typescript
// ❌ Bad - Multiple useState calls
const [name, setName] = useState('');
const [email, setEmail] = useState('');
const [phone, setPhone] = useState('');

// ✅ Good - Single state object
const [formData, setFormData] = useState({
  name: '',
  email: '',
  phone: '',
});
```

## Performance

### React.memo Usage

```typescript
// Use for expensive pure components
export const ExpensiveComponent = React.memo<Props>(({ data }) => {
  return <div>{/* expensive rendering */}</div>;
});
```

### useMemo and useCallback

```typescript
// Memoize expensive calculations
const sortedData = useMemo(() => data.sort((a, b) => a.name.localeCompare(b.name)), [data]);

// Memoize callbacks passed to children
const handleClick = useCallback(() => {
  doSomething(id);
}, [id]);
```

## Accessibility

### Required Practices

1. **Semantic HTML** - Use proper HTML elements
2. **ARIA labels** - Add labels for screen readers
3. **Keyboard navigation** - All interactive elements accessible
4. **Focus management** - Proper focus handling in modals
5. **Color contrast** - WCAG AA compliance

### Examples

```typescript
// ❌ Bad
<div onClick={handleClick}>Click me</div>

// ✅ Good
<button onClick={handleClick} aria-label="Submit form">
  Click me
</button>
```

## Security

### Input Validation

```typescript
// Always validate user input
const schema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

const result = schema.safeParse(formData);
if (!result.success) {
  // Handle validation errors
}
```

### XSS Prevention

```typescript
// ❌ Bad - Dangerous HTML injection
<div dangerouslySetInnerHTML={{ __html: userInput }} />

// ✅ Good - Sanitize or avoid HTML
<div>{userInput}</div>
```

## Documentation

### Code Comments

```typescript
// ❌ Bad - Obvious comment
// Set the name
setName(value);

// ✅ Good - Explains why
// Reset form after 3 failed attempts to prevent brute force
if (failedAttempts >= 3) {
  resetForm();
}
```

### JSDoc for Public APIs

```typescript
/**
 * Fetches user data from the API
 * @param userId - The unique identifier for the user
 * @returns Promise resolving to user data
 * @throws {ApiError} When user is not found
 */
export async function fetchUser(userId: string): Promise<User> {
  // ...
}
```

## Tools Integration

### VS Code Settings

```json
{
  "editor.formatOnSave": true,
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  },
  "typescript.tsdk": "node_modules/typescript/lib"
}
```

### Git Hooks

Managed by Husky:

- `.husky/pre-commit` - Lint and format staged files
- `.husky/pre-push` - Run full test suite

## Continuous Improvement

### Metrics to Track

- Test coverage percentage
- Build size (target: < 250 kB)
- Lighthouse scores (target: 90+)
- ESLint warnings (target: 0)
- TypeScript errors (target: 0)

### Regular Reviews

- **Weekly**: Review new ESLint warnings
- **Monthly**: Analyze bundle size
- **Quarterly**: Update dependencies
- **Annually**: Review and update standards

## Related Documentation

- [Testing Guide](./TESTING.md) - Testing standards and practices
- [Development Guide](./DEVELOPMENT.md) - Development workflow
- [Contributing Guidelines](../README.md#contributing) - How to contribute
