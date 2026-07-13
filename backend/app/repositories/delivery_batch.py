from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy.orm import selectinload
from app.models.delivery_batch import DeliveryBatch, DeliveryBatchStatus
from app.models.order import Order
from app.repositories.base import BaseRepository

class DeliveryBatchRepository(BaseRepository[DeliveryBatch]):
    def __init__(self, session: AsyncSession):
        super().__init__(DeliveryBatch, session)

    async def get_batch_details(self, batch_id: int) -> DeliveryBatch | None:
        query = select(DeliveryBatch).where(DeliveryBatch.id == batch_id).options(
            selectinload(DeliveryBatch.orders).selectinload(Order.items)
        )
        result = await self.session.execute(query)
        return result.scalars().first()

    async def list_active_batches(self) -> list[DeliveryBatch]:
        query = select(DeliveryBatch).where(
            DeliveryBatch.status.in_([DeliveryBatchStatus.PENDING, DeliveryBatchStatus.ASSIGNED, DeliveryBatchStatus.DELIVERING])
        ).options(selectinload(DeliveryBatch.orders).selectinload(Order.items)).order_by(DeliveryBatch.created_at.desc())
        result = await self.session.execute(query)
        return list(result.scalars().all())

    async def list_by_driver(self, driver_id: int) -> list[DeliveryBatch]:
        query = select(DeliveryBatch).where(DeliveryBatch.driver_id == driver_id).options(
            selectinload(DeliveryBatch.orders).selectinload(Order.items)
        ).order_by(DeliveryBatch.created_at.desc())
        result = await self.session.execute(query)
        return list(result.scalars().all())
