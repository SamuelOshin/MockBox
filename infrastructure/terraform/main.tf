# infrastructure/terraform/main.tf
terraform {
  required_version = ">= 1.0"
  required_providers {
    vercel = {
      source  = "vercel/vercel"
      version = "~> 0.15"
    }
    github = {
      source  = "integrations/github"
      version = "~> 5.0"
    }
  }
  
  backend "s3" {
    # Configure your S3 backend for state management
    bucket = "mockbox-terraform-state"
    key    = "frontend/terraform.tfstate"
    region = "us-east-1"
  }
}

# Variables
variable "environment" {
  description = "Environment name (dev, staging, prod)"
  type        = string
  default     = "dev"
}

variable "vercel_api_token" {
  description = "Vercel API token"
  type        = string
  sensitive   = true
}

variable "github_token" {
  description = "GitHub token for repository management"
  type        = string
  sensitive   = true
}

variable "domain_name" {
  description = "Custom domain for the frontend"
  type        = string
  default     = ""
}

variable "supabase_url" {
  description = "Supabase project URL"
  type        = string
  sensitive   = true
}

variable "supabase_anon_key" {
  description = "Supabase anonymous key"
  type        = string
  sensitive   = true
}

variable "backend_api_url" {
  description = "Backend API URL"
  type        = string
}

# Providers
provider "vercel" {
  api_token = var.vercel_api_token
}

provider "github" {
  token = var.github_token
}

# Data sources
data "github_repository" "mockbox" {
  full_name = "your-org/mockbox" # Update with your repo
}

# Vercel project
resource "vercel_project" "mockbox_frontend" {
  name         = "mockbox-frontend-${var.environment}"
  framework    = "nextjs"
  
  git_repository = {
    type = "github"
    repo = data.github_repository.mockbox.full_name
  }

  root_directory = "frontend"
  
  build_command    = "npm run build"
  output_directory = "out"
  install_command  = "npm install"

  environment = [
    {
      key    = "NODE_ENV"
      value  = "production"
      target = ["production"]
    },
    {
      key    = "NEXT_PUBLIC_SUPABASE_URL"
      value  = var.supabase_url
      target = ["production", "preview"]
    },
    {
      key    = "NEXT_PUBLIC_SUPABASE_ANON_KEY"
      value  = var.supabase_anon_key
      target = ["production", "preview"]
    },
    {
      key    = "NEXT_PUBLIC_API_URL"
      value  = var.backend_api_url
      target = ["production", "preview"]
    }
  ]
}

# Custom domain (optional)
resource "vercel_project_domain" "mockbox_domain" {
  count      = var.domain_name != "" ? 1 : 0
  project_id = vercel_project.mockbox_frontend.id
  domain     = var.domain_name
}

# Deployment protection
resource "vercel_project_function_cpu" "mockbox_cpu" {
  project_id = vercel_project.mockbox_frontend.id
  cpu        = "basic" # or "standard" for production
}

# Output values
output "vercel_project_id" {
  value = vercel_project.mockbox_frontend.id
}

output "deployment_url" {
  value = "https://${vercel_project.mockbox_frontend.name}.vercel.app"
}

output "custom_domain_url" {
  value = var.domain_name != "" ? "https://${var.domain_name}" : null
}
