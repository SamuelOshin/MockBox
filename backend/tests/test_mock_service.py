"""
Unit tests for MockService
"""

import pytest
from unittest.mock import Mock, AsyncMock, patch, MagicMock
from uuid import UUID, uuid4
from datetime import datetime
from fastapi import HTTPException, status

from app.services.mock_service import MockService
from app.models.models import Mock as MockModel, HTTPMethod, MockStatus
from app.schemas.schemas import MockCreate, MockUpdate, PaginationParams


# Global fixtures
@pytest.fixture
def mock_db():
    """Mock database manager"""
    db = Mock()
    db.supabase.client = Mock()
    db.get_client_with_auth = Mock(return_value=Mock())
    return db


@pytest.fixture
def mock_service(mock_db):
    """MockService instance with mocked dependencies"""
    return MockService(db=mock_db)


@pytest.fixture
def mock_service_with_auth(mock_db):
    """MockService instance with auth token"""
    return MockService(db=mock_db, user_token="test_token")


@pytest.fixture
def sample_user_id():
    """Sample user ID"""
    return UUID("123e4567-e89b-12d3-a456-426614174000")


@pytest.fixture
def sample_mock_id():
    """Sample mock ID"""
    return UUID("987fcdeb-51d3-42a1-b456-123456789abc")


@pytest.fixture
def sample_mock_create():
    """Sample mock creation data"""
    return MockCreate(
        name="Test Mock",
        description="Test description",
        endpoint="/api/test",
        method=HTTPMethod.GET,
        response={"message": "test"},
        headers={"Content-Type": "application/json"},
        status_code=200,
        delay_ms=100,
        is_public=True,
        tags=["test", "api"],
    )


@pytest.fixture
def sample_mock_data(sample_mock_id, sample_user_id):
    """Sample mock database record"""
    return {
        "id": str(sample_mock_id),
        "user_id": str(sample_user_id),
        "name": "Test Mock",
        "description": "Test description",
        "endpoint": "/api/test",
        "method": "GET",
        "response": {"message": "test"},
        "headers": {"Content-Type": "application/json"},
        "status_code": 200,
        "delay_ms": 100,
        "status": "active",
        "is_public": True,
        "tags": ["test", "api"],
        "access_count": 0,
        "last_accessed": None,
        "created_at": "2025-06-18T10:00:00Z",
        "updated_at": None,
    }


class TestMockService:
    """Unit tests for MockService"""


class TestMockServiceInitialization:
    """Test MockService initialization"""

    def test_init_without_auth(self, mock_db):
        """Test initialization without auth token"""
        service = MockService(db=mock_db)

        assert service.db == mock_db
        assert service.user_token is None
        assert service.client == mock_db.supabase.client
        mock_db.get_client_with_auth.assert_not_called()

    def test_init_with_auth(self, mock_db):
        """Test initialization with auth token"""
        token = "test_token"
        service = MockService(db=mock_db, user_token=token)

        assert service.db == mock_db
        assert service.user_token == token
        mock_db.get_client_with_auth.assert_called_once_with(token)
        assert service.client == mock_db.get_client_with_auth.return_value


