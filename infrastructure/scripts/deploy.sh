#!/bin/bash

# infrastructure/scripts/deploy.sh
# Professional deployment script for MockBox Frontend

set -euo pipefail

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"
FRONTEND_DIR="$PROJECT_ROOT/frontend"

# Default values
ENVIRONMENT="staging"
DRY_RUN="false"
SKIP_TESTS="false"
SKIP_BUILD="false"

# Functions
log() {
    echo -e "${BLUE}[$(date +'%Y-%m-%d %H:%M:%S')] $1${NC}"
}

success() {
    echo -e "${GREEN}✅ $1${NC}"
}

warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

error() {
    echo -e "${RED}❌ $1${NC}"
    exit 1
}

usage() {
    cat << EOF
Usage: $0 [OPTIONS]

Options:
    -e, --environment ENV    Target environment (dev, staging, prod) [default: staging]
    -d, --dry-run           Show what would be deployed without deploying
    -s, --skip-tests        Skip running tests
    -b, --skip-build        Skip building the application
    -h, --help              Show this help message

Examples:
    $0 --environment staging
    $0 -e prod --dry-run
    $0 --skip-tests --environment dev

EOF
}

# Parse command line arguments
while [[ $# -gt 0 ]]; do
    case $1 in
        -e|--environment)
            ENVIRONMENT="$2"
            shift 2
            ;;
        -d|--dry-run)
            DRY_RUN="true"
            shift
            ;;
        -s|--skip-tests)
            SKIP_TESTS="true"
            shift
            ;;
        -b|--skip-build)
            SKIP_BUILD="true"
            shift
            ;;
        -h|--help)
            usage
            exit 0
            ;;
        *)
            error "Unknown option $1"
            ;;
    esac
done

# Validate environment
if [[ ! "$ENVIRONMENT" =~ ^(dev|staging|prod)$ ]]; then
    error "Invalid environment: $ENVIRONMENT. Must be one of: dev, staging, prod"
fi

# Main deployment function
deploy() {
    log "🚀 Starting MockBox Frontend deployment to $ENVIRONMENT"
    log "Project root: $PROJECT_ROOT"
    log "Frontend directory: $FRONTEND_DIR"
    
    if [[ "$DRY_RUN" == "true" ]]; then
        warning "DRY RUN MODE - No actual deployment will occur"
    fi
    
    # Check prerequisites
    check_prerequisites
    
    # Load environment configuration
    load_environment_config
    
    # Run pre-deployment checks
    pre_deployment_checks
    
    # Run tests if not skipped
    if [[ "$SKIP_TESTS" != "true" ]]; then
        run_tests
    fi
    
    # Build application if not skipped
    if [[ "$SKIP_BUILD" != "true" ]]; then
        build_application
    fi
    
    # Deploy to target environment
    deploy_to_environment
    
    # Run post-deployment verification
    post_deployment_verification
    
    success "🎉 Deployment completed successfully!"
}

check_prerequisites() {
    log "🔍 Checking prerequisites..."
    
    # Check if we're in the right directory
    if [[ ! -f "$FRONTEND_DIR/package.json" ]]; then
        error "Frontend package.json not found. Are you in the right directory?"
    fi
    
    # Check required tools
    command -v node >/dev/null 2>&1 || error "Node.js is required but not installed"
    command -v npm >/dev/null 2>&1 || error "npm is required but not installed"
    command -v vercel >/dev/null 2>&1 || error "Vercel CLI is required but not installed"
    command -v git >/dev/null 2>&1 || error "git is required but not installed"
    
    # Check git status
    if [[ $(git -C "$PROJECT_ROOT" status --porcelain) ]]; then
        warning "Git working directory is not clean"
        git -C "$PROJECT_ROOT" status --short
        read -p "Continue anyway? (y/N): " -n 1 -r
        echo
        if [[ ! $REPLY =~ ^[Yy]$ ]]; then
            error "Deployment cancelled"
        fi
    fi
    
    success "Prerequisites check passed"
}

load_environment_config() {
    log "⚙️  Loading environment configuration for $ENVIRONMENT..."
    
    ENV_FILE="$PROJECT_ROOT/infrastructure/environments/$ENVIRONMENT.env"
    if [[ -f "$ENV_FILE" ]]; then
        set -a
        source "$ENV_FILE"
        set +a
        success "Environment configuration loaded"
    else
        warning "Environment file not found: $ENV_FILE"
    fi
}

