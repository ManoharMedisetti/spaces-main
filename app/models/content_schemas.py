from pydantic import BaseModel
from uuid import UUID
from datetime import datetime
from typing import Optional


# ─── inbound payload ──────────────────────────────────────────
class ContentCreate(BaseModel):
    space_id: UUID
    owner_id: Optional[UUID] = None   # keep until auth is enforced
    title: Optional[str] = None


# ─── outbound / DB read ───────────────────────────────────────
class ContentOut(BaseModel):
    id: UUID
    space_id: UUID
    owner_id: Optional[UUID]
    title: Optional[str]
    mime_type: str
    status: str
    created_at: datetime

    class Config:
        orm_mode = True               # enables SQLModel → Pydantic
