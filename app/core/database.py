import os
import ssl
from contextlib import asynccontextmanager

from dotenv import load_dotenv
from sqlalchemy.ext.asyncio import (
    AsyncSession,
    create_async_engine,
)
from sqlalchemy.orm import sessionmaker
from sqlmodel import SQLModel

# ──────────────────────────────
# 1. Environment
# ──────────────────────────────
load_dotenv()  # read .env once at import

DATABASE_URL: str | None = os.getenv("DATABASE_URL")
SSL_CERT_PATH: str | None = os.getenv("SSL_CERT_PATH")  # absolute or container path

if not DATABASE_URL:
    raise RuntimeError("DATABASE_URL env var is required")

# ──────────────────────────────
# 2. SSL context for asyncpg
# ──────────────────────────────
connect_args = {}
if SSL_CERT_PATH:
    ssl_ctx = ssl.create_default_context(cafile=SSL_CERT_PATH)
    connect_args = {"ssl": ssl_ctx}

# ──────────────────────────────
# 3. Async engine & session maker
# ──────────────────────────────
engine = create_async_engine(
    DATABASE_URL,
    echo=False,
    future=True,
    connect_args=connect_args,
)

async_session_factory = sessionmaker(
    engine, class_=AsyncSession, expire_on_commit=False
)

# ──────────────────────────────
# 4. Dependency for FastAPI routes
# ──────────────────────────────
async def get_session() -> AsyncSession:
    """
    FastAPI dependency that yields an AsyncSession
    Usage:
        async def route(..., session: AsyncSession = Depends(get_session)):
    """
    async with async_session_factory() as session:
        yield session


# ──────────────────────────────
# 5. One‑shot helper to build tables (dev only)
# ──────────────────────────────
async def create_db_and_tables() -> None:
    """
    Call once on startup in dev (or run migrations in prod).
    """
    async with engine.begin() as conn:
        await conn.run_sync(SQLModel.metadata.create_all)
