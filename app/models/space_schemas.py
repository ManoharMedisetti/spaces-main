# app/models/space_schemas.py
import uuid
from typing import Optional
from pydantic import BaseModel, Field
import datetime

class SpaceBase(BaseModel):
    title: str
    description: Optional[str] = None
    owner_id: str                      # ← required in payload

class SpaceCreate(SpaceBase):
    pass

class SpaceRead(SpaceBase):
    id: str
    owner_id: str

class SpaceUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    owner_id: Optional[uuid.UUID] = None 
    
class SpaceOut(BaseModel):
    id: uuid.UUID
    title: str
    description: Optional[str] = None
    owner_id: uuid.UUID
    created_at: datetime.datetime

    class Config:
        orm_mode = True  # ← key line      # allow owner change if you want
