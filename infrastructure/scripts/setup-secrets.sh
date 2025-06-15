#!/bin/bash

# infrastructure/scripts/setup-secrets.sh
# Script to set up GitHub Secrets for deployment

set -euo pipefail

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

log() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if GitHub CLI is installed
if ! command -v gh &> /dev/null; then
    error "GitHub CLI (gh) is required but not installed"
    echo "Install it from: https://cli.github.com/"
    exit 1
fi

# Check if user is authenticated
if ! gh auth status &> /dev/null; then
    error "Please authenticate with GitHub CLI first: gh auth login"
    exit 1
fi

# Function to set secret
set_secret() {
    local secret_name="$1"
    local secret_value="$2"
    local visibility="${3:-all}"
    
    echo -n "$secret_value" | gh secret set "$secret_name" --visibility="$visibility"
    log "Set secret: $secret_name"
}

# Function to prompt for secret value
prompt_secret() {
    local secret_name="$1"
    local description="$2"
    
    echo
    echo "Setting up: $secret_name"
    echo "Description: $description"
    echo -n "Enter value (will be hidden): "
    read -s secret_value
    echo
    
    if [[ -z "$secret_value" ]]; then
        warning "Skipping empty value for $secret_name"
        return
    fi
    
    set_secret "$secret_name" "$secret_value"
}

log "🔐 Setting up GitHub Secrets for MockBox Frontend deployment"
echo

# Vercel secrets
prompt_secret "VERCEL_TOKEN" "Vercel API token from https://vercel.com/account/tokens"
prompt_secret "VERCEL_ORG_ID" "Vercel organization ID (found in team settings)"
prompt_secret "VERCEL_PROJECT_ID_STAGING" "Vercel project ID for staging environment"
prompt_secret "VERCEL_PROJECT_ID_PROD" "Vercel project ID for production environment"

# Supabase secrets
prompt_secret "SUPABASE_URL" "Supabase project URL (for development)"
prompt_secret "SUPABASE_ANON_KEY" "Supabase anonymous key (for development)"
prompt_secret "STAGING_SUPABASE_URL" "Supabase project URL (for staging)"
prompt_secret "STAGING_SUPABASE_ANON_KEY" "Supabase anonymous key (for staging)"
prompt_secret "PROD_SUPABASE_URL" "Supabase project URL (for production)"
prompt_secret "PROD_SUPABASE_ANON_KEY" "Supabase anonymous key (for production)"

# API URLs
prompt_secret "STAGING_API_URL" "Backend API URL for staging environment"
prompt_secret "PROD_API_URL" "Backend API URL for production environment"

# Monitoring secrets
prompt_secret "SENTRY_DSN" "Sentry DSN for error tracking (optional)"
prompt_secret "SLACK_WEBHOOK_URL" "Slack webhook URL for notifications (optional)"

# Lighthouse CI (optional)
echo
read -p "Do you want to set up Lighthouse CI? (y/N): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    prompt_secret "LHCI_GITHUB_APP_TOKEN" "Lighthouse CI GitHub App token"
fi

echo
log "✅ GitHub Secrets setup completed!"
echo
log "Next steps:"
echo "1. Create Vercel projects for staging and production"
echo "2. Update the project IDs in your secrets"
echo "3. Configure your Supabase projects"
echo "4. Test the deployment pipeline"
