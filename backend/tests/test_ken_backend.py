import pytest
import hmac
import hashlib
from datetime import datetime
from httpx import AsyncClient
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, update
from app.config import settings
from app.models.user import User, UserRole
from app.models.wallet import Wallet, Transaction, TransactionStatus, TransactionType
from app.models.merchant import Merchant
from app.models.building import Building
from app.models.product import Product
from app.models.order import Order, OrderStatus, PaymentMethod
from app.models.delivery_batch import DeliveryBatch, DeliveryBatchStatus

# Helper function to create mock PayOS webhook signature
def make_payos_webhook_payload(order_code: int, amount: int, success: bool = True):
    data = {
        "orderCode": order_code,
        "amount": amount,
        "description": "Test topup",
        "currency": "VND",
        "paymentLinkId": "pay_link_123",
        "code": "00" if success else "01",
        "desc": "success" if success else "failed"
    }
    
    # Sort keys of data object alphabetically and join key=value
    sorted_keys = sorted(data.keys())
    query_parts = []
    for key in sorted_keys:
        val = data[key]
        if isinstance(val, bool):
            val_str = str(val).lower()
        else:
            val_str = str(val)
        query_parts.append(f"{key}={val_str}")
        
    query_string = "&".join(query_parts)
    
    # Sign query string using SHA256 HMAC and PayOS CHECKSUM_KEY
    signature = hmac.new(
        settings.PAYOS_CHECKSUM_KEY.encode("utf-8"),
        query_string.encode("utf-8"),
        hashlib.sha256
    ).hexdigest()
    
    return {
        "success": success,
        "data": data,
        "signature": signature
    }

@pytest.mark.asyncio
async def test_auth_and_wallet_lifecycle(client: AsyncClient, db_session: AsyncSession):
    """
    Test 1: User register, wallet creation, login, and profile fetching.
    """
    # 1. Register customer
    reg_response = await client.post(
        "/api/auth/register",
        json={"email": "cust@ken.vn", "password": "password123", "full_name": "Nguyen Van Customer", "role": "customer"}
    )
    assert reg_response.status_code == 201
    cust_data = reg_response.json()
    assert cust_data["email"] == "cust@ken.vn"
    assert cust_data["role"] == "customer"

    # Verify wallet exists and has 0 balance
    res_wallet = await db_session.execute(select(Wallet).where(Wallet.user_id == cust_data["id"]))
    wallet = res_wallet.scalar_one()
    assert wallet.balance == 0
    assert wallet.deposit_amount == 0

    # 2. Login
    login_response = await client.post(
        "/api/auth/login",
        json={"email": "cust@ken.vn", "password": "password123"}
    )
    assert login_response.status_code == 200
    token = login_response.json()["access_token"]
    
    # 3. Get profile (me)
    headers = {"Authorization": f"Bearer {token}"}
    me_response = await client.get("/api/auth/me", headers=headers)
    assert me_response.status_code == 200
    assert me_response.json()["email"] == "cust@ken.vn"


@pytest.mark.asyncio
async def test_payos_deposit_and_idempotency(client: AsyncClient, db_session: AsyncSession):
    """
    Test 2: Deposit requests, PayOS webhook receipt, balance addition,
    and idempotency guards (preventing success duplicates and success -> failed overrides).
    """
    # Register customer & log in
    await client.post(
        "/api/auth/register",
        json={"email": "cust2@ken.vn", "password": "password123", "full_name": "User 2", "role": "customer"}
    )
    login_res = await client.post("/api/auth/login", json={"email": "cust2@ken.vn", "password": "password123"})
    token = login_res.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    # Request Deposit Link
    deposit_amount = 50000
    dep_res = await client.post("/api/wallet/deposit", json={"amount": deposit_amount}, headers=headers)
    assert dep_res.status_code == 200
    order_code = dep_res.json()["order_code"]
    assert order_code is not None

    # Check database transaction is created as PENDING
    tx_query = await db_session.execute(
        select(Transaction).where(Transaction.reference_id == order_code, Transaction.type == TransactionType.DEPOSIT)
    )
    tx = tx_query.scalar_one()
    assert tx.status == TransactionStatus.PENDING

    # 1. Trigger successful PayOS webhook
    webhook_payload = make_payos_webhook_payload(int(order_code), deposit_amount, success=True)
    webhook_res = await client.post("/api/payos/webhook", json=webhook_payload)
    assert webhook_res.status_code == 200
    
    # Reload wallet and transaction
    await db_session.refresh(tx)
    wallet_query = await db_session.execute(select(Wallet).where(Wallet.id == tx.wallet_id))
    wallet = wallet_query.scalar_one()
    assert tx.status == TransactionStatus.SUCCESS
    assert wallet.balance == deposit_amount

    # 2. Trigger SUCCESS webhook again (idempotency test)
    webhook_res_dup = await client.post("/api/payos/webhook", json=webhook_payload)
    assert webhook_res_dup.status_code == 200
    await db_session.refresh(wallet)
    assert wallet.balance == deposit_amount  # Still 50,000 VND

    # 3. Trigger FAILED webhook for the same transaction (state transition guard test)
    failed_payload = make_payos_webhook_payload(int(order_code), deposit_amount, success=False)
    webhook_res_fail = await client.post("/api/payos/webhook", json=failed_payload)
    assert webhook_res_fail.status_code == 200
    await db_session.refresh(tx)
    await db_session.refresh(wallet)
    assert tx.status == TransactionStatus.SUCCESS
    assert wallet.balance == deposit_amount


