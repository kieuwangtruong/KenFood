from datetime import datetime, time, date
from sqlalchemy.ext.asyncio import AsyncSession
from app.models.delivery_batch import DeliveryBatch, DeliveryBatchStatus
from app.models.order import OrderStatus
from app.repositories.order import OrderRepository
from app.repositories.delivery_batch import DeliveryBatchRepository
from app.schemas.delivery_batch import MerchantProductAggregation, MerchantAggregationResponse
import logging

logger = logging.getLogger(__name__)

class BatchService:
    def __init__(self, session: AsyncSession):
        self.session = session
        self.order_repo = OrderRepository(session)
        self.batch_repo = DeliveryBatchRepository(session)

    async def get_merchant_aggregation(self, merchant_id: int, target_date: date) -> MerchantAggregationResponse:
        """
        Gathers list of products to prepare for a specific merchant on a target day.
        Groups by product_id and returns totals.
        """
        start_time = datetime.combine(target_date, time.min)
        end_time = datetime.combine(target_date, time.max)
        
        aggregated_rows = await self.order_repo.get_merchant_aggregated_products(merchant_id, start_time, end_time)
        
        items = []
        for row in aggregated_rows:
            items.append(
                MerchantProductAggregation(
                    product_id=row.product_id,
                    product_name=row.product_name,
                    price=row.price,
                    total_quantity=row.total_quantity,
                    total_revenue=row.total_revenue
                )
            )
            
        return MerchantAggregationResponse(
            merchant_id=merchant_id,
            date=target_date.isoformat(),
            aggregated_items=items
        )

    async def compile_batches(self, cutoff_time: datetime = None) -> list[DeliveryBatch]:
        """
        Triggered at 10:01 AM.
        Collects all orders placed BEFORE 10:00 AM today which are in PAID or CONFIRMED state.
        Groups them by building_id and creates DeliveryBatch entities.
        """
        if cutoff_time is None:
            # Default to today at 10:00:00 AM
            cutoff_time = datetime.now().replace(hour=10, minute=0, second=0, microsecond=0)
            
        logger.info(f"Compiling batch delivery jobs with cutoff: {cutoff_time}")

        # Fetch orders meeting criteria
        orders = await self.order_repo.get_unbatched_orders_before_cutoff(cutoff_time)
        if not orders:
            logger.info("No orders found eligible for batch compiling.")
            return []

        # Group orders by building_id
        building_groups: dict[int, list] = {}
        for order in orders:
            building_groups.setdefault(order.building_id, []).append(order)

        created_batches = []

        # Process each destination building
        for building_id, group_orders in building_groups.items():
            # Create the delivery batch job
            batch = DeliveryBatch(
                building_id=building_id,
                status=DeliveryBatchStatus.PENDING
            )
            await self.batch_repo.create(batch)
            await self.session.flush()  # populate batch.id
            
            # Associate orders with batch
            for order in group_orders:
                order.batch_id = batch.id
                order.status = OrderStatus.BATCHED
            
            created_batches.append(batch)
            logger.info(f"Created batch {batch.id} for building {building_id} with {len(group_orders)} orders.")

        await self.session.flush()
        return created_batches
