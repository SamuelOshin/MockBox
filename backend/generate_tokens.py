#!/usr/bin/env python3
"""
Simple JWT Token Generator for MockBox Testing
Creates test tokens without requiring database seeding
"""
import json
import sys
import os
from datetime import datetime, timedelta

# Add the app directory to the path
sys.path.append(os.path.join(os.path.dirname(__file__), 'app'))

from app.core.security import create_access_token

def generate_test_tokens():
    """Generate test JWT tokens for different user roles"""
    print("🔑 Generating Test JWT Tokens")
    print("=" * 40)
    
    # Test user data
    test_users = [
        {
            "id": "550e8400-e29b-41d4-a716-446655440000",
            "email": "admin@mockbox.dev",
            "username": "admin",
            "role": "admin",
            "name": "Admin User"
        },
        {
            "id": "550e8400-e29b-41d4-a716-446655440001",
            "email": "developer@mockbox.dev", 
            "username": "developer",
            "role": "user",
            "name": "Developer User"
        },
        {
            "id": "550e8400-e29b-41d4-a716-446655440002",
            "email": "tester@mockbox.dev",
            "username": "tester",
            "role": "user", 
            "name": "Test User"
        }
    ]
    
    tokens = {}
    
    try:
        for user in test_users:
            # Create token payload
            token_data = {
                "sub": user["id"],
                "email": user["email"],
                "role": user["role"],
                "username": user["username"],
                "name": user["name"]
            }
            
            # Generate token (valid for 24 hours)
            expires_delta = timedelta(hours=24)
            token = create_access_token(token_data, expires_delta)
            
            tokens[user["username"]] = {
                "user": user,
                "token": token
            }
            
            print(f"✅ Generated token for {user['username']} ({user['email']})")
        
        # Save tokens to file
        token_file = os.path.join(os.path.dirname(__file__), "test_tokens.json")
        with open(token_file, "w") as f:
            json.dump(tokens, f, indent=2)
        
        print(f"\n✅ Saved test tokens to: {token_file}")
        return tokens
        
    except Exception as e:
        print(f"❌ Error generating tokens: {e}")
        return None

def print_usage_examples(tokens):
    """Print usage examples"""
    print("\n" + "=" * 60)
    print("🚀 Test Tokens Generated! Usage Examples:")
    print("=" * 60)
    
    admin_token = tokens["admin"]["token"]
    dev_token = tokens["developer"]["token"]
    
    print("\n📖 Test Authenticated Endpoints:")
    print("# List mocks as admin:")
    print(f'curl -X GET "http://localhost:8000/api/v1/mocks/" \\')
    print(f'  -H "Authorization: Bearer {admin_token[:50]}..."')
    
    print("\n# Create mock as admin:")
    print('curl -X POST "http://localhost:8000/api/v1/mocks/" \\')
    print(f'  -H "Authorization: Bearer {admin_token[:50]}..." \\')
    print('  -H "Content-Type: application/json" \\')
    print('  -d \'{"name":"Test API","description":"Test mock","endpoint":"/test","method":"GET","response":{"message":"Hello"},"status_code":200,"delay_ms":100,"is_public":true,"tags":["test"]}\'')
    
    print("\n📋 Quick Test Commands:")
    print("# Test with authentication:")
    print("python test_auth.py")
    
    print("\n# Test without authentication (public endpoints):")
    print("python quick_verify.py")
    
    print("\n🌐 Interactive Testing:")
    print("Visit: http://localhost:8000/docs")
    print("Use the 'Authorize' button and paste a token from test_tokens.json")
    
    print("\n🔑 Token Details:")
    for username, data in tokens.items():
        user = data["user"]
        print(f"  {username}: {user['email']} ({user['role']})")

def main():
    """Main function"""
    tokens = generate_test_tokens()
    
    if tokens:
        print_usage_examples(tokens)
        print("\n🎉 Test tokens generated successfully!")
        return True
    else:
        print("\n❌ Failed to generate test tokens!")
        return False

if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1)
