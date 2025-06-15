# Environment Configuration for MockBox Frontend

## Overview
This directory contains environment-specific configurations for deploying MockBox Frontend across different environments.

## Environments

### Development (`dev`)
- **Purpose**: Local development and testing
- **URL**: http://localhost:3000
- **Backend**: http://localhost:8000
- **Supabase**: Development project

### Staging (`staging`)
- **Purpose**: Pre-production testing and QA
- **URL**: https://mockbox-frontend-staging.vercel.app
- **Backend**: https://api-staging.mockbox.dev
- **Supabase**: Staging project

### Production (`prod`)
- **Purpose**: Live production environment
- **URL**: https://mockbox.app
- **Backend**: https://api.mockbox.dev
- **Supabase**: Production project

## Configuration Files

- `dev.env` - Development environment variables
- `staging.env` - Staging environment variables  
- `prod.env` - Production environment variables
- `vercel-dev.json` - Vercel config for development
- `vercel-staging.json` - Vercel config for staging
- `vercel-prod.json` - Vercel config for production

## Security

- All sensitive variables are stored in GitHub Secrets
- Environment files contain only non-sensitive defaults
- Production uses separate Supabase projects for isolation

## Deployment Process

1. **Development**: Manual deployment via `vercel dev`
2. **Staging**: Auto-deploy on `develop` branch push
3. **Production**: Auto-deploy on `main` branch push with manual approval
