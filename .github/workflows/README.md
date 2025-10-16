# GitHub Actions Workflows

This directory contains CI/CD workflows for the Ownima Admin Dashboard.

## Workflows

### 1. CI Workflow (`ci.yml`) - **Recommended**

**Triggers:**
- Push to `main`, `develop`, or `tests/**` branches
- Pull requests to `main` or `develop`

**Jobs:**

#### Lint & Test
- Runs ESLint for code quality
- Runs TypeScript type checking
- Executes all tests with coverage
- Uploads coverage to Coveralls (automatic, no token needed)

#### Build
- Builds production bundle
- Checks build size
- Runs after tests pass

**Coverage Badge:**
After first run, add to README.md:
```markdown
[![Coverage Status](https://coveralls.io/repos/github/YOUR_USERNAME/ownima-admin/badge.svg?branch=main)](https://coveralls.io/github/YOUR_USERNAME/ownima-admin?branch=main)
```

---

### 2. Test Workflow (`test.yml`) - **Alternative with Codecov**

**Triggers:**
- Push to `main`, `develop`, or `tests/**` branches
- Pull requests to `main` or `develop`

**Jobs:**

#### Test Matrix
- Tests on Node.js 18.x and 20.x
- Runs linter and type check
- Executes tests with coverage
- Uploads coverage to Codecov (requires `CODECOV_TOKEN` secret)
- Archives coverage reports as artifacts

#### Build Check
- Verifies production build succeeds
- Archives build artifacts

**Setup Required:**
1. Sign up at [codecov.io](https://codecov.io)
2. Add repository
3. Get upload token
4. Add `CODECOV_TOKEN` to GitHub Secrets

**Coverage Badge:**
```markdown
[![codecov](https://codecov.io/gh/YOUR_USERNAME/ownima-admin/branch/main/graph/badge.svg)](https://codecov.io/gh/YOUR_USERNAME/ownima-admin)
```

---

## Which Workflow to Use?

### Use `ci.yml` (Coveralls) if:
- ✅ You want zero configuration
- ✅ Repository is public
- ✅ You want automatic coverage tracking
- ✅ You prefer simpler setup

### Use `test.yml` (Codecov) if:
- ✅ You need advanced coverage analytics
- ✅ You want multi-version Node.js testing
- ✅ You need private repository support
- ✅ You want detailed coverage reports

**Recommendation:** Start with `ci.yml` for simplicity. You can always switch later.

---

## Local Testing

Test the workflow locally before pushing:

```bash
# Run linter
npm run lint

# Run type check
npx tsc --noEmit

# Run tests with coverage
npm run test:coverage

# Build production
npm run build
```

---

## Coverage Thresholds

Current coverage thresholds (configured in `vitest.config.ts`):
- Lines: 80%
- Functions: 80%
- Branches: 80%
- Statements: 80%

**Note:** These thresholds are currently failing. Consider adjusting them or improving coverage:

```typescript
// vitest.config.ts
coverage: {
  thresholds: {
    lines: 60,      // Adjust to current level
    functions: 60,
    branches: 75,
    statements: 60,
  },
}
```

---

## Artifacts

Both workflows upload artifacts:

### Coverage Report
- **Retention:** 30 days
- **Location:** Actions → Workflow Run → Artifacts
- **Contents:** HTML coverage report, lcov files

### Build Artifacts
- **Retention:** 7 days
- **Location:** Actions → Workflow Run → Artifacts
- **Contents:** Production build (`dist/` directory)

---

## Troubleshooting

### Tests fail in CI but pass locally
- Check Node.js version matches (use `node -v`)
- Ensure all dependencies are in `package.json` (not just `devDependencies`)
- Check for environment-specific issues

### Coverage upload fails
- **Coveralls:** Ensure repository is public or has Coveralls integration
- **Codecov:** Verify `CODECOV_TOKEN` is set in GitHub Secrets

### Build fails
- Run `npm run build` locally first
- Check for TypeScript errors: `npx tsc --noEmit`
- Verify all imports are correct

### Linter fails
- Run `npm run lint` locally
- Fix issues: `npm run lint -- --fix`
- Check ESLint configuration

---

## Best Practices

1. **Always run tests locally** before pushing
2. **Keep dependencies updated** for security
3. **Monitor coverage trends** - aim for improvement
4. **Review failed workflows** immediately
5. **Use branch protection** to require passing tests

---

## Future Enhancements

Potential additions:
- [ ] E2E tests with Playwright
- [ ] Visual regression testing
- [ ] Performance benchmarks
- [ ] Automated dependency updates (Dependabot)
- [ ] Deployment workflows
- [ ] Release automation
- [ ] Lighthouse CI for performance
