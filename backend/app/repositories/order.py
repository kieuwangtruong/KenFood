from datetime import datetime
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy import and_, func
from sqlalchemy.orm import selectinload
from app.models.order import Order, OrderItem, OrderStatus
from app.models.product import Product
from app.repositories.base import BaseRepository

class OrderRepository(BaseRepository[Order]):
    def __init__(self, session: AsyncSession):
        super().__init__(Order, session)

    def _order_options(self):
        from app.models.delivery_batch import DeliveryBatch
        return [
            selectinload(Order.merchant),
            selectinload(Order.building),
            selectinload(Order.items).selectinload(OrderItem.product),
            selectinload(Order.batch).selectinload(DeliveryBatch.driver)
        ]

    async def get_by_payos_order_code(self, payos_order_code: str) -> Order | None:
        query = select(Order).where(Order.payos_order_code == payos_order_code).options(*self._order_options())
        result = await self.session.execute(query)
        return result.scalars().first()

    async def get_by_payos_order_code_for_update(self, payos_order_code: str) -> Order | None:
        query = select(Order).where(Order.payos_order_code == payos_order_code).options(*self._order_options()).with_for_update()
        result = await self.session.execute(query)
        return result.scalars().first()

    async def get_order_details(self, order_id: int) -> Order | None:
        query = select(Order).where(Order.id == order_id).options(*self._order_options())
        result = await self.session.execute(query)
        return result.scalars().first()

    async def list_by_customer(self, customer_id: int) -> list[Order]:
        query = select(Order).where(Order.customer_id == customer_id).options(*self._order_options()).order_by(Order.created_at.desc())
        result = await self.session.execute(query)
        return list(result.scalars().all())

    async def list_by_merchant(self, merchant_id: int) -> list[Order]:
        query = select(Order).where(Order.merchant_id == merchant_id).options(*self._order_options()).order_by(Order.created_at.desc())
        result = await self.session.execute(query)
        return list(result.scalars().all())

    async def get_unbatched_orders_before_cutoff(self, cutoff_time: datetime) -> list[Order]:
        # Orders must be PAID or CONFIRMED (for Cash), not yet batched, and created before 10:00:00 local time
        query = select(Order).where(
            and_(
                Order.batch_id.is_(None),
                Order.status.in_([OrderStatus.PAID, OrderStatus.CONFIRMED]),
                Order.created_at < cutoff_time
            )
        ).options(*self._order_options())
        result = await self.session.execute(query)
        return list(result.scalars().all())

    async def get_merchant_aggregated_products(self, merchant_id: int, start_time: datetime, end_time: datetime) -> list[tuple]:
        # GROUP BY product_id query to compile the kitchen order list for partner prep
        query = (
            select(
                Product.id.label("product_id"),
                Product.name.label("product_name"),
                Product.price.label("price"),
                func.sum(OrderItem.quantity).label("total_quantity"),
                func.sum(OrderItem.quantity * OrderItem.price).label("total_revenue")
            )
            .join(OrderItem, OrderItem.product_id == Product.id)
            .join(Order, Order.id == OrderItem.order_id)
            .where(
                and_(
                    Product.merchant_id == merchant_id,
                    # Compiled orders must be PAID or CONFIRMED, or BATCHED, or DELIVERING, or COMPLETED
                    Order.status.in_([OrderStatus.PAID, OrderStatus.CONFIRMED, OrderStatus.BATCHED, OrderStatus.DELIVERING, OrderStatus.COMPLETED]),
                    Order.created_at >= start_time,
                    Order.created_at < end_time
                )
            )
            .group_by(Product.id, Product.name, Product.price)
        )
        result = await self.session.execute(query)
        return list(result.all())
