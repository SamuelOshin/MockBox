-- Sample data for testing MockBox
-- Run this after the initial schema setup

-- Insert sample mock templates
INSERT INTO mock_templates (name, description, category, template_data, is_public, tags) VALUES
(
    'REST User API',
    'Complete REST API for user management',
    'REST API',
    '{
        "endpoints": [
            {
                "endpoint": "/users",
                "method": "GET",
                "response": {"users": [{"id": 1, "name": "John Doe", "email": "john@example.com"}]},
                "status_code": 200
            },
            {
                "endpoint": "/users/{id}",
                "method": "GET",
                "response": {"id": 1, "name": "John Doe", "email": "john@example.com"},
                "status_code": 200
            },
            {
                "endpoint": "/users",
                "method": "POST",
                "response": {"id": 2, "message": "User created successfully"},
                "status_code": 201
            }
        ]
    }',
    true,
    ARRAY['rest', 'api', 'users', 'crud']
),
(
    'E-commerce Product API',
    'Product catalog API for e-commerce applications',
    'E-commerce',
    '{
        "endpoints": [
            {
                "endpoint": "/products",
                "method": "GET",
                "response": {
                    "products": [
                        {"id": 1, "name": "Laptop", "price": 999.99, "category": "Electronics"},
                        {"id": 2, "name": "Book", "price": 19.99, "category": "Books"}
                    ]
                },
                "status_code": 200
            },
            {
                "endpoint": "/products/{id}",
                "method": "GET",
                "response": {"id": 1, "name": "Laptop", "price": 999.99, "category": "Electronics", "stock": 50},
                "status_code": 200
            }
        ]
    }',
    true,
    ARRAY['ecommerce', 'products', 'catalog']
),
(
    'Error Responses',
    'Common error response templates',
    'Error Handling',
    '{
        "endpoints": [
            {
                "endpoint": "/error/404",
                "method": "GET",
                "response": {"error": "Not Found", "message": "The requested resource was not found"},
                "status_code": 404
            },
            {
                "endpoint": "/error/500",
                "method": "GET",
                "response": {"error": "Internal Server Error", "message": "Something went wrong"},
                "status_code": 500
            },
            {
                "endpoint": "/error/unauthorized",
                "method": "GET",
                "response": {"error": "Unauthorized", "message": "Authentication required"},
                "status_code": 401
            }
        ]
    }',
    true,
    ARRAY['errors', 'http', 'responses']
);

-- Note: Sample mocks and collections should be created by users through the application
-- This ensures proper user association and RLS compliance

-- Comprehensive Mock Templates for Full-Stack Development
-- Insert additional mock templates covering various development scenarios

INSERT INTO mock_templates (name, description, category, template_data, is_public, tags) VALUES

-- Authentication & Authorization Templates
(
    'JWT Authentication API',
    'Complete JWT authentication flow with login, register, and token refresh',
    'Authentication',
    '{
        "endpoints": [
            {
                "endpoint": "/auth/register",
                "method": "POST",
                "response": {
                    "user": {"id": 1, "email": "user@example.com", "name": "John Doe"},
                    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
                    "refreshToken": "rt_abc123xyz"
                },
                "status_code": 201
            },
            {
                "endpoint": "/auth/login",
                "method": "POST",
                "response": {
                    "user": {"id": 1, "email": "user@example.com", "name": "John Doe"},
                    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
                    "refreshToken": "rt_abc123xyz"
                },
                "status_code": 200
            },
            {
                "endpoint": "/auth/refresh",
                "method": "POST",
                "response": {
                    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
                    "refreshToken": "rt_def456uvw"
                },
                "status_code": 200
            },
            {
                "endpoint": "/auth/logout",
                "method": "POST",
                "response": {"message": "Logged out successfully"},
                "status_code": 200
            }
        ]
    }',
    true,
    ARRAY['auth', 'jwt', 'login', 'security']
),

