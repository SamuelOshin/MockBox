# Contributing to MockBox 🤝

Thank you for your interest in contributing to MockBox! We welcome contributions from developers of all skill levels. This document provides guidelines and instructions for contributing to the project.

## 📋 Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Setup](#development-setup)
- [Contributing Workflow](#contributing-workflow)
- [Coding Standards](#coding-standards)
- [Testing Guidelines](#testing-guidelines)
- [Documentation](#documentation)
- [Pull Request Process](#pull-request-process)
- [Bug Reports](#bug-reports)
- [Feature Requests](#feature-requests)
- [Community](#community)

## 🤝 Code of Conduct

This project adheres to a Code of Conduct that we expect all contributors to follow. Please read and follow our [Code of Conduct](CODE_OF_CONDUCT.md) to ensure a welcoming environment for everyone.

### Our Pledge

- **Be respectful** - Treat everyone with respect and professionalism
- **Be inclusive** - Welcome contributors from all backgrounds
- **Be collaborative** - Work together to improve the project
- **Be constructive** - Provide helpful feedback and suggestions

## 🚀 Getting Started

### Prerequisites

Before contributing, ensure you have:

- **Node.js 18+** and npm/pnpm
- **Python 3.11+** and pip
- **Git** for version control
- **Docker** (optional, for containerized development)
- **Supabase account** for database access

### Quick Setup

1. **Fork the repository**
```bash
git clone https://github.com/SamuelOshin/MockBox.git
cd mockbox
```

2. **Set up the backend**
```bash
cd backend
pip install -r requirements.txt
cp .env.example .env
# Edit .env with your configuration
```

3. **Set up the frontend**
```bash
cd frontend
npm install
cp .env.example .env.local
# Edit .env.local with your configuration
```

4. **Run the development servers**
```bash
# Terminal 1 - Backend
cd backend && uvicorn main:app --reload

# Terminal 2 - Frontend
cd frontend && npm run dev
```

## 🛠️ Development Setup

### Environment Configuration

#### Backend (.env)
```env
SUPABASE_URL=your_supabase_url
SUPABASE_KEY=your_supabase_anon_key
SUPABASE_JWT_SECRET=your_jwt_secret
DEBUG=true
HOST=0.0.0.0
PORT=8000
```

#### Frontend (.env.local)
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
NEXT_PUBLIC_API_URL=http://localhost:8000
```

### Database Setup

1. Create a Supabase project
2. Run the migration files in your Supabase SQL editor:
   - `backend/migrations/001_initial_schema.sql`
   - `backend/migrations/002_sample_data.sql` (optional)

### Development Tools

We recommend using the following tools for development:

- **VS Code** with recommended extensions
- **Postman** or **Insomnia** for API testing
- **TablePlus** or **pgAdmin** for database management

## 🔄 Contributing Workflow

### 1. Create an Issue

Before starting work, create an issue or comment on an existing one to discuss:
- Bug reports with reproduction steps
- Feature requests with detailed descriptions
- Documentation improvements
- Performance optimizations

### 2. Fork and Branch

```bash
# Fork the repository on GitHub
git clone https://github.com/SamuelOshin/MockBox.git
cd mockbox

# Create a feature branch
git checkout -b feature/your-feature-name
# or for bug fixes
git checkout -b fix/bug-description
```

### 3. Make Changes

- Follow our [coding standards](#coding-standards)
- Write tests for new features
- Update documentation as needed
- Ensure all tests pass

### 4. Commit and Push

```bash
# Stage your changes
git add .

# Commit with a descriptive message
git commit -m "feat: add new mock template feature"

# Push to your fork
git push origin feature/your-feature-name
```

### 5. Create Pull Request

- Open a pull request from your fork to the main repository
- Fill out the pull request template
- Link related issues
- Wait for review and address feedback

## 📏 Coding Standards

### Frontend (TypeScript/React)

#### Code Style
```typescript
// Use TypeScript interfaces for type definitions
interface MockEndpoint {
  id: string;
  name: string;
  method: HTTPMethod;
  endpoint: string;
}

// Use functional components with hooks
const MockBuilder: React.FC = () => {
  const [mock, setMock] = useState<MockEndpoint | null>(null);
  
  return (
    <div className="flex flex-col space-y-4">
      {/* Component JSX */}
    </div>
  );
};

export default MockBuilder;
```

#### Naming Conventions
- **Components**: PascalCase (`MockBuilder`, `UserProfile`)
- **Files**: kebab-case (`mock-builder.tsx`, `user-profile.tsx`)
- **Variables/Functions**: camelCase (`mockData`, `handleSubmit`)
- **Constants**: UPPER_SNAKE_CASE (`API_BASE_URL`)

#### Component Structure
```typescript
// 1. Imports
import React from 'react';
import { useRouter } from 'next/navigation';

// 2. Types/Interfaces
interface ComponentProps {
  title: string;
  onSubmit: () => void;
}

// 3. Component
const Component: React.FC<ComponentProps> = ({ title, onSubmit }) => {
  // 4. Hooks
  const router = useRouter();
  
  // 5. Functions
  const handleClick = () => {
    // Implementation
  };
  
  // 6. Render
  return (
    <div>
      {/* JSX */}
    </div>
  );
};

// 7. Export
export default Component;
```

### Backend (Python/FastAPI)

#### Code Style
```python
# Use type hints for all functions
from typing import List, Optional
from pydantic import BaseModel

class MockCreate(BaseModel):
    """Schema for creating a new mock"""
    name: str
    endpoint: str
    method: HTTPMethod
    response: dict

async def create_mock(
    mock_data: MockCreate,
    current_user: dict = Depends(get_current_user),
    db: DatabaseManager = Depends(get_database)
) -> MockResponse:
    """Create a new mock endpoint"""
    service = MockService(db)
    mock = await service.create_mock(UUID(current_user["id"]), mock_data)
    return MockResponse(**mock.dict())
```

#### Naming Conventions
- **Classes**: PascalCase (`MockService`, `DatabaseManager`)
- **Functions**: snake_case (`create_mock`, `get_user_mocks`)
- **Variables**: snake_case (`mock_data`, `current_user`)
- **Constants**: UPPER_SNAKE_CASE (`API_V1_PREFIX`)

#### File Structure
```python
"""
Module docstring describing the file's purpose
"""

# 1. Standard library imports
import os
from typing import List

# 2. Third-party imports
from fastapi import APIRouter, Depends
from pydantic import BaseModel

# 3. Local imports
from app.core.config import settings
from app.models.models import Mock

# 4. Constants
API_PREFIX = "/api/v1"

# 5. Classes and functions
class ServiceClass:
    """Class docstring"""
    
    def __init__(self):
        pass
    
    async def method(self) -> str:
        """Method docstring"""
        return "result"
```

### General Guidelines

#### Documentation
- Use clear, descriptive docstrings
- Comment complex logic
- Keep comments up-to-date
- Use type hints consistently

#### Error Handling
```python
# Backend - Proper error handling
try:
    result = await service.create_mock(mock_data)
    return MockResponse(**result.dict())
except ValidationError as e:
    raise HTTPException(
        status_code=400,
        detail=f"Validation error: {str(e)}"
    )
except Exception as e:
    logger.error(f"Unexpected error: {str(e)}")
    raise HTTPException(
        status_code=500,
        detail="Internal server error"
    )
```

```typescript
// Frontend - Error handling with try-catch
const handleSubmit = async (data: MockCreate) => {
  try {
    await mockApi.createMock(data);
    toast.success('Mock created successfully!');
    router.push('/dashboard');
  } catch (error) {
    console.error('Failed to create mock:', error);
    toast.error('Failed to create mock. Please try again.');
  }
};
```

## 🧪 Testing Guidelines

### Frontend Tests

#### Unit Tests (Jest + Testing Library)
```typescript
import { render, screen, fireEvent } from '@testing-library/react';
import { MockBuilder } from '@/components/MockBuilder';

describe('MockBuilder', () => {
  it('renders form elements correctly', () => {
    render(<MockBuilder />);
    
    expect(screen.getByLabelText(/mock name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/endpoint/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /create mock/i })).toBeInTheDocument();
  });

  it('submits form with valid data', async () => {
    const mockSubmit = jest.fn();
    render(<MockBuilder onSubmit={mockSubmit} />);
    
    fireEvent.change(screen.getByLabelText(/mock name/i), {
      target: { value: 'Test Mock' }
    });
    
    fireEvent.click(screen.getByRole('button', { name: /create mock/i }));
    
    expect(mockSubmit).toHaveBeenCalledWith({
      name: 'Test Mock',
      // ... other fields
    });
  });
});
```

#### E2E Tests (Playwright)
```typescript
import { test, expect } from '@playwright/test';

test('user can create a mock', async ({ page }) => {
  await page.goto('/login');
  
  // Login
  await page.fill('[data-testid=email]', 'test@example.com');
  await page.fill('[data-testid=password]', 'password');
  await page.click('[data-testid=submit]');
  
  // Navigate to builder
  await page.click('[data-testid=create-mock]');
  
  // Fill form
  await page.fill('[data-testid=mock-name]', 'Test API');
  await page.fill('[data-testid=endpoint]', '/test');
  await page.selectOption('[data-testid=method]', 'GET');
  
  // Submit
  await page.click('[data-testid=create]');
  
  // Verify success
  await expect(page.locator('[data-testid=success-message]')).toBeVisible();
});
```

### Backend Tests

#### Unit Tests (pytest)
```python
import pytest
from httpx import AsyncClient
from app.main import app

@pytest.mark.asyncio
async def test_create_mock(client: AsyncClient, authenticated_user):
    """Test creating a new mock"""
    mock_data = {
        "name": "Test Mock",
        "endpoint": "/test",
        "method": "GET",
        "response": {"message": "Hello World"},
        "status_code": 200
    }
    
    response = await client.post(
        "/api/v1/mocks/",
        json=mock_data,
        headers={"Authorization": f"Bearer {authenticated_user.token}"}
    )
    
    assert response.status_code == 201
    data = response.json()
    assert data["name"] == mock_data["name"]
    assert data["endpoint"] == mock_data["endpoint"]

@pytest.mark.asyncio
async def test_simulate_mock(client: AsyncClient, sample_mock):
    """Test mock simulation"""
    response = await client.get(f"/simulate/{sample_mock.id}")
    
    assert response.status_code == 200
    assert response.json() == sample_mock.response
```

#### Integration Tests
```python
@pytest.mark.asyncio
async def test_mock_crud_operations(client: AsyncClient, authenticated_user):
    """Test complete CRUD operations for mocks"""
    # Create
    create_response = await client.post("/api/v1/mocks/", json=mock_data)
    mock_id = create_response.json()["id"]
    
    # Read
    get_response = await client.get(f"/api/v1/mocks/{mock_id}")
    assert get_response.status_code == 200
    
    # Update
    update_data = {"name": "Updated Mock"}
    update_response = await client.put(f"/api/v1/mocks/{mock_id}", json=update_data)
    assert update_response.json()["name"] == "Updated Mock"
    
    # Delete
    delete_response = await client.delete(f"/api/v1/mocks/{mock_id}")
    assert delete_response.status_code == 204
```

### Running Tests

```bash
# Frontend tests
cd frontend
npm test                    # Unit tests
npm run test:e2e           # E2E tests
npm run test:coverage      # Coverage report

# Backend tests
cd backend
pytest                     # All tests
pytest -v                  # Verbose output
pytest --cov=app tests/    # Coverage report
pytest tests/test_mocks.py # Specific test file
```

## 📚 Documentation

### Code Documentation

#### Python Docstrings
```python
async def create_mock(
    user_id: UUID,
    mock_data: MockCreate
) -> Mock:
    """
    Create a new mock endpoint for a user.
    
    Args:
        user_id: The ID of the user creating the mock
        mock_data: The mock configuration data
        
    Returns:
        Mock: The created mock object
        
    Raises:
        ValidationError: If the mock data is invalid
        DuplicateError: If a mock with the same endpoint already exists
        
    Example:
        >>> mock_data = MockCreate(name="Test", endpoint="/test", method="GET")
        >>> mock = await create_mock(user_id, mock_data)
        >>> print(mock.name)
        "Test"
    """
    # Implementation
```

#### TypeScript JSDoc
```typescript
/**
 * Create a new mock endpoint
 * 
 * @param mockData - The mock configuration
 * @returns Promise that resolves to the created mock
 * @throws {Error} When the API request fails
 * 
 * @example
 * ```typescript
 * const mock = await createMock({
 *   name: "User API",
 *   endpoint: "/users",
 *   method: "GET"
 * });
 * ```
 */
async function createMock(mockData: CreateMockRequest): Promise<MockEndpoint> {
  // Implementation
}
```

### README Updates

When adding new features, update the relevant README files:
- Main project README
- Frontend README
- Backend README
- Component-specific documentation

### API Documentation

- Update OpenAPI schemas for new endpoints
- Add examples for request/response formats
- Document error responses
- Include authentication requirements

## 🔍 Pull Request Process

### 1. Pre-submission Checklist

- [ ] Code follows project style guidelines
- [ ] Tests pass locally
- [ ] New tests added for new features
- [ ] Documentation updated
- [ ] No merge conflicts with main branch
- [ ] Commit messages follow convention

### 2. Pull Request Template

```markdown
## Description
Brief description of changes

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Testing
- [ ] Unit tests pass
- [ ] Integration tests pass
- [ ] Manual testing completed

## Screenshots
(If applicable)

## Checklist
- [ ] Code follows style guidelines
- [ ] Self-review completed
- [ ] Documentation updated
- [ ] Tests added/updated
```

### 3. Review Process

1. **Automated Checks** - CI/CD pipeline runs tests
2. **Code Review** - Team members review code
3. **Feedback** - Address review comments
4. **Approval** - Get approval from maintainers
5. **Merge** - Squash and merge to main

### 4. Commit Message Convention

We follow the [Conventional Commits](https://www.conventionalcommits.org/) specification:

```
type(scope): description

[optional body]

[optional footer]
```

#### Types
- `feat`: New features
- `fix`: Bug fixes
- `docs`: Documentation changes
- `style`: Code style changes
- `refactor`: Code refactoring
- `test`: Test additions/changes
- `chore`: Maintenance tasks

#### Examples
```
feat(api): add mock template endpoints
fix(ui): resolve login form validation error
docs(readme): update installation instructions
test(mock): add integration tests for mock service
```

## 🐛 Bug Reports

### Before Reporting

1. Check existing issues for duplicates
2. Test with the latest version
3. Verify it's not a configuration issue

### Bug Report Template

```markdown
## Bug Description
Clear description of the bug

## Steps to Reproduce
1. Go to '...'
2. Click on '...'
3. See error

## Expected Behavior
What should happen

## Actual Behavior
What actually happens

## Environment
- OS: [e.g., Windows 10, macOS 12]
- Browser: [e.g., Chrome 96, Firefox 94]
- Node.js: [e.g., 18.0.0]
- Python: [e.g., 3.11.0]

## Screenshots
(If applicable)

## Additional Context
Any other relevant information
```

## 💡 Feature Requests

### Feature Request Template

```markdown
## Feature Description
Clear description of the proposed feature

## Problem Statement
What problem does this solve?

## Proposed Solution
How should this feature work?

## Alternatives Considered
Other solutions you've considered

## Additional Context
Screenshots, mockups, or examples
```

### Feature Development Process

1. **Discussion** - Discuss the feature in an issue
2. **Planning** - Plan implementation approach
3. **Design** - Create mockups/wireframes if needed
4. **Implementation** - Code the feature
5. **Testing** - Comprehensive testing
6. **Documentation** - Update docs
7. **Review** - Code review and feedback
8. **Release** - Include in next release

## 👥 Community

### Getting Help

- **GitHub Discussions** - For general questions and discussions
- **Discord** - Real-time chat with the community
- **GitHub Issues** - For bug reports and feature requests
- **Email** - For private inquiries: dev@mockbox.dev

### Communication Guidelines

- Be respectful and professional
- Search before asking questions
- Provide context and details
- Follow up on your issues
- Help others when possible

### Community Roles

#### Contributors
- Submit pull requests
- Report bugs
- Suggest features
- Help with documentation

#### Maintainers
- Review pull requests
- Manage releases
- Guide project direction
- Support community

#### Core Team
- Project leadership
- Architecture decisions
- Long-term planning
- Community management

## 🎉 Recognition

We appreciate all contributions and recognize them in several ways:

- **Contributors file** - Listed in CONTRIBUTORS.md
- **Release notes** - Mentioned in release announcements
- **GitHub profile** - Contribution activity visible
- **Special thanks** - Called out for significant contributions

## 📞 Contact

For questions about contributing:

- **Email:** contribute@mockbox.dev
- **Discord:** [MockBox Community](https://discord.gg/MockBox)
- **GitHub:** [@mockbox](https://github.com/MockBox)

---

Thank you for contributing to MockBox! Together, we're building the future of API mocking. 🚀
