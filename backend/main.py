from fastapi import FastAPI

app = FastAPI(title="Porsesh AI API")

@app.get("/health")
def health_check():
    return {"status": "ok", "message": "Porsesh AI backend is running"}
