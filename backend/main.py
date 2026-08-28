import os
import httpx
from fastapi import FastAPI, UploadFile, File, Form, Request
from fastapi.responses import JSONResponse, StreamingResponse
from fastapi.middleware.cors import CORSMiddleware
from ai_pipeline import transcribe_local

app = FastAPI(title="LectureAI Local Proxy", version="1.0.0")

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
    print(f"Received transcription request for model: {model}")
    
    # Save temp file
    file_path = f"temp_{file.filename}"
    with open(file_path, "wb") as f:
        f.write(await file.read())
        
    try:
        transcript = transcribe_local(file_path)
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
    print("Received chat completion request, proxying to Ollama...")
    body = await request.json()
    
    # Force model to gemma4:e4b or keep as is
    if "model" in body:
        body["model"] = "gemma4:e4b"
        
    OLLAMA_URL = "http://127.0.0.1:11434/v1/chat/completions"
    
    async def forward():
        async with httpx.AsyncClient() as client:
            req = client.build_request(
                method="POST", 
                url=OLLAMA_URL, 
                json=body,
                headers={"Authorization": "Bearer dummy"}
            )
            r = await client.send(req, stream=True)
            async for chunk in r.aiter_raw():
                yield chunk

    return StreamingResponse(forward(), media_type="application/json")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
