from sqlalchemy.ext.asyncio import AsyncSession
from fastapi import HTTPException, status
from app.models.wallet import Wallet, Transaction, TransactionType, TransactionStatus
from app.repositories.wallet import WalletRepository
import logging

logger = logging.getLogger(__name__)

class WalletService:
    def __init__(self, session: AsyncSession):
        self.session = session
        self.wallet_repo = WalletRepository(session)

    async def get_wallet(self, user_id: int) -> Wallet:
        wallet = await self.wallet_repo.get_by_user_id(user_id)
        if not wallet:
            # Lazy initialize wallet if not exists
            wallet = Wallet(user_id=user_id, balance=0, deposit_amount=0, blocked_balance=0)
            await self.wallet_repo.create(wallet)
            await self.session.flush()
        return wallet

    async def get_wallet_for_update(self, user_id: int) -> Wallet:
        wallet = await self.wallet_repo.get_by_user_id_for_update(user_id)
        if not wallet:
            # Lazy initialize with row-lock
            wallet = Wallet(user_id=user_id, balance=0, deposit_amount=0, blocked_balance=0)
            await self.wallet_repo.create(wallet)
            await self.session.flush()
            # Re-fetch with lock
            wallet = await self.wallet_repo.get_by_user_id_for_update(user_id)
        return wallet

    async def deposit(self, user_id: int, amount: int, reference_id: str, description: str = "Deposit via PayOS") -> Transaction:
        """
        Idempotent deposit handler.
        Locks the wallet row, checks if a successful/failed transaction already exists.
        If pending/new, updates balance and records transaction.
        """
        if amount <= 0:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Deposit amount must be positive")

        # Row-level lock on the wallet
        wallet = await self.get_wallet_for_update(user_id)

        # Idempotency check: look for existing SUCCESS transaction with same reference
        existing_tx = await self.wallet_repo.get_transaction(reference_id, TransactionType.DEPOSIT, TransactionStatus.SUCCESS)
        if existing_tx:
            logger.info(f"Duplicate deposit webhook received for reference {reference_id}. Already processed.")
            return existing_tx

        # Look for FAILED transaction, if webhook status changes? But deposit webhook is success only.
        # Create transaction ledger
        tx = Transaction(
            wallet_id=wallet.id,
            amount=amount,
            type=TransactionType.DEPOSIT,
            status=TransactionStatus.SUCCESS,
            reference_id=reference_id,
            description=description
        )
        wallet.balance += amount
        self.session.add(tx)
        await self.session.flush()
        return tx

    async def block_funds(self, driver_id: int, amount: int, reference_id: str, description: str) -> Transaction:
        """
        Tín Quỹ Rule: Blocks funds from a driver's wallet for a CASH order/batch.
        Allows available balance to go negative only if abs(new_available) <= deposit_amount.
        Formula: available_balance = balance - blocked_balance.
        We check: (balance - (blocked_balance + amount)) >= -deposit_amount
        """
        if amount < 0:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Block amount must be positive")

        wallet = await self.get_wallet_for_update(driver_id)
        
        # Check if already blocked (idempotency)
        existing_block = await self.wallet_repo.get_transaction(reference_id, TransactionType.BLOCK, TransactionStatus.SUCCESS)
        if existing_block:
            return existing_block

        new_blocked = wallet.blocked_balance + amount
        available = wallet.balance - new_blocked

        # Enforce Tín Quỹ rule
        if available < -wallet.deposit_amount:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=(
                    f"Transaction rejected due to Tín Quỹ credit limit. "
                    f"Required: {amount} VND. Available credit: {wallet.balance - wallet.blocked_balance + wallet.deposit_amount} VND. "
                    f"Please deposit more funds to your wallet."
                )
            )

        wallet.blocked_balance = new_blocked
        tx = Transaction(
            wallet_id=wallet.id,
            amount=amount,
            type=TransactionType.BLOCK,
            status=TransactionStatus.SUCCESS,
            reference_id=reference_id,
            description=description
        )
        self.session.add(tx)
        await self.session.flush()
        return tx

    async def release_blocked_funds(self, driver_id: int, amount: int, reference_id: str, description: str) -> Transaction:
        """
        Unlocks blocked balance without affecting main balance (e.g. driver drops batch or batch cancelled).
        """
        wallet = await self.get_wallet_for_update(driver_id)

        # Check if already released
        existing_release = await self.wallet_repo.get_transaction(reference_id, TransactionType.RELEASE, TransactionStatus.SUCCESS)
        if existing_release:
            return existing_release

        wallet.blocked_balance = max(0, wallet.blocked_balance - amount)
        tx = Transaction(
            wallet_id=wallet.id,
            amount=amount,
            type=TransactionType.RELEASE,
            status=TransactionStatus.SUCCESS,
            reference_id=reference_id,
            description=description
        )
        self.session.add(tx)
        await self.session.flush()
        return tx

    async def deduct_cash_order(self, driver_id: int, amount: int, reference_id: str, description: str) -> Transaction:
        """
        Finalizes CASH deduction upon order completion.
        Deducts amount from both balance and blocked_balance.
        """
        wallet = await self.get_wallet_for_update(driver_id)

        existing_deduct = await self.wallet_repo.get_transaction(reference_id, TransactionType.DEDUCT, TransactionStatus.SUCCESS)
        if existing_deduct:
            return existing_deduct

        wallet.blocked_balance = max(0, wallet.blocked_balance - amount)
        wallet.balance -= amount

        tx = Transaction(
            wallet_id=wallet.id,
            amount=-amount,  # negative amount represents debit
            type=TransactionType.DEDUCT,
            status=TransactionStatus.SUCCESS,
            reference_id=reference_id,
            description=description
        )
        self.session.add(tx)
        await self.session.flush()
        return tx

    async def payout(self, user_id: int, amount: int, reference_id: str, description: str) -> Transaction:
        """
        Credits payout amount (either Driver delivery payout or Merchant food payout).
        """
        wallet = await self.get_wallet_for_update(user_id)

        existing_payout = await self.wallet_repo.get_transaction(reference_id, TransactionType.PAYOUT, TransactionStatus.SUCCESS)
        if existing_payout:
            return existing_payout

        wallet.balance += amount
        tx = Transaction(
            wallet_id=wallet.id,
            amount=amount,
            type=TransactionType.PAYOUT,
            status=TransactionStatus.SUCCESS,
            reference_id=reference_id,
            description=description
        )
        self.session.add(tx)
        await self.session.flush()
        return tx
