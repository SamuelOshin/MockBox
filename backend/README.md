# MockBox Backend

A professional API mocking service built with FastAPI and Supabase.

## 🚀 Features

- **Mock Management**: Create, update, and manage API mocks with full CRUD operations
- **Dynamic Simulation**: Real-time API simulation with custom responses, headers, and delays
- **Authentication**: Secure JWT-based authentication via Supabase
- **Analytics**: Track mock usage and performance metrics
- **Rate Limiting**: Built-in rate limiting for production use
- **Row-Level Security**: Database-level security with Supabase RLS
- **Docker Ready**: Production-ready containerization

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

## 📦 Installation

### Prerequisites
- Python 3.11+
- Supabase account and project
- Git

### Setup

1. **Clone the repository**
```bash
git clone <repository-url>
cd backend
```

2. **Install dependencies**
```bash
pip install -r requirements.txt
```

3. **Environment configuration**
```bash
cp .env.example .env
# Edit .env with your Supabase credentials
```

4. **Database setup**
```sql
-- Run in your Supabase SQL editor:
-- 1. migrations/001_initial_schema.sql
-- 2. migrations/002_sample_data.sql (optional)
```

5. **Run the application**
```bash
# Development
uvicorn main:app --reload --port 8000

# Production
gunicorn main:app -w 4 -k uvicorn.workers.UvicornWorker
```

## 🐳 Docker Deployment

### Using Docker Compose
```bash
# Build and run
docker-compose up -d

# View logs
docker-compose logs -f

# Stop
docker-compose down
```

### Using Docker only
```bash
# Build image
docker build -t mockbox-backend .

# Run container
docker run -d \
  --name mockbox-backend \
  -p 8000:8000 \
  --env-file .env \
  mockbox-backend
```

## 🔧 Configuration

### Environment Variables

| Variable | Description | Required | Default |
|----------|-------------|----------|---------|
| `SUPABASE_URL` | Supabase project URL | Yes | - |
| `SUPABASE_KEY` | Supabase anon key | Yes | - |
| `SUPABASE_JWT_SECRET` | JWT secret from Supabase | Yes | - |
| `DEBUG` | Enable debug mode | No | `false` |
| `HOST` | Server host | No | `0.0.0.0` |
| `PORT` | Server port | No | `8000` |
| `CORS_ORIGINS` | Allowed CORS origins | No | `*` |

### Supabase Setup

1. Create a new Supabase project
2. Go to Settings > API
3. Copy your project URL and anon key
4. Go to Settings > API > JWT Settings
5. Copy your JWT secret
6. Run the migration scripts in your SQL editor

## 📖 API Documentation

### Authentication
All protected endpoints require a Bearer token:
```
Authorization: Bearer <supabase-jwt-token>
```

### Core Endpoints

#### Mock Management
- `POST /api/v1/mocks/` - Create new mock
- `GET /api/v1/mocks/` - List user's mocks
- `GET /api/v1/mocks/{id}` - Get specific mock
- `PUT /api/v1/mocks/{id}` - Update mock
- `DELETE /api/v1/mocks/{id}` - Delete mock

#### Simulation
- `GET|POST|PUT|DELETE /api/v1/simulate/{path}` - Simulate endpoint
- `GET /api/v1/simulate/{mock_id}` - Simulate by mock ID

#### System
- `GET /health` - Health check
- `GET /docs` - Interactive API docs (development)

### Request/Response Examples

#### Create Mock
```bash
POST /api/v1/mocks/
Content-Type: application/json
Authorization: Bearer <token>

{
  "name": "User API",
  "description": "Mock user endpoint",
  "endpoint": "/users/123",
  "method": "GET",
  "response": {
    "id": 123,
    "name": "John Doe",
    "email": "john@example.com"
  },
  "status_code": 200,
  "delay_ms": 500
}
```

#### Simulate Mock
```bash
GET /api/v1/simulate/users/123

Response:
{
  "id": 123,
  "name": "John Doe", 
  "email": "john@example.com"
}
```

## 🧪 Testing

```bash
# Run all tests
pytest

# Run with coverage
pytest --cov=app tests/

# Run specific test file
pytest tests/test_main.py -v
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

### Performance Considerations
- Use `gunicorn` with multiple workers
- Enable database connection pooling
- Configure proper caching headers
- Set up monitoring and alerting

### Recommended Environment
```bash
# Production environment variables
DEBUG=false
ENVIRONMENT=production
CORS_ORIGINS=https://yourdomain.com
RATE_LIMIT_PER_MINUTE=1000
```

### Scaling
- Horizontal scaling with multiple instances
- Database read replicas for analytics
- CDN for static assets
- Load balancer configuration

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

- **Documentation**: Check `/docs` endpoint in development
- **Issues**: Open GitHub issues for bugs and feature requests
- **Discussions**: Use GitHub discussions for questions

---

**Built with ❤️ using FastAPI and Supabase**
