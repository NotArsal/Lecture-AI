# ADR 002: Serverless and Cross-Platform Fallback Strategy for Native Media Processing

## Status

Accepted

## Context

LectureAI was enhanced with high-performance native C++ / Rust bindings (`native-media`) for file magic-byte validation and audio extraction/compression. However:

1. Serverless hosting platforms like Vercel Functions and Cloudflare Pages run in ephemeral Linux containers where local Windows/macOS `.node` native binaries cannot execute.
2. Next.js standalone output (`output: 'standalone'`) on Windows machines without developer symlink privileges causes `EPERM: operation not permitted` during build.
3. Network-based ingestion (YouTube URLs, direct audio/video URLs) exposed vectors for command injection (shell expansion) and Server-Side Request Forgery (SSRF) targeting internal networks (`127.0.0.1`, `10.x.x.x`, `192.168.x.x`, and cloud metadata services `169.254.169.254`).

## Decision

We instituted a multi-tier fallback and security hardening layer:

1. **Graceful Native-to-JavaScript Fallback**:
   - `lib/file-security.ts` attempts to load `native-media`. If unavailable or failing, it falls back to a pure Node.js header reader inspecting magic bytes (RIFF, ftyp, ID3, OggS, fLaC, Matroska).
   - `lib/ffmpeg.ts` falls back to `fluent-ffmpeg` and dynamically resolves `ffmpeg` / `ffprobe` using platform-native paths (`where` on Windows, `existsSync` and `which` on Unix/macOS).

2. **Conditional Standalone Packaging**:
   - In `next.config.js`, `output: 'standalone'` is strictly activated via `process.env.NEXT_STANDALONE === 'true'`. Local development and standard Vercel deployments avoid symlink permission errors while containerized Docker builds can opt-in.

3. **Defense-in-Depth for Remote Ingestion**:
   - YouTube audio downloads (`lib/youtube.ts`) strictly use `execFile` with separate string argument arrays, eliminating shell interpolation and command injection risks.
   - Media downloads (`lib/media-downloader.ts`) enforce strict IP and hostname validation to block private subnets, loopbacks, and cloud metadata endpoints before issuing outbound HTTP requests.

## Consequences

- Zero-configuration deployment across Vercel, Docker, Fly.io, and local Windows/macOS/Linux machines.
- Safe execution in untrusted serverless environments without requiring native C++ compilers.
- Robust protection against SSRF, command injection, and malicious file spoofing.
