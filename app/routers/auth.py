# app/routers/auth.py
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlmodel import select

from app.core.auth import (
    hash_password,
    verify_password,
    create_access_token,
)
from app.core.database import get_session
from app.models.auth import UserCreate, UserLogin, Token
from app.models.user import User

router = APIRouter(prefix="/auth", tags=["Auth"])


# ─────────────────────────────
# Register
# ─────────────────────────────
@router.post("/register")
async def register(user: UserCreate, session: AsyncSession = Depends(get_session)):
    # Use session.execute() instead of session.exec()
    result = await session.execute(select(User).where(User.email == user.email))
    existing_user = result.scalar_one_or_none()
    
    if existing_user:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    hashed_pw = hash_password(user.password)

    # Create new user
    new_user = User(
        email=user.email,
        full_name=user.full_name,
        hashed_password=hashed_pw,
    )
    session.add(new_user)
    await session.commit()
    await session.refresh(new_user)
    
    # 3. Issue JWT token
    token = create_access_token({"sub": str(new_user.id)})
    return {"access_token": token, "token_type": "bearer"}


# ─────────────────────────────
# Login
# ─────────────────────────────
@router.post("/login", response_model=Token)
async def login(
    user: UserLogin,
    session: AsyncSession = Depends(get_session),
):
    # Use session.execute() instead of session.exec()
    result = await session.execute(select(User).where(User.email == user.email))
    db_user = result.scalar_one_or_none()  # Use scalar_one_or_none() instead of first()

    if not db_user or not verify_password(user.password, db_user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password",
        )

    token = create_access_token({"sub": str(db_user.id)})
    return {"access_token": token, "token_type": "bearer", "user_id": str(db_user.id), "email": db_user.email}