from app.routers.auth import router as auth_router
from app.routers.wallet import router as wallet_router
from app.routers.order import router as order_router
from app.routers.batch import router as batch_router
from app.routers.payos import router as payos_router
from app.routers.building import router as building_router
from app.routers.admin import router as admin_router
from app.routers.product import router as product_router

__all__ = [
    "auth_router",
    "wallet_router",
    "order_router",
    "batch_router",
    "payos_router",
    "building_router",
    "admin_router",
    "product_router",
]