class TestCreateMock:
    """Test create_mock method"""

    @pytest.mark.asyncio
    async def test_create_mock_success(
        self, mock_service, sample_user_id, sample_mock_create, sample_mock_data
    ):
        """Test successful mock creation"""
        # Mock dependencies
        mock_service._get_mock_by_endpoint = AsyncMock(return_value=None)
        mock_service._create_mock_stats = AsyncMock()

        # Mock database response
        mock_result = Mock()
        mock_result.data = [sample_mock_data]
        mock_service.client.table.return_value.insert.return_value.execute.return_value = (
            mock_result
        )

        # Execute
        result = await mock_service.create_mock(sample_user_id, sample_mock_create)

        # Assertions
        assert isinstance(result, MockModel)
        assert result.name == sample_mock_create.name
        assert result.endpoint == sample_mock_create.endpoint

        # Verify database call
        mock_service.client.table.assert_called_with("mocks")
        mock_service._create_mock_stats.assert_called_once()

    @pytest.mark.asyncio
    async def test_create_mock_duplicate_endpoint(
        self, mock_service, sample_user_id, sample_mock_create, sample_mock_data
    ):
        """Test creating mock with duplicate endpoint"""
        # Mock existing mock
        existing_mock = MockModel(**sample_mock_data)
        mock_service._get_mock_by_endpoint = AsyncMock(return_value=existing_mock)

        # Execute and assert
        with pytest.raises(HTTPException) as exc_info:
            await mock_service.create_mock(sample_user_id, sample_mock_create)

        assert exc_info.value.status_code == status.HTTP_409_CONFLICT
        assert "already exists" in exc_info.value.detail

    @pytest.mark.asyncio
    async def test_create_mock_foreign_key_error(
        self, mock_service, sample_user_id, sample_mock_create
    ):
        """Test create mock with foreign key constraint error"""
        # Mock dependencies
        mock_service._get_mock_by_endpoint = AsyncMock(return_value=None)

        # Mock database error
        mock_service.client.table.return_value.insert.return_value.execute.side_effect = Exception(
            "mocks_user_id_fkey violates foreign key constraint"
        )

        # Execute and assert
        with pytest.raises(HTTPException) as exc_info:
            await mock_service.create_mock(sample_user_id, sample_mock_create)

        assert exc_info.value.status_code == status.HTTP_401_UNAUTHORIZED
        assert "User not found" in exc_info.value.detail

    @pytest.mark.asyncio
    async def test_create_mock_database_error(
        self, mock_service, sample_user_id, sample_mock_create
    ):
        """Test create mock with general database error"""
        # Mock dependencies
        mock_service._get_mock_by_endpoint = AsyncMock(return_value=None)

        # Mock database error
        mock_service.client.table.return_value.insert.return_value.execute.side_effect = Exception(
            "Database error"
        )

        # Execute and assert
        with pytest.raises(HTTPException) as exc_info:
            await mock_service.create_mock(sample_user_id, sample_mock_create)

        assert exc_info.value.status_code == status.HTTP_500_INTERNAL_SERVER_ERROR
        assert "Failed to create mock" in exc_info.value.detail

    @pytest.mark.asyncio
    async def test_create_mock_no_data_returned(
        self, mock_service, sample_user_id, sample_mock_create
    ):
        """Test create mock when no data is returned"""
        # Mock dependencies
        mock_service._get_mock_by_endpoint = AsyncMock(return_value=None)

        # Mock database response with no data
        mock_result = Mock()
        mock_result.data = []
        mock_service.client.table.return_value.insert.return_value.execute.return_value = (
            mock_result
        )

        # Execute and assert
        with pytest.raises(HTTPException) as exc_info:
            await mock_service.create_mock(sample_user_id, sample_mock_create)

        assert exc_info.value.status_code == status.HTTP_500_INTERNAL_SERVER_ERROR
        assert "Failed to create mock" in exc_info.value.detail


