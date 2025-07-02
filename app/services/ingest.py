from uuid import UUID
from pathlib import Path
import tempfile
import asyncio

from app.services.media_parser import extract_text
from app.services.memory_db import memory_db
from app.core.database import async_session_factory
from app.models.content import Content


async def async_ingest(content_id: UUID) -> None:
    async with async_session_factory() as session:
        content: Content | None = await session.get(Content, content_id)
        if not content:
            return

        try:
            # 1. read bytes
            data = Path(content.file_path).read_bytes()

            # 2. write to temp file so extract_text gets a path
            with tempfile.NamedTemporaryFile(delete=False, suffix=Path(content.file_path).suffix) as tmp:  # keep ext
                tmp.write(data)
                tmp_path = tmp.name

            # 3. extract text
            text = await extract_text(tmp_path)

            # 4. embed + store
            await memory_db.upsert(
                user_id=str(content.owner_id or "anon"),
                text=text,
                type_="content",
                subtype=str(content.id),
            )

            content.status = "processed"
            await session.commit()

        except Exception:  # noqa: BLE001
            content.status = "error"
            await session.commit()
            raise
