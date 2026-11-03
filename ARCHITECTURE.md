# LectureAI Architecture Specification

This document provides a comprehensive overview of the LectureAI architecture, system design, data flows, and engineering patterns.

---

## 🎯 Design Philosophy

1. **Separation of Concerns**: Type-safe Server Actions orchestrate heavy backend processing, while modern React 19 Client Components handle responsive UI state.
2. **Deterministic Outputs**: AI summarization enforces strict JSON Schema contracts via Google Gemini (`responseJsonSchema`) and Groq/OpenAI function schemas to eliminate parsing hallucinations.
3. **High-Availability Hybrid Topology**: Next.js cloud APIs seamlessly fall back to local hardware acceleration (NVIDIA RTX 4060 CUDA Whisper + local Ollama proxy) when cloud rate limits are exceeded.
4. **Security-First Media Ingestion**: Defense-in-depth protections include binary magic-byte validation, SSRF filtering against private network interfaces, and parameterized CLI execution.
5. **Zero-Configuration Portability**: Works uniformly across local development (Windows/macOS/Linux), containerized Docker runtimes, and serverless edge hosts (Vercel).

---

## 🏛️ System Architecture

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                             Client UI Layer                                 │
│                               (React 19)                                    │
│                                                                             │
│  ┌──────────────┐  ┌───────────────┐  ┌────────────────┐  ┌──────────────┐  │
│  │  UploadForm  │  │ NotesDisplay  │  │ 3D Flashcards  │  │ MediaPlayer  │  │
│  │ (File/YT/URL)│  │ (8 View Tabs) │  │  (Flip Study)  │  │ (Floating)   │  │
│  └──────┬───────┘  └───────▲───────┘  └────────▲───────┘  └──────▲───────┘  │
└─────────┼──────────────────┼───────────────────┼─────────────────┼──────────┘
          │                  │                   │                 │
          ▼                  │                   │                 │
┌──────────────────────────────────────────────────────────────────┴──────────┐
│                         Next.js 15 App Router                               │
│                                                                             │
│  ┌─────────────────────────┐             ┌───────────────────────────────┐  │
│  │ app/page.tsx            │             │ app/api/limits/route.ts       │  │
│  │ app/layout.tsx          │             │ app/api/transcribe/route.ts   │  │
│  └──────────┬──────────────┘             └───────────────────────────────┘  │
└─────────────┼───────────────────────────────────────────────────────────────┘
              ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                      Server Actions Mutation Layer                          │
│                                                                             │
│  actions/transcription.ts -> createTranscriptionMutation()                  │
│   ├── Step 1: File integrity & magic-byte validation (lib/file-security.ts) │
│   ├── Step 2: Rate limit check (lib/rate-limiter.ts)                        │
│   ├── Step 3: Media acquisition & extraction (lib/youtube.ts, lib/ffmpeg.ts)│
│   ├── Step 4: Speech-to-Text transcription (lib/ai.ts)                      │
│   ├── Step 5: Structured note synthesis (lib/ai.ts -> Gemini/Groq)          │
│   └── Step 6: Temp file cleanup & result caching                            │
└─────────────┬───────────────────────────────────────────────────────────────┘
              │
      ┌───────┴───────────────────────────────┐
      ▼                                       ▼