class TestGetMock:
    """Test get_mock method"""

    @pytest.mark.asyncio
    async def test_get_mock_with_user_id(
        self, mock_service, sample_mock_id, sample_user_id, sample_mock_data
    ):
        """Test getting mock with user ID"""
        # Mock database response
        mock_result = Mock()
        mock_result.data = [sample_mock_data]
        mock_service.client.table.return_value.select.return_value.eq.return_value.or_.return_value.execute.return_value = (
            mock_result
        )

        # Execute
        result = await mock_service.get_mock(sample_mock_id, sample_user_id)

        # Assertions
        assert isinstance(result, MockModel)
        assert result.id == sample_mock_id
        assert result.name == "Test Mock"

        # Verify database call
        mock_service.client.table.assert_called_with("mocks")

    @pytest.mark.asyncio
    async def test_get_mock_public_only(
        self, mock_service, sample_mock_id, sample_mock_data
    ):
        """Test getting mock without user ID (public only)"""
        # Mock database response
        mock_result = Mock()
        mock_result.data = [sample_mock_data]
        mock_service.client.table.return_value.select.return_value.eq.return_value.eq.return_value.execute.return_value = (
            mock_result
        )

        # Execute
        result = await mock_service.get_mock(sample_mock_id)

        # Assertions
        assert isinstance(result, MockModel)
        assert result.id == sample_mock_id

    @pytest.mark.asyncio
    async def test_get_mock_not_found(self, mock_service, sample_mock_id):
        """Test getting non-existent mock"""
        # Mock database response with no data
        mock_result = Mock()
        mock_result.data = []
        mock_service.client.table.return_value.select.return_value.eq.return_value.eq.return_value.execute.return_value = (
            mock_result
        )

        # Execute
        result = await mock_service.get_mock(sample_mock_id)

        # Assertions
        assert result is None

    @pytest.mark.asyncio
    async def test_get_mock_database_error(self, mock_service, sample_mock_id):
        """Test get mock with database error"""
        # Mock database error
        mock_service.client.table.return_value.select.side_effect = Exception(
            "Database error"
        )

        # Execute and assert
        with pytest.raises(HTTPException) as exc_info:
            await mock_service.get_mock(sample_mock_id)

        assert exc_info.value.status_code == status.HTTP_500_INTERNAL_SERVER_ERROR
        assert "Error fetching mock" in exc_info.value.detail


class TestListMocks:
    """Test list_mocks method"""

    @pytest.mark.asyncio
    async def test_list_mocks_basic(
        self, mock_service, sample_user_id, sample_mock_data
    ):
        """Test basic mock listing"""
        pagination = PaginationParams(page=1, limit=10)

        # Mock database response
        mock_result = Mock()
        mock_result.data = [sample_mock_data]
        mock_result.count = 1

        # Setup method chain mock
        table_mock = Mock()
        select_mock = Mock()
        eq_mock = Mock()
        order_mock = Mock()
        range_mock = Mock()

        mock_service.client.table.return_value = table_mock
        table_mock.select.return_value = select_mock
        select_mock.eq.return_value = eq_mock
        eq_mock.order.return_value = order_mock
        order_mock.range.return_value = range_mock
        range_mock.execute.return_value = mock_result

        # Execute
        mocks, total = await mock_service.list_mocks(sample_user_id, pagination)

        # Assertions
        assert len(mocks) == 1
        assert isinstance(mocks[0], MockModel)
        assert total == 1

        # Verify database calls
        mock_service.client.table.assert_called_with("mocks")
        table_mock.select.assert_called_with("*", count="exact")
        select_mock.eq.assert_called_with("user_id", str(sample_user_id))

    @pytest.mark.asyncio
    async def test_list_mocks_with_filters(
        self, mock_service, sample_user_id, sample_mock_data
    ):
        """Test mock listing with filters"""
        pagination = PaginationParams(page=1, limit=10)

        # Mock database response
        mock_result = Mock()
        mock_result.data = [sample_mock_data]
        mock_result.count = 1

        # Setup complex method chain mock
        table_mock = Mock()
        select_mock = Mock()
        eq_mock = Mock()
        eq2_mock = Mock()
        or_mock = Mock()
        contains_mock = Mock()
        order_mock = Mock()
        range_mock = Mock()

        mock_service.client.table.return_value = table_mock
        table_mock.select.return_value = select_mock
        select_mock.eq.return_value = eq_mock
        eq_mock.eq.return_value = eq2_mock
        eq2_mock.or_.return_value = or_mock
        or_mock.contains.return_value = contains_mock
        contains_mock.order.return_value = order_mock
        order_mock.range.return_value = range_mock
        range_mock.execute.return_value = mock_result

        # Execute with filters
        mocks, total = await mock_service.list_mocks(
            sample_user_id,
            pagination,
            status_filter=MockStatus.ACTIVE,
            search="test",
            tags=["api"],
        )

        # Assertions
        assert len(mocks) == 1
        assert total == 1

    @pytest.mark.asyncio
    async def test_list_mocks_database_error(self, mock_service, sample_user_id):
        """Test list mocks with database error"""
        pagination = PaginationParams(page=1, limit=10)

        # Mock database error
        mock_service.client.table.side_effect = Exception("Database error")

        # Execute and assert
        with pytest.raises(HTTPException) as exc_info:
            await mock_service.list_mocks(sample_user_id, pagination)

        assert exc_info.value.status_code == status.HTTP_500_INTERNAL_SERVER_ERROR
        assert "Error listing mocks" in exc_info.value.detail


