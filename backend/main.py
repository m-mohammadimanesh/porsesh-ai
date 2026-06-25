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
    
    MAX_BYTES = MAX_PDF_SIZE_MB * 1024 * 1024
    content_bytearray = bytearray()
    
    while True:
        chunk = await file.read(1024 * 1024) # Read in 1MB chunks
        if not chunk:
            break
        content_bytearray.extend(chunk)
        if len(content_bytearray) > MAX_BYTES:
            raise HTTPException(status_code=400, detail=f"File too large. Max size is {MAX_PDF_SIZE_MB}MB")
            
    content = bytes(content_bytearray)

    try:
        pages = pdf_service.extract_pages_from_pdf(content)
        chunks = pdf_service.chunk_pages(pages)
        vector_service.store_chunks(chunks, source=file.filename, session_id=session_id)
        
        return UploadResponse(
            status="success",
            filename=file.filename,
            pages=len(pages),  # Actual page count from PDF
            chunks=len(chunks)
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/chat", response_model=ChatResponse)
async def chat(request: ChatRequest):
    try:
        print(f"Chat endpoint received history length: {len(request.history)}")
        context_chunks = vector_service.query_similar_chunks(request.message, request.session_id, request.active_files)
        answer = ai_service.generate_answer(request.message, context_chunks, request.history, request.active_files)
        
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
