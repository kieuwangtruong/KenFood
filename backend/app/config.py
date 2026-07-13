import os
from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    PORT: int = 8000
    HOST: str = "0.0.0.0"
    
    DATABASE_URL: str = "postgresql+asyncpg://postgres:postgres@localhost:5432/ken_db"
    
    JWT_SECRET: str = "super_secret_jwt_key_please_change_in_production"
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 1440
    
    PAYOS_CLIENT_ID: str = "your_payos_client_id"
    PAYOS_API_KEY: str = "your_payos_api_key"
    PAYOS_CHECKSUM_KEY: str = "your_payos_checksum_key"
    PAYOS_RETURN_URL: str = "http://localhost:3000/wallet/callback"
    PAYOS_CANCEL_URL: str = "http://localhost:3000/wallet/deposit"
    
    model_config = SettingsConfigDict(
        env_file=os.path.join(os.path.dirname(os.path.dirname(__file__)), ".env"),
        env_file_encoding="utf-8",
        extra="ignore"
    )

settings = Settings()