class TestUpdateMock:
    """Test update_mock method"""

    @pytest.mark.asyncio
    async def test_update_mock_success(
        self, mock_service, sample_mock_id, sample_user_id, sample_mock_data
    ):
        """Test successful mock update"""
        # Mock existing mock
        existing_mock = MockModel(**sample_mock_data)
        mock_service.get_mock = AsyncMock(return_value=existing_mock)

        # Mock update data
        update_data = MockUpdate(name="Updated Mock", status_code=201)

        # Mock database response
        updated_data = sample_mock_data.copy()
        updated_data["name"] = "Updated Mock"
        updated_data["status_code"] = 201

        mock_result = Mock()
        mock_result.data = [updated_data]
        mock_service.client.table.return_value.update.return_value.eq.return_value.execute.return_value = (
            mock_result
        )

        # Execute
        result = await mock_service.update_mock(
            sample_mock_id, sample_user_id, update_data
        )

        # Assertions
        assert isinstance(result, MockModel)
        assert result.name == "Updated Mock"
        assert result.status_code == 201

        # Verify database call
        mock_service.client.table.assert_called_with("mocks")

    @pytest.mark.asyncio
    async def test_update_mock_not_found(
        self, mock_service, sample_mock_id, sample_user_id
    ):
        """Test updating non-existent mock"""
        # Mock no existing mock
        mock_service.get_mock = AsyncMock(return_value=None)

        update_data = MockUpdate(name="Updated Mock")

        # Execute and assert
        with pytest.raises(HTTPException) as exc_info:
            await mock_service.update_mock(sample_mock_id, sample_user_id, update_data)

        assert exc_info.value.status_code == status.HTTP_404_NOT_FOUND
        assert "Mock not found or access denied" in exc_info.value.detail

    @pytest.mark.asyncio
    async def test_update_mock_wrong_user(
        self, mock_service, sample_mock_id, sample_user_id, sample_mock_data
    ):
        """Test updating mock owned by different user"""
        # Mock existing mock with different user_id
        wrong_user_data = sample_mock_data.copy()
        wrong_user_data["user_id"] = str(uuid4())
        existing_mock = MockModel(**wrong_user_data)
        mock_service.get_mock = AsyncMock(return_value=existing_mock)

        update_data = MockUpdate(name="Updated Mock")

        # Execute and assert
        with pytest.raises(HTTPException) as exc_info:
            await mock_service.update_mock(sample_mock_id, sample_user_id, update_data)

        assert exc_info.value.status_code == status.HTTP_404_NOT_FOUND
        assert "Mock not found or access denied" in exc_info.value.detail


class TestDeleteMock:
    """Test delete_mock method"""

    @pytest.mark.asyncio
    async def test_delete_mock_success(
        self, mock_service, sample_mock_id, sample_user_id, sample_mock_data
    ):
        """Test successful mock deletion"""
        # Mock existing mock
        existing_mock = MockModel(**sample_mock_data)
        mock_service.get_mock = AsyncMock(return_value=existing_mock)

        # Mock database responses
        stats_result = Mock()
        stats_result.data = []
        mock_result = Mock()
        mock_result.data = [sample_mock_data]

        mock_service.client.table.return_value.delete.return_value.eq.return_value.execute.side_effect = [
            stats_result,  # First call for stats deletion
            mock_result,  # Second call for mock deletion
        ]

        # Execute
        result = await mock_service.delete_mock(sample_mock_id, sample_user_id)

        # Assertions
        assert result is True

        # Verify database calls (2 delete operations)
        assert mock_service.client.table.call_count == 2

    @pytest.mark.asyncio
    async def test_delete_mock_not_found(
        self, mock_service, sample_mock_id, sample_user_id
    ):
        """Test deleting non-existent mock"""
        # Mock no existing mock
        mock_service.get_mock = AsyncMock(return_value=None)

        # Execute and assert
        with pytest.raises(HTTPException) as exc_info:
            await mock_service.delete_mock(sample_mock_id, sample_user_id)

        assert exc_info.value.status_code == status.HTTP_404_NOT_FOUND
        assert "Mock not found or access denied" in exc_info.value.detail


class TestSimulateMock:
    """Test simulate_mock method"""

    @pytest.mark.asyncio
    async def test_simulate_mock_success(
        self, mock_service, sample_mock_id, sample_mock_data
    ):
        """Test successful mock simulation"""
        # Mock existing active mock
        existing_mock = MockModel(**sample_mock_data)
        mock_service.get_mock = AsyncMock(return_value=existing_mock)
        mock_service._log_mock_access = AsyncMock()

        request_data = {"ip": "127.0.0.1", "user_agent": "test"}

        # Execute
        with patch("time.time", return_value=1000.0):
            result = await mock_service.simulate_mock(sample_mock_id, request_data)

        # Assertions
        assert result["mock_id"] == sample_mock_id
        assert result["response_data"] == {"message": "test"}
        assert result["status_code"] == 200
        assert result["simulated_delay_ms"] == 100

        # Verify access logging
        mock_service._log_mock_access.assert_called_once()

    @pytest.mark.asyncio
    async def test_simulate_mock_not_found(self, mock_service, sample_mock_id):
        """Test simulating non-existent mock"""
        # Mock no existing mock
        mock_service.get_mock = AsyncMock(return_value=None)

        request_data = {"ip": "127.0.0.1"}

        # Execute and assert
        with pytest.raises(HTTPException) as exc_info:
            await mock_service.simulate_mock(sample_mock_id, request_data)

        assert exc_info.value.status_code == status.HTTP_404_NOT_FOUND
        assert "Mock not found or not accessible" in exc_info.value.detail

    @pytest.mark.asyncio
    async def test_simulate_mock_inactive(
        self, mock_service, sample_mock_id, sample_mock_data
    ):
        """Test simulating inactive mock"""
        # Mock inactive mock
        inactive_data = sample_mock_data.copy()
        inactive_data["status"] = MockStatus.INACTIVE.value
        existing_mock = MockModel(**inactive_data)
        mock_service.get_mock = AsyncMock(return_value=existing_mock)

        request_data = {"ip": "127.0.0.1"}

        # Execute and assert
        with pytest.raises(HTTPException) as exc_info:
            await mock_service.simulate_mock(sample_mock_id, request_data)

        assert exc_info.value.status_code == status.HTTP_503_SERVICE_UNAVAILABLE
        assert "Mock is not active" in exc_info.value.detail

    @pytest.mark.asyncio
    async def test_simulate_mock_with_delay(
        self, mock_service, sample_mock_id, sample_mock_data
    ):
        """Test simulating mock with delay"""
        # Mock existing mock with delay
        existing_mock = MockModel(**sample_mock_data)
        mock_service.get_mock = AsyncMock(return_value=existing_mock)
        mock_service._log_mock_access = AsyncMock()

        request_data = {"ip": "127.0.0.1"}

        # Execute with mocked asyncio.sleep
        with patch("app.services.mock_service.asyncio.sleep") as mock_sleep:
            with patch("time.time", return_value=1000.0):
                result = await mock_service.simulate_mock(sample_mock_id, request_data)

        # Verify delay was applied
        mock_sleep.assert_called_once_with(0.1)  # 100ms converted to seconds
        assert result["simulated_delay_ms"] == 100


class TestGetMockByEndpoint:
    """Test get_mock_by_endpoint method"""

    @pytest.mark.asyncio
    async def test_get_mock_by_endpoint_success(self, mock_service, sample_mock_data):
        """Test getting mock by endpoint successfully"""
        # Mock database response
        mock_result = Mock()
        mock_result.data = [sample_mock_data]

        # Setup method chain mock
        table_mock = Mock()
        select_mock = Mock()
        eq1_mock = Mock()
        eq2_mock = Mock()
        eq3_mock = Mock()
        eq4_mock = Mock()

        mock_service.client.table.return_value = table_mock
        table_mock.select.return_value = select_mock
        select_mock.eq.return_value = eq1_mock
        eq1_mock.eq.return_value = eq2_mock
        eq2_mock.eq.return_value = eq3_mock
        eq3_mock.eq.return_value = eq4_mock
        eq4_mock.execute.return_value = mock_result

        # Execute
        result = await mock_service.get_mock_by_endpoint("/api/test", HTTPMethod.GET)

        # Assertions
        assert isinstance(result, MockModel)
        assert result.endpoint == "/api/test"
        assert result.method == HTTPMethod.GET

    @pytest.mark.asyncio
    async def test_get_mock_by_endpoint_not_found(self, mock_service):
        """Test getting mock by endpoint when not found"""
        # Mock database response with no data
        mock_result = Mock()
        mock_result.data = []

        # Setup method chain mock
        table_mock = Mock()
        select_mock = Mock()
        eq1_mock = Mock()
        eq2_mock = Mock()
        eq3_mock = Mock()
        eq4_mock = Mock()

        mock_service.client.table.return_value = table_mock
        table_mock.select.return_value = select_mock
        select_mock.eq.return_value = eq1_mock
        eq1_mock.eq.return_value = eq2_mock
        eq2_mock.eq.return_value = eq3_mock
        eq3_mock.eq.return_value = eq4_mock
        eq4_mock.execute.return_value = mock_result

        # Execute
        result = await mock_service.get_mock_by_endpoint(
            "/api/nonexistent", HTTPMethod.GET
        )

        # Assertions
        assert result is None


class TestPrivateMethods:
    """Test private helper methods"""

    @pytest.mark.asyncio
    async def test_get_mock_by_endpoint_private(
        self, mock_service, sample_user_id, sample_mock_data
    ):
        """Test private _get_mock_by_endpoint method"""
        # Mock database response
        mock_result = Mock()
        mock_result.data = [sample_mock_data]

        # Setup method chain mock
        table_mock = Mock()
        select_mock = Mock()
        eq1_mock = Mock()
        eq2_mock = Mock()
        eq3_mock = Mock()

        mock_service.client.table.return_value = table_mock
        table_mock.select.return_value = select_mock
        select_mock.eq.return_value = eq1_mock
        eq1_mock.eq.return_value = eq2_mock
        eq2_mock.eq.return_value = eq3_mock
        eq3_mock.execute.return_value = mock_result

        # Execute
        result = await mock_service._get_mock_by_endpoint(
            sample_user_id, "/api/test", HTTPMethod.GET
        )

        # Assertions
        assert isinstance(result, MockModel)

    @pytest.mark.asyncio
    async def test_create_mock_stats(
        self, mock_service, sample_mock_id, sample_user_id
    ):
        """Test _create_mock_stats method"""
        # Mock database response
        mock_result = Mock()
        mock_result.data = [{"id": "stats_id"}]
        mock_service.client.table.return_value.insert.return_value.execute.return_value = (
            mock_result
        )

        # Execute (should not raise exception)
        await mock_service._create_mock_stats(sample_mock_id, sample_user_id)

        # Verify database call
        mock_service.client.table.assert_called_with("mock_stats")

    @pytest.mark.asyncio
    async def test_create_mock_stats_exception(
        self, mock_service, sample_mock_id, sample_user_id
    ):
        """Test _create_mock_stats method with exception"""
        # Mock database error
        mock_service.client.table.return_value.insert.side_effect = Exception(
            "Database error"
        )

        # Execute (should not raise exception, just pass)
        await mock_service._create_mock_stats(sample_mock_id, sample_user_id)

    @pytest.mark.asyncio
    async def test_log_mock_access(self, mock_service, sample_mock_id, sample_user_id):
        """Test _log_mock_access method"""
        # Mock database response
        mock_result = Mock()
        mock_result.data = [{"access_count": 1}]
        mock_service.client.table.return_value.update.return_value.eq.return_value.execute.return_value = (
            mock_result
        )

        request_data = {"ip": "127.0.0.1", "user_agent": "test"}

        # Execute (should not raise exception)
        await mock_service._log_mock_access(
            sample_mock_id, sample_user_id, request_data, 100.0, 200
        )

        # Verify database call
        mock_service.client.table.assert_called_with("mocks")


