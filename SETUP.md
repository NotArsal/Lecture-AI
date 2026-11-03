# LectureAI Setup Guide

This guide covers local development setup, AI provider configurations, local hybrid GPU fallback, and production deployment options.

---

## 📋 Prerequisites Checklist

- [x] **Node.js**: `18.18.0` or higher (tested on Node 20 & 22)
- [x] **pnpm**: `8.0.0` or higher (recommended: `pnpm 9+`)
- [x] **FFmpeg**: Required for audio extraction and compression
- [x] **Python 3.10+**: Required for `yt-dlp` and local CUDA acceleration proxy
- [x] **Git**: For source version control
- [x] **AI Provider Key**: Free Groq API key or Google Gemini API key

---

## 🛠️ Step-by-Step Local Setup

### 1. Clone the Repository

```bash
git clone https://github.com/NotArsal/Lecture-AI.git
cd Lecture-AI/talk2notes
```

### 2. Install Node Dependencies

```bash
pnpm install
```

### 3. Install System Binaries

#### FFmpeg

- **Windows**: Download from [ffmpeg.org](https://ffmpeg.org/download.html), extract, and add the `bin/` folder to your Windows system `PATH`.
- **macOS**: `brew install ffmpeg`
- **Linux (Ubuntu/Debian)**: `sudo apt update && sudo apt install ffmpeg`

Verify FFmpeg:

```bash
ffmpeg -version
ffprobe -version
```

#### yt-dlp (For YouTube Video Transcriptions)

- **Windows**:
  ```bash
  pip install yt-dlp
  # or
  winget install yt-dlp
  ```
- **macOS**: `brew install yt-dlp`
- **Linux**: `pip install yt-dlp`

Verify yt-dlp:

```bash
yt-dlp --version
# or
python -m yt_dlp --version
```

---

## 🔑 AI Provider Configuration

Copy the sample environment file:

```bash
cp .env.example .env
```

### Option A: Free Tier via Groq (Default)

Groq provides high-speed Whisper transcription and LLM inference.

1. Sign up for a free key at [console.groq.com](https://console.groq.com/).
2. Add to `.env`:
   ```env
   AI_PROVIDER=groq
   GROQ_API_KEY=gsk_your_groq_api_key_here
   GROQ_TRANSCRIPTION_MODEL=whisper-large-v3
   GROQ_SUMMARIZATION_MODEL=openai/gpt-oss-20b
   ```

### Option B: Google Gemini 2.5 Flash (Recommended for Structured Notes)

Gemini 2.5 Flash delivers structured lecture summaries with native JSON Schema enforcement:

1. Create a free API key at [Google AI Studio](https://aistudio.google.com/).
2. Add to `.env`:
   ```env
   GEMINI_API_KEY=your_gemini_api_key_here
   ```

### Option C: OpenAI

```env
AI_PROVIDER=openai
OPENAI_API_KEY=sk-your_openai_api_key_here
OPENAI_TRANSCRIPTION_MODEL=whisper-1
OPENAI_SUMMARIZATION_MODEL=gpt-4o
```

---

## ⚡ Local GPU Fallback (NVIDIA CUDA + Ollama)

If you have a dedicated GPU (e.g., NVIDIA RTX 4060) and want 100% offline uptime during cloud rate limits:

1. **Navigate to the backend directory**:

   ```bash
   cd backend
   ```

2. **Create a Python virtual environment & install requirements**:

   ```bash
   python -m venv venv
   # On Windows:
   .\venv\Scripts\activate
   # On Linux/macOS:
   source venv/bin/activate

   pip install -r requirements.txt
   ```

3. **Start the local FastAPI proxy**:

   ```bash
   python main.py
   # Runs on http://127.0.0.1:8000
   ```

4. **Point Next.js to the local endpoint** (in your main `.env`):
   ```env
   OPENAI_BASE_URL=http://localhost:8000/v1
   ```

---

## ▶️ Running the Application

Start the Next.js development server:

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) (or the active port shown in terminal).

---

## 🧪 Quality Assurance & Tests

Run the comprehensive test suite and validation gates:

```bash
# 1. Run all integration tests (128 passing tests)
pnpm test:run

# 2. Check TypeScript types
pnpm type-check

# 3. Verify Prettier code formatting
pnpm format:check

# 4. Run production build
pnpm build
```

---

## 🚢 Production Deployment

### Vercel

1. Push your changes to GitHub.
2. Link the repository in the Vercel Dashboard.
3. Configure Environment Variables:
   - `AI_PROVIDER=groq` (or `gemini`)
   - `GROQ_API_KEY` or `GEMINI_API_KEY`
4. Deploy! The application includes automatic pure-JS fallbacks for magic-byte verification and serverless compatibility.

### Docker

```bash
docker build -t lecture-ai .
docker run -p 3000:3000 --env-file .env lecture-ai
```
