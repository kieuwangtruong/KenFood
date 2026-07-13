from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy import and_
from app.models.wallet import Wallet, Transaction, TransactionType, TransactionStatus
from app.repositories.base import BaseRepository

class WalletRepository(BaseRepository[Wallet]):
    def __init__(self, session: AsyncSession):
        super().__init__(Wallet, session)

    async def get_by_user_id(self, user_id: int) -> Wallet | None:
        query = select(Wallet).where(Wallet.user_id == user_id)
        result = await self.session.execute(query)
        return result.scalars().first()

    async def get_by_user_id_for_update(self, user_id: int) -> Wallet | None:
        # Crucial for concurrency safety: row-level lock
        query = select(Wallet).where(Wallet.user_id == user_id).with_for_update()
        result = await self.session.execute(query)
        return result.scalars().first()

    async def get_transaction(self, reference_id: str, type: TransactionType, status: TransactionStatus) -> Transaction | None:
        query = select(Transaction).where(
            and_(
                Transaction.reference_id == reference_id,
                Transaction.type == type,
                Transaction.status == status
            )
        )
        result = await self.session.execute(query)
        return result.scalars().first()

    async def list_transactions(self, wallet_id: int) -> list[Transaction]:
        query = select(Transaction).where(Transaction.wallet_id == wallet_id).order_by(Transaction.created_at.desc())
        result = await self.session.execute(query)
        return list(result.scalars().all())