@pytest.mark.asyncio
async def test_order_checkout_and_timezone_batching(client: AsyncClient, db_session: AsyncSession):
    """
    Test 3 & 4: Order checkout with wallet deduction and 10:01 AM batch compiling
    enforcing local timezone cutoff bounds (< 10:00:00 vs >= 10:00:00).
    """
    # 1. Setup Admin, Customer, Partner, Product, Building
    # Admin Signup
    await client.post(
        "/api/auth/register",
        json={"email": "admin@ken.vn", "password": "password123", "full_name": "Admin User", "role": "admin"}
    )
    admin_login = await client.post("/api/auth/login", json={"email": "admin@ken.vn", "password": "password123"})
    admin_token = admin_login.json()["access_token"]

    # Customer signup and login
    await client.post(
        "/api/auth/register",
        json={"email": "cust3@ken.vn", "password": "password123", "full_name": "Nguyen Customer", "role": "customer"}
    )
    cust_login = await client.post("/api/auth/login", json={"email": "cust3@ken.vn", "password": "password123"})
    cust_data = await client.get("/api/auth/me", headers={"Authorization": f"Bearer {cust_login.json()['access_token']}"})
    cust_id = cust_data.json()["id"]

    # Topup customer wallet with 100k
    c_wallet_query = await db_session.execute(select(Wallet).where(Wallet.user_id == cust_id))
    c_wallet = c_wallet_query.scalar_one()
    c_wallet.balance = 100000
    await db_session.commit()

    # Partner signup
    await client.post(
        "/api/auth/register",
        json={"email": "partner@ken.vn", "password": "password123", "full_name": "Partner Food", "role": "partner"}
    )
    # Get partner's merchant ID
    p_query = await db_session.execute(select(Merchant).join(User).where(User.email == "partner@ken.vn"))
    merchant = p_query.scalar_one()

    # Create Product
    product = Product(merchant_id=merchant.id, name="Com Ga Xoi Mo", price=35000, is_available=True)
    db_session.add(product)
    
    # Create Building
    building = Building(name="Buidling E", address="123 FPT Campus")
    db_session.add(building)
    await db_session.commit()

    # 2. Customer orders via wallet deduction
    checkout_res = await client.post(
        "/api/order/checkout",
        json={
            "merchant_id": merchant.id,
            "building_id": building.id,
            "payment_method": "wallet",
            "items": [{"product_id": product.id, "quantity": 2}]
        },
        headers={"Authorization": f"Bearer {cust_login.json()['access_token']}"}
    )
    assert checkout_res.status_code == 201
    order1_id = checkout_res.json()["order"]["id"]

    # Verify wallet has 15,000 VND remaining
    await db_session.refresh(c_wallet)
    assert c_wallet.balance == 15000

    # 3. Create another order (CASH payment) that is placed *after* 10:00 AM cutoff
    checkout_res2 = await client.post(
        "/api/order/checkout",
        json={
            "merchant_id": merchant.id,
            "building_id": building.id,
            "payment_method": "cash",
            "items": [{"product_id": product.id, "quantity": 1}]
        },
        headers={"Authorization": f"Bearer {cust_login.json()['access_token']}"}
    )
    assert checkout_res2.status_code == 201
    order2_id = checkout_res2.json()["order"]["id"]

    # Backdate order 1 to 9:55 AM today
    await db_session.execute(
        update(Order).where(Order.id == order1_id).values(
            created_at=datetime.now().replace(hour=9, minute=55, second=0, microsecond=0)
        )
    )
    # Forward-date order 2 to 10:05 AM today
    await db_session.execute(
        update(Order).where(Order.id == order2_id).values(
            created_at=datetime.now().replace(hour=10, minute=5, second=0, microsecond=0)
        )
    )
    await db_session.commit()

    # 4. Compile Batches at 10:01 AM (Admin call)
    cutoff_time = datetime.now().replace(hour=10, minute=0, second=0, microsecond=0).isoformat()
    compile_res = await client.post(
        f"/api/batch/compile?cutoff={cutoff_time}",
        headers={"Authorization": f"Bearer {admin_token}"}
    )
    assert compile_res.status_code == 200
    batches = compile_res.json()
    
    # We should have created 1 batch containing Order 1
    assert len(batches) == 1
    assert batches[0]["building_id"] == building.id
    
    # Verify Order statuses (Expire all cached local ORMs before checking)
    db_session.expire_all()
    res_o1 = await db_session.execute(select(Order).where(Order.id == order1_id))
    o1 = res_o1.scalar_one()
    res_o2 = await db_session.execute(select(Order).where(Order.id == order2_id))
    o2 = res_o2.scalar_one()
    
    assert o1.status == OrderStatus.BATCHED
    assert o1.batch_id == batches[0]["id"]
    
    assert o2.status == OrderStatus.CONFIRMED
    assert o2.batch_id is None


