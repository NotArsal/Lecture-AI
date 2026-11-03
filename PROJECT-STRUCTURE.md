# LectureAI Project Structure

```
talk2notes/
├── actions/                          # Next.js Server Actions ('use server')
│   └── transcription.ts              # Core mutation orchestrator for file/URL/YouTube
│
├── app/                              # Next.js 15 App Router
│   ├── api/                          # Route handlers
│   │   ├── limits/route.ts           # Rate limit status endpoint
│   │   └── transcribe/route.ts       # REST transcription API
│   ├── test-error-boundary/          # Error boundary verification page
│   ├── error.tsx                     # App-level error boundary
│   ├── global-error.tsx              # Root global error boundary
│   ├── layout.tsx                    # Root layout, metadata & headers
│   ├── loading.tsx                   # Top-level suspense loading skeleton
│   ├── not-found.tsx                 # Custom 404 page
│   ├── page.tsx                      # Main application view container
│   └── globals.css                   # Global styles & Tailwind CSS
│
├── backend/                          # Local Acceleration Proxy (Python / CUDA)
│   ├── main.py                       # FastAPI server (OpenAI-compatible endpoints)
│   ├── ai_pipeline.py                # faster-whisper (float16) + Ollama proxy
│   ├── logger.py                     # Backend structured logging
│   └── requirements.txt              # Python dependencies
│
├── components/                       # React 19 Client Components
│   ├── upload.tsx                    # Ingestion form (Drag-and-drop, YouTube, URL)
│   ├── notes-display.tsx             # Tabbed notes viewer, Quiz, and 3D Flashcards
│   ├── media-player.tsx              # Picture-in-Picture floating media player
│   ├── history.tsx                   # Client-side history drawer & local restore
│   ├── progress.tsx                  # Animated multi-step progress bar
│   ├── processing-steps.tsx          # Step status checklist
│   ├── processing-tips.tsx           # Contextual tips during long processing
│   └── error-boundary.tsx            # Component-level React error boundaries
│
├── lib/                              # Core Business Logic & Services
│   ├── ai.ts                         # AI client abstraction (Gemini 2.5 Flash, Groq, OpenAI)
│   ├── ai-prompts.ts                 # System prompts for English and Hinglish
│   ├── ai-utils.ts                   # Token estimation and transcript cropping
│   ├── ffmpeg.ts                     # Audio extraction, duration & compression
│   ├── file-security.ts              # Binary magic-byte file signature validator
│   ├── media-downloader.ts           # SSRF-guarded media URL downloader
│   ├── youtube.ts                    # Parameterized yt-dlp execution & path resolver
│   ├── rate-limiter.ts               # In-memory sliding window rate limiter
│   ├── transcription-providers.ts    # Transcription provider dispatchers
│   ├── upload.ts                     # Upload directory and temp file management
│   └── logger.ts                     # Pino structured logging wrapper
│
├── types/                            # Shared TypeScript Definitions
│   └── index.ts                      # Interfaces (LectureNotes, Flashcard, QuizQuestion)
│
├── utils/                            # Shared Utilities
│   ├── format-api-error.ts           # User-friendly API error formatter
│   └── format-api-error.test.ts      # Unit tests for error formatting
│
├── docs/                             # Architecture Decision Records & Specs
│   ├── architecture/
│   │   ├── ADR-001-Local-Fallback.md
│   │   └── ADR-002-serverless-native-fallback.md
│   └── ADR-001-hybrid-ai-architecture.md
│
├── tests/                            # Vitest Test Suites
│   └── integration/                  # End-to-end integration tests (128 passing tests)
│
├── public/                           # Static assets & icons
├── uploads/                          # Temporary working directory (gitignored)
│
├── next.config.js                    # Next.js configuration & standalone gate
├── tsconfig.json                     # TypeScript compilation config
├── package.json                      # Project manifest & dependencies
└── pnpm-lock.yaml                    # Deterministic dependency lockfile
```
