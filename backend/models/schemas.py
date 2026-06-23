from pydantic import BaseModel
from typing import List, Optional

class MessageItem(BaseModel):
    role: str
    content: str

class ChatRequest(BaseModel):
    message: str
    session_id: str
    history: List[MessageItem] = []
    active_files: List[str] = []

class ChatResponse(BaseModel):
    answer: str
    session_id: str

class UploadResponse(BaseModel):
    status: str
    filename: str
    pages: int
    chunks: int
