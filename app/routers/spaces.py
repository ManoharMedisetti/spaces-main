# app/routers/spaces.py
from fastapi import APIRouter, HTTPException, status, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlmodel import select

from app.core.database import get_session
from app.models.space import Space
from app.models.space_schemas import SpaceCreate, SpaceRead, SpaceUpdate, SpaceOut
from typing import List

router = APIRouter(prefix="/spaces", tags=["Spaces (no-auth, owner_id in body)"])

# CREATE
@router.post("/create_space", status_code=status.HTTP_201_CREATED)
async def create_space(
    payload: SpaceCreate,
    session: AsyncSession = Depends(get_session),
):
    space = Space(
        title=payload.title,
        description=payload.description,
        owner_id=payload.owner_id,  # owner_id is required in the payload
    )
    session.add(space)
    await session.commit()
    await session.refresh(space)
    return space

# LIST (optionally filter by owner_id)
@router.get("/list_spaces", response_model=List[SpaceOut])
async def list_spaces(
    owner_id: str | None = None,                   # ?owner_id=<uuid> query param
    session: AsyncSession = Depends(get_session),
):
    stmt = select(Space).order_by(Space.created_at.desc())
    if owner_id:
        stmt = stmt.where(Space.owner_id == owner_id)
    result = await session.execute(stmt)
    spaces = result.all()
    return [space for space, in spaces]

# GET
@router.get("/space/{space_id}", response_model=SpaceOut)
async def get_space(space_id: str, session: AsyncSession = Depends(get_session)):
    space = await session.get(Space, space_id)
    if not space:
        raise HTTPException(status_code=404, detail="Space not found")
    return space

# UPDATE
@router.patch("/space{space_id}", response_model=SpaceOut)
async def update_space(
    space_id: str,
    updates: SpaceUpdate,
    session: AsyncSession = Depends(get_session),
):
    space = await session.get(Space, space_id)
    if not space:
        raise HTTPException(status_code=404, detail="Space not found")

    for k, v in updates.dict(exclude_unset=True).items():
        setattr(space, k, v)
    await session.commit()
    await session.refresh(space)
    return space

# DELETE
@router.delete("/space/{space_id}")
async def delete_space(space_id: str, session: AsyncSession = Depends(get_session)):
    space = await session.get(Space, space_id)
    if not space:
        raise HTTPException(status_code=404, detail="Space not found")
    await session.delete(space)
    await session.commit()
    return {"detail": "Space deleted successfully"}