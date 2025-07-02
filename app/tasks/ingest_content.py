# app/tasks/ingest_content.py
"""
Background task to process an uploaded file:
1. Load Content row from DB
2. Read file from disk (local) or S3/MinIO
3. Chunk & embed (stubbed for now)
4. Save embeddings to Chroma
5. Mark Content.status = "processed"
"""

import os
from uuid import UUID

from celery import Celery, shared_task
from sqlmodel import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import async_session_factory
from app.models import Content

# ─── Celery App ------------------------------------------------
celery_app = Celery("spaces_tasks")
celery_app.config_from_object(
    {
        "broker_url": os.getenv("REDIS_URL", "redis://localhost:6379/0"),
        "result_backend": os.getenv("REDIS_URL", "redis://localhost:6379/0"),
        "task_serializer": "json",
        "result_serializer": "json",
        "accept_content": ["json"],
    }
)

# ─── Dispatcher ------------------------------------------------
@shared_task(name="tasks.ingest_content")
def ingest_content(content_id: str) -> None:
    """
    Celery entry point. Runs sync, calls async helper with asyncio.
    """
    import asyncio

    asyncio.run(_ingest_content_async(UUID(content_id)))


# ─── Async worker ---------------------------------------------
async def _ingest_content_async(content_id: UUID) -> None:
    async with async_session_factory() as session:
        content: Content | None = await session.get(Content, content_id)
        if not content:
            return

        try:
            # 1. Read the file
            file_bytes = _load_file(content.file_path)

            # 2. Chunk & embed (stub—replace with real logic)
            chunks = _simple_split(file_bytes.decode(errors="ignore"), 1000)
            _store_in_chroma(content.space_id, chunks)

            # 3. Mark as processed
            content.status = "processed"
            await session.commit()

        except Exception as exc:  # noqa: BLE001
            content.status = "error"
            await session.commit()
            raise exc


# ─── Helpers ---------------------------------------------------
def _load_file(path: str) -> bytes:
    with open(path, "rb") as f:
        return f.read()


def _simple_split(text: str, chunk_size: int) -> list[str]:
    """Naive splitter—for PDFs/videos switch to LangChain later."""
    return [text[i : i + chunk_size] for i in range(0, len(text), chunk_size)]


def _store_in_chroma(space_id: UUID, chunks: list[str]) -> None:
    """
    Placeholder: add embeddings to Chroma collection.
    Replace with actual Chroma client calls.
    """
    # from chromadb import Client
    # client = Client()
    # coll = client.get_or_create_collection(str(space_id))
    # for i, chunk in enumerate(chunks):
    #     coll.add(documents=[chunk], ids=[f"{space_id}-{i}"])
    pass