@pytest.mark.asyncio
async def test_driver_tin_quy_limits_and_batch_completion(client: AsyncClient, db_session: AsyncSession):
    """
    Test 5 & 6: Driver accepts batch.
    - Check Tín Quỹ rule: blocks CASH values (order 2 is CASH).
    - If deposit is 0, acceptance fails.
    - Deposit limit is set, acceptance succeeds.
    - Complete batch, disbursement settles correctly (85% Partner, +30k Driver, -COD Driver).
    """
    # 1. Setup Admin, Customer, Driver, Partner, Product, Building
    # Admin Signup
    await client.post(
        "/api/auth/register",
        json={"email": "admin@ken.vn", "password": "password123", "full_name": "Admin User", "role": "admin"}
    )
    admin_login = await client.post("/api/auth/login", json={"email": "admin@ken.vn", "password": "password123"})
    admin_token = admin_login.json()["access_token"]

    # Driver signup and login
    await client.post(
        "/api/auth/register",
        json={"email": "driver@ken.vn", "password": "password123", "full_name": "Nguyen Van TaiXe", "role": "driver"}
    )
    driver_login = await client.post("/api/auth/login", json={"email": "driver@ken.vn", "password": "password123"})
    driver_token = driver_login.json()["access_token"]
    driver_headers = {"Authorization": f"Bearer {driver_token}"}

    # Fetch driver ID
    d_data = await client.get("/api/auth/me", headers=driver_headers)
    driver_id = d_data.json()["id"]

    # Customer signup and login
    await client.post(
        "/api/auth/register",
        json={"email": "cust3@ken.vn", "password": "password123", "full_name": "Nguyen Customer", "role": "customer"}
    )
    cust_login = await client.post("/api/auth/login", json={"email": "cust3@ken.vn", "password": "password123"})
    cust_token = cust_login.json()["access_token"]
    cust_headers = {"Authorization": f"Bearer {cust_token}"}

    # Partner signup
    await client.post(
        "/api/auth/register",
        json={"email": "partner@ken.vn", "password": "password123", "full_name": "Partner Food", "role": "partner"}
    )
    p_query = await db_session.execute(select(Merchant).join(User).where(User.email == "partner@ken.vn"))
    merchant = p_query.scalar_one()

    # Create Product
    product = Product(merchant_id=merchant.id, name="Com Ga Xoi Mo", price=35000, is_available=True)
    db_session.add(product)
    
    # Create Building
    building = Building(name="Buidling E", address="123 FPT Campus")
    db_session.add(building)
    await db_session.commit()

    # Verify driver's default wallet
    d_wallet_query = await db_session.execute(select(Wallet).where(Wallet.user_id == driver_id))
    d_wallet = d_wallet_query.scalar_one()
    assert d_wallet.balance == 0
    assert d_wallet.deposit_amount == 0

    # Customer places a CASH order (Total: food 35,000 + delivery 15,000 = 50,000 VND)
    checkout_res = await client.post(
        "/api/order/checkout",
        json={
            "merchant_id": merchant.id,
            "building_id": building.id,
            "payment_method": "cash",
            "items": [{"product_id": product.id, "quantity": 1}]
        },
        headers=cust_headers
    )
    assert checkout_res.status_code == 201
    cash_order_id = checkout_res.json()["order"]["id"]

    # Backdate cash order to 9:55 AM today
    await db_session.execute(
        update(Order).where(Order.id == cash_order_id).values(
            created_at=datetime.now().replace(hour=9, minute=55, second=0, microsecond=0)
        )
    )
    await db_session.commit()

    # Admin compiles batches
    cutoff_time = datetime.now().replace(hour=10, minute=0, second=0, microsecond=0).isoformat()
    compile_res = await client.post(
        f"/api/batch/compile?cutoff={cutoff_time}",
        headers={"Authorization": f"Bearer {admin_token}"}
    )
    assert compile_res.status_code == 200
    batches = compile_res.json()
    
    # Find the batch that has the CASH order
    cash_batch_id = None
    for b in batches:
        for ord in b["orders"]:
            if ord["id"] == cash_order_id:
                cash_batch_id = b["id"]
                break
    assert cash_batch_id is not None

    # 2. Driver attempts to accept batch. Wallet has 0 balance and 0 deposit.
    accept_res = await client.post(f"/api/batch/{cash_batch_id}/accept", headers=driver_headers)
    assert accept_res.status_code == 400
    assert "Tín Quỹ credit limit" in accept_res.json()["detail"]

    # 3. Driver updates their deposit amount (ký quỹ) to 100k
    limit_res = await client.post("/api/auth/driver/deposit-limit?amount=100000", headers=driver_headers)
    assert limit_res.status_code == 200
    
    db_session.expire_all()
    d_wallet_query = await db_session.execute(select(Wallet).where(Wallet.user_id == driver_id))
    d_wallet = d_wallet_query.scalar_one()
    assert d_wallet.deposit_amount == 100000

    # 4. Accept batch again. This should succeed!
    accept_res_ok = await client.post(f"/api/batch/{cash_batch_id}/accept", headers=driver_headers)
    assert accept_res_ok.status_code == 200
    
    # Check driver blocked balance
    db_session.expire_all()
    d_wallet_query = await db_session.execute(select(Wallet).where(Wallet.user_id == driver_id))
    d_wallet = d_wallet_query.scalar_one()
    assert d_wallet.blocked_balance == 50000
    assert d_wallet.balance == 0
    assert d_wallet.available_balance == -50000

    # Check order status is DELIVERING
    res_o = await db_session.execute(select(Order).where(Order.id == cash_order_id))
    cash_order = res_o.scalar_one()
    assert cash_order.status == OrderStatus.DELIVERING

    # 5. Complete batch (Settlements run)
    comp_res = await client.post(f"/api/batch/{cash_batch_id}/complete", headers=driver_headers)
    assert comp_res.status_code == 200

    # Verify Settlements:
    # A. Driver Wallet:
    #   - Blocked amount released: blocked_balance back to 0.
    #   - Cash COD deducted: balance decreases by 50,000 VND (Order total).
    #   - Fixed Payout credited: balance increases by 30,000 VND.
    #   - Net driver balance = 0 - 50,000 + 30,000 = -20,000 VND.
    db_session.expire_all()
    d_wallet_query = await db_session.execute(select(Wallet).where(Wallet.user_id == driver_id))
    d_wallet = d_wallet_query.scalar_one()
    assert d_wallet.blocked_balance == 0
    assert d_wallet.balance == -20000
    assert d_wallet.available_balance == -20000

    # B. Partner (Merchant) Wallet:
    #   - Receives 85% of food revenue. 35,000 * 0.85 = 29,750 VND.
    #   - Balance should be 29,750 VND.
    p_wallet_query = await db_session.execute(
        select(Wallet).join(User).where(User.email == "partner@ken.vn")
    )
    p_wallet = p_wallet_query.scalar_one()
    assert p_wallet.balance == 29750

    # C. Order Status:
    res_o = await db_session.execute(select(Order).where(Order.id == cash_order_id))
    cash_order = res_o.scalar_one()
    assert cash_order.status == OrderStatus.COMPLETED
