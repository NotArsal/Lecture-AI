from logger import get_logger
logger = get_logger(__name__)
import os
import tempfile
import uuid
import httpx
from fastapi import FastAPI, UploadFile, File, Form, Request
from fastapi.responses import JSONResponse, StreamingResponse
from fastapi.middleware.cors import CORSMiddleware
from ai_pipeline import transcribe_local

from contextlib import asynccontextmanager
from ai_pipeline import load_whisper_model, unload_whisper_model

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Load ML models into VRAM eagerly on startup so the first request doesn't block
    load_whisper_model()
    yield
    # Clean up ML models on shutdown to release VRAM
    unload_whisper_model()

app = FastAPI(title="LectureAI Local Proxy", version="1.0.0", lifespan=lifespan)


import time
from fastapi import Request

@app.middleware("http")
async def log_requests(request: Request, call_next):
    start_time = time.time()
    response = await call_next(request)
    process_time = time.time() - start_time
    logger.info(f"{request.method} {request.url.path} - {response.status_code} - {process_time:.4f}s")
    return response

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# STT Endpoint compatible with OpenAI's /v1/audio/transcriptions
@app.post("/v1/audio/transcriptions")
@app.post("/audio/transcriptions")
async def audio_transcriptions(
    file: UploadFile = File(...),
    model: str = Form("whisper-1")
):
    logger.info(f"Received transcription request for model: {model}")
    
    # Save temp file
    
    # Save temp file securely
    _, ext = os.path.splitext(file.filename or "")
    unique_filename = f"temp_{uuid.uuid4().hex}{ext}"
    file_path = os.path.join(tempfile.gettempdir(), unique_filename)
    
    with open(file_path, "wb") as f:

        while True:
              chunk = await file.read(1024 * 1024)
              if not chunk:
                  break
              f.write(chunk)
        
    try:
        import asyncio
        transcript = await asyncio.to_thread(transcribe_local, file_path)
    finally:
        if os.path.exists(file_path):
            os.remove(file_path)
            
    return {
        "text": transcript,
        "duration": 0.0,
        "language": "en",
        "segments": []
    }

# Chat Endpoint compatible with OpenAI's /v1/chat/completions
@app.post("/v1/chat/completions")
@app.post("/chat/completions")
async def chat_completions(request: Request):
    logger.info("Received chat completion request, proxying to Ollama...")
    body = await request.json()
    
    # Force model to gemma4:e4b or keep as is
    if "model" in body:
        body["model"] = "gemma4:e4b"
        
    OLLAMA_URL = "http://127.0.0.1:11434/v1/chat/completions"
    
    async def forward():
        async with httpx.AsyncClient() as client:
            async with client.stream("POST", OLLAMA_URL, json=body, headers={"Authorization": "Bearer dummy"}) as r:
                  async for chunk in r.aiter_raw():
                      yield chunk

    return StreamingResponse(forward(), media_type="application/json")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)




