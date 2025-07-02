from sqlmodel import SQLModel, Field
from uuid import uuid4, UUID
from datetime import datetime
from typing import Optional
from sqlalchemy import select

class Content(SQLModel, table=True):
    __tablename__ = "contents"

    id: UUID = Field(default_factory=uuid4, primary_key=True)
    space_id: UUID = Field(foreign_key="spaces.id", index=True)
    owner_id: UUID | None = Field(default=None, index=True)   # keep nullable for now
    title: Optional[str] = None
    file_path: str                      # local path or s3:// bucket key
    mime_type: str
    status: str = "pending"             # pending | processed | error
    created_at: datetime = Field(default_factory=datetime.utcnow)
