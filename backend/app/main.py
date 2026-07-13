from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.config import settings
from app.database import engine
from app.models.base import Base
from app.routers import auth_router, wallet_router, order_router, batch_router, payos_router, building_router, admin_router, product_router
import logging

# Set up logging format
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s"
)
logger = logging.getLogger("ken_backend")

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Automatically sync database tables on server startup
    logger.info("Initializing database schemas...")
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    logger.info("Database schemas initialized successfully.")

    # Seed default data
    from app.database import async_session_maker
    from app.models.user import User, UserRole
    from app.models.wallet import Wallet
    from app.models.merchant import Merchant
    from app.models.product import Product
    from app.models.building import Building
    from sqlalchemy import select
    import bcrypt

    logger.info("Seeding database default data if empty...")
    async with async_session_maker() as session:
        user_check = await session.execute(select(User).limit(1))
        if not user_check.scalars().first():
            def hash_pwd(pwd: str) -> str:
                return bcrypt.hashpw(pwd.encode("utf-8"), bcrypt.gensalt()).decode("utf-8")

            cust = User(email="customer@ken.vn", hashed_password=hash_pwd("customer123"), full_name="Đỗ Thu Trang", role=UserRole.CUSTOMER)
            driver = User(email="driver@ken.vn", hashed_password=hash_pwd("driver123"), full_name="Nguyễn Văn Hùng", role=UserRole.DRIVER)
            admin = User(email="admin@ken.vn", hashed_password=hash_pwd("admin123"), full_name="Admin Kén", role=UserRole.ADMIN)

            session.add_all([cust, driver, admin])
            await session.flush()

            # Seed wallets
            cust_wallet = Wallet(user_id=cust.id, balance=200000, deposit_amount=0, blocked_balance=0)
            driver_wallet = Wallet(user_id=driver.id, balance=0, deposit_amount=100000, blocked_balance=50000)
            admin_wallet = Wallet(user_id=admin.id, balance=0, deposit_amount=0, blocked_balance=0)
            session.add_all([cust_wallet, driver_wallet, admin_wallet])

            # Seed merchant users & profiles
            merchants_data = [
                {"email": "phothin@ken.vn", "name": "Phở Thìn Lò Đúc"},
                {"email": "huonglien@ken.vn", "name": "Bún Chả Hương Liên"},
                {"email": "comtamsaigon@ken.vn", "name": "Cơm Tấm Sài Gòn"},
                {"email": "banhmi25@ken.vn", "name": "Bánh Mì 25"},
                {"email": "annhienvegan@ken.vn", "name": "An Nhiên Vegan"},
                {"email": "lauphan@ken.vn", "name": "Lẩu Phan"},
                {"email": "phuclong@ken.vn", "name": "Phúc Long Coffee & Tea"},
                {"email": "bunbooxuan@ken.vn", "name": "Bún Bò O Xuân"},
            ]

            merchants_list = []
            for m_data in merchants_data:
                m_user = User(email=m_data["email"], hashed_password=hash_pwd("merchant123"), full_name=m_data["name"], role=UserRole.PARTNER)
                session.add(m_user)
                await session.flush()
                
                m_wallet = Wallet(user_id=m_user.id, balance=0, deposit_amount=0, blocked_balance=0)
                session.add(m_wallet)
                
                merchant = Merchant(user_id=m_user.id, name=m_data["name"], commission_rate=0.15)
                session.add(merchant)
                await session.flush()
                merchants_list.append(merchant)

            # Map from merchant name to merchant id
            m_map = {m.name: m.id for m in merchants_list}

            # Seed products
            products_data = [
                {"name": "Phở bò tái lăn đặc biệt", "price": 75000, "merchant": "Phở Thìn Lò Đúc", "category": "pho", "ward": "Hai Bà Trưng", "image": "/vietnamese-pho-beef-noodle-soup-premium-bowl.png"},
                {"name": "Bún chả Hà Nội than hoa", "price": 65000, "merchant": "Bún Chả Hương Liên", "category": "pho", "ward": "Hoàn Kiếm", "image": "/vietnamese-bun-cha-grilled-pork-noodles.png"},
                {"name": "Cơm tấm sườn bì chả", "price": 55000, "merchant": "Cơm Tấm Sài Gòn", "category": "com", "ward": "Cầu Giấy", "image": "/vietnamese-com-tam-broken-rice-pork-chop.png"},
                {"name": "Bánh mì pate trứng ốp", "price": 35000, "merchant": "Bánh Mì 25", "category": "banh", "ward": "Hoàn Kiếm", "image": "/vietnamese-banh-mi-sandwich-pate-egg.png"},
                {"name": "Buddha bowl chay hữu cơ", "price": 89000, "merchant": "An Nhiên Vegan", "category": "chay", "ward": "Tây Hồ", "image": "/vegan-buddha-bowl-organic-vietnamese.png"},
                {"name": "Lẩu riêu cua bắp bò", "price": 320000, "merchant": "Lẩu Phan", "category": "lau", "ward": "Đống Đa", "image": "/vietnamese-crab-hotpot-beef-lau.png"},
                {"name": "Trà sữa trân châu hoàng kim", "price": 45000, "merchant": "Phúc Long Coffee & Tea", "category": "drink", "ward": "Thanh Xuân", "image": "/golden-bubble-milk-tea-premium.png"},
                {"name": "Bún bò Huế chuẩn vị", "price": 70000, "merchant": "Bún Bò O Xuân", "category": "pho", "ward": "Ba Đình", "image": "/vietnamese-bun-bo-hue-spicy-noodle-soup.png"},
            ]

            for p_data in products_data:
                m_id = m_map.get(p_data["merchant"])
                if m_id:
                    prod = Product(
                        merchant_id=m_id,
                        name=p_data["name"],
                        price=p_data["price"],
                        description=f"Thơm ngon chuẩn vị từ {p_data['merchant']}",
                        image_url=p_data["image"],
                        category=p_data["category"],
                        ward=p_data["ward"],
                        is_available=True
                    )
                    session.add(prod)

            # Seed buildings
            buildings = [
                Building(name="Keangnam Landmark 72", address="Khu đô thị mới Cầu Giấy, Mễ Trì, Nam Từ Liêm, Hà Nội"),
                Building(name="Viettel Complex Tower", address="285 Cách Mạng Tháng Tám, Quận 10, TP. Hồ Chí Minh"),
                Building(name="FPT Tower Cầu Giấy", address="Số 10 Phạm Văn Bạch, Dịch Vọng, Cầu Giấy, Hà Nội"),
                Building(name="Lotte Center Hanoi", address="54 Liễu Giai, Cống Vị, Ba Đình, Hà Nội")
            ]
            session.add_all(buildings)

            await session.commit()
            logger.info("Database seeded successfully with 8 merchants, products, wallets, and buildings.")
        else:
            logger.info("Database already has data. Seeding skipped.")

    yield
    # Shutdown logic if any goes here
    logger.info("Shutting down backend server...")

app = FastAPI(
    title="Kén Startup Backend (ken_backend)",
    description="High-Concurrency Marketplace & Batch Delivery Fintech Engine",
    version="1.0.0",
    lifespan=lifespan
)

# Disable static file and template caching in local dev mode (Cache-Control Headers middleware)
@app.middleware("http")
async def add_no_cache_headers(request, call_next):
    response = await call_next(request)
    response.headers["Cache-Control"] = "no-store, no-cache, must-revalidate, max-age=0"
    response.headers["Pragma"] = "no-cache"
    response.headers["Expires"] = "0"
    return response

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://localhost:5173",
        "http://127.0.0.1:3000",
        "http://127.0.0.1:5173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Register routes
app.include_router(auth_router)
app.include_router(wallet_router)
app.include_router(order_router)
app.include_router(batch_router)
app.include_router(payos_router)
app.include_router(building_router)
app.include_router(admin_router)
app.include_router(product_router)

@app.get("/health")
def health_check():
    return {"status": "healthy", "service": "ken_backend", "timestamp": lifespan}
