# 🚀 MockBox Frontend Deployment Guide

## Overview

This document provides comprehensive instructions for deploying the MockBox frontend using professional DevOps practices. The deployment strategy includes multiple environments, automated CI/CD, monitoring, and security best practices.

## Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Development   │    │     Staging     │    │   Production    │
│                 │    │                 │    │                 │
│ Local Machine   │───▶│ Vercel Staging  │───▶│ Vercel Production│
│ localhost:3000  │    │ staging.app     │    │ mockbox.app     │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         │                       │                       │
         ▼                       ▼                       ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Dev Backend   │    │ Staging Backend │    │  Prod Backend   │
│ localhost:8000  │    │ api-staging     │    │ api.mockbox.dev │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## Prerequisites

### Required Tools
- **Node.js** (18.x or later)
- **npm** or **pnpm**
- **Vercel CLI** (`npm install -g vercel`)
- **GitHub CLI** (`gh`) for secret management
- **Terraform** (optional, for infrastructure as code)
- **Docker** (optional, for local testing)

### Required Accounts
- **GitHub** account with repository access
- **Vercel** account for hosting
- **Supabase** projects (dev, staging, prod)

## Quick Start

### 1. Clone and Setup
```bash
git clone <your-repo>
cd MockBox
cd frontend
npm install
```

### 2. Configure Environment
```bash
# Copy environment template
cp .env.example .env.local

# Edit with your values
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
NEXT_PUBLIC_API_URL=http://localhost:8000
```

### 3. Deploy to Staging
```bash
# Using our deployment script
./infrastructure/scripts/deploy.sh --environment staging

# Or manually with Vercel
vercel --prod
```

## Environment Configuration

### Development
- **URL**: http://localhost:3000
- **Backend**: http://localhost:8000
- **Purpose**: Local development and testing
- **Deployment**: Manual via `npm run dev`

### Staging
- **URL**: https://mockbox-frontend-staging.vercel.app
- **Backend**: https://api-staging.mockbox.dev
- **Purpose**: QA and integration testing
- **Deployment**: Auto-deploy on `develop` branch

### Production
- **URL**: https://mockbox.app
- **Backend**: https://api.mockbox.dev
- **Purpose**: Live production environment
- **Deployment**: Auto-deploy on `main` branch (with approval)

## CI/CD Pipeline

### Workflow Triggers
- **Push to `main`**: Production deployment
- **Push to `develop`**: Staging deployment
- **Pull Requests**: Build and test only
- **Manual dispatch**: Deploy to any environment

### Pipeline Stages

1. **Security & Quality**
   - Trivy vulnerability scanning
   - TruffleHog secret detection
   - ESLint code quality
   - TypeScript type checking

2. **Build & Test**
   - Multi-environment builds
   - Unit tests (when available)
   - Bundle size analysis
   - Lighthouse CI (PR only)

3. **Deployment**
   - Environment-specific deployment
   - Health checks
   - Smoke tests
   - Performance audits

4. **Post-Deployment**
   - Slack notifications
   - Release tagging
   - Monitoring setup

## Manual Deployment

### Using Deployment Script
```bash
# Deploy to staging
./infrastructure/scripts/deploy.sh --environment staging

# Deploy to production (dry run first)
./infrastructure/scripts/deploy.sh --environment prod --dry-run
./infrastructure/scripts/deploy.sh --environment prod

# Skip tests and build
./infrastructure/scripts/deploy.sh -e staging --skip-tests --skip-build
```

### Using Vercel CLI
```bash
# Install and login
npm install -g vercel
vercel login

# Link project
vercel link

# Deploy to staging
vercel

# Deploy to production
vercel --prod
```

### Using Docker (Local Testing)
```bash
# Build and run with Docker Compose
cd infrastructure/docker
docker-compose -f docker-compose.dev.yml up --build

# Access at http://localhost:3000
```

## Infrastructure as Code

