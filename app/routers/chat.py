from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from uuid import UUID
from sqlmodel import select  
from app.core.database import get_session
from app.models.space import Space
from app.models.content import Content  # optional existence check
from app.models.chat_schemas import ChatRequest, ChatResponse
from app.services.chat import chat  # <- your helper module
from sqlalchemy import select


router = APIRouter(prefix="/chat", tags=["Chat"])


@router.post("/", response_model=ChatResponse)
async def chat_endpoint(
    payload: ChatRequest,
    session: AsyncSession = Depends(get_session),
):
    """
    Conversational endpoint scoped to a Space.
    """
    # 1. basic validation: space must exist
    space: Space | None = await session.get(Space, payload.space_id)
    if not space:
        raise HTTPException(status_code=404, detail="Space not found")

    # (optional) ensure the space actually has content
    stmt = select(Content).where(Content.space_id == payload.space_id).limit(1)
    result = await session.execute(stmt)
    if not result.first():
        raise HTTPException(400, detail="Space has no processed content yet")

    # 2. delegate to chat helper
    response = await chat(
        user_id=str(payload.user_id),
        space=str(payload.space_id),
        user_msg=payload.message,
        history=[m.dict() for m in (payload.history or [])],
        k=payload.k,
        temperature=payload.temperature,
    )
    return response