class TestListPublicMocks:
    """Test list_public_mocks method"""

    @pytest.mark.asyncio
    async def test_list_public_mocks_success(self, mock_service, sample_mock_data):
        """Test listing public mocks successfully"""
        pagination = PaginationParams(page=1, limit=10)

        # Mock database response
        mock_result = Mock()
        mock_result.data = [sample_mock_data]
        mock_result.count = 1

        # Setup method chain mock
        table_mock = Mock()
        select_mock = Mock()
        eq1_mock = Mock()
        eq2_mock = Mock()
        order_mock = Mock()
        range_mock = Mock()

        mock_service.client.table.return_value = table_mock
        table_mock.select.return_value = select_mock
        select_mock.eq.return_value = eq1_mock
        eq1_mock.eq.return_value = eq2_mock
        eq2_mock.order.return_value = order_mock
        order_mock.range.return_value = range_mock
        range_mock.execute.return_value = mock_result

        # Execute
        mocks, total = await mock_service.list_public_mocks(pagination)

        # Assertions
        assert len(mocks) == 1
        assert isinstance(mocks[0], MockModel)
        assert total == 1

        # Verify database calls
        mock_service.client.table.assert_called_with("mocks")
        table_mock.select.assert_called_with("*", count="exact")

    @pytest.mark.asyncio
    async def test_list_public_mocks_with_search(self, mock_service, sample_mock_data):
        """Test listing public mocks with search"""
        pagination = PaginationParams(page=1, limit=10)

        # Mock database response
        mock_result = Mock()
        mock_result.data = [sample_mock_data]
        mock_result.count = 1

        # Setup method chain mock
        table_mock = Mock()
        select_mock = Mock()
        eq1_mock = Mock()
        eq2_mock = Mock()
        or_mock = Mock()
        order_mock = Mock()
        range_mock = Mock()

        mock_service.client.table.return_value = table_mock
        table_mock.select.return_value = select_mock
        select_mock.eq.return_value = eq1_mock
        eq1_mock.eq.return_value = eq2_mock
        eq2_mock.or_.return_value = or_mock
        or_mock.order.return_value = order_mock
        order_mock.range.return_value = range_mock
        range_mock.execute.return_value = mock_result

        # Execute
        mocks, total = await mock_service.list_public_mocks(pagination, search="test")

        # Assertions
        assert len(mocks) == 1
        assert total == 1

    @pytest.mark.asyncio
    async def test_list_public_mocks_database_error(self, mock_service):
        """Test list public mocks with database error"""
        pagination = PaginationParams(page=1, limit=10)

        # Mock database error
        mock_service.client.table.side_effect = Exception("Database error")

        # Execute and assert
        with pytest.raises(HTTPException) as exc_info:
            await mock_service.list_public_mocks(pagination)

        assert exc_info.value.status_code == status.HTTP_500_INTERNAL_SERVER_ERROR
        assert "Error listing public mocks" in exc_info.value.detail
