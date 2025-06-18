"""
Test JWT authentication with Supabase database operations
Tests that RLS (Row Level Security) works correctly with user tokens
"""
import pytest
import json
import os
from datetime import datetime, timedelta
from unittest.mock import patch, MagicMock, AsyncMock
from app.core.database import DatabaseManager
from app.core.security import create_access_token, verify_supabase_token
from app.core.config import settings


class TestDatabaseAuthentication:
    """Test database authentication with JWT tokens"""
    
    def setup_method(self):
        """Setup test data"""
        self.test_user_data = {
            "sub": "550e8400-e29b-41d4-a716-446655440000",
            "email": "test@mockbox.dev",
            "role": "authenticated",
            "username": "testuser",
            "name": "Test User"
        }
        
        self.admin_user_data = {
            "sub": "f5027369-23af-4440-9cb4-7ba889e48dfc",
            "email": "admin@mockbox.dev",
            "role": "admin",
            "username": "admin",
            "name": "Admin User"
        }
    
    def test_database_manager_initialization(self):
        """Test DatabaseManager initialization"""
        # Without token
        db_manager = DatabaseManager()
        assert db_manager.user_token is None
        
        # With token
        test_token = "test-token-123"
        db_manager_with_token = DatabaseManager(user_token=test_token)
        assert db_manager_with_token.user_token == test_token
    
    def test_get_client_with_auth_no_token(self):
        """Test get_client_with_auth returns default client when no token provided"""
        db_manager = DatabaseManager()
        client = db_manager.get_client_with_auth()
        
        # Should return the default client
        assert client is not None
        assert client == db_manager.supabase.client
    
    @patch('app.core.database.create_client')   
    def test_get_client_with_auth_with_token(self, mock_create_client):
        """Test get_client_with_auth creates authenticated client when token provided"""
        # Setup mock client
        mock_client = MagicMock()
        mock_client.rest = MagicMock()
        mock_client.rest.session = MagicMock()
        mock_client.rest.session.headers = MagicMock()
        mock_client.postgrest = MagicMock()
        mock_client.postgrest.headers = MagicMock()
        mock_create_client.return_value = mock_client
        
        # Test with token
        test_token = "test-jwt-token"
        db_manager = DatabaseManager()
        client = db_manager.get_client_with_auth(user_token=test_token)
        
        # Verify client creation was called
        mock_create_client.assert_called_once_with(settings.supabase_url, settings.supabase_key)
        
        # Verify headers were set
        expected_headers = {
            "Authorization": f"Bearer {test_token}",
            "apikey": settings.supabase_key
        }
        
        # Check if headers were updated on the REST client
        mock_client.rest.session.headers.update.assert_called_once_with(expected_headers)
        
        # Check if headers were updated on the PostgREST client
        mock_client.postgrest.headers.update.assert_called_once_with(expected_headers)
        
        assert client == mock_client
    
    @patch('app.core.database.create_client')   
    def test_get_client_with_auth_instance_token(self, mock_create_client):
        """Test get_client_with_auth uses instance token when no parameter provided"""
        # Setup mock client
        mock_client = MagicMock()
        mock_client.rest = MagicMock()
        mock_client.rest.session = MagicMock()
        mock_client.rest.session.headers = MagicMock()
        mock_client.postgrest = MagicMock()
        mock_client.postgrest.headers = MagicMock()
        mock_create_client.return_value = mock_client
        
        # Test with instance token
        instance_token = "instance-jwt-token"
        db_manager = DatabaseManager(user_token=instance_token)
        client = db_manager.get_client_with_auth()
        
        # Verify client creation was called
        mock_create_client.assert_called_once_with(settings.supabase_url, settings.supabase_key)
        
        # Verify headers were set with instance token
        expected_headers = {
            "Authorization": f"Bearer {instance_token}",
            "apikey": settings.supabase_key
        }
        
        mock_client.rest.session.headers.update.assert_called_once_with(expected_headers)
        mock_client.postgrest.headers.update.assert_called_once_with(expected_headers)
    
    @patch('app.core.database.create_client')    
    def test_get_client_with_auth_parameter_overrides_instance(self, mock_create_client):
        """Test get_client_with_auth parameter token overrides instance token"""
        # Setup mock client
        mock_client = MagicMock()
        mock_client.rest = MagicMock()
        mock_client.rest.session = MagicMock()
        mock_client.rest.session.headers = MagicMock()
        mock_client.postgrest = MagicMock()
        mock_client.postgrest.headers = MagicMock()
        mock_create_client.return_value = mock_client
        
        # Test parameter override
        instance_token = "instance-token"
        parameter_token = "parameter-token"
        
        db_manager = DatabaseManager(user_token=instance_token)
        client = db_manager.get_client_with_auth(user_token=parameter_token)
        
        # Verify headers were set with parameter token, not instance token
        expected_headers = {
            "Authorization": f"Bearer {parameter_token}",
            "apikey": settings.supabase_key
        }
        
        mock_client.rest.session.headers.update.assert_called_once_with(expected_headers)
        mock_client.postgrest.headers.update.assert_called_once_with(expected_headers)
    
    def test_create_jwt_token(self):
        """Test JWT token creation"""
        token = create_access_token(
            data=self.test_user_data,
            expires_delta=timedelta(hours=1)
        )
        
        assert token is not None
        assert isinstance(token, str)
        
        # Verify token can be decoded
        payload = verify_supabase_token(token)
        assert payload["sub"] == self.test_user_data["sub"]
        assert payload["email"] == self.test_user_data["email"]
    
    def test_jwt_token_verification(self):
        """Test JWT token verification"""
        # Create valid token
        token = create_access_token(
            data=self.test_user_data,
            expires_delta=timedelta(hours=1)
        )
        
        # Verify token
        payload = verify_supabase_token(token)
        assert payload["sub"] == self.test_user_data["sub"]
        assert payload["email"] == self.test_user_data["email"]
        assert payload["role"] == self.test_user_data["role"]    
        
    def test_database_health_check(self):
        """Test database health check logic"""
        db_manager = DatabaseManager()
        
        # For simplicity, just verify the manager exists and has the required methods
        assert hasattr(db_manager, 'health_check')
        assert callable(getattr(db_manager, 'health_check'))
        
        # Test the basic structure rather than async execution
        # In a real integration test, this would test actual connectivity
    
    def test_integration_user_specific_client(self):
        """Integration test for user-specific client creation"""
        # This test would require actual Supabase connection for full integration
        # For now, test the client creation logic
        
        user_token = create_access_token(
            data=self.test_user_data,
            expires_delta=timedelta(hours=1)
        )
        
        db_manager = DatabaseManager()
          # Mock the create_client to avoid actual Supabase connection
        with patch('app.core.database.create_client') as mock_create_client:
            mock_client = MagicMock()
            mock_client.rest = MagicMock()
            mock_client.rest.session = MagicMock()
            mock_client.rest.session.headers = MagicMock()
            mock_client.postgrest = MagicMock()
            mock_client.postgrest.headers = MagicMock()
            mock_create_client.return_value = mock_client
            
            # Get authenticated client
            client = db_manager.get_client_with_auth(user_token=user_token)
            
            # Verify the client was configured with the user token
            expected_headers = {
                "Authorization": f"Bearer {user_token}",
                "apikey": settings.supabase_key
            }
            
            mock_client.rest.session.headers.update.assert_called_once_with(expected_headers)
            mock_client.postgrest.headers.update.assert_called_once_with(expected_headers)
    
    def test_different_users_get_different_clients(self):
        """Test that different users get different client configurations"""
        user1_token = create_access_token(
            data=self.test_user_data,
            expires_delta=timedelta(hours=1)
        )
        
        user2_token = create_access_token(
            data=self.admin_user_data,
            expires_delta=timedelta(hours=1)
        )
        
        db_manager = DatabaseManager()
        
        with patch('app.core.database.create_client') as mock_create_client:
            mock_client1 = MagicMock()
            mock_client1.rest = MagicMock()
            mock_client1.rest.session = MagicMock()
            mock_client1.rest.session.headers = MagicMock()
            mock_client1.postgrest = MagicMock()
            mock_client1.postgrest.headers = MagicMock()
            
            mock_client2 = MagicMock()
            mock_client2.rest = MagicMock()
            mock_client2.rest.session = MagicMock()
            mock_client2.rest.session.headers = MagicMock()
            mock_client2.postgrest = MagicMock()
            mock_client2.postgrest.headers = MagicMock()
            
            # Mock create_client to return different clients for different calls
            mock_create_client.side_effect = [mock_client1, mock_client2]
            
            # Get clients for different users
            client1 = db_manager.get_client_with_auth(user_token=user1_token)
            client2 = db_manager.get_client_with_auth(user_token=user2_token)
            
            # Verify different clients were created
            assert client1 != client2
            assert mock_create_client.call_count == 2
            
            # Verify correct headers were set for each client
            expected_headers1 = {
                "Authorization": f"Bearer {user1_token}",
                "apikey": settings.supabase_key
            }
            expected_headers2 = {
                "Authorization": f"Bearer {user2_token}",
                "apikey": settings.supabase_key
            }
            
            mock_client1.rest.session.headers.update.assert_called_once_with(expected_headers1)
            mock_client2.rest.session.headers.update.assert_called_once_with(expected_headers2)


