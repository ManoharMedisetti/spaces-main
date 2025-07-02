from fastapi import APIRouter, UploadFile, File, Depends, HTTPException, BackgroundTasks, status
from uuid import UUID
from sqlmodel import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_session
from app.core.storage import save_upload
from app.models.content import Content
from app.models.content_schemas import ContentOut
from app.models.space import Space
from app.services.ingest import async_ingest

router = APIRouter(prefix="/contents", tags=["Contents"])


@router.post("/upload", response_model=ContentOut, status_code=status.HTTP_201_CREATED)
async def upload_content(
    background_tasks: BackgroundTasks,
    space_id: UUID,
    file: UploadFile = File(...),
    title: str | None = None,
    owner_id: UUID | None = None,
    session: AsyncSession = Depends(get_session),
):
    # 1. verify space exists
    if not await session.get(Space, space_id):
        raise HTTPException(404, detail="Space not found")

    # 2. create Content (without file_path yet)
    content = Content(
        space_id=space_id,
        owner_id=owner_id,
        title=title or file.filename,
        mime_type=file.content_type,
        status="pending",
    )

    # 3. save file first (to keep extension) → get path
    try:
        saved_path = save_upload(file, content.id)
    except ValueError as exc:
        raise HTTPException(400, str(exc)) from exc

    content.file_path = str(saved_path)

    # 4. insert row
    session.add(content)
    await session.commit()
    await session.refresh(content)

    # 5. background ingestion
    background_tasks.add_task(async_ingest, content.id)

    return content


# ─── list by space ─────────────────────────────────────────────
@router.get("/by_space/{space_id}", response_model=list[ContentOut])
async def list_by_space(space_id: UUID, session: AsyncSession = Depends(get_session)):
    stmt = select(Content).where(Content.space_id == space_id).order_by(Content.created_at.desc())
    result = await session.execute(stmt)
    return result.scalars().all()
