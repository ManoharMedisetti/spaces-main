from pydantic import BaseModel, Field
from typing import List, Dict, Optional
from uuid import UUID


class ChatMessage(BaseModel):
    role: str = Field(..., pattern="^(user|assistant)$")
    content: str


class ChatRequest(BaseModel):
    user_id: UUID
    space_id: UUID
    message: str
    history: Optional[List[ChatMessage]] = None
    k: int = 5
    temperature: float = 0.3


class ChatResponse(BaseModel):
    answer: str
    context: List[str]
