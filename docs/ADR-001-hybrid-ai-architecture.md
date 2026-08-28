# ADR 001: Hybrid Cloud-to-Local AI Architecture

## Context
LectureAI requires processing large audio/video files for college lectures. Cloud APIs (Groq, Gemini) offer incredible speed and efficiency. However, API rate limits or network failures can interrupt the workflow. The user is equipped with a powerful local machine (RTX 4060 GPU, 32GB RAM) capable of running these models natively.

## Decision
We implemented a **Hybrid Fallback Pipeline**:
1. **Primary Layer (Cloud)**: The Next.js backend attempts to use `@google/genai` (Gemini 2.5 Flash) and `groq-sdk` (Whisper) for near-instant processing.
2. **Fallback Layer (Local)**: If the cloud provider fails, the Next.js API transparently routes the payload to a local Python FastAPI proxy (`http://127.0.0.1:8000/v1`).
3. **Local Execution**: The Python proxy (`backend/main.py`) acts as a drop-in replacement. It executes `faster-whisper` on NVIDIA CUDA and streams summarization requests to local `Ollama` (`gemma4:e4b`).

## Consequences
* **High Availability**: The app never crashes due to API limits. It gracefully degrades to local hardware.
* **Cost Efficiency**: Students can rely on free cloud tiers and seamlessly overflow to their own hardware.
* **Separation of Concerns**: Node.js handles UI/Routing, Python handles raw model execution.
