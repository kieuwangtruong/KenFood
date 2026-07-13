import random
from datetime import datetime
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from fastapi import HTTPException, status
from app.models.order import Order, OrderItem, OrderStatus, PaymentMethod
from app.models.product import Product
from app.models.user import User, UserRole
from app.models.merchant import Merchant
from app.models.delivery_batch import DeliveryBatch, DeliveryBatchStatus
from app.repositories.order import OrderRepository
from app.repositories.delivery_batch import DeliveryBatchRepository
from app.repositories.user import UserRepository
from app.schemas.order import OrderCreate
from app.services.wallet_service import WalletService
from app.services.payos_service import PayOSService
import logging

logger = logging.getLogger(__name__)

class OrderService:
    def __init__(self, session: AsyncSession):
        self.session = session
        self.order_repo = OrderRepository(session)
        self.batch_repo = DeliveryBatchRepository(session)
        self.user_repo = UserRepository(session)
        self.wallet_service = WalletService(session)

    async def create_order(self, customer_id: int, dto: OrderCreate) -> tuple[Order, str | None]:
        """
        Calculates food totals, attaches fixed 15,000 VND delivery fee,
        and deducts wallet or generates PayOS deposit links accordingly.
        """
        # Validate customer
        customer = await self.user_repo.get(customer_id)
        if not customer or customer.role != UserRole.CUSTOMER:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Only customers can place orders")

        # Validate merchant
        merchant = await self.session.get(Merchant, dto.merchant_id)
        if not merchant:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Merchant not found")

        # Fetch and snapshot product prices
        food_amount = 0
        order_items = []
        for item in dto.items:
            product = await self.session.get(Product, item.product_id)
            if not product or product.merchant_id != dto.merchant_id or not product.is_available:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=f"Product {item.product_id} is unavailable or does not belong to this merchant"
                )
            
            item_total = product.price * item.quantity
            food_amount += item_total
            
            order_items.append(
                OrderItem(
                    product_id=product.id,
                    quantity=item.quantity,
                    price=product.price
                )
            )

        # Fixed Kén Startup delivery fee
        delivery_fee = 15000
        total_amount = food_amount + delivery_fee

        # Instantiate Order
        order = Order(
            customer_id=customer_id,
            merchant_id=dto.merchant_id,
            building_id=dto.building_id,
            payment_method=dto.payment_method,
            food_amount=food_amount,
            delivery_fee=delivery_fee,
            total_amount=total_amount,
            status=OrderStatus.PENDING_PAYMENT,
            items=order_items
        )

        payos_url = None

        if dto.payment_method == PaymentMethod.WALLET:
            # Internal Wallet pre-deduction flow
            wallet = await self.wallet_service.get_wallet_for_update(customer_id)
            if wallet.available_balance < total_amount:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Insufficient wallet balance. Please top up."
                )
            
            # Deduct wallet immediately
            wallet.balance -= total_amount
            await self.session.flush()

            # Record DEDUCT transaction
            from app.models.wallet import Transaction, TransactionType, TransactionStatus
            tx = Transaction(
                wallet_id=wallet.id,
                amount=-total_amount,
                type=TransactionType.DEDUCT,
                status=TransactionStatus.SUCCESS,
                description=f"Payment for Order #{order.id}"
            )
            self.session.add(tx)
            
            order.status = OrderStatus.CONFIRMED  # Confirmed and ready for batch grouping
            await self.order_repo.create(order)
            await self.session.flush()
            tx.reference_id = str(order.id)

        elif dto.payment_method == PaymentMethod.PAYOS:
            # PayOS external deposit link flow
            order_code = random.randint(100000, 999999999)
            order.payos_order_code = str(order_code)
            order.status = OrderStatus.PENDING_PAYMENT
            
            await self.order_repo.create(order)
            await self.session.flush()

            # Create PayOS payment link
            try:
                payos_response = await PayOSService.create_payment_link(
                    order_code=order_code,
                    amount=total_amount,
                    description=f"KenPay Order {order.id}"
                )
                payos_url = payos_response.checkoutUrl
            except Exception as e:
                logger.error(f"PayOS link creation failed: {e}")
                raise HTTPException(
                    status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                    detail="Could not generate external payment link. Try again."
                )

        elif dto.payment_method == PaymentMethod.CASH:
            # Cash on delivery order is confirmed immediately for batching
            order.status = OrderStatus.CONFIRMED
            await self.order_repo.create(order)
            await self.session.flush()

        return order, payos_url

    async def accept_batch(self, batch_id: int, driver_id: int) -> DeliveryBatch:
        """
        Accept Batch delivery job.
        Implements block-fund safety checks for all CASH orders in the batch.
        """
        # Validate Driver
        driver = await self.user_repo.get(driver_id)
        if not driver or driver.role != UserRole.DRIVER:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Only drivers can accept batches")

        batch = await self.batch_repo.get_batch_details(batch_id)
        if not batch:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Delivery batch not found")
        if batch.status != DeliveryBatchStatus.PENDING:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Batch is already accepted or completed")

        # Update batch driver and status
        batch.driver_id = driver_id
        batch.status = DeliveryBatchStatus.ASSIGNED

        # Block driver wallet funds for CASH orders in batch
        for order in batch.orders:
            if order.payment_method == PaymentMethod.CASH:
                # Block order total from driver available balance
                await self.wallet_service.block_funds(
                    driver_id=driver_id,
                    amount=order.total_amount,
                    reference_id=f"batch_{batch.id}_order_{order.id}_block",
                    description=f"Block fund for CASH delivery of Order #{order.id}"
                )
            
            order.status = OrderStatus.DELIVERING

        await self.session.flush()
        return batch

    async def drop_batch(self, batch_id: int, driver_id: int) -> DeliveryBatch:
        """
        Driver drops batch. Releases any blocked cash funds.
        """
        batch = await self.batch_repo.get_batch_details(batch_id)
        if not batch:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Delivery batch not found")
        if batch.driver_id != driver_id:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="You do not own this batch")
        if batch.status not in [DeliveryBatchStatus.ASSIGNED, DeliveryBatchStatus.DELIVERING]:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Cannot drop batch in current status")

        # Release blocked cash funds
        for order in batch.orders:
            if order.payment_method == PaymentMethod.CASH:
                await self.wallet_service.release_blocked_funds(
                    driver_id=driver_id,
                    amount=order.total_amount,
                    reference_id=f"batch_{batch.id}_order_{order.id}_block",
                    description=f"Release blocked fund from dropped Batch #{batch.id}"
                )
            order.status = OrderStatus.BATCHED  # Send order back to batched state

        batch.driver_id = None
        batch.status = DeliveryBatchStatus.PENDING
        await self.session.flush()
        return batch

    async def complete_batch(self, batch_id: int, driver_id: int) -> DeliveryBatch:
        """
        Driver completes all deliveries in the batch.
        Runs order completion finances on each.
        """
        batch = await self.batch_repo.get_batch_details(batch_id)
        if not batch:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Delivery batch not found")
        if batch.driver_id != driver_id:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="You do not own this batch")
        if batch.status != DeliveryBatchStatus.ASSIGNED and batch.status != DeliveryBatchStatus.DELIVERING:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Batch is not in a deliverable state")

        # Complete each order inside this batch
        for order in batch.orders:
            await self.complete_order_internal(order, driver_id)

        batch.status = DeliveryBatchStatus.COMPLETED
        await self.session.flush()
        return batch

    async def complete_order_internal(self, order: Order, driver_id: int):
        """
        Helper that completes an individual order and runs payouts.
        Ensures 85% goes back to Partner, driver gets 30,000 flat, and CASH COD deductions apply.
        """
        if order.status == OrderStatus.COMPLETED:
            return

        order.status = OrderStatus.COMPLETED

        # 1. Partner Food Payout (85% back to merchant, 15% system fee)
        merchant = await self.session.get(Merchant, order.merchant_id)
        merchant_payout = int(order.food_amount * (1.0 - merchant.commission_rate))
        await self.wallet_service.payout(
            user_id=merchant.user_id,
            amount=merchant_payout,
            reference_id=f"order_{order.id}_merchant_payout",
            description=f"85% Food Revenue payout for Order #{order.id}"
        )

        # 2. Driver Flat Payout (30,000 VND)
        await self.wallet_service.payout(
            user_id=driver_id,
            amount=30000,
            reference_id=f"order_{order.id}_driver_payout",
            description=f"Fixed delivery payout for Order #{order.id}"
        )

        # 3. COD CASH Deduction from Driver
        if order.payment_method == PaymentMethod.CASH:
            # Release and permanently deduct cash gathered by driver
            await self.wallet_service.deduct_cash_order(
                driver_id=driver_id,
                amount=order.total_amount,
                reference_id=f"batch_{order.batch_id}_order_{order.id}_block",
                description=f"Cash COD deduction for completed Order #{order.id}"
            )