-- File Upload & Management
(
    'File Upload API',
    'File upload, download, and management endpoints',
    'File Management',
    '{
        "endpoints": [
            {
                "endpoint": "/files/upload",
                "method": "POST",
                "response": {
                    "file": {
                        "id": "file_123",
                        "filename": "document.pdf",
                        "size": 1024000,
                        "url": "https://storage.example.com/files/document.pdf",
                        "uploadedAt": "2024-01-15T10:30:00Z"
                    }
                },
                "status_code": 201
            },
            {
                "endpoint": "/files/{id}",
                "method": "GET",
                "response": {
                    "id": "file_123",
                    "filename": "document.pdf",
                    "size": 1024000,
                    "url": "https://storage.example.com/files/document.pdf",
                    "downloadCount": 5,
                    "uploadedAt": "2024-01-15T10:30:00Z"
                },
                "status_code": 200
            },
            {
                "endpoint": "/files/{id}/download",
                "method": "GET",
                "response": "Binary file content or redirect to signed URL",
                "status_code": 200
            },
            {
                "endpoint": "/files/{id}",
                "method": "DELETE",
                "response": {"message": "File deleted successfully"},
                "status_code": 200
            }
        ]
    }',
    true,
    ARRAY['files', 'upload', 'storage', 'media']
),

-- Social Media / Blog API
(
    'Social Media Posts API',
    'Social media platform with posts, comments, and likes',
    'Social Media',
    '{
        "endpoints": [
            {
                "endpoint": "/posts",
                "method": "GET",
                "response": {
                    "posts": [
                        {
                            "id": 1,
                            "content": "Just launched my new project!",
                            "author": {"id": 1, "username": "johndoe", "avatar": "https://example.com/avatar1.jpg"},
                            "createdAt": "2024-01-15T10:30:00Z",
                            "likes": 42,
                            "comments": 5,
                            "isLiked": false
                        }
                    ],
                    "pagination": {"page": 1, "totalPages": 10, "totalPosts": 100}
                },
                "status_code": 200
            },
            {
                "endpoint": "/posts",
                "method": "POST",
                "response": {
                    "id": 2,
                    "content": "New post created",
                    "author": {"id": 1, "username": "johndoe"},
                    "createdAt": "2024-01-15T11:00:00Z",
                    "likes": 0,
                    "comments": 0
                },
                "status_code": 201
            },
            {
                "endpoint": "/posts/{id}/like",
                "method": "POST",
                "response": {"liked": true, "likeCount": 43},
                "status_code": 200
            },
            {
                "endpoint": "/posts/{id}/comments",
                "method": "GET",
                "response": {
                    "comments": [
                        {
                            "id": 1,
                            "content": "Great work!",
                            "author": {"id": 2, "username": "janedoe"},
                            "createdAt": "2024-01-15T10:45:00Z"
                        }
                    ]
                },
                "status_code": 200
            }
        ]
    }',
    true,
    ARRAY['social', 'posts', 'comments', 'likes']
),

-- Real-time Chat API
(
    'Chat/Messaging API',
    'Real-time messaging system with rooms and direct messages',
    'Real-time',
    '{
        "endpoints": [
            {
                "endpoint": "/chat/rooms",
                "method": "GET",
                "response": {
                    "rooms": [
                        {
                            "id": "room_1",
                            "name": "General",
                            "participants": 25,
                            "lastMessage": {
                                "content": "Hello everyone!",
                                "sender": "johndoe",
                                "timestamp": "2024-01-15T10:30:00Z"
                            }
                        }
                    ]
                },
                "status_code": 200
            },
            {
                "endpoint": "/chat/rooms/{roomId}/messages",
                "method": "GET",
                "response": {
                    "messages": [
                        {
                            "id": "msg_1",
                            "content": "Hello everyone!",
                            "sender": {"id": 1, "username": "johndoe", "avatar": "avatar.jpg"},
                            "timestamp": "2024-01-15T10:30:00Z",
                            "type": "text"
                        }
                    ],
                    "pagination": {"page": 1, "hasMore": true}
                },
                "status_code": 200
            },
            {
                "endpoint": "/chat/rooms/{roomId}/messages",
                "method": "POST",
                "response": {
                    "id": "msg_2",
                    "content": "New message sent",
                    "sender": {"id": 1, "username": "johndoe"},
                    "timestamp": "2024-01-15T10:35:00Z"
                },
                "status_code": 201
            }
        ]
    }',
    true,
    ARRAY['chat', 'messaging', 'realtime', 'websocket']
),

