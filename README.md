# LectureAI 🎙️📝

[![Build Status](https://img.shields.io/github/actions/workflow/status/NotArsal/Lecture-AI/ci.yml?branch=main)](https://github.com/NotArsal/Lecture-AI/actions)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Next.js](https://img.shields.io/badge/Next.js-15.5-black)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19-blue)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.3-blue)](https://www.typescriptlang.org/)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](CONTRIBUTING.md)

> Transform audio and video lectures into structured, comprehensive notes using AI

LectureAI is an open-source web application that automatically transcribes audio and video files and generates well-organized lecture notes complete with executive summaries, key concepts, definitions, example problems, interactive quizzes, **interactive 3D flashcards**, and action items.

🌐 **[Live Demo](https://LectureAI.fly.dev)** | 📖 **[Documentation](DOCS.md)** | ⚡ **[Quick Start](QUICKSTART.md)** | 🆓 **[Groq & Gemini Setup](SETUP.md)** | 🛡️ **[Rate Limits](RATE-LIMITS.md)** | 🔍 **[Troubleshooting](TROUBLESHOOTING.md)**

---

## ✨ Features

- 💰 **Free & Generous Tiers**: Default Groq Whisper integration and Google Gemini 2.5 Flash support.
- 🎵 **Multi-format Ingestion**: Upload MP3, WAV, M4A, MP4, MKV, MOV, FLAC, and WebM.
- 🎬 **YouTube Extraction**: Transcribe directly from YouTube URLs (via resilient `yt-dlp` / `python -m yt_dlp`).
- 🔗 **Direct URL & Google Drive Download**: Ingest media from public links and Google Drive with anti-SSRF protections.
- 🎧 **In-Browser Audio Playback**: Listen to uploaded audio/video lectures and URL downloads directly with HTTP 206 byte-range streaming (`/api/media`).
- 🤖 **Next-Gen AI Summarization**: Google Gemini 2.5 Flash via `@google/genai` with strict `responseJsonSchema`, Groq Whisper, OpenAI, or Anthropic.
- ⚡ **Concurrent Pipeline**: Transcript formatting and structured note summarization execute in parallel (`Promise.all`), cutting processing latency by ~6 seconds.
- 🔄 **Hybrid Local Fallback**: Seamless fallback to local Python FastAPI proxy (`backend/main.py`) powered by `faster-whisper` on NVIDIA CUDA (RTX 4060) and local Ollama (`gemma4`).
- 🇮🇳 **Bilingual Lecture Dialect**: Optimized for **English** and **Hinglish** (Hindi-English colloquial code-switching used in college classrooms).
- 🍱 **Bento Analytics Dashboard**: Visual overview cards for reading pace, flashcards, quiz status, and core concept badges.
- 📇 **Interactive Flashcards**: 3D flip card study mode with difficulty/priority tags (High, Medium, Low) and flip animations.
- 🎯 **Interactive Quiz**: AI-generated multiple-choice questions with instant scoring, feedback, and rationale.
- 📝 **Formatted Transcript**: AI-structured transcript organized into coherent paragraphs, timestamps, and section headers.
- 📊 **Structured Study Notes**: Detailed notes with summaries, definitions, sample problems, solutions, and action items.
- 🎵 **Draggable Floating Media Player**: Picture-in-Picture player for YouTube videos, Google Drive previews, direct URLs, and local audio streaming with smart edge-snapping.
- 🛡️ **Security Hardened**:
  - Pure-JS magic-byte validation (RIFF, ftyp, ID3, OggS, fLaC, Matroska) supporting audio-in-MP4 containers.
  - Anti-SSRF protection blocking private RFC 1918 subnets, loopbacks, and cloud metadata (`169.254.169.254`).
  - Command injection prevention via parameterized `execFile` argument vectors.
- ☁️ **Vercel Serverless Ready**: Dynamic pure-JS fallbacks when native `.node` binaries or system binaries are not present.
- 📜 **Client History & Restore**: LocalStorage-backed history drawer with one-click restore and individual deletion.

---

## 🚀 Quick Start

### Prerequisites

- Node.js 18.18+ and pnpm 8+
- FFmpeg installed on your system (or available in PATH)
- Python 3.10+ with `yt-dlp` (for YouTube ingestion)
- Free API key from Groq or Google Gemini

### Installation

1. **Clone repository**

```bash
git clone https://github.com/NotArsal/Lecture-AI.git
cd Lecture-AI/talk2notes
```

2. **Install dependencies**

```bash
pnpm install
```

3. **Configure environment variables**

```bash
cp .env.example .env
```

Edit `.env` and provide your API keys:

```env
# AI Provider Configuration
AI_PROVIDER=groq
GROQ_API_KEY=gsk_your_groq_api_key
GROQ_TRANSCRIPTION_MODEL=whisper-large-v3
GROQ_SUMMARIZATION_MODEL=openai/gpt-oss-20b

# Optional: Google Gemini 2.5 Flash (Recommended for structured notes)
GEMINI_API_KEY=your_gemini_api_key

# Optional: Local Fallback (RTX 4060 CUDA Whisper + Ollama)
# OPENAI_BASE_URL=http://localhost:8000/v1
```

4. **Verify FFmpeg & yt-dlp**

```bash
ffmpeg -version
yt-dlp --version
```

5. **Run Development Server**

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) (or the assigned port).

---

## 📖 Usage & Modes

### 1. Ingestion Modes

- **📁 File Upload**: Drag and drop audio or video files up to 500MB (audio is automatically extracted and compressed if video).
- **▶️ YouTube**: Paste any standard or shortened YouTube URL (`youtube.com`, `youtu.be`). Audio is downloaded at optimal bitrate.
- **🔗 Direct URL**: Ingest audio/video files from direct public URLs (with SSRF protection).

### 2. Language Dialects

- **🇬🇧 English**: Standard English lecture transcription and study notes.
- **🇮🇳 Hinglish**: Preserves English technical jargon, formulas, and code while rendering explanatory text in conversational Hinglish.

### 3. Study Views

- **Summary**: Concise bullet points and high-level takeaways.
- **Detailed Notes**: In-depth conceptual explanations with Markdown formatting.
- **Key Concepts**: Core lecture concepts broken down by topic.
- **Definitions**: Glossary of specialized terminology.
- **Examples**: Solved practice problems and derivations.
- **Quiz**: Self-assessment multiple choice questions with instant explanations.
- **Flashcards**: Interactive 3D flip cards for rapid exam revision.
- **Action Items**: Checkable tasks, recommended follow-up readings, and practice problems.
- **Full Transcript**: Segmented transcript with paragraph breaks.

---

## 🏗️ Architecture Overview

```
talk2notes/
├── actions/                  # Next.js Server Actions ('use server')
│   └── transcription.ts      # Core pipeline orchestrator
├── app/                      # Next.js App Router
│   ├── api/                  # API endpoints (/api/limits, /api/transcribe, /api/media)
│   ├── layout.tsx            # Root layout & theme wrapper
│   ├── page.tsx              # Application container
│   └── globals.css           # Tailwind CSS styles
├── backend/                  # Local Python FastAPI Proxy (RTX 4060 CUDA)
│   ├── main.py               # OpenAI-compatible local endpoints
│   ├── ai_pipeline.py        # faster-whisper + Ollama integrations
│   └── requirements.txt      # Python dependencies
├── components/               # React 19 Client Components
│   ├── upload.tsx            # Multi-mode upload form (File, YouTube, URL)
│   ├── notes-display.tsx     # Tabbed notes viewer with 3D Flashcards
│   ├── media-player.tsx      # Picture-in-Picture floating audio/video player
│   ├── history.tsx           # History drawer with restore & delete
│   ├── progress.tsx          # Multi-step animated progress indicators
│   └── error-boundary.tsx    # React error boundaries
├── lib/                      # Core Services & Utilities
│   ├── ai.ts                 # Gemini (@google/genai), Groq, OpenAI client
│   ├── ffmpeg.ts             # Audio extraction, duration & compression
│   ├── file-security.ts      # Magic-byte file validation (Native + pure JS)
│   ├── youtube.ts            # yt-dlp execution & path detection
│   ├── media-downloader.ts   # SSRF-guarded HTTP media fetcher
│   └── rate-limiter.ts       # In-memory sliding window rate limiter
├── types/                    # Shared TypeScript interfaces
│   └── index.ts              # Data contracts and schema types
└── tests/                    # Vitest & Playwright test suites
    └── integration/          # Integration & unit test coverage
```

---

## 🔒 Security Hardening

- **SSRF Mitigation**: `lib/media-downloader.ts` inspects IP addresses prior to downloading, rejecting private RFC 1918 subnets (`10.0.0.0/8`, `172.16.0.0/12`, `192.168.0.0/16`), loopbacks (`127.0.0.1`), and link-local cloud metadata endpoints (`169.254.169.254`).
- **Command Injection Guard**: All external tool invocations (`yt-dlp`, `ffmpeg`) use `child_process.execFile` with separate array arguments rather than executing raw shell strings.
- **Magic-Byte Signature Verification**: Files are validated by inspecting binary headers (RIFF for WAV/AVI, ftyp for MP4/M4A/MOV, ID3 for MP3, OggS for OGG, fLaC for FLAC, Matroska for MKV/WebM) preventing spoofed file uploads.
- **Serverless Resilience**: Gracefully handles missing native modules on platforms like Vercel with zero-dependency pure TypeScript fallbacks.

---

## 🧪 Testing & Verification

```bash
# Run unit & integration tests
pnpm test:run

# Run TypeScript type check
pnpm type-check

# Run code format verification
pnpm format:check

# Run production build
pnpm build
```

---

## 🚢 Deployment

### Vercel (Serverless)

- Push code to GitHub repository `NotArsal/Lecture-AI`.
- Connect repository in Vercel.
- Configure environment variables: `AI_PROVIDER`, `GROQ_API_KEY`, `GEMINI_API_KEY`.
- Pure JS magic-byte and fluent-ffmpeg fallbacks will automatically engage.

### Docker / Self-Hosted

```bash
docker build -t lecture-ai .
docker run -p 3000:3000 --env-file .env lecture-ai
```

---

## 📄 License

This project is licensed under the MIT License. See [LICENSE](LICENSE) for details.
