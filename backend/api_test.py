"""
Quick API verification script for MockBox Backend
Tests the running backend API endpoints
"""
import urllib.request
import urllib.parse
import json
import sys

def test_api():
    print("🚀 MockBox Backend API Verification")
    print("=" * 40)
    
    # Test 1: Health Check
    try:
        response = urllib.request.urlopen("http://localhost:8000/health")
        data = json.loads(response.read())
        print("✅ Health Check:", data)
    except Exception as e:
        print("❌ Health Check Failed:", e)
        return False
    
    # Test 2: Root endpoint
    try:
        response = urllib.request.urlopen("http://localhost:8000/")
        data = json.loads(response.read())
        print("✅ Root Endpoint:", data)
    except Exception as e:
        print("❌ Root Endpoint Failed:", e)
    
    # Test 3: Create Mock
    try:
        mock_data = {
            "name": "Quick Test API",
            "method": "GET",
            "path": "/api/quick-test",
            "statusCode": 200,
            "response": {
                "message": "Hello from MockBox!",
                "timestamp": "2025-06-14T10:30:00Z",
                "status": "success"
            },
            "delay": 100,
            "isPublic": True        }
        
        req = urllib.request.Request(
            "http://localhost:8000/api/v1/mocks/",
            data=json.dumps(mock_data).encode('utf-8'),
            headers={'Content-Type': 'application/json'}
        )
        
        response = urllib.request.urlopen(req)
        mock_result = json.loads(response.read())
        print("✅ Mock Created:", {
            "id": mock_result.get("id"),
            "name": mock_result.get("name"),
            "path": mock_result.get("path")
        })
        
        # Test 4: Simulate the mock
        mock_id = mock_result.get("id")
        if mock_id:
            sim_response = urllib.request.urlopen(f"http://localhost:8000/simulate/{mock_id}")
            sim_data = json.loads(sim_response.read())
            print("✅ Mock Simulation:", sim_data)
        
        return True
        
    except Exception as e:
        print("❌ Mock Creation Failed:", e)
        return False

def main():
    success = test_api()
    if success:
        print("\n" + "=" * 40)
        print("🎉 MockBox Backend is working perfectly!")
        print("\n📖 Next steps:")
        print("   • Visit http://localhost:8000/docs for API documentation")
        print("   • Start your frontend to test the integration")
        print("   • Find your JWT Secret in Supabase for production use")
    else:
        print("\n❌ Some tests failed. Check the server status.")
        sys.exit(1)

if __name__ == "__main__":
    main()