-- Payment & Billing API
(
    'Payment Processing API',
    'Payment gateway integration with orders and transactions',
    'Payment',
    '{
        "endpoints": [
            {
                "endpoint": "/payments/methods",
                "method": "GET",
                "response": {
                    "paymentMethods": [
                        {
                            "id": "pm_1",
                            "type": "card",
                            "card": {"last4": "4242", "brand": "visa", "expMonth": 12, "expYear": 2025},
                            "isDefault": true
                        }
                    ]
                },
                "status_code": 200
            },
            {
                "endpoint": "/payments/create-intent",
                "method": "POST",
                "response": {
                    "clientSecret": "pi_1234_secret_5678",
                    "paymentIntentId": "pi_1234567890",
                    "amount": 2000,
                    "currency": "usd",
                    "status": "requires_payment_method"
                },
                "status_code": 200
            },
            {
                "endpoint": "/orders",
                "method": "POST",
                "response": {
                    "id": "order_123",
                    "status": "pending",
                    "total": 29.99,
                    "currency": "usd",
                    "items": [
                        {"id": 1, "name": "Product A", "quantity": 2, "price": 14.99}
                    ],
                    "createdAt": "2024-01-15T10:30:00Z"
                },
                "status_code": 201
            },
            {
                "endpoint": "/orders/{id}",
                "method": "GET",
                "response": {
                    "id": "order_123",
                    "status": "paid",
                    "total": 29.99,
                    "currency": "usd",
                    "paymentMethod": "card",
                    "shippingAddress": {
                        "street": "123 Main St",
                        "city": "Anytown",
                        "state": "CA",
                        "zipCode": "12345"
                    }
                },
                "status_code": 200
            }
        ]
    }',
    true,
    ARRAY['payment', 'billing', 'stripe', 'orders']
),

-- Search & Analytics API
(
    'Search & Analytics API',
    'Full-text search with filters and analytics tracking',
    'Search',
    '{
        "endpoints": [
            {
                "endpoint": "/search",
                "method": "GET",
                "response": {
                    "results": [
                        {
                            "id": 1,
                            "title": "React Best Practices",
                            "excerpt": "Learn the best practices for React development...",
                            "category": "Programming",
                            "score": 0.95,
                            "highlights": ["React", "best practices"]
                        }
                    ],
                    "totalResults": 150,
                    "facets": {
                        "categories": [{"name": "Programming", "count": 45}],
                        "tags": [{"name": "react", "count": 20}]
                    },
                    "pagination": {"page": 1, "totalPages": 15}
                },
                "status_code": 200
            },
            {
                "endpoint": "/analytics/events",
                "method": "POST",
                "response": {"eventId": "evt_123", "status": "recorded"},
                "status_code": 201
            },
            {
                "endpoint": "/analytics/dashboard",
                "method": "GET",
                "response": {
                    "metrics": {
                        "pageViews": 1250,
                        "uniqueVisitors": 890,
                        "averageSessionDuration": 245,
                        "bounceRate": 0.35
                    },
                    "topPages": [
                        {"path": "/home", "views": 450},
                        {"path": "/products", "views": 320}
                    ]
                },
                "status_code": 200
            }
        ]
    }',
    true,
    ARRAY['search', 'analytics', 'tracking', 'elasticsearch']
),