@pytest.fixture
def sample_jwt_token():
    """Fixture to provide a sample JWT token for testing"""
    user_data = {
        "sub": "550e8400-e29b-41d4-a716-446655440000",
        "email": "test@mockbox.dev",
        "role": "authenticated",
        "username": "testuser",
        "name": "Test User"
    }
    
    return create_access_token(
        data=user_data,
        expires_delta=timedelta(hours=1)
    )


@pytest.fixture
def admin_jwt_token():
    """Fixture to provide an admin JWT token for testing"""
    admin_data = {
        "sub": "f5027369-23af-4440-9cb4-7ba889e48dfc",
        "email": "admin@mockbox.dev",
        "role": "admin",
        "username": "admin",
        "name": "Admin User"
    }
    
    return create_access_token(
        data=admin_data,
        expires_delta=timedelta(hours=1)
    )


class TestRLSIntegration:
    """Test RLS behavior with real database operations (requires live Supabase)"""
    
    @pytest.mark.integration
    @pytest.mark.asyncio
    async def test_user_isolation(self, sample_jwt_token, admin_jwt_token):
        """Test that users can only access their own data (requires live DB)"""
        # This would be a full integration test that requires:
        # 1. Live Supabase instance
        # 2. RLS policies configured
        # 3. Test data in the database
        
        # For now, this is a placeholder that demonstrates the test structure
        pytest.skip("Integration test requires live Supabase instance")
        
        # Example of what the full test would look like:
        """
        user_db = DatabaseManager(user_token=sample_jwt_token)
        admin_db = DatabaseManager(user_token=admin_jwt_token)
        
        # Test that user can only see their own mocks
        user_client = user_db.get_client_with_auth()
        user_mocks = user_client.table('mocks').select('*').execute()
        
        # Test that admin can see all mocks
        admin_client = admin_db.get_client_with_auth()
        admin_mocks = admin_client.table('mocks').select('*').execute()
        
        # Verify RLS is working
        assert len(admin_mocks.data) >= len(user_mocks.data)
        """