┌─────────────────────────────┐   ┌───────────────────────────────────────────┐
│     Cloud AI Providers      │   │          Local Hybrid Proxy               │
│                             │   │          (FastAPI on Port 8000)           │
│ 1. Google Gemini 2.5 Flash  │   │                                           │
│    (@google/genai SDK)      │   │ 1. faster-whisper (NVIDIA CUDA float16)   │
│ 2. Groq Cloud (Whisper L3)  │   │ 2. Ollama Local Proxy (gemma4)            │
│ 3. OpenAI / Deepgram        │   │ 3. 120s Streaming keep-alive              │
└─────────────────────────────┘   └───────────────────────────────────────────┘
```

---

## 📁 Codebase Layout

```
talk2notes/
├── actions/
│   └── transcription.ts          # Server Action entry point ('use server')
├── app/
│   ├── api/                      # Next.js route handlers
│   │   ├── limits/route.ts       # Rate limit queries
│   │   └── transcribe/route.ts   # REST API endpoint
│   ├── layout.tsx                # Metadata & theme structure
│   ├── page.tsx                  # Root client container
│   ├── error.tsx                 # Route error boundary
│   ├── not-found.tsx             # 404 page
│   └── globals.css               # Tailwind CSS & custom animations
├── backend/                      # Python FastAPI local acceleration proxy
│   ├── main.py                   # FastAPI server & route handlers
│   ├── ai_pipeline.py            # faster-whisper (CUDA) & Ollama pipeline
│   └── requirements.txt          # Python dependencies
├── components/                   # React 19 UI components
│   ├── upload.tsx                # Drag-and-drop, YouTube, and URL inputs
│   ├── notes-display.tsx         # Notes viewer, Quiz, and 3D Flashcards
│   ├── media-player.tsx          # Floating PiP player for streaming media
│   ├── history.tsx               # Client-side history drawer
│   ├── progress.tsx              # Multi-step progress bars
│   └── error-boundary.tsx        # React client component error boundaries
├── lib/                          # Core business logic & integrations
│   ├── ai.ts                     # AI provider abstraction (Gemini/Groq/OpenAI)
│   ├── ai-prompts.ts             # System prompts for English & Hinglish
│   ├── ffmpeg.ts                 # Audio extraction, duration & compression
│   ├── file-security.ts          # Magic-byte file validator (native & pure JS)
│   ├── media-downloader.ts       # SSRF-guarded media URL fetcher
│   ├── youtube.ts                # Parameterized yt-dlp wrapper
│   ├── rate-limiter.ts           # Sliding-window rate limiter
│   └── logger.ts                 # Pino structured logger
├── types/
│   └── index.ts                  # Shared TypeScript models and contracts
└── tests/
    └── integration/              # Vitest test suites (128 tests)
```

---

## 🔄 End-to-End Execution Flow

### 1. Ingestion & Pre-Flight Checks

When a user submits a payload:

- **File Upload**: `lib/file-security.ts` reads the initial 12 bytes of the file. It verifies that the magic bytes match authorized audio/video formats (RIFF for WAV, ftyp for MP4/MOV, ID3/MPEG for MP3, etc.).
- **YouTube Link**: `lib/youtube.ts` verifies URL host validity (`youtube.com`, `youtu.be`) and uses `execFile` without shell interpolation to invoke `yt-dlp` or `python -m yt_dlp`.
- **Direct URL**: `lib/media-downloader.ts` parses the hostname and resolves its DNS, verifying that it does not point to internal private subnets (`127.0.0.1`, `10.0.0.0/8`, `172.16.0.0/12`, `192.168.0.0/16`) or link-local cloud metadata endpoints (`169.254.169.254`).

### 2. Audio Processing & Normalization

If the ingested file is a video:

- `lib/ffmpeg.ts` executes an extraction command converting the video stream into a normalized 16kHz mono MP3 or WAV file.
- If the audio duration or size exceeds provider limits (>24MB), FFmpeg automatically downsamples bitrate while preserving vocal clarity.
- Platform-native detection resolves `ffmpeg` and `ffprobe` binaries via `where` on Windows and `existsSync` / `which` on Unix.

### 3. Speech-to-Text Transcription

- **Primary Cloud**: Sent to Groq's `whisper-large-v3` API or OpenAI's Whisper API.
- **Local Fallback**: If cloud credentials are missing or rate limits (HTTP 429) occur, the request is dispatched to `http://localhost:8000/v1/audio/transcriptions`. The local FastAPI server loads `faster-whisper` on NVIDIA RTX 4060 with CUDA acceleration in `float16` precision.

### 4. Structured Synthesis & Flashcards Generation

- The transcription is passed to the AI summarization engine with the selected language target (`English` or `Hinglish`).
- **Google Gemini 2.5 Flash**: Invoked using `@google/genai` with `responseMimeType: 'application/json'` and `responseJsonSchema`. The strict schema guarantees typed fields:
  - `summary`: Bulleted executive overview.
  - `detailedNotes`: Markdown formatted conceptual sections.
  - `keyConcepts`: Concept titles and explanations.
  - `definitions`: Terminology glossary.
  - `examples`: Problem statements with step-by-step solutions.
  - `quiz`: Multiple-choice questions with answer keys and rationales.
  - `flashcards`: Study cards with `front`, `back`, `category`, and `priority` (`high` | `medium` | `low`).
  - `actionItems`: Practice items and follow-up study recommendations.

---

## 📇 Flashcards Interactive Architecture

The flashcards feature in `components/notes-display.tsx` provides an interactive study experience:

- **3D Perspective Flip**: Implemented using CSS `perspective: 1000px`, `transform-style: preserve-3d`, and `transform: rotateY(180deg)`.
- **Priority Visuals**: Flashcards display color-coded priority badges:
  - `High`: Red badge for core exam concepts.
  - `Medium`: Yellow badge for supplementary definitions.
  - `Low`: Blue badge for contextual examples.
- **State Preservation**: The current card index and flip state are managed in local component state with keyboard and button navigation.

---

## 🛡️ Security & Reliability Architecture

| Threat / Concern                       | Mitigation Architecture                                                                                              | Location                                 |
| -------------------------------------- | -------------------------------------------------------------------------------------------------------------------- | ---------------------------------------- |
| **Command Injection**                  | Switched from `exec` with string formatting to `execFile` with separate argument arrays.                             | `lib/youtube.ts`                         |
| **Server-Side Request Forgery (SSRF)** | IP address validation blocking loopback (`127.x`), RFC 1918 subnets, and AWS/GCP metadata (`169.254.169.254`).       | `lib/media-downloader.ts`                |
| **Malicious File Uploads**             | Pure-JS magic-byte header inspection (RIFF, ftyp, ID3, OggS, fLaC, Matroska) rather than trusting client MIME types. | `lib/file-security.ts`                   |
| **API Rate Limits (429)**              | Sliding-window memory rate limiter + automatic local proxy fallback (FastAPI + CUDA).                                | `lib/rate-limiter.ts`, `backend/main.py` |
| **Serverless Deployment Crashes**      | Graceful `try/catch` wrappers around optional native C++ bindings with pure TypeScript fallbacks.                    | `lib/file-security.ts`, `lib/ffmpeg.ts`  |
| **Windows Build Symlink Crashes**      | Gated Next.js `output: 'standalone'` behind `process.env.NEXT_STANDALONE === 'true'`.                                | `next.config.js`                         |

---

## 🌐 Supported Environment Configurations

| Environment Variable       | Description                                     | Default              |
| -------------------------- | ----------------------------------------------- | -------------------- |
| `AI_PROVIDER`              | Active AI provider (`gemini`, `groq`, `openai`) | `groq`               |
| `GEMINI_API_KEY`           | Google Gemini API key for Gemini 2.5 Flash      | Optional             |
| `GROQ_API_KEY`             | Groq API key for Whisper Large v3               | Optional             |
| `GROQ_TRANSCRIPTION_MODEL` | Transcription model identifier                  | `whisper-large-v3`   |
| `GROQ_SUMMARIZATION_MODEL` | Summarization model identifier                  | `openai/gpt-oss-20b` |
| `OPENAI_BASE_URL`          | Base URL for OpenAI-compatible local proxy      | Optional             |
| `FFMPEG_PATH`              | Explicit path to `ffmpeg` binary                | Auto-detected        |
| `FFPROBE_PATH`             | Explicit path to `ffprobe` binary               | Auto-detected        |
| `NEXT_STANDALONE`          | Enable Next.js standalone container packaging   | `false`              |
