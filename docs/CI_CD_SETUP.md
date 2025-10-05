# CI/CD Setup Guide

This guide will help you set up continuous integration and coverage reporting for the Ownima Admin Dashboard.

## Quick Start (Recommended)

The easiest setup uses **Coveralls** with the `ci.yml` workflow:

### Step 1: Enable GitHub Actions

1. Push the `.github/workflows/ci.yml` file to your repository
2. Go to your repository on GitHub
3. Click on the **Actions** tab
4. GitHub Actions will automatically detect and run the workflow

### Step 2: Set Up Coveralls (Free for Public Repos)

1. Go to [coveralls.io](https://coveralls.io)
2. Sign in with your GitHub account
3. Click **"Add Repos"**
4. Find `ownima-admin` and toggle it on
5. That's it! Coverage will be uploaded automatically on the next push

### Step 3: Add Coverage Badge

1. Go to your Coveralls repo page
2. Click **"Badge URLs"** or **"Embed"**
3. Copy the Markdown badge code
4. Replace the placeholder in `README.md`:

```markdown
[![Coverage Status](https://coveralls.io/repos/github/YOUR_USERNAME/ownima-admin/badge.svg?branch=main)](https://coveralls.io/github/YOUR_USERNAME/ownima-admin?branch=main)
```

Replace `YOUR_USERNAME` with your actual GitHub username.

---

## Alternative: Codecov Setup

If you prefer Codecov (better analytics, works with private repos):

### Step 1: Sign Up for Codecov

1. Go to [codecov.io](https://codecov.io)
2. Sign in with your GitHub account
3. Add your repository

### Step 2: Get Upload Token

1. In Codecov, go to your repository settings
2. Copy the **Upload Token**

### Step 3: Add Token to GitHub Secrets

1. Go to your GitHub repository
2. Click **Settings** → **Secrets and variables** → **Actions**
3. Click **New repository secret**
4. Name: `CODECOV_TOKEN`
5. Value: Paste the token from Codecov
6. Click **Add secret**

### Step 4: Use test.yml Workflow

1. Delete or rename `ci.yml`
2. Ensure `test.yml` is in `.github/workflows/`
3. Push to trigger the workflow

### Step 5: Add Codecov Badge

```markdown
[![codecov](https://codecov.io/gh/YOUR_USERNAME/ownima-admin/branch/main/graph/badge.svg)](https://codecov.io/gh/YOUR_USERNAME/ownima-admin)
```

---

## Workflow Features

### What Gets Tested

✅ **Linting** - ESLint checks code quality
✅ **Type Checking** - TypeScript validates types
✅ **Unit Tests** - 264 tests across all components
✅ **Coverage** - Tracks test coverage over time
✅ **Build** - Ensures production build succeeds

### When Tests Run

- **On Push** to `main`, `develop`, or `tests/**` branches
- **On Pull Request** to `main` or `develop`
- **Manual Trigger** via GitHub Actions UI

### Test Matrix (test.yml only)

Tests run on multiple Node.js versions:
- Node.js 18.x
- Node.js 20.x

This ensures compatibility across versions.

---

## Coverage Thresholds

Current thresholds in `vitest.config.ts`:

```typescript
coverage: {
  thresholds: {
    lines: 80,
    functions: 80,
    branches: 80,
    statements: 80,
  },
}
```

**Current Coverage:**
- Lines: 44.38%
- Functions: 56.25%
- Branches: 73.27%
- Statements: 44.38%

### Adjusting Thresholds

To prevent CI failures while improving coverage, temporarily lower thresholds:

```typescript
coverage: {
  thresholds: {
    lines: 40,      // Current level
    functions: 55,
    branches: 70,
    statements: 40,
  },
}
```

Then gradually increase as you add more tests.

---

## Branch Protection Rules

Recommended settings for `main` branch:

1. Go to **Settings** → **Branches**
2. Add rule for `main`
3. Enable:
   - ✅ Require status checks to pass before merging
   - ✅ Require branches to be up to date before merging
   - ✅ Select: `Lint & Test` (or `test` for test.yml)
   - ✅ Require linear history
   - ✅ Include administrators

This ensures all code is tested before merging.

---

## Viewing Results

### GitHub Actions

1. Go to **Actions** tab
2. Click on a workflow run
3. View logs for each job
4. Download artifacts (coverage reports, build files)

### Coverage Reports

**Coveralls:**
- Visit `https://coveralls.io/github/YOUR_USERNAME/ownima-admin`
- View coverage trends over time
- See file-by-file coverage

**Codecov:**
- Visit `https://codecov.io/gh/YOUR_USERNAME/ownima-admin`
- Interactive coverage visualization
- Pull request comments with coverage changes

---

## Troubleshooting

### Tests Pass Locally But Fail in CI

**Possible causes:**
1. **Node version mismatch** - Check `node -v` locally vs CI
2. **Missing dependencies** - Ensure all deps are in `package.json`
3. **Environment differences** - Check for hardcoded paths or env vars

**Solution:**
```bash
# Test with exact CI environment
docker run -it --rm -v $(pwd):/app -w /app node:20 bash
npm ci
npm run test:run
```

### Coverage Upload Fails

**Coveralls:**
- Ensure repository is public or has Coveralls integration
- Check workflow logs for error messages

**Codecov:**
- Verify `CODECOV_TOKEN` is correctly set
- Check token hasn't expired
- Ensure `lcov.info` file is generated

### Build Fails

**Common issues:**
1. TypeScript errors - Run `npx tsc --noEmit`
2. Missing imports - Check all imports are correct
3. Environment variables - Ensure build doesn't require runtime env vars

---

## Performance Optimization

### Caching

Both workflows use npm caching:
```yaml
- uses: actions/setup-node@v4
  with:
    cache: 'npm'
```

This speeds up dependency installation by ~50%.

### Parallel Jobs

The `test.yml` workflow runs tests in parallel across Node versions, reducing total time.

### Artifacts

Artifacts are automatically cleaned up:
- Coverage reports: 30 days
- Build artifacts: 7 days

---

## Advanced Configuration

### Custom Test Scripts

Add to `package.json`:
```json
{
  "scripts": {
    "test:ci": "vitest run --coverage --reporter=verbose",
    "test:quick": "vitest run --changed"
  }
}
```

### Conditional Steps

Run steps only on specific branches:
```yaml
- name: Deploy
  if: github.ref == 'refs/heads/main'
  run: npm run deploy
```

### Matrix Strategy

Test multiple configurations:
```yaml
strategy:
  matrix:
    node-version: [18.x, 20.x]
    os: [ubuntu-latest, windows-latest]
```

---

## Monitoring

### GitHub Status Checks

Add badges to README for quick status:

```markdown
[![CI](https://github.com/YOUR_USERNAME/ownima-admin/workflows/CI/badge.svg)](https://github.com/YOUR_USERNAME/ownima-admin/actions)
[![Coverage](https://coveralls.io/repos/github/YOUR_USERNAME/ownima-admin/badge.svg)](https://coveralls.io/github/YOUR_USERNAME/ownima-admin)
[![Tests](https://img.shields.io/badge/tests-264%20passing-brightgreen)](https://github.com/YOUR_USERNAME/ownima-admin)
```

### Notifications

Enable GitHub notifications for:
- Failed workflow runs
- Coverage decreases
- Security alerts

---

## Next Steps

After setting up CI/CD:

1. ✅ **Add more tests** - Aim for 80% coverage
2. ✅ **Set up branch protection** - Require passing tests
3. ✅ **Monitor coverage trends** - Don't let it decrease
4. ✅ **Add E2E tests** - Test complete user flows
5. ✅ **Set up deployment** - Automate production deploys

---

## Resources

- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [Coveralls Documentation](https://docs.coveralls.io/)
- [Codecov Documentation](https://docs.codecov.com/)
- [Vitest Documentation](https://vitest.dev/)
- [Testing Library](https://testing-library.com/)

---

## Support

If you encounter issues:

1. Check workflow logs in GitHub Actions
2. Review this guide's troubleshooting section
3. Check `.github/workflows/README.md` for workflow details
4. Consult the testing documentation in main README

---

**Last Updated:** 2025-10-05
**Workflow Version:** 1.0
**Maintained By:** Ownima Team
