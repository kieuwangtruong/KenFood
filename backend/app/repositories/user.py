from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy.orm import selectinload
from app.models.user import User
from app.models.merchant import Merchant
from app.repositories.base import BaseRepository

class UserRepository(BaseRepository[User]):
    def __init__(self, session: AsyncSession):
        super().__init__(User, session)

    async def get_by_email(self, email: str) -> User | None:
        query = select(User).where(User.email == email).options(selectinload(User.wallet))
        result = await self.session.execute(query)
        return result.scalars().first()

    async def get_merchant_by_user_id(self, user_id: int) -> Merchant | None:
        query = select(Merchant).where(Merchant.user_id == user_id)
        result = await self.session.execute(query)
        return result.scalars().first()
