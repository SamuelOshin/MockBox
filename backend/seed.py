#!/usr/bin/env python3
"""
MockBox Database Seeder
Creates test users and sample mocks for development and testing
"""
import asyncio
import os
import sys
from datetime import datetime, timedelta
from uuid import uuid4
import json

# Add the app directory to the path so we can import our modules
sys.path.append(os.path.join(os.path.dirname(__file__), "app"))

from app.core.config import settings
from app.core.database import init_database, close_database, get_database_sync
from app.core.security import create_access_token
from supabase import create_client, Client


class DatabaseSeeder:
    """Database seeder for MockBox"""

    def __init__(self):
        self.supabase: Client = create_client(
            settings.supabase_url, settings.supabase_key
        )

    async def seed_users(self):
        """Create test users"""
        print("🌱 Seeding test users...")

        test_users = [
            {
                "id": str(uuid4()),
                "email": "admin@mockbox.dev",
                "username": "admin",
                "display_name": "Admin User",
                "role": "admin",
                "is_active": True,
                "created_at": datetime.utcnow().isoformat(),
                "updated_at": datetime.utcnow().isoformat(),
                "last_login": datetime.utcnow().isoformat(),
                "settings": {"theme": "dark", "notifications": True, "auto_save": True},
            },
            {
                "id": str(uuid4()),
                "email": "developer@mockbox.dev",
                "username": "developer",
                "display_name": "Developer User",
                "role": "user",
                "is_active": True,
                "created_at": datetime.utcnow().isoformat(),
                "updated_at": datetime.utcnow().isoformat(),
                "last_login": (datetime.utcnow() - timedelta(hours=2)).isoformat(),
                "settings": {
                    "theme": "light",
                    "notifications": False,
                    "auto_save": True,
                },
            },
            {
                "id": str(uuid4()),
                "email": "tester@mockbox.dev",
                "username": "tester",
                "display_name": "Test User",
                "role": "user",
                "is_active": True,
                "created_at": (datetime.utcnow() - timedelta(days=1)).isoformat(),
                "updated_at": (datetime.utcnow() - timedelta(hours=1)).isoformat(),
                "last_login": (datetime.utcnow() - timedelta(minutes=30)).isoformat(),
                "settings": {
                    "theme": "auto",
                    "notifications": True,
                    "auto_save": False,
                },
            },
        ]

        try:
            # Insert users
            result = self.supabase.table("users").upsert(test_users).execute()
            print(f"✅ Created {len(result.data)} test users")
            return test_users
        except Exception as e:
            print(f"❌ Error creating users: {e}")
            return []

    async def seed_mocks(self, users):
        """Create sample mocks"""
        print("🌱 Seeding sample mocks...")

        if not users:
            print("❌ No users found, skipping mock creation")
            return []

        admin_user = users[0]
        dev_user = users[1]
        test_user = users[2]

        sample_mocks = [
            # Admin user mocks
            {
                "id": str(uuid4()),
                "user_id": admin_user["id"],
                "name": "User Authentication API",
                "description": "Mock API for user login and authentication",
                "endpoint": "/api/auth/login",
                "method": "POST",
                "response": {
                    "success": True,
                    "data": {
                        "user": {
                            "id": "usr_123",
                            "email": "john@example.com",
                            "name": "John Doe",
                            "role": "user",
                        },
                        "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
                        "expires_in": 3600,
                    },
                    "message": "Login successful",
                },
                "headers": {"Content-Type": "application/json"},
                "status_code": 200,
                "delay_ms": 150,
                "status": "active",
                "is_public": True,
                "tags": ["auth", "login", "jwt"],
                "created_at": datetime.utcnow().isoformat(),
                "updated_at": datetime.utcnow().isoformat(),
            },
            {
                "id": str(uuid4()),
                "user_id": admin_user["id"],
                "name": "User Profile API",
                "description": "Get user profile information",
                "endpoint": "/api/users/profile",
                "method": "GET",
                "response": {
                    "success": True,
                    "data": {
                        "id": "usr_123",
                        "email": "john@example.com",
                        "name": "John Doe",
                        "avatar": "https://api.mockbox.dev/avatars/123",
                        "role": "user",
                        "created_at": "2024-01-15T10:30:00Z",
                        "preferences": {
                            "theme": "dark",
                            "notifications": True,
                            "language": "en",
                        },
                    },
                },
                "headers": {"Content-Type": "application/json"},
                "status_code": 200,
                "delay_ms": 100,
                "status": "active",
                "is_public": True,
                "tags": ["user", "profile"],
                "created_at": (datetime.utcnow() - timedelta(hours=1)).isoformat(),
                "updated_at": (datetime.utcnow() - timedelta(minutes=30)).isoformat(),
            },
            # Developer user mocks
            {
                "id": str(uuid4()),
                "user_id": dev_user["id"],
                "name": "Products API",
                "description": "E-commerce product catalog",
                "endpoint": "/api/products",
                "method": "GET",
                "response": {
                    "success": True,
                    "data": [
                        {
                            "id": "prod_456",
                            "name": "Wireless Headphones",
                            "description": "High-quality wireless headphones with noise cancellation",
                            "price": 199.99,
                            "currency": "USD",
                            "category": "electronics",
                            "in_stock": True,
                            "images": ["https://api.mockbox.dev/images/prod_456_1.jpg"],
                            "rating": 4.5,
                            "reviews": 128,
                        },
                        {
                            "id": "prod_789",
                            "name": "Smart Watch",
                            "description": "Feature-rich smartwatch with health tracking",
                            "price": 299.99,
                            "currency": "USD",
                            "category": "electronics",
                            "in_stock": False,
                            "images": ["https://api.mockbox.dev/images/prod_789_1.jpg"],
                            "rating": 4.2,
                            "reviews": 89,
                        },
                    ],
                    "pagination": {
                        "page": 1,
                        "limit": 20,
                        "total": 2,
                        "has_more": False,
                    },
                },
                "headers": {"Content-Type": "application/json"},
                "status_code": 200,
                "delay_ms": 200,
                "status": "active",
                "is_public": True,
                "tags": ["ecommerce", "products", "catalog"],
                "created_at": (datetime.utcnow() - timedelta(hours=2)).isoformat(),
                "updated_at": (datetime.utcnow() - timedelta(hours=1)).isoformat(),
            },
            {
                "id": str(uuid4()),
                "user_id": dev_user["id"],
                "name": "Order Creation API",
                "description": "Create a new order",
                "endpoint": "/api/orders",
                "method": "POST",
                "response": {
                    "success": True,
                    "data": {
                        "id": "ord_123",
                        "status": "confirmed",
                        "items": [
                            {"product_id": "prod_456", "quantity": 1, "price": 199.99}
                        ],
                        "total": 199.99,
                        "currency": "USD",
                        "customer": {
                            "id": "usr_123",
                            "email": "john@example.com",
                            "name": "John Doe",
                        },
                        "created_at": "2025-06-14T10:30:00Z",
                        "estimated_delivery": "2025-06-18T10:30:00Z",
                    },
                    "message": "Order created successfully",
                },
                "headers": {"Content-Type": "application/json"},
                "status_code": 201,
                "delay_ms": 300,
                "status": "active",
                "is_public": False,
                "tags": ["ecommerce", "orders", "checkout"],
                "created_at": (datetime.utcnow() - timedelta(hours=3)).isoformat(),
                "updated_at": (datetime.utcnow() - timedelta(hours=2)).isoformat(),
            },
            # Test user mocks
            {
                "id": str(uuid4()),
                "user_id": test_user["id"],
                "name": "Error Response API",
                "description": "Mock API for testing error handling",
                "endpoint": "/api/test/error",
                "method": "GET",
                "response": {
                    "success": False,
                    "error": {
                        "code": "VALIDATION_ERROR",
                        "message": "Invalid request parameters",
                        "details": [
                            {"field": "email", "message": "Email is required"},
                            {
                                "field": "password",
                                "message": "Password must be at least 8 characters",
                            },
                        ],
                        "timestamp": "2025-06-14T10:30:00Z",
                    },
                },
                "headers": {"Content-Type": "application/json"},
                "status_code": 400,
                "delay_ms": 50,
                "status": "active",
                "is_public": True,
                "tags": ["testing", "error", "validation"],
                "created_at": (datetime.utcnow() - timedelta(days=1)).isoformat(),
                "updated_at": (datetime.utcnow() - timedelta(hours=4)).isoformat(),
            },
            {
                "id": str(uuid4()),
                "user_id": test_user["id"],
                "name": "Slow Response API",
                "description": "Mock API for testing timeout handling",
                "endpoint": "/api/test/slow",
                "method": "GET",
                "response": {
                    "success": True,
                    "data": {
                        "message": "This response was intentionally delayed",
                        "delay_ms": 2000,
                        "timestamp": "2025-06-14T10:30:00Z",
                    },
                },
                "headers": {"Content-Type": "application/json"},
                "status_code": 200,
                "delay_ms": 2000,
                "status": "active",
                "is_public": True,
                "tags": ["testing", "performance", "timeout"],
                "created_at": (datetime.utcnow() - timedelta(days=1)).isoformat(),
                "updated_at": (datetime.utcnow() - timedelta(hours=6)).isoformat(),
            },
        ]

        try:
            # Insert mocks
            result = self.supabase.table("mocks").upsert(sample_mocks).execute()
            print(f"✅ Created {len(result.data)} sample mocks")
            return result.data
        except Exception as e:
            print(f"❌ Error creating mocks: {e}")
            return []

    async def seed_mock_stats(self, mocks):
        """Create sample mock statistics"""
        print("🌱 Seeding mock statistics...")

        if not mocks:
            print("❌ No mocks found, skipping stats creation")
            return

        stats = []
        for mock in mocks:
            # Generate random access patterns
            base_date = datetime.utcnow() - timedelta(days=7)

            for i in range(10):  # Create 10 access records per mock
                access_time = base_date + timedelta(hours=i * 2)
                stats.append(
                    {
                        "id": str(uuid4()),
                        "mock_id": mock["id"],
                        "accessed_at": access_time.isoformat(),
                        "request_data": {
                            "ip": f"192.168.1.{10 + i}",
                            "user_agent": "MockBox Test Client",
                            "method": mock["method"],
                            "response_time_ms": mock["delay_ms"] + (i * 10),
                        },
                        "response_size_bytes": len(json.dumps(mock["response"])),
                        "status_code": mock["status_code"],
                    }
                )

        try:
            # Insert stats in batches
            batch_size = 50
            for i in range(0, len(stats), batch_size):
                batch = stats[i : i + batch_size]
                self.supabase.table("mock_stats").insert(batch).execute()

            print(f"✅ Created {len(stats)} mock statistics records")
        except Exception as e:
            print(f"❌ Error creating mock stats: {e}")

    async def create_test_tokens(self, users):
        """Create JWT tokens for testing"""
        print("🔑 Creating test authentication tokens...")

        tokens = {}
        for user in users:
            token_data = {
                "sub": user["id"],
                "email": user["email"],
                "role": user["role"],
                "username": user["username"],
            }

            token = create_access_token(token_data)
            tokens[user["username"]] = {"user": user, "token": token}

            print(f"✅ Created token for {user['username']} ({user['email']})")

        # Save tokens to file for easy testing
        token_file = os.path.join(os.path.dirname(__file__), "test_tokens.json")
        with open(token_file, "w") as f:
            # Make tokens serializable
            serializable_tokens = {}
            for username, data in tokens.items():
                serializable_tokens[username] = {
                    "user": data["user"],
                    "token": data["token"],
                }
            json.dump(serializable_tokens, f, indent=2)

        print(f"✅ Saved test tokens to: {token_file}")
        return tokens

    def print_usage_examples(self, tokens):
        """Print usage examples for testing"""
        print("\n" + "=" * 60)
        print("🚀 MockBox Seed Complete! Usage Examples:")
        print("=" * 60)

        admin_token = tokens.get("admin", {}).get("token", "")
        dev_token = tokens.get("developer", {}).get("token", "")

        print("\n📖 Test Authentication:")
        print("# Test with admin user:")
        print(f'curl -X GET "http://localhost:8000/api/v1/mocks/" \\')
        print(f'  -H "Authorization: Bearer {admin_token[:50]}..."')

        print("\n# Test with developer user:")
        print(f'curl -X GET "http://localhost:8000/api/v1/mocks/" \\')
        print(f'  -H "Authorization: Bearer {dev_token[:50]}..."')

        print("\n📋 Create New Mock:")
        print('curl -X POST "http://localhost:8000/api/v1/mocks/" \\')
        print(f'  -H "Authorization: Bearer {admin_token[:50]}..." \\')
        print('  -H "Content-Type: application/json" \\')
        print(
            '  -d \'{"name":"Test API","method":"GET","endpoint":"/test","statusCode":200,"response":{"message":"Hello World"},"delay":100,"isPublic":true}\''
        )

        print("\n🎯 Test Mock Simulation:")
        print("# After creating mocks, test simulation:")
        print('curl -X GET "http://localhost:8000/simulate/{mock_id}"')

        print("\n📊 View API Documentation:")
        print("Visit: http://localhost:8000/docs")

        print("\n🔑 Authentication Tokens saved to: test_tokens.json")
        print("\n✨ Your MockBox backend is ready for testing!")


async def main():
    """Main seeder function"""
    print("🌱 MockBox Database Seeder")
    print("=" * 40)

    # Initialize database connection
    await init_database()

    try:
        seeder = DatabaseSeeder()

        # Seed data
        users = await seeder.seed_users()
        mocks = await seeder.seed_mocks(users)
        await seeder.seed_mock_stats(mocks)
        tokens = await seeder.create_test_tokens(users)

        # Print usage examples
        seeder.print_usage_examples(tokens)

    except Exception as e:
        print(f"❌ Seeding failed: {e}")
        return False
    finally:
        await close_database()

    return True


if __name__ == "__main__":
    # Run the seeder
    success = asyncio.run(main())

    if success:
        print("\n🎉 Database seeding completed successfully!")
        sys.exit(0)
    else:
        print("\n❌ Database seeding failed!")
        sys.exit(1)
