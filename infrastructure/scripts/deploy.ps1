# PowerShell deployment script for MockBox Frontend
param(
    [string]$Environment = "staging",
    [switch]$DryRun,
    [switch]$SkipTests,
    [switch]$SkipBuild,
    [switch]$Help
)

# Colors for output
$Red = [ConsoleColor]::Red
$Green = [ConsoleColor]::Green
$Yellow = [ConsoleColor]::Yellow
$Blue = [ConsoleColor]::Blue

function Write-Log {
    param([string]$Message)
    Write-Host "[$(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')] $Message" -ForegroundColor $Blue
}

function Write-Success {
    param([string]$Message)
    Write-Host "✅ $Message" -ForegroundColor $Green
}

function Write-Warning {
    param([string]$Message)
    Write-Host "⚠️  $Message" -ForegroundColor $Yellow
}

function Write-Error {
    param([string]$Message)
    Write-Host "❌ $Message" -ForegroundColor $Red
    exit 1
}

function Show-Usage {
    @"
Usage: .\deploy.ps1 [OPTIONS]

Options:
    -Environment ENV     Target environment (dev, staging, prod) [default: staging]
    -DryRun             Show what would be deployed without deploying
    -SkipTests          Skip running tests
    -SkipBuild          Skip building the application
    -Help               Show this help message

Examples:
    .\deploy.ps1 -Environment staging
    .\deploy.ps1 -Environment prod -DryRun
    .\deploy.ps1 -SkipTests -Environment dev
"@
}

function Test-Prerequisites {
    Write-Log "🔍 Checking prerequisites..."
    
    # Check if we're in the right directory
    if (-not (Test-Path "frontend\package.json")) {
        Write-Error "Frontend package.json not found. Are you in the right directory?"
    }
    
    # Check required tools
    $tools = @("node", "npm", "vercel", "git")
    foreach ($tool in $tools) {
        if (-not (Get-Command $tool -ErrorAction SilentlyContinue)) {
            Write-Error "$tool is required but not installed"
        }
    }
    
    # Check git status
    $gitStatus = git status --porcelain
    if ($gitStatus) {
        Write-Warning "Git working directory is not clean"
        git status --short
        $continue = Read-Host "Continue anyway? (y/N)"
        if ($continue -notmatch "^[Yy]") {
            Write-Error "Deployment cancelled"
        }
    }
    
    Write-Success "Prerequisites check passed"
}

function Set-EnvironmentConfig {
    Write-Log "⚙️  Loading environment configuration for $Environment..."
    
    $envFile = "infrastructure\environments\$Environment.env"
    if (Test-Path $envFile) {
        Get-Content $envFile | ForEach-Object {
            if ($_ -match "^([^#][^=]+)=(.*)$") {
                [Environment]::SetEnvironmentVariable($matches[1], $matches[2], "Process")
            }
        }
        Write-Success "Environment configuration loaded"
    } else {
        Write-Warning "Environment file not found: $envFile"
    }
}

function Invoke-PreDeploymentChecks {
    Write-Log "🔍 Running pre-deployment checks..."
    
    Set-Location "frontend"
    
    # Check for security vulnerabilities
    Write-Log "Checking for security vulnerabilities..."
    try {
        npm audit --audit-level=high
    } catch {
        Write-Warning "Security vulnerabilities found. Review and fix if necessary."
        $continue = Read-Host "Continue deployment? (y/N)"
        if ($continue -notmatch "^[Yy]") {
            Write-Error "Deployment cancelled due to security concerns"
        }
    }
    
    # Check environment variables
    if ($Environment -ne "dev") {
        if (-not $env:NEXT_PUBLIC_SUPABASE_URL) {
            Write-Error "NEXT_PUBLIC_SUPABASE_URL is required for $Environment"
        }
        if (-not $env:NEXT_PUBLIC_SUPABASE_ANON_KEY) {
            Write-Error "NEXT_PUBLIC_SUPABASE_ANON_KEY is required for $Environment"
        }
    }
    
    Set-Location ".."
    Write-Success "Pre-deployment checks passed"
}

function Invoke-Tests {
    Write-Log "🧪 Running tests..."
    
    Set-Location "frontend"
    
    # Install dependencies if needed
    if (-not (Test-Path "node_modules")) {
        Write-Log "Installing dependencies..."
        npm ci
    }
    
    # Run linting
    Write-Log "Running ESLint..."
    npm run lint
    if ($LASTEXITCODE -ne 0) { Write-Error "Linting failed" }
    
    # Run type checking
    Write-Log "Running TypeScript type checking..."
    npx tsc --noEmit
    if ($LASTEXITCODE -ne 0) { Write-Error "Type checking failed" }
    
    # Run unit tests (when available)
    $hasTests = npm run 2>&1 | Select-String "test"
    if ($hasTests) {
        Write-Log "Running unit tests..."
        npm run test
        if ($LASTEXITCODE -ne 0) { Write-Error "Tests failed" }
    } else {
        Write-Warning "No tests configured"
    }
    
    Set-Location ".."
    Write-Success "All tests passed"
}

function Invoke-Build {
    Write-Log "🏗️  Building application for $Environment..."
    
    Set-Location "frontend"
    
    if ($DryRun) {
        Write-Log "DRY RUN: Would build application now"
        Set-Location ".."
        return
    }
    
    # Clean previous build
    Remove-Item -Path ".next", "out" -Recurse -Force -ErrorAction SilentlyContinue
    
    # Build the application
    npm run build
    if ($LASTEXITCODE -ne 0) { Write-Error "Build failed" }
    
    Set-Location ".."
    Write-Success "Build completed successfully"
}

function Invoke-Deployment {
    Write-Log "🚀 Deploying to $Environment..."
    
    Set-Location "frontend"
    
    if ($DryRun) {
        Write-Log "DRY RUN: Would deploy to $Environment now"
        if ($Environment -eq "prod") {
            Write-Log "DRY RUN: Would run: vercel deploy --prod"
        } else {
            Write-Log "DRY RUN: Would run: vercel deploy"
        }
        Set-Location ".."
        return
    }
    
    # Deploy based on environment
    switch ($Environment) {
        "prod" {
            vercel deploy --prod --yes
            if ($LASTEXITCODE -ne 0) { Write-Error "Production deployment failed" }
        }
        "staging" {
            vercel deploy --yes
            if ($LASTEXITCODE -ne 0) { Write-Error "Staging deployment failed" }
        }
        "dev" {
            vercel dev --yes
            if ($LASTEXITCODE -ne 0) { Write-Error "Development deployment failed" }
        }
    }
    
    Set-Location ".."
    Write-Success "Deployment to $Environment completed"
}

function Test-Deployment {
    Write-Log "🔍 Running post-deployment verification..."
    
    if ($DryRun) {
        Write-Log "DRY RUN: Would verify deployment now"
        return
    }
    
    # Determine deployment URL
    $deploymentUrl = switch ($Environment) {
        "prod" { "https://mockbox.app" }
        "staging" { "https://mockbox-frontend-staging.vercel.app" }
        "dev" { "http://localhost:3000" }
    }
    
    Write-Log "Verifying deployment at $deploymentUrl..."
    
    # Wait for deployment to be ready
    Start-Sleep 10
    
    # Health check
    for ($i = 1; $i -le 5; $i++) {
        try {
            $response = Invoke-WebRequest -Uri $deploymentUrl -UseBasicParsing -TimeoutSec 10
            if ($response.StatusCode -eq 200) {
                Write-Success "Deployment is healthy and accessible"
                break
            }
        } catch {
            Write-Warning "Health check attempt $i failed, retrying..."
            Start-Sleep 10
        }
        
        if ($i -eq 5) {
            Write-Error "Deployment verification failed - site not accessible"
        }
    }
    
    Write-Success "Post-deployment verification completed"
}

# Main function
function Start-Deployment {
    if ($Help) {
        Show-Usage
        return
    }
    
    # Validate environment
    if ($Environment -notmatch "^(dev|staging|prod)$") {
        Write-Error "Invalid environment: $Environment. Must be one of: dev, staging, prod"
    }
    
    Write-Log "🚀 Starting MockBox Frontend deployment to $Environment"
    
    if ($DryRun) {
        Write-Warning "DRY RUN MODE - No actual deployment will occur"
    }
    
    try {
        Test-Prerequisites
        Set-EnvironmentConfig
        Invoke-PreDeploymentChecks
        
        if (-not $SkipTests) {
            Invoke-Tests
        }
        
        if (-not $SkipBuild) {
            Invoke-Build
        }
        
        Invoke-Deployment
        Test-Deployment
        
        Write-Success "🎉 Deployment completed successfully!"
    } catch {
        Write-Error "Deployment failed: $($_.Exception.Message)"
    }
}

# Run the deployment
Start-Deployment
