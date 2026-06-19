from pydantic import BaseModel

class ChatRequest(BaseModel):
    message: str
    session_id: str

class ChatResponse(BaseModel):
    answer: str
    session_id: str

class UploadResponse(BaseModel):
    status: str
    filename: str
    pages: int
    chunks: int