-- Notification System API
(
    'Notification System API',
    'Push notifications, email alerts, and notification preferences',
    'Notifications',
    '{
        "endpoints": [
            {
                "endpoint": "/notifications",
                "method": "GET",
                "response": {
                    "notifications": [
                        {
                            "id": "notif_1",
                            "type": "message",
                            "title": "New message from John",
                            "body": "Hey, how are you doing?",
                            "isRead": false,
                            "createdAt": "2024-01-15T10:30:00Z",
                            "data": {"senderId": 1, "conversationId": "conv_123"}
                        }
                    ],
                    "unreadCount": 5
                },
                "status_code": 200
            },
            {
                "endpoint": "/notifications/{id}/read",
                "method": "PUT",
                "response": {"status": "marked_as_read"},
                "status_code": 200
            },
            {
                "endpoint": "/notifications/send",
                "method": "POST",
                "response": {
                    "id": "notif_2",
                    "status": "sent",
                    "recipients": 1,
                    "channels": ["push", "email"]
                },
                "status_code": 201
            },
            {
                "endpoint": "/notifications/preferences",
                "method": "GET",
                "response": {
                    "email": {"enabled": true, "frequency": "immediate"},
                    "push": {"enabled": true, "quiet_hours": {"start": "22:00", "end": "08:00"}},
                    "sms": {"enabled": false}
                },
                "status_code": 200
            }
        ]
    }',
    true,
    ARRAY['notifications', 'push', 'email', 'alerts']
),

-- GraphQL API Template
(
    'GraphQL API Schema',
    'GraphQL queries and mutations for modern APIs',
    'GraphQL',
    '{
        "endpoints": [
            {
                "endpoint": "/graphql",
                "method": "POST",
                "query": "query GetUser($id: ID!) { user(id: $id) { id name email posts { id title createdAt } } }",
                "response": {
                    "data": {
                        "user": {
                            "id": "1",
                            "name": "John Doe",
                            "email": "john@example.com",
                            "posts": [
                                {"id": "1", "title": "My First Post", "createdAt": "2024-01-15T10:30:00Z"}
                            ]
                        }
                    }
                },
                "status_code": 200
            },
            {
                "endpoint": "/graphql",
                "method": "POST",
                "query": "mutation CreatePost($input: CreatePostInput!) { createPost(input: $input) { id title content author { name } } }",
                "response": {
                    "data": {
                        "createPost": {
                            "id": "2",
                            "title": "New Post",
                            "content": "This is a new post",
                            "author": {"name": "John Doe"}
                        }
                    }
                },
                "status_code": 200
            }
        ]
    }',
    true,
    ARRAY['graphql', 'queries', 'mutations', 'schema']
),

-- Admin Dashboard API
(
    'Admin Dashboard API',
    'Administrative endpoints for user management and system monitoring',
    'Admin',
    '{
        "endpoints": [
            {
                "endpoint": "/admin/users",
                "method": "GET",
                "response": {
                    "users": [
                        {
                            "id": 1,
                            "email": "user@example.com",
                            "name": "John Doe",
                            "role": "user",
                            "status": "active",
                            "lastLogin": "2024-01-15T10:30:00Z",
                            "createdAt": "2024-01-01T00:00:00Z"
                        }
                    ],
                    "pagination": {"page": 1, "totalPages": 10, "totalUsers": 1000}
                },
                "status_code": 200
            },
            {
                "endpoint": "/admin/users/{id}/suspend",
                "method": "PUT",
                "response": {"status": "suspended", "message": "User suspended successfully"},
                "status_code": 200
            },
            {
                "endpoint": "/admin/system/stats",
                "method": "GET",
                "response": {
                    "totalUsers": 1000,
                    "activeUsers": 850,
                    "totalPosts": 5000,
                    "serverLoad": 0.65,
                    "dbConnections": 45,
                    "memoryUsage": "2.5GB",
                    "diskUsage": "45%"
                },
                "status_code": 200
            }
        ]
    }',
    true,
    ARRAY['admin', 'dashboard', 'users', 'management']
),

