import bcrypt
from datetime import datetime, timedelta
from typing import Annotated
import jwt
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.ext.asyncio import AsyncSession

from app.config import settings
from app.database import get_db
from app.models.user import User, UserRole
from app.models.merchant import Merchant
from app.repositories.user import UserRepository
from app.schemas.user import UserCreate, UserResponse, UserLogin, Token
from app.services.wallet_service import WalletService
from app.routers.deps import get_current_user

router = APIRouter(prefix="/api/auth", tags=["Authentication"])

def hash_password(password: str) -> str:
    salt = bcrypt.gensalt()
    hashed = bcrypt.hashpw(password.encode("utf-8"), salt)
    return hashed.decode("utf-8")

def verify_password(plain_password: str, hashed_password: str) -> bool:
    try:
        return bcrypt.checkpw(plain_password.encode("utf-8"), hashed_password.encode("utf-8"))
    except Exception:
        return False


def create_access_token(data: dict, expires_delta: timedelta | None = None) -> str:
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, settings.JWT_SECRET, algorithm=settings.JWT_ALGORITHM)
    return encoded_jwt

@router.post("/register", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
async def register(dto: UserCreate, db: Annotated[AsyncSession, Depends(get_db)]):
    user_repo = UserRepository(db)
    
    # Check duplicate
    existing = await user_repo.get_by_email(dto.email)
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")
        
    # Create user
    user = User(
        email=dto.email,
        hashed_password=hash_password(dto.password),
        full_name=dto.full_name,
        role=dto.role
    )
    await user_repo.create(user)
    await db.flush()

    # Pre-create wallet
    wallet_service = WalletService(db)
    await wallet_service.get_wallet(user.id)

    # If role is partner, create merchant profile
    if dto.role == UserRole.PARTNER:
        merchant = Merchant(
            user_id=user.id,
            name=f"{dto.full_name}'s Restaurant",
            commission_rate=0.15
        )
        db.add(merchant)
        
    await db.commit()
    return user

@router.post("/token", response_model=Token)
async def login_for_access_token(
    form_data: Annotated[OAuth2PasswordRequestForm, Depends()],
    db: Annotated[AsyncSession, Depends(get_db)]
):
    user_repo = UserRepository(db)
    user = await user_repo.get_by_email(form_data.username)
    if not user or not verify_password(form_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    access_token = create_access_token(data={"sub": user.email, "role": user.role.value})
    return Token(access_token=access_token, token_type="bearer")

@router.post("/login", response_model=Token)
async def login_json(dto: UserLogin, db: Annotated[AsyncSession, Depends(get_db)]):
    user_repo = UserRepository(db)
    user = await user_repo.get_by_email(dto.email)
    if not user or not verify_password(dto.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password"
        )
    access_token = create_access_token(data={"sub": user.email, "role": user.role.value})
    return Token(access_token=access_token, token_type="bearer")

@router.get("/me", response_model=UserResponse)
async def get_me(current_user: Annotated[User, Depends(get_current_user)]):
    return current_user

@router.post("/driver/deposit-limit")
async def update_driver_deposit(
    amount: int,
    current_user: Annotated[User, Depends(get_current_user)],
    db: Annotated[AsyncSession, Depends(get_db)]
):
    """
    Simulates setting a driver's deposit limit (Ký quỹ amount) for testing Tín Quỹ rule.
    """
    if current_user.role != UserRole.DRIVER and current_user.role != UserRole.ADMIN:
        raise HTTPException(status_code=403, detail="Only drivers or admins can set deposit limits")
        
    wallet_service = WalletService(db)
    wallet = await wallet_service.get_wallet_for_update(current_user.id)
    wallet.deposit_amount = amount
    await db.commit()
    return {"message": "Deposit limit (Ký quỹ) updated successfully", "deposit_amount": wallet.deposit_amount}
