# Environment Configuration Guide

Complete guide for configuring the Ownima Admin Dashboard across different environments.

## Quick Start

```bash
# 1. Copy the example environment file
cp .env.example .env.local

# 2. Set your environment
echo "VITE_ENVIRONMENT=development" > .env.local

# 3. Start the development server
npm run dev
```

## Available Environments

### Development

**Purpose:** Local development with local backend  
**API URL:** `http://localhost:8000/api/v1`  
**Use When:** Developing features, testing locally

```bash
VITE_ENVIRONMENT=development
npm run dev:development
```

### Staging

**Purpose:** Pre-production testing  
**API URL:** `https://stage.ownima.com/api/v1`  
**Use When:** Testing before production release

```bash
VITE_ENVIRONMENT=staging
npm run dev:staging
```

### Beta

**Purpose:** Beta testing with real users  
**API URL:** `https://beta.ownima.com/api/v1`  
**Use When:** Beta testing, default environment

```bash
VITE_ENVIRONMENT=beta
npm run dev:beta
```

### Production

**Purpose:** Live production environment  
**API URL:** `https://api.ownima.com/api/v1`  
**Use When:** Production deployments only

```bash
VITE_ENVIRONMENT=production
npm run build:production
```

## Environment Detection

The application automatically detects the environment based on:

1. **VITE_ENVIRONMENT** variable (highest priority)
2. **Hostname** detection in browser:
   - `localhost` → development
   - `stage.ownima.com` → staging
   - `beta.ownima.com` → beta
   - `ownima.com` → production
3. **Default:** beta (if nothing else matches)

## Configuration Files

### .env.example

Template file with all available configuration options. **Never contains secrets.**

### .env.local

Your local configuration file. **Never committed to git.**

```bash
# Example .env.local
VITE_ENVIRONMENT=development

# Optional: Enable debug features
VITE_DEBUG=true

# Optional: Custom API URL (overrides environment detection)
# VITE_API_BASE_URL=http://localhost:8080/api/v1
```

### .env

Production environment file. **Only used in production deployments.**

## Environment Variables

All environment variables must be prefixed with `VITE_` to be exposed to the client.

### Required Variables

| Variable           | Description        | Example                                        |
| ------------------ | ------------------ | ---------------------------------------------- |
| `VITE_ENVIRONMENT` | Target environment | `development`, `staging`, `beta`, `production` |

### Optional Variables

| Variable                            | Description                  | Default       |
| ----------------------------------- | ---------------------------- | ------------- |
| `VITE_API_BASE_URL`                 | Override API URL             | Auto-detected |
| `VITE_DEBUG`                        | Enable debug mode            | `false`       |
| `VITE_ENABLE_EXPERIMENTAL_FEATURES` | Enable experimental features | `false`       |
| `VITE_ANALYTICS_ID`                 | Analytics tracking ID        | None          |
| `VITE_SENTRY_DSN`                   | Sentry error tracking        | None          |

## Building for Different Environments

### Development Build

```bash
npm run build:development
```

- Source maps enabled
- Debug logging enabled
- Points to localhost API

### Staging Build

```bash
npm run build:staging
```

- Source maps enabled
- Points to staging API
- Production optimizations

### Beta Build

```bash
npm run build:beta
```

- Source maps disabled
- Points to beta API
- Full production optimizations

### Production Build

```bash
npm run build:production
```

- Source maps disabled
- Points to production API
- Maximum optimizations
- No debug code

## Avatar URLs

Avatar URLs are automatically constructed based on the environment:

```typescript
// Development
http://localhost:8000/media/avatars/user123.jpg

// Staging
https://stage.ownima.com/media/avatars/user123.jpg

// Beta
https://beta.ownima.com/media/avatars/user123.jpg

// Production
https://ownima.com/media/avatars/user123.jpg
```

## Security Best Practices

### ✅ DO

- Use `.env.local` for local development
- Keep `.env.example` updated with all variables
- Use environment-specific builds for deployments
- Validate environment variables on startup

### ❌ DON'T

- Commit `.env.local` or `.env` files
- Store secrets in environment variables (use secure vaults)
- Use production credentials in development
- Hardcode API URLs in code

## Troubleshooting

### Wrong API URL

**Problem:** App connects to wrong environment

**Solution:**

```bash
# Check current environment
echo $VITE_ENVIRONMENT

# Clear and set correct environment
rm .env.local
echo "VITE_ENVIRONMENT=development" > .env.local

# Restart dev server
npm run dev
```

### Environment Variable Not Working

**Problem:** Variable not accessible in code

**Checklist:**

1. ✅ Variable prefixed with `VITE_`?
2. ✅ Dev server restarted after change?
3. ✅ Using `import.meta.env.VITE_*` to access?

### CORS Errors

**Problem:** API requests blocked by CORS

**Solution:**

- Development: Ensure backend allows `localhost:5173`
- Production: Verify domain is whitelisted in backend

## Testing Environments

### Unit Tests

Always use development environment:

```bash
# Automatically uses development
npm run test
```

### Integration Tests

Can target any environment:

```bash
# Test against staging
VITE_ENVIRONMENT=staging npm run test:integration
```

## CI/CD Configuration

### GitHub Actions

```yaml
- name: Build for staging
  run: npm run build:staging
  env:
    VITE_ENVIRONMENT: staging
```

### Environment Secrets

Store sensitive values in GitHub Secrets:

- `STAGING_API_KEY`
- `PRODUCTION_API_KEY`
- `SENTRY_DSN`

## Monitoring

### Environment Health Checks

Each environment should have:

- Health check endpoint: `/api/v1/health`
- Status page monitoring
- Error tracking (Sentry)
- Performance monitoring

### Verification

After deployment, verify:

```bash
# Check API connection
curl https://beta.ownima.com/api/v1/health

# Check frontend
curl https://beta.ownima.com

# Verify environment in browser console
console.log(import.meta.env.VITE_ENVIRONMENT)
```

## Related Documentation

- [Deployment Guide](./DEPLOYMENT.md) - Production deployment procedures
- [CI/CD Setup](./CI_CD.md) - Automated deployment configuration
- [Main README](../README.md) - Project overview and setup