-- Webhook & Integration API
(
    'Webhook & Integration API',
    'Webhook management and third-party service integrations',
    'Integration',
    '{
        "endpoints": [
            {
                "endpoint": "/webhooks",
                "method": "GET",
                "response": {
                    "webhooks": [
                        {
                            "id": "wh_1",
                            "url": "https://api.example.com/webhook",
                            "events": ["user.created", "order.completed"],
                            "isActive": true,
                            "secret": "wh_secret_123",
                            "createdAt": "2024-01-15T10:30:00Z"
                        }
                    ]
                },
                "status_code": 200
            },
            {
                "endpoint": "/webhooks",
                "method": "POST",
                "response": {
                    "id": "wh_2",
                    "url": "https://api.example.com/webhook",
                    "secret": "wh_secret_456",
                    "status": "created"
                },
                "status_code": 201
            },
            {
                "endpoint": "/integrations/slack/channels",
                "method": "GET",
                "response": {
                    "channels": [
                        {"id": "C1234567890", "name": "general", "isPrivate": false},
                        {"id": "C0987654321", "name": "dev-team", "isPrivate": true}
                    ]
                },
                "status_code": 200
            },
            {
                "endpoint": "/integrations/slack/send",
                "method": "POST",
                "response": {"messageId": "msg_123", "status": "sent"},
                "status_code": 200
            }
        ]
    }',
    true,
    ARRAY['webhooks', 'integration', 'slack', 'automation']
),

-- IoT & Device Management API
(
    'IoT Device Management API',
    'Internet of Things device monitoring and control',
    'IoT',
    '{
        "endpoints": [
            {
                "endpoint": "/devices",
                "method": "GET",
                "response": {
                    "devices": [
                        {
                            "id": "device_1",
                            "name": "Smart Thermostat",
                            "type": "thermostat",
                            "status": "online",
                            "lastSeen": "2024-01-15T10:30:00Z",
                            "battery": 85,
                            "location": "Living Room"
                        }
                    ]
                },
                "status_code": 200
            },
            {
                "endpoint": "/devices/{id}/data",
                "method": "GET",
                "response": {
                    "readings": [
                        {
                            "timestamp": "2024-01-15T10:30:00Z",
                            "temperature": 22.5,
                            "humidity": 45,
                            "co2": 400
                        }
                    ]
                },
                "status_code": 200
            },
            {
                "endpoint": "/devices/{id}/control",
                "method": "POST",
                "response": {
                    "commandId": "cmd_123",
                    "status": "sent",
                    "command": "set_temperature",
                    "parameters": {"temperature": 24}
                },
                "status_code": 200
            }
        ]
    }',
    true,
    ARRAY['iot', 'devices', 'sensors', 'monitoring']
),

-- Content Management API
(
    'CMS Content API',
    'Content management system with pages, media, and publishing',
    'CMS',
    '{
        "endpoints": [
            {
                "endpoint": "/content/pages",
                "method": "GET",
                "response": {
                    "pages": [
                        {
                            "id": 1,
                            "title": "About Us",
                            "slug": "about-us",
                            "status": "published",
                            "author": {"id": 1, "name": "John Doe"},
                            "publishedAt": "2024-01-15T10:30:00Z",
                            "updatedAt": "2024-01-15T11:00:00Z"
                        }
                    ]
                },
                "status_code": 200
            },
            {
                "endpoint": "/content/pages/{id}",
                "method": "GET",
                "response": {
                    "id": 1,
                    "title": "About Us",
                    "content": "<h1>About Our Company</h1><p>We are a leading...</p>",
                    "seo": {
                        "metaTitle": "About Us - Company Name",
                        "metaDescription": "Learn about our company..."
                    },
                    "status": "published"
                },
                "status_code": 200
            },
            {
                "endpoint": "/content/media",
                "method": "GET",
                "response": {
                    "media": [
                        {
                            "id": 1,
                            "filename": "hero-image.jpg",
                            "url": "https://cdn.example.com/hero-image.jpg",
                            "alt": "Hero image",
                            "size": 1024000,
                            "dimensions": {"width": 1920, "height": 1080}
                        }
                    ]
                },
                "status_code": 200
            }
        ]
    }',
    true,
    ARRAY['cms', 'content', 'pages', 'media']
);