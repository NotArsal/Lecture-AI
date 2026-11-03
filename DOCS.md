# LectureAI Documentation Index

Welcome to the LectureAI technical and user documentation directory.

---

## 📖 Getting Started

| Document                              | Purpose                                                        | Audience            |
| ------------------------------------- | -------------------------------------------------------------- | ------------------- |
| [Quick Start](QUICKSTART.md)          | 5-minute setup and your first lecture note                     | Everyone            |
| [Setup Guide](SETUP.md)               | Detailed installation, dependencies, and environment keys      | Developers & Admins |
| [README](README.md)                   | Comprehensive project overview and capability catalog          | Everyone            |
| [Rate Limits](RATE-LIMITS.md)         | Information on free-tier rate limits and sliding window bounds | Users & Developers  |
| [Troubleshooting](TROUBLESHOOTING.md) | Solutions for common audio, FFmpeg, and model errors           | Everyone            |

---

## 💻 Architecture & Technical References

| Document                                                                                         | Purpose                                                            |
| ------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------ |
| [Architecture Specification](ARCHITECTURE.md)                                                    | System design, hybrid fallback, security layers, and data flows    |
| [Project Structure](PROJECT-STRUCTURE.md)                                                        | File and folder layout across Next.js and Python proxy             |
| [ADR 001: Hybrid Local Fallback](docs/architecture/ADR-001-Local-Fallback.md)                    | Architectural decision record for cloud-to-local fallback          |
| [ADR 002: Serverless Fallback Strategy](docs/architecture/ADR-002-serverless-native-fallback.md) | Architectural decision record for Vercel/serverless resilience     |
| [ADR 003: Hybrid Media Streaming](docs/architecture/ADR-003-hybrid-media-streaming-and-latency-optimization.md) | Architectural decision record for HTTP Range media streaming & latency reduction |
| [CLI Reference](CLI-REFERENCE.md)                                                                | Complete CLI scripts and npm/pnpm tooling reference                |
| [Contributing Guidelines](CONTRIBUTING.md)                                                       | Development standards, Git conventions, and pull request workflows |

---

## 🧭 Common Tasks

- **How do I configure Google Gemini or Groq?** → See [Setup Guide](SETUP.md#ai-provider-configuration).
- **How do I enable local CUDA acceleration on RTX 4060?** → See [Local GPU Fallback](SETUP.md#local-gpu-fallback-nvidia-cuda--ollama).
- **How does SSRF and file validation work?** → See [Architecture: Security](ARCHITECTURE.md#security--reliability-architecture).
- **How do I deploy to Vercel or Docker?** → See [Deployment](README.md#deployment).

---

## 🔗 Official Links & Repositories

- **GitHub Repository**: [https://github.com/NotArsal/Lecture-AI](https://github.com/NotArsal/Lecture-AI)
- **Issue Tracker**: [https://github.com/NotArsal/Lecture-AI/issues](https://github.com/NotArsal/Lecture-AI/issues)