pre_deployment_checks() {
    log "🔍 Running pre-deployment checks..."
    
    cd "$FRONTEND_DIR"
    
    # Check for security vulnerabilities
    log "Checking for security vulnerabilities..."
    npm audit --audit-level=high || {
        warning "Security vulnerabilities found. Review and fix if necessary."
        read -p "Continue deployment? (y/N): " -n 1 -r
        echo
        if [[ ! $REPLY =~ ^[Yy]$ ]]; then
            error "Deployment cancelled due to security concerns"
        fi
    }
    
    # Check environment variables
    if [[ "$ENVIRONMENT" != "dev" ]]; then
        if [[ -z "${NEXT_PUBLIC_SUPABASE_URL:-}" ]]; then
            error "NEXT_PUBLIC_SUPABASE_URL is required for $ENVIRONMENT"
        fi
        if [[ -z "${NEXT_PUBLIC_SUPABASE_ANON_KEY:-}" ]]; then
            error "NEXT_PUBLIC_SUPABASE_ANON_KEY is required for $ENVIRONMENT"
        fi
    fi
    
    success "Pre-deployment checks passed"
}

run_tests() {
    log "🧪 Running tests..."
    
    cd "$FRONTEND_DIR"
    
    # Install dependencies if needed
    if [[ ! -d "node_modules" ]]; then
        log "Installing dependencies..."
        npm ci
    fi
    
    # Run linting
    log "Running ESLint..."
    npm run lint || error "Linting failed"
    
    # Run type checking
    log "Running TypeScript type checking..."
    npx tsc --noEmit || error "Type checking failed"
    
    # Run unit tests (when available)
    if npm run | grep -q "test"; then
        log "Running unit tests..."
        npm run test || error "Tests failed"
    else
        warning "No tests configured"
    fi
    
    success "All tests passed"
}

build_application() {
    log "🏗️  Building application for $ENVIRONMENT..."
    
    cd "$FRONTEND_DIR"
    
    if [[ "$DRY_RUN" == "true" ]]; then
        log "DRY RUN: Would build application now"
        return
    fi
    
    # Clean previous build
    rm -rf .next out
    
    # Build the application
    npm run build || error "Build failed"
    
    # Analyze bundle size
    if command -v npx >/dev/null 2>&1; then
        log "Analyzing bundle size..."
        npx next-bundle-analyzer || warning "Bundle analysis failed"
    fi
    
    success "Build completed successfully"
}

deploy_to_environment() {
    log "🚀 Deploying to $ENVIRONMENT..."
    
    cd "$FRONTEND_DIR"
    
    if [[ "$DRY_RUN" == "true" ]]; then
        log "DRY RUN: Would deploy to $ENVIRONMENT now"
        log "DRY RUN: Would run: vercel deploy ${ENVIRONMENT:+--prod}"
        return
    fi
    
    # Set Vercel project based on environment
    case "$ENVIRONMENT" in
        "prod")
            vercel deploy --prod --yes || error "Production deployment failed"
            ;;
        "staging")
            vercel deploy --yes || error "Staging deployment failed"
            ;;
        "dev")
            vercel dev --yes || error "Development deployment failed"
            ;;
    esac
    
    success "Deployment to $ENVIRONMENT completed"
}

post_deployment_verification() {
    log "🔍 Running post-deployment verification..."
    
    if [[ "$DRY_RUN" == "true" ]]; then
        log "DRY RUN: Would verify deployment now"
        return
    fi
    
    # Determine the deployment URL based on environment
    case "$ENVIRONMENT" in
        "prod")
            DEPLOYMENT_URL="https://mockbox.app"
            ;;
        "staging")
            DEPLOYMENT_URL="https://mockbox-frontend-staging.vercel.app"
            ;;
        "dev")
            DEPLOYMENT_URL="http://localhost:3000"
            ;;
    esac
    
    log "Verifying deployment at $DEPLOYMENT_URL..."
    
    # Wait for deployment to be ready
    sleep 10
    
    # Health check
    for i in {1..5}; do
        if curl -f "$DEPLOYMENT_URL" >/dev/null 2>&1; then
            success "Deployment is healthy and accessible"
            break
        else
            warning "Health check attempt $i failed, retrying..."
            sleep 10
        fi
        
        if [[ $i -eq 5 ]]; then
            error "Deployment verification failed - site not accessible"
        fi
    done
    
    # Performance check (if lighthouse is available)
    if command -v lighthouse >/dev/null 2>&1 && [[ "$ENVIRONMENT" == "prod" ]]; then
        log "Running Lighthouse performance audit..."
        lighthouse "$DEPLOYMENT_URL" --output=json --output-path=/tmp/lighthouse-report.json || warning "Lighthouse audit failed"
    fi
    
    success "Post-deployment verification completed"
}

# Cleanup function
cleanup() {
    log "🧹 Cleaning up..."
    # Add any cleanup tasks here
}

# Set trap for cleanup
trap cleanup EXIT

# Run main function
deploy