### Terraform Setup
```bash
cd infrastructure/terraform

# Initialize
terraform init

# Plan deployment
terraform plan -var-file="terraform.tfvars"

# Apply changes
terraform apply -var-file="terraform.tfvars"
```

### Vercel Configuration
The `infrastructure/vercel.json` file defines:
- Build configuration
- Environment variables
- Custom headers
- Routing rules
- Security headers

## Secret Management

### Setup GitHub Secrets
```bash
# Run the setup script
./infrastructure/scripts/setup-secrets.sh

# Or manually set secrets
gh secret set VERCEL_TOKEN --body "your_token"
gh secret set SUPABASE_URL --body "your_url"
```

### Required Secrets
- `VERCEL_TOKEN`: Vercel API token
- `VERCEL_ORG_ID`: Vercel organization ID
- `VERCEL_PROJECT_ID_STAGING`: Staging project ID
- `VERCEL_PROJECT_ID_PROD`: Production project ID
- `SUPABASE_URL`: Supabase project URL
- `SUPABASE_ANON_KEY`: Supabase anonymous key
- `STAGING_*`: Staging-specific values
- `PROD_*`: Production-specific values

## Monitoring & Alerting

### Error Tracking
- **Sentry** integration for error monitoring
- Environment-specific error filtering
- Performance tracking

### Uptime Monitoring
- Health checks every 5 minutes
- Multi-region monitoring
- Slack/email/PagerDuty alerts

### Performance Monitoring
- **Lighthouse CI** for performance audits
- **Vercel Analytics** for real-time metrics
- Bundle size tracking

## Security

### Headers
- Content Security Policy
- X-Frame-Options
- X-Content-Type-Options
- HTTPS enforcement

### Environment Isolation
- Separate Supabase projects per environment
- Environment-specific API keys
- Production secret rotation

### Vulnerability Management
- **Trivy** for dependency scanning
- **TruffleHog** for secret detection
- Regular security audits

## Troubleshooting

### Common Issues

1. **Build Failures**
   ```bash
   # Check Node version
   node --version  # Should be 18.x+
   
   # Clean and reinstall
   rm -rf node_modules package-lock.json
   npm install
   ```

2. **Environment Variable Issues**
   ```bash
   # Check variables are set
   env | grep NEXT_PUBLIC
   
   # Verify in Vercel
   vercel env ls
   ```

3. **Deployment Failures**
   ```bash
   # Check Vercel status
   vercel --debug
   
   # View logs
   vercel logs
   ```

### Debug Mode
```bash
# Enable debug logging
export DEBUG=true
export NEXT_PUBLIC_DEBUG_MODE=true

# Run with verbose output
npm run build -- --debug
```

## Performance Optimization

### Bundle Size
- Code splitting enabled
- Dynamic imports for large components
- Vendor chunk separation
- Tree shaking optimization

### Caching
- Static asset caching
- API response caching
- Browser caching headers

### CDN
- Vercel Edge Network
- Global content distribution
- Automatic optimization

## Best Practices

### Development
1. Always test locally before deploying
2. Use feature branches for new functionality
3. Run linting and type checking before commits
4. Keep dependencies up to date

### Deployment
1. Use staging for testing changes
2. Monitor deployments for issues
3. Have a rollback plan ready
4. Document all configuration changes

### Security
1. Never commit secrets to git
2. Use environment variables for configuration
3. Regularly rotate API keys
4. Keep dependencies updated

## Support

### Getting Help
1. Check the troubleshooting section
2. Review Vercel deployment logs
3. Check GitHub Actions workflow runs
4. Contact the development team

### Resources
- [Vercel Documentation](https://vercel.com/docs)
- [Next.js Documentation](https://nextjs.org/docs)
- [Supabase Documentation](https://supabase.com/docs)
- [GitHub Actions Documentation](https://docs.github.com/en/actions)

---

**Last Updated**: $(date)
**Version**: 1.0.0
