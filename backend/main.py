import sys
import pysqlite3
sys.modules["sqlite3"] = sys.modules.pop("pysqlite3")

import os
from fastapi import FastAPI, UploadFile, File, HTTPException, Form
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv

from models.schemas import ChatRequest, ChatResponse, UploadResponse
from services import pdf_service, vector_service, ai_service

load_dotenv()

app = FastAPI(title="Porsesh AI API")

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "https://porsesh-ai.vercel.app",
        "https://*.vercel.app",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

MAX_PDF_SIZE_MB = int(os.getenv("MAX_PDF_SIZE_MB", 10))

@app.get("/health")
def health_check():
    return {"status": "ok"}

@app.post("/upload", response_model=UploadResponse)
async def upload_pdf(file: UploadFile = File(...), session_id: str = Form(...)):
    if not file.filename.endswith('.pdf'):
        raise HTTPException(status_code=400, detail="Only PDF files are allowed")
    
    content = await file.read()
    if len(content) > MAX_PDF_SIZE_MB * 1024 * 1024:
        raise HTTPException(status_code=400, detail=f"File too large. Max size is {MAX_PDF_SIZE_MB}MB")

    try:
        text = pdf_service.extract_text_from_pdf(content)
        chunks = pdf_service.chunk_text(text)
        vector_service.store_chunks(chunks, source=file.filename, session_id=session_id)
        
        return UploadResponse(
            status="success",
            filename=file.filename,
            pages=max(1, len(text) // 1500),  # Rough estimate
            chunks=len(chunks)
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/chat", response_model=ChatResponse)
async def chat(request: ChatRequest):
    try:
        print(f"Chat endpoint received history length: {len(request.history)}")
        context_chunks = vector_service.query_similar_chunks(request.message, request.session_id)
        answer = ai_service.generate_answer(request.message, context_chunks, request.history)
        
        return ChatResponse(
            answer=answer,
            session_id=request.session_id
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.delete("/session/{session_id}/file/{filename}")
def delete_file(session_id: str, filename: str):
    try:
        vector_service.delete_file(session_id, filename)
        return {"status": "success"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.delete("/session/{session_id}")
def clear_session(session_id: str):
    try:
        vector_service.clear_session(session_id)
        return {"status": "success"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
