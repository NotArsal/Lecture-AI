# ADR 1: Local Python Proxy Fallback for High Availability AI Processing

## Status
Accepted

## Context
LectureAI relies heavily on cloud AI providers (Groq for Whisper STT, Gemini for LLM summarization). As a free or low-tier application, we frequently hit rate limits (429 Too Many Requests) and API key exhaustion. The Next.js frontend alone cannot fallback to local hardware seamlessly due to browser memory limits and the lack of robust Node.js bindings for CUDA-accelerated Whisper models and local LLMs.

## Decision
We implemented a hybrid architecture:
1. **Primary**: Next.js Server Actions calling Groq/Gemini APIs.
2. **Secondary (Fallback)**: A local Python FastAPI server (backend/main.py) running on port 8000. 
3. The frontend lib/ai.ts intercepts network failures from primary APIs. If OPENAI_BASE_URL is set, it redirects the request to the local Python server, treating it as an OpenAI-compatible endpoint.
4. The local server uses faster-whisper (running on RTX 4060 via CUDA) for STT and Ollama for local LLM extraction.

## Consequences
- 100% uptime for local deployments even when cloud limits are exhausted.
- Full privacy for local processing.
- Automatically leverages NVIDIA hardware without Node.js friction.
- Whisper model is instantiated as a global Singleton to prevent CUDA OOM.
