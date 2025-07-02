from sqlmodel import SQLModel, Field, Relationship
import uuid
from typing import Optional, List
from datetime import datetime


class Space(SQLModel, table=True):
    __tablename__ = "spaces"

    id :uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    title: str = Field(max_length=255, nullable=False)
    description: Optional[str] = Field(default=None, max_length=1000)
    owner_id: uuid.UUID = Field(index=True, nullable=False)
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow, nullable=False)