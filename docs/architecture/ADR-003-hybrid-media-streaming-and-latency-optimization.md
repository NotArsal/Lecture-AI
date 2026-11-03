# ADR 003: Hybrid Media Streaming Architecture and Pipeline Latency Optimization

## Status

Accepted

## Date

2026-11-03

## Context

LectureAI was designed as a zero-cloud-storage lecture synthesis tool. However, real-world usage highlighted three key friction points:

1. **Playback Failure for URL Ingestion (Google Drive & Web URLs)**:
   When transcribing from remote URLs (e.g., Google Drive sharing links), the backend downloaded the media and extracted audio, but immediately deleted the local audio file to save disk space and returned the original web URL as `sourceUrl`. The frontend media player rendered `<video src="https://drive.google.com/file/d/.../view">`. Because Google Drive URLs serve HTML web interfaces rather than raw media byte streams, the browser's native HTML5 player threw `Failed to load media`.

2. **Absence of Audio Playback for File Uploads**:
   Users who uploaded lecture audio files (`.mp3`, `.m4a`, `.wav`) wanted to listen back to specific lecture segments while studying their generated notes, flashcards, and quizzes.

3. **Perceived and Backend Latency**:
   - **Frontend**: The `UploadForm` component contained legacy `await new Promise(r => setTimeout(r, ...))` calls intended for progress animation (1s upload, 2s video extraction, 3s compression, and 3s post-summarization), forcing up to **9 seconds of artificial idle waiting** even after the server had finished.
   - **Backend**: In `processAudioPipeline`, formatting the transcript and generating the full structured notes (summary, concepts, definitions, flashcards, quiz) ran sequentially (`await formatTranscript()` followed by `await summarizeTranscript()`), accumulating ~24s of combined LLM latency.

## Decision

We enacted a three-pronged architecture upgrade:

### 1. Hybrid Media Streaming Endpoint (`/api/media`)

- **HTTP Range Streaming**: Created `app/api/media/route.ts` with RFC 7233 byte-range support (HTTP 206 Partial Content) and stream piping (`Readable.toWeb(createReadStream(...))`). This enables smooth audio seeking, scrubbing, and pause/resume in browser native controls.
- **Selective Retention**: For file uploads and URL downloads, the server cleans up bulky video files (which can be hundreds of megabytes) but preserves the compact extracted audio track in `uploads/` to power the local streaming endpoint `/api/media?file=...`.
- **Directory Traversal Protection**: The streaming route enforces strict basename sanitization and path validation to ensure files can only be read from `uploads/`.

### 2. Multi-Provider Embed Support in `MediaPlayer`

- **Google Drive Native Embeds**: Implemented `getGoogleDriveEmbedUrl()` to parse `/file/d/{id}/view` and `?id={id}` patterns, converting them into sandboxed responsive `https://drive.google.com/file/d/{id}/preview` iframe players with an Amber theme.
- **Audio vs Video Separation**: Direct URLs are checked against media MIME types. Audio files (`.mp3`, `.wav`, `.m4a`, `.aac`, `.ogg`) render a clean `<audio>` element rather than a blank `<video>` canvas.
- **Non-blocking Error Recovery**: If an external host blocks playback or requires cookies, `MediaPlayer` presents a prominent **"Open source ↗"** escape hatch rather than a dead-end error box.

### 3. Pipeline Concurrency & Non-Blocking UI

- **Parallel LLM Synthesis**: In `actions/transcription.ts`, wrapped `formatTranscript()` and `summarizeTranscript()` in `Promise.all()`. Since both consume the raw transcript text independently, they execute concurrently on the AI provider (Gemini 2.5 Flash / Groq), shaving ~6 seconds off backend processing.
- **Non-Blocking Progress Ticker**: In `components/upload.tsx`, replaced all blocking `await setTimeout()` sleeps with dynamic non-blocking ticker intervals. The millisecond the Server Action resolves, the ticker is cleared, progress hits 100%, and notes render immediately.

## Consequences

- **Reliable Playback**: Google Drive, YouTube, and direct audio/video URLs play without CORS or decoder failures.
- **Audio Scrubbing**: Students can listen to uploaded lectures side-by-side with generated study notes, quizzes, and 3D flashcards.
- **Substantial Speedup**: User-perceived processing time is reduced by **12 to 15 seconds** per transcription.
- **Backward Compatibility**: Fully compatible with existing LocalStorage history records and test suites (153 unit & integration tests passing).
