# MockB[![Status](https://img.shields.io/badge/status-production--ready-green.svg)](https://github.com/SamuelOshin/MockBox)x Backend - Professional API Mocking Service

[![FastAPI](https://img.shields.io/badge/FastAPI-0.104-009688.svg)](https://fastapi.tiangolo.com/)
[![Python](https://img.shields.io/badge/Python-3.11+-3776AB.svg)](https://www.python.org/)
[![Supabase](https://img.shields.io/badge/Supabase-Integrated-3ECF8E.svg)](https://supabase.com/)
[![Docker](https://img.shields.io/badge/Docker-Ready-2496ED.svg)](https://www.docker.com/)
[![Tests](https://img.shields.io/badge/Tests-Passing-brightgreen.svg)](https://github.com/features/actions)
[![Status](https://img.shields.io/badge/status-production--ready-green.svg)](https://github.com/SamuelOshin/MockBox)

> A high-performance, production-ready API mocking service built with FastAPI, Supabase authentication, and enterprise-grade security features.

## 🎯 Current Status: Production Ready

✅ **Complete Authentication** - JWT integration with Supabase Auth
✅ **Full CRUD Operations** - Mock management with user-scoped access
✅ **Real-time Simulation** - Dynamic API endpoint simulation
✅ **Row-Level Security** - Database-level security with Supabase RLS
✅ **Comprehensive Testing** - Full test suite with pytest
✅ **Docker Ready** - Production containerization with docker-compose
✅ **API Documentation** - Auto-generated docs with FastAPI

## 🚀 Features

### 🎯 **Core Functionality (Production Ready)**
- **Mock Management**: Complete CRUD operations with validation and error handling
- **Dynamic Simulation**: Real-time API simulation with custom responses, headers, and delays
- **User Authentication**: Secure JWT-based authentication via Supabase with session management
- **Request Analytics**: Track mock usage, performance metrics, and user activity
- **Response Customization**: Configurable status codes, headers, delays, and response formats

### 🔐 **Security & Authentication (Fully Implemented)**
- **JWT Validation**: Secure token-based authentication with automatic verification
- **Row-Level Security**: Database-level security policies with Supabase RLS
- **User Context**: Automatic user identification and data scoping
- **CORS Configuration**: Flexible cross-origin resource sharing setup
- **Input Validation**: Comprehensive request validation with Pydantic models

### 🏗️ **Architecture & Performance**
- **Async/Await**: Non-blocking operations throughout the application
- **Database Connection Pooling**: Optimized database connections with automatic management
- **Error Handling**: Comprehensive error tracking with structured logging
- **Rate Limiting**: Built-in protection against API abuse
- **Health Monitoring**: System health checks and status monitoring

### 🛠️ **Developer Experience**
- **Auto-Generated Documentation**: Interactive API docs with FastAPI
- **Type Safety**: Full type annotations with Pydantic models
- **Hot Reload**: Development server with automatic code reloading
- **Comprehensive Testing**: Unit and integration tests with pytest
- **Docker Support**: Production-ready containerization

## 🏗️ Architecture

```
┌─────────────────┐
│    Frontend     │
│   (Next.js)     │
└─────────┬───────┘
          │
┌─────────▼───────┐
│   Supabase      │
│ (Auth, DB, RLS) │
└─────────┬───────┘
          │
┌─────────▼───────┐
│  FastAPI Backend│
│ (Business Logic)│
└─────────────────┘
```

## 📦 Installation & Setup

### Prerequisites

**System Requirements:**
- **Python** 3.11 or higher
- **pip** or **pipenv** for package management
- **Git** for version control
- **Supabase Account** (free tier available)
- **Docker** (optional, for containerized development)

**Development Tools (Recommended):**
- **VS Code** with Python extension
- **Postman** or **curl** for API testing
- **Database client** for Supabase management

### Setup Instructions

1. **Clone and Navigate**
   ```bash
   git clone https://github.com/SamuelOshin/MockBox.git
   cd MockBox/backend
   ```

2. **Create Virtual Environment**
   ```bash
   # Create virtual environment
   python -m venv venv

   # Activate virtual environment
   # Windows (PowerShell):
   venv\Scripts\Activate.ps1
   # Windows (Command Prompt):
   venv\Scripts\activate.bat
   # macOS/Linux:
   source venv/bin/activate
   ```

3. **Install Dependencies**
   ```bash
   pip install -r requirements.txt
   ```

4. **Environment Configuration**
   ```bash
   cp .env.example .env
   # Edit .env with your Supabase credentials
   ```

5. **Database Setup**
   - Create a new Supabase project at [supabase.com](https://supabase.com)
   - Execute migration scripts in your Supabase SQL editor:
     ```sql
     -- Run in order:
     -- 1. migrations/001_initial_schema.sql
     -- 2. migrations/002_sample_data.sql (optional)
     ```

6. **Start Development Server**
   ```bash
   uvicorn main:app --reload --port 8000
   ```

   Access the API documentation at [http://localhost:8000/docs](http://localhost:8000/docs)

## 🐳 Docker Deployment

### Development with Docker Compose

**Quick Start**
```bash
# Start all services
docker-compose up -d

# View logs
docker-compose logs -f backend

# Stop services
docker-compose down
```

**Docker Compose Configuration**
```yaml
# docker-compose.yml
version: '3.8'
services:
  backend:
    build: .
    ports:
      - "8000:8000"
    environment:
      - SUPABASE_URL=${SUPABASE_URL}
      - SUPABASE_KEY=${SUPABASE_KEY}
      - SUPABASE_JWT_SECRET=${SUPABASE_JWT_SECRET}
    volumes:
      - .:/app
    depends_on:
      - db
```

### Production Docker Deployment

**Build Production Image**
```bash
# Build optimized production image
docker build -t mockbox-backend:latest .

# Run production container
docker run -d \
  --name mockbox-backend \
  -p 8000:8000 \
  --env-file .env.production \
  mockbox-backend:latest
```

**Multi-stage Dockerfile**
```dockerfile
FROM python:3.11-slim as base
WORKDIR /app
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

FROM base as production
COPY . .
EXPOSE 8000
CMD ["gunicorn", "main:app", "-w", "4", "-k", "uvicorn.workers.UvicornWorker", "--bind", "0.0.0.0:8000"]
```

## 🔧 Configuration

### Environment Variables

| Variable | Description | Required | Default | Example |
|----------|-------------|----------|---------|---------|
| `SUPABASE_URL` | Supabase project URL | Yes | - | `https://xyz.supabase.co` |
| `SUPABASE_KEY` | Supabase service role key | Yes | - | `eyJ0eXAiOiJKV1Q...` |
| `SUPABASE_JWT_SECRET` | JWT secret from Supabase | Yes | - | `your-jwt-secret` |
| `DEBUG` | Enable debug mode | No | `false` | `true` |
| `HOST` | Server host address | No | `0.0.0.0` | `127.0.0.1` |
| `PORT` | Server port number | No | `8000` | `8080` |
| `CORS_ORIGINS` | Allowed CORS origins | No | `*` | `http://localhost:3000` |
| `RATE_LIMIT_PER_MINUTE` | API rate limit | No | `1000` | `500` |
| `LOG_LEVEL` | Logging level | No | `INFO` | `DEBUG` |

### Supabase Configuration

**Step-by-step Setup:**

1. **Create Supabase Project**
   - Go to [supabase.com](https://supabase.com) and create a new project
   - Wait for the project to be fully provisioned

2. **Get API Credentials**
   - Navigate to Settings → API in your Supabase dashboard
   - Copy the "Project URL" and "service_role key"
   - **Important**: Use the service_role key, not the anon key for backend

3. **Get JWT Secret**
   - Go to Settings → API → JWT Settings
   - Copy the "JWT Secret" value
   - This is used for token verification

4. **Database Migrations**
   - Open the SQL Editor in your Supabase dashboard
   - Execute the migration files in order:
     ```sql
     -- Execute migrations/001_initial_schema.sql first
     -- Then execute migrations/002_sample_data.sql (optional)
     ```

5. **Verify Setup**
   ```bash
   # Test database connection
   python -c "from app.core.database import DatabaseManager; print('Database connected successfully')"
   ```

## 📖 API Documentation

### Authentication
All protected endpoints require a Bearer token in the Authorization header:
```bash
Authorization: Bearer <supabase-jwt-token>
```

### Available Endpoints

#### System Endpoints
- `GET /` - API information and health status
- `GET /health` - Detailed health check with database connectivity
- `GET /docs` - Interactive API documentation (Swagger UI)
- `GET /redoc` - Alternative API documentation (ReDoc)

#### Mock Management (Protected)
- `POST /api/v1/mocks/` - Create new mock endpoint
- `GET /api/v1/mocks/` - List user's mock endpoints
- `GET /api/v1/mocks/{id}` - Get specific mock details
- `PUT /api/v1/mocks/{id}` - Update existing mock
- `DELETE /api/v1/mocks/{id}` - Delete mock endpoint

#### Mock Simulation (Public)
- `GET|POST|PUT|DELETE /api/v1/simulate/{path}` - Simulate any endpoint
- `GET /api/v1/simulate/{mock_id}` - Simulate by mock ID

#### Public Access
- `GET /api/v1/mocks/public` - List public mock endpoints

### Request/Response Examples

#### Create Mock Endpoint
```bash
POST /api/v1/mocks/
Content-Type: application/json
Authorization: Bearer <supabase-jwt-token>

{
  "name": "User Profile API",
  "description": "Mock user profile endpoint with detailed information",
  "endpoint": "/api/users/123",
  "method": "GET",
  "response": {
    "id": 123,
    "name": "John Doe",
    "email": "john.doe@example.com",
    "avatar": "https://avatar.example.com/john.jpg",
    "role": "developer",
    "created_at": "2024-01-01T00:00:00Z"
  },
  "status_code": 200,
  "headers": {
    "Content-Type": "application/json",
    "Cache-Control": "no-cache"
  },
  "delay_ms": 250,
  "is_public": false
}
```

#### Simulate Mock Response
```bash
GET /api/v1/simulate/api/users/123

Response:
HTTP/1.1 200 OK
Content-Type: application/json
Cache-Control: no-cache

{
  "id": 123,
  "name": "John Doe",
  "email": "john.doe@example.com",
  "avatar": "https://avatar.example.com/john.jpg",
  "role": "developer",
  "created_at": "2024-01-01T00:00:00Z"
}
```

#### List User Mocks
```bash
GET /api/v1/mocks/
Authorization: Bearer <supabase-jwt-token>

Response:
{
  "mocks": [
    {
      "id": "uuid-123",
      "name": "User Profile API",
      "endpoint": "/api/users/123",
      "method": "GET",
      "status_code": 200,
      "is_public": false,
      "created_at": "2024-01-01T00:00:00Z",
      "updated_at": "2024-01-01T00:00:00Z"
    }
  ],
  "total": 1
}
```

## 🧪 Testing

### Running Tests

**Basic Test Execution**
```bash
# Run all tests
pytest

# Run with verbose output
pytest -v

# Run specific test file
pytest tests/test_main.py -v

# Run specific test function
pytest tests/test_main.py::test_create_mock -v
```

**Coverage Analysis**
```bash
# Run tests with coverage
pytest --cov=app tests/

# Generate HTML coverage report
pytest --cov=app --cov-report=html tests/

# Coverage with missing lines
pytest --cov=app --cov-report=term-missing tests/
```

**Development Testing**
```bash
# Watch mode (requires pytest-watch)
pip install pytest-watch
ptw

# Run tests on file changes
pytest-watch --runner "pytest --cov=app"
```

### Test Structure

```
tests/
├── __init__.py
├── conftest.py              # Test configuration and fixtures
├── test_main.py             # Main application tests
├── test_database_auth.py    # Database and authentication tests
└── test_mock_service.py     # Mock service functionality tests
```

### Manual API Testing

**Quick API Verification**
```bash
# Test basic connectivity
python api_test.py

# Test with custom token
python api_test.py --token "your-jwt-token"
```

**cURL Examples**
```bash
# Health check
curl http://localhost:8000/health

# Create mock (requires auth)
curl -X POST http://localhost:8000/api/v1/mocks/ \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{"name":"Test","endpoint":"/test","method":"GET","response":{"message":"hello"}}'

# Simulate mock
curl http://localhost:8000/api/v1/simulate/test
```

## 📊 Monitoring

### Health Checks
- **Endpoint**: `GET /health`
- **Response**: System status, database connectivity, version info

### Logging
- Structured logging with timestamps
- Request/response logging
- Error tracking
- Performance metrics

## 🔒 Security

### Authentication
- JWT-based authentication via Supabase
- Automatic token validation
- User context extraction

### Authorization
- Row-level security (RLS) in database
- User-based resource access
- Public/private mock visibility

### Security Headers
- CORS configuration
- Rate limiting
- Request validation
- SQL injection protection

## 🚀 Production Deployment

### Performance Optimization

**Production Server Setup**
```bash
# Install production dependencies
pip install gunicorn

# Run with multiple workers
gunicorn main:app -w 4 -k uvicorn.workers.UvicornWorker --bind 0.0.0.0:8000

# Advanced configuration
gunicorn main:app \
  --workers 4 \
  --worker-class uvicorn.workers.UvicornWorker \
  --bind 0.0.0.0:8000 \
  --access-logfile - \
  --error-logfile - \
  --log-level info
```

**Environment Configuration**
```bash
# Production environment variables
DEBUG=false
ENVIRONMENT=production
HOST=0.0.0.0
PORT=8000
CORS_ORIGINS=https://yourdomain.com,https://www.yourdomain.com
RATE_LIMIT_PER_MINUTE=1000
LOG_LEVEL=WARNING
```

### Security Considerations

**Production Checklist:**
- ✅ Set `DEBUG=false` in production
- ✅ Use HTTPS for all connections
- ✅ Configure proper CORS origins
- ✅ Set strong JWT secrets
- ✅ Enable rate limiting
- ✅ Use service role key for Supabase
- ✅ Set up monitoring and logging
- ✅ Configure proper firewall rules

### Scaling Strategies

**Horizontal Scaling**
```bash
# Load balancer configuration (nginx example)
upstream mockbox_backend {
    server backend1:8000;
    server backend2:8000;
    server backend3:8000;
}

server {
    listen 80;
    location / {
        proxy_pass http://MockBox_backend;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

**Database Optimization**
- Use connection pooling for high traffic
- Configure read replicas for analytics queries
- Set up database monitoring and alerting
- Implement caching for frequently accessed mocks

### Monitoring & Observability

**Health Monitoring**
```bash
# Health check endpoint
GET /health

Response:
{
  "status": "healthy",
  "timestamp": "2024-06-18T12:00:00Z",
  "version": "2.1.0",
  "database": "connected",
  "uptime": "2d 5h 30m"
}
```

**Logging Configuration**
```python
# Production logging setup
import logging

logging.basicConfig(
    level=logging.WARNING,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.StreamHandler(),
        logging.FileHandler('/var/log/MockBox/app.log')
    ]
)
```

## 🤝 Contributing

### Development Workflow

1. **Fork the repository** and clone your fork
2. **Create a feature branch** (`git checkout -b feature/amazing-feature`)
3. **Set up development environment** (see Installation section)
4. **Make your changes** with proper testing
5. **Run the test suite** to ensure everything works
6. **Commit your changes** (`git commit -m 'Add amazing feature'`)
7. **Push to the branch** (`git push origin feature/amazing-feature`)
8. **Open a Pull Request** with a clear description

### Code Standards

**Python Code Style:**
```bash
# Format code with black
black .

# Sort imports with isort
isort .

# Lint with flake8
flake8 app tests

# Type checking with mypy
mypy app
```

**Testing Requirements:**
- Write tests for new features
- Maintain or improve test coverage
- Test both success and error cases
- Include integration tests for API endpoints

**Documentation:**
- Update API documentation for new endpoints
- Add docstrings for new functions and classes
- Update README for new features or setup changes

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](../LICENSE) file for details.

## 🆘 Support & Troubleshooting

### Common Issues

**Database Connection Errors**
```bash
# Check Supabase credentials
python -c "import os; print(f'URL: {os.getenv(\"SUPABASE_URL\")}'); print(f'Key: {os.getenv(\"SUPABASE_KEY\")[:10]}...')"

# Test database connectivity
python -c "from app.core.database import DatabaseManager; dm = DatabaseManager(); print('Connected successfully')"
```

**JWT Token Issues**
```bash
# Verify JWT secret
python -c "import os; print(f'JWT Secret: {os.getenv(\"SUPABASE_JWT_SECRET\")[:10]}...')"

# Test token validation
curl -H "Authorization: Bearer YOUR_TOKEN" http://localhost:8000/api/v1/mocks/
```

### Getting Help

- **Documentation**: Visit http://localhost:8000/docs for interactive API docs
- **GitHub Issues**: Report bugs and request features
- **Discussions**: Ask questions in GitHub discussions
- **Email**: Contact the development team

### Development Resources

- **FastAPI Documentation**: https://fastapi.tiangolo.com/
- **Supabase Documentation**: https://supabase.com/docs
- **Python Best Practices**: https://realpython.com/
- **API Design Guidelines**: https://restfulapi.net/

---

**Built with ❤️ using FastAPI, Supabase, and modern Python practices**
