import pytest
from typing import AsyncGenerator
from unittest.mock import patch
from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker, AsyncSession
from app.models.base import Base
from app.database import get_db
from app.main import app
from httpx import AsyncClient, ASGITransport

# Use shared cache in-memory SQLite for data sharing across isolated connection transactions
DATABASE_URL = "sqlite+aiosqlite:///file:test_db?mode=memory&cache=shared"
engine = create_async_engine(DATABASE_URL, connect_args={"uri": True}, echo=False)

TestingSessionLocal = async_sessionmaker(
    bind=engine, 
    class_=AsyncSession, 
    expire_on_commit=False,
    autocommit=False,
    autoflush=False
)

# Mock PayOS payment link creation globally during tests
class MockPayOSResponse:
    checkoutUrl = "http://mock-checkout-url.com"

async def mock_create_payment_link(order_code: int, amount: int, description: str):
    return MockPayOSResponse()

@pytest.fixture(autouse=True)
def mock_payos_service():
    with patch("app.services.payos_service.PayOSService.create_payment_link", side_effect=mock_create_payment_link):
        yield

@pytest.fixture(scope="function", autouse=True)
async def keep_db_alive():
    """
    Keeps one connection open for the lifetime of each test.
    This holds the shared memory SQLite instance active during test request cycles.
    """
    async with engine.connect() as conn:
        # Construct schemas
        async with conn.begin():
            await conn.run_sync(Base.metadata.create_all)
        yield conn
        # Tear down schemas
        async with conn.begin():
            await conn.run_sync(Base.metadata.drop_all)

@pytest.fixture(scope="function")
async def db_session() -> AsyncGenerator[AsyncSession, None]:
    async with TestingSessionLocal() as session:
        yield session

@pytest.fixture(scope="function")
async def client() -> AsyncGenerator[AsyncClient, None]:
    async def override_get_db():
        async with TestingSessionLocal() as session:
            yield session
            
    app.dependency_overrides[get_db] = override_get_db
    
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        yield ac
        
    app.dependency_overrides.clear()
