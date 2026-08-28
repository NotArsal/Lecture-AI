# Quick Start - 5 Minutes to First Transcription

Get LectureAI running in 5 minutes with **free Groq API** (no credit card needed!)

ðŸŒ **Want to try it first?** Check out the [live demo](https://LectureAI.fly.dev) before installing!

## Prerequisites

- âœ… Node.js 18.18+ installed
- âœ… pnpm 8+ installed
- âœ… FFmpeg installed
- âœ… Groq API key (free, get in 30 seconds!)

## ðŸš€ Installation (3 Steps)

### 1. Clone & Install

```bash
git clone https://github.com/taufiqelrahman/LectureAI.git
cd LectureAI
pnpm install
```

### 2. Get Free API Key

**Option A: Groq (Recommended - Free!)** ðŸ†“

1. Go to: https://console.groq.com/keys
2. Sign up with Google/GitHub (30 seconds)
3. Click "Create API Key"
4. Copy key starting with `gsk_...`

**Option B: OpenAI (Requires Payment)** ðŸ’³

- Get key: https://platform.openai.com/api-keys

### 3. Configure

```bash
# Copy example config
cp .env.example .env

# Edit and add your API key
nano .env
```

Add your Groq key:

```env
AI_PROVIDER=groq
GROQ_API_KEY=gsk_your_actual_key_here
GROQ_TRANSCRIPTION_MODEL=whisper-large-v3
GROQ_SUMMARIZATION_MODEL=openai/gpt-oss-20b
```

## â–¶ï¸ Run

```bash
pnpm dev
```

Open http://localhost:3000 ðŸŽ‰

## ðŸŽ¯ Your First Transcription

**From File:**

1. **Select Language:** Choose ðŸ‡¬ðŸ‡§ English or ðŸ‡®ðŸ‡© Indonesian
2. **Upload:** Drag & drop an audio/video file
3. **Wait:** Processing takes 30s - 3 min (depending on file size)
4. **View:** See your formatted transcript with paragraphs, sections, and structured notes
5. **Download:** Export notes as JSON/Markdown or transcript as TXT

**From YouTube URL:** (requires yt-dlp - see [Setup Guide](SETUP.md))

1. **Toggle to YouTube mode**
2. **Select Language:** Choose ðŸ‡¬ðŸ‡§ English or ðŸ‡®ðŸ‡© Indonesian
3. **Paste URL:** Enter YouTube video link
4. **Wait:** Download + process takes 1-5 min
5. **View:** Formatted transcript and notes with auto-compression for large videos

**Access History:**

1. **Click "Show History"** button below the title
2. **Browse** past transcriptions sorted by date
3. **Click any item** to restore its complete notes
4. **Delete** individual items by hovering and clicking the trash icon
5. **Clear All** to remove all history (with confirmation)

## ðŸŒ Language Features

**English:** Original transcription and notes in English

**Indonesian:**

- Automatic transcript translation to Bahasa Indonesia
- Notes generated in Indonesian
- Special handling for Academic content (preserves Original Language text with harakat)

## ðŸ“ Supported Formats

**Audio:** MP3, WAV, M4A, AAC, OGG, FLAC

**Video:** MP4, MKV, MOV, AVI, WEBM

## ðŸ”§ FFmpeg Setup

If you don't have FFmpeg:

```bash
# macOS
brew install ffmpeg

# Ubuntu/Debian
sudo apt install ffmpeg

# Verify
ffmpeg -version
```

## ðŸ†š Provider Comparison

| Feature         | Groq (Default) | OpenAI           |
| --------------- | -------------- | ---------------- |
| **Cost**        | ðŸ†“ Free        | ðŸ’° Paid          |
| **Setup**       | 30 seconds     | Need credit card |
| **Speed**       | âš¡ Very Fast   | Normal           |
| **Quality**     | âœ… Excellent   | âœ… Excellent     |
| **Daily Limit** | ~240 hours     | Depends on plan  |

## â“ Common Issues

| Problem          | Solution                                                   |
| ---------------- | ---------------------------------------------------------- |
| FFmpeg not found | Install: `brew install ffmpeg` (macOS)                     |
| Port 3000 in use | Run: `PORT=3001 pnpm dev`                                  |
| API key invalid  | Check `.env` has correct key (starts with `gsk_` for Groq) |

| Error 429 quota | Using OpenAI? Switch to Groq (free!) |

``````

## ðŸ“š Next Steps

`````

- Read [Groq Setup Guide](GROQ-SETUP.md) for detailed configuration

- Check [Troubleshooting](TROUBLESHOOTING.md) if you hit issuesOpen http://localhost:3000

- See [Setup Guide](SETUP.md) for advanced configuration

**Get API Keys:**

## ðŸ’¡ Pro Tips

## 5. Use

1. **Start with Groq** - It's free and fast!

2. **Use files < 10MB** - For fastest processing- OpenAI: https://platform.openai.com/api-keys## Your First Transcription

3. **Video files auto-extract audio** - No need to convert manually

4. **Files 10-25MB auto-compress** - But may take longer1. Upload an audio/video file (drag & drop)



---2. Wait for processing (30s - 3min depending on file size)- Groq (faster): https://console.groq.com



**Total time:** 5 minutes â±ï¸  3. View your structured notes

**Cost:** $0 (with Groq) ðŸ’¸

**Next:** Upload your first lecture! ðŸŽ“4. Download as JSON or Markdown1. **Open the app:** http://localhost:3000




## Supported Formats## 3. Install FFmpeg2. **Upload a file:** Drag & drop an audio/video file



**Audio:** MP3, WAV, M4A, AAC, OGG, FLAC  3. **Wait:** Processing takes a few seconds to minutes depending on file size

**Video:** MP4, MKV, MOV, AVI, WEBM

````bash4. **View notes:** See your structured lecture notes

## Common Issues

# macOS5. **Download:** Export as JSON or Markdown

| Problem | Solution |

|---------|----------|brew install ffmpeg

| FFmpeg not found | Install: `brew install ffmpeg` (macOS) |

| Port 3000 in use | Run: `PORT=3001 pnpm dev` |## Example API Keys

| API key invalid | Check `.env` has correct key |

| Upload fails | Max file size is 100MB by default |# Ubuntu/Debian



## Next Stepssudo apt install ffmpeg### OpenAI (Recommended)



- **Full setup:** [SETUP.md](SETUP.md)

- **CLI commands:** [CLI-REFERENCE.md](CLI-REFERENCE.md)

- **Architecture:** [ARCHITECTURE.md](ARCHITECTURE.md)# Verify```env

- **Contributing:** [CONTRIBUTING.md](CONTRIBUTING.md)

ffmpeg -versionAI_PROVIDER=openai

## Production Deployment

```OPENAI_API_KEY=sk-proj-xxxxx

### Vercel (Recommended)

```bash````

vercel

```## 4. Run



### DockerGet key: https://platform.openai.com/api-keys

```bash

docker-compose up -d```bash

```

pnpm dev### Groq (Faster, Free Tier)

---

```

**That's it!** ðŸŽ‰ For detailed documentation, see [README.md](README.md)

````env

Open http://localhost:3000AI_PROVIDER=groq

GROQ_API_KEY=gsk_xxxxx

## 5. Use```



1. Upload an audio/video file (drag & drop)Get key: https://console.groq.com

2. Wait for processing (30s - 3min depending on file size)

3. View your structured notes## Test Files

4. Download as JSON or Markdown

Try with these sample files:

## Supported Formats

- Short audio clip (30 seconds)

**Audio:** MP3, WAV, M4A, AAC, OGG, FLAC  - Lecture recording (5-10 minutes)

**Video:** MP4, MKV, MOV, AVI, WEBM- YouTube video (download with youtube-dl)



## Common Issues## Common Commands



| Problem | Solution |```bash

|---------|----------|pnpm dev              # Start development

| FFmpeg not found | Install: `brew install ffmpeg` (macOS) |pnpm build           # Build for production

| Port 3000 in use | Run: `PORT=3001 pnpm dev` |pnpm start               # Run production build

| API key invalid | Check `.env` has correct key |pnpm lint            # Check code quality

| Upload fails | Max file size is 100MB by default |```



## Next Steps## Troubleshooting Quick Fixes



- **Full setup:** [SETUP.md](SETUP.md)### FFmpeg not found

- **CLI commands:** [CLI-REFERENCE.md](CLI-REFERENCE.md)

- **Architecture:** [ARCHITECTURE.md](ARCHITECTURE.md)```bash

- **Contributing:** [CONTRIBUTING.md](CONTRIBUTING.md)# macOS

brew install ffmpeg

## Production Deployment

# Ubuntu

### Vercel (Recommended)sudo apt install ffmpeg

```bash```

vercel

```### API key error



### DockerCheck that `.env` has:

```bash

docker-compose up -d```env

```OPENAI_API_KEY=sk-xxxxx  # No spaces, no quotes

`````

---

### Port 3000 in use

**That's it!** ðŸŽ‰ For detailed documentation, see [README.md](README.md)

```bash
# Use different port
PORT=3001 pnpm dev

# Or kill the process
lsof -ti:3000 | xargs kill
```

### Upload fails

- Check file is < 100MB
- Verify format: MP3, WAV, MP4, MOV, etc.
- Ensure `uploads/` directory exists

## What's Next?

- ðŸ“– Read [README.md](README.md) for full documentation
- ðŸ—ï¸ Check [ARCHITECTURE.md](ARCHITECTURE.md) to understand the code
- ðŸ¤ See [CONTRIBUTING.md](CONTRIBUTING.md) to contribute
- ðŸ“ Review [PROJECT-STRUCTURE.md](PROJECT-STRUCTURE.md) for file organization

## Getting Help

- **Issues:** https://github.com/taufiqelrahman/LectureAI/issues
- **Discussions:** https://github.com/taufiqelrahman/LectureAI/discussions

## Advanced Usage

### Change AI Provider

```env
# Use Groq instead of OpenAI
AI_PROVIDER=groq
GROQ_API_KEY=gsk_xxxxx
```

### Increase Upload Limit

```env
MAX_FILE_SIZE_MB=200
```

### Custom Models

```env
OPENAI_SUMMARIZATION_MODEL=gpt-4-turbo-preview
```

## Production Deployment

### Vercel (Easiest)

```bash
pnpm install -g vercel
vercel
```

### Docker

```bash
docker-compose up -d
```

### Manual

```bash
pnpm build
pnpm start
```

---

**That's it!** You're ready to transcribe lectures. ðŸŽ‰
``````
