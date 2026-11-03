# Quick Start - 5 Minutes to First Lecture Notes

Get LectureAI running in 5 minutes with a **free Groq or Google Gemini API key** (no credit card required!)

---

## ⚡ Prerequisites

- Node.js 18.18+ & pnpm 8+ installed
- FFmpeg installed and available in PATH
- Groq or Google Gemini API key (free!)

---

## 🚀 Installation in 3 Steps

### 1. Clone & Install Dependencies

```bash
git clone https://github.com/NotArsal/Lecture-AI.git
cd Lecture-AI/talk2notes
pnpm install
```

### 2. Configure Free AI Keys

Create your `.env` file:

```bash
cp .env.example .env
```

Add your free API key:

```env
AI_PROVIDER=groq
GROQ_API_KEY=gsk_your_groq_api_key_here
GROQ_TRANSCRIPTION_MODEL=whisper-large-v3
GROQ_SUMMARIZATION_MODEL=openai/gpt-oss-20b

# Optional: Google Gemini 2.5 Flash
# GEMINI_API_KEY=your_gemini_api_key_here
```

### 3. Launch the Server

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser! 🎉

---

## 🎯 Generating Your First Notes

### Ingestion Methods:

1. **📁 Upload File**: Drag & drop any audio or video file (MP3, WAV, M4A, MP4, MKV).
2. **▶️ YouTube**: Paste a link to any YouTube lecture or tutorial (requires `yt-dlp`).
3. **🔗 Direct URL**: Paste a link to any public audio or video file.

### Selecting Your Language Dialect:

- **🇬🇧 English**: Standard English lecture transcriptions and study notes.
- **🇮🇳 Hinglish**: Tailored for Indian college classrooms—preserves code, mathematical formulas, and technical terminology in English while providing explanations in natural, conversational Hinglish.

---

## 📚 Exploring Your Lecture Notes

Once processing completes, explore the interactive study tabs:

- **Summary**: Key points, executive overview, and high-level concepts.
- **Detailed Notes**: Structured Markdown notes with sections and definitions.
- **Key Concepts**: Core lecture concepts broken down by topic.
- **Definitions**: Glossary of specialized terminology.
- **Examples**: Step-by-step problem statements and derivations.
- **🎯 Interactive Quiz**: Multiple-choice assessment questions with real-time score calculation and answer explanations.
- **📇 3D Flashcards**: Flip cards with priority ratings (High / Medium / Low) for rapid exam review.
- **Action Items**: Checkable tasks and practice problem assignments.
- **Full Transcript**: Segmented transcription with timestamps.

---

## 📜 Managing History

- All processed lectures are automatically saved to your browser's local storage.
- Click **"Show History"** at the top of the page to browse, reload past lectures with one click, or delete old sessions.
