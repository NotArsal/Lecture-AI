# LectureAI Project Structure

```
LectureAI/
â”‚
â”œâ”€â”€ .github/                      # GitHub configuration
â”‚   â””â”€â”€ workflows/                # GitHub Actions workflows
â”‚       â”œâ”€â”€ ci.yml                # Continuous Integration
â”‚       â””â”€â”€ code-quality.yml      # Code quality checks
â”‚
â”œâ”€â”€ .vscode/                      # VS Code configuration
â”‚   â”œâ”€â”€ extensions.json           # Recommended extensions
â”‚   â””â”€â”€ settings.json             # Editor settings
â”‚
â”œâ”€â”€ actions/                      # Next.js Server Actions (TypeScript)
â”‚   â””â”€â”€ transcription.ts          # Main transcription mutation logic
â”‚       â”œâ”€â”€ createTranscriptionMutation()
â”‚       â”œâ”€â”€ validateFileMutation()
â”‚       â””â”€â”€ cleanupFilesAction()
â”‚
â”œâ”€â”€ app/                          # Next.js App Router (JavaScript)
â”‚   â”œâ”€â”€ api/                      # API Routes
â”‚   â”‚   â””â”€â”€ transcribe/
â”‚   â”‚       â””â”€â”€ route.ts          # Transcription API endpoint
â”‚   â”œâ”€â”€ layout.js                 # Root layout with header/footer
â”‚   â”œâ”€â”€ page.js                   # Home page (upload + display)
â”‚   â””â”€â”€ globals.css               # Global styles with Tailwind
â”‚
â”œâ”€â”€ components/                   # React Components (JavaScript/TypeScript)
â”‚   â”œâ”€â”€ upload.tsx                # File upload form with drag-drop
â”‚   â”œâ”€â”€ progress.js               # Progress indicator
â”‚   â”œâ”€â”€ notes-display.js          # Tabbed notes viewer
â”‚   â””â”€â”€ history.tsx               # History list with delete functionality
â”‚
â”œâ”€â”€ lib/                          # Core Libraries (TypeScript)
â”‚   â”œâ”€â”€ ai.ts                     # AI provider abstraction
â”‚   â”‚   â”œâ”€â”€ getAIConfig()
â”‚   â”‚   â”œâ”€â”€ transcribeAudio()
â”‚   â”‚   â”œâ”€â”€ summarizeTranscript()
â”‚   â”‚   â”œâ”€â”€ transcribeWithOpenAI()
â”‚   â”‚   â”œâ”€â”€ transcribeWithGroq()
â”‚   â”‚   â”œâ”€â”€ transcribeWithDeepgram()
â”‚   â”‚   â””â”€â”€ buildSummarizationPrompt()
â”‚   â”‚
â”‚   â”œâ”€â”€ ffmpeg.ts                 # FFmpeg utilities
â”‚   â”‚   â”œâ”€â”€ extractAudioFromVideo()
â”‚   â”‚   â”œâ”€â”€ getAudioDuration()
â”‚   â”‚   â”œâ”€â”€ convertAudioFormat()
â”‚   â”‚   â”œâ”€â”€ cleanupTempFile()
â”‚   â”‚   â””â”€â”€ getAudioMetadata()
â”‚   â”‚
â”‚   â””â”€â”€ upload.ts                 # File upload handling
â”‚       â”œâ”€â”€ ensureUploadDir()
â”‚       â”œâ”€â”€ parseFormData()
â”‚       â”œâ”€â”€ saveUploadedFile()
â”‚       â””â”€â”€ cleanupUploadedFile()
â”‚
â”œâ”€â”€ types/                        # TypeScript Type Definitions
â”‚   â””â”€â”€ index.ts                  # All interfaces and types
â”‚       â”œâ”€â”€ UploadedFile
â”‚       â”œâ”€â”€ TranscriptionResult
â”‚       â”œâ”€â”€ LectureNotes
â”‚       â”œâ”€â”€ KeyConcept
â”‚       â”œâ”€â”€ Definition
â”‚       â”œâ”€â”€ ExampleProblem
â”‚       â”œâ”€â”€ HistoryItem
â”‚       â”œâ”€â”€ MutationResult<T>
â”‚       â””â”€â”€ AIConfig
â”‚
â”œâ”€â”€ utils/                        # Utility Functions (TypeScript)
â”‚   â”œâ”€â”€ validateFile.ts           # File validation
â”‚   â”‚   â”œâ”€â”€ validateFile()
â”‚   â”‚   â”œâ”€â”€ formatFileSize()
â”‚   â”‚   â”œâ”€â”€ formatDuration()
â”‚   â”‚   â””â”€â”€ sanitizeFilename()
â”‚   â””â”€â”€ history.ts                # History management
â”‚       â”œâ”€â”€ getHistory()
â”‚       â”œâ”€â”€ saveToHistory()
â”‚       â”œâ”€â”€ deleteFromHistory()
â”‚       â”œâ”€â”€ clearHistory()
â”‚       â”œâ”€â”€ getHistoryItem()
â”‚       â””â”€â”€ formatTimestamp()
â”‚
â”œâ”€â”€ public/                       # Static Assets
â”‚   â””â”€â”€ (images, icons, etc.)
â”‚
â”œâ”€â”€ uploads/                      # Upload directory (gitignored)
â”‚   â””â”€â”€ (temporary uploaded files)
â”‚
â”œâ”€â”€ .env.example                  # Environment variables template
â”œâ”€â”€ .env                          # Environment variables (gitignored)
â”œâ”€â”€ .gitignore                    # Git ignore rules
â”œâ”€â”€ .prettierrc.json              # Prettier configuration
â”œâ”€â”€ .prettierignore               # Prettier ignore rules
â”œâ”€â”€ .eslintrc.json                # ESLint configuration
â”œâ”€â”€ .editorconfig                 # Editor configuration
â”‚
â”œâ”€â”€ commitlint.config.js          # Commit message linting
â”œâ”€â”€ next.config.js                # Next.js configuration
â”œâ”€â”€ tsconfig.json                 # TypeScript configuration
â”œâ”€â”€ tailwind.config.js            # Tailwind CSS configuration
â”œâ”€â”€ postcss.config.js             # PostCSS configuration
â”‚
â”œâ”€â”€ package.json                  # Project dependencies and scripts
â”œâ”€â”€ package-lock.json             # Dependency lock file
â”‚
â”œâ”€â”€ Dockerfile                    # Docker container definition
â”œâ”€â”€ docker-compose.yml            # Docker Compose configuration
â”‚
â”œâ”€â”€ README.md                     # Main documentation
â”œâ”€â”€ ARCHITECTURE.md               # Architecture documentation
â”œâ”€â”€ CONTRIBUTING.md               # Contribution guidelines
â”œâ”€â”€ SETUP.md                      # Setup instructions
â”œâ”€â”€ LICENSE                       # MIT License
â”‚
â””â”€â”€ setup.sh                      # Automated setup script
```

## Key Directories Explained

### `actions/` - Server Actions

Server-side logic using Next.js Server Actions with `'use server'` directive.
All files are TypeScript for type safety.

**Purpose:** Handle mutations and server-side operations
**Language:** TypeScript
**Pattern:** MutationResult<T> return type

### `app/` - App Router

Next.js 14 App Router for pages and routing.
Uses JavaScript for flexibility in client components.

**Purpose:** Pages, layouts, and API routes
**Language:** JavaScript (pages), TypeScript (API routes)
**Pattern:** File-based routing

### `components/` - UI Components

React client components for the user interface.
Uses JavaScript for simplicity in UI code.

**Purpose:** Reusable UI components
**Language:** JavaScript
**Pattern:** Functional components with hooks

### `lib/` - Core Libraries

Business logic and external service integrations.
TypeScript for type safety and maintainability.

**Purpose:** Core application logic
**Language:** TypeScript
**Pattern:** Exported functions with types

### `types/` - Type Definitions

Centralized TypeScript type definitions.
Shared across all TypeScript files.

**Purpose:** Type definitions and interfaces
**Language:** TypeScript
**Pattern:** Export interfaces and types

### `utils/` - Utility Functions

Helper functions used across the application.
TypeScript for type safety.

**Purpose:** Reusable utility functions
**Language:** TypeScript
**Pattern:** Pure functions with types

## File Naming Conventions

- **TypeScript files:** `kebab-case.ts` (e.g., `validate-file.ts`)
- **JavaScript files:** `kebab-case.js` (e.g., `upload-form.js`)
- **React components:** `PascalCase` for component names
- **Constants:** `UPPER_SNAKE_CASE`
- **Functions:** `camelCase`

## Import Path Aliases

The project uses path aliases for cleaner imports:

```typescript
// Instead of: import { LectureNotes } from '../../../types'
import { LectureNotes } from '@/types'

// Available aliases:
@/actions      â†’ /actions
@/app          â†’ /app
@/components   â†’ /components
@/lib          â†’ /lib
@/types        â†’ /types
@/utils        â†’ /utils
```

## Configuration Files

| File                   | Purpose                                                  |
| ---------------------- | -------------------------------------------------------- |
| `next.config.js`       | Next.js configuration (body size, experimental features) |
| `tsconfig.json`        | TypeScript compiler options                              |
| `tailwind.config.js`   | Tailwind CSS theme and configuration                     |
| `postcss.config.js`    | PostCSS plugins configuration                            |
| `.eslintrc.json`       | ESLint rules for code quality                            |
| `.prettierrc.json`     | Prettier formatting rules                                |
| `commitlint.config.js` | Conventional commit validation                           |

## Build Output

When you run `npm run build`, Next.js creates:

```
.next/
â”œâ”€â”€ cache/              # Build cache
â”œâ”€â”€ server/             # Server-side code
â”œâ”€â”€ static/             # Static assets
â””â”€â”€ types/              # Generated types
```

## Environment Files

```
.env                    # Local development (gitignored)
.env.example            # Template for environment variables
.env.local              # Local overrides (gitignored)
.env.production         # Production variables (gitignored)
```

## Dependencies Overview

### Core Dependencies

- `next` - React framework
- `react`, `react-dom` - UI library
- `openai` - OpenAI API client
- `formidable` - File upload handling
- `fluent-ffmpeg` - FFmpeg wrapper
- `zod` - Schema validation

### Dev Dependencies

- `typescript` - Type checking
- `eslint` - Code linting
- `prettier` - Code formatting
- `tailwindcss` - CSS framework
- `autoprefixer`, `postcss` - CSS processing

## Scripts Reference

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm start            # Start production server
npm run lint         # Run ESLint
npm run type-check   # Run TypeScript type checking
npm run format       # Format code with Prettier
npm run format:check # Check code formatting
```

## CI/CD Workflows

### `ci.yml` - Continuous Integration

- Runs on push/PR to main/develop
- Lint, type check, build
- Security scan with Snyk

### `code-quality.yml` - Code Quality

- Runs on PRs
- Validates conventional commits
- Comments on PR with results

## Docker Structure

### `Dockerfile`

Multi-stage build:

1. **base** - Node.js + FFmpeg
2. **dependencies** - Install packages
3. **build** - Build application
4. **runner** - Production runtime

### `docker-compose.yml`

- Single service configuration
- Volume for uploads
- Environment variable support
- Auto-restart policy

## Getting Started

For first-time setup, run:

```bash
./setup.sh
```

Or follow [SETUP.md](SETUP.md) for detailed instructions.

---

**Maintained by:** LectureAI Contributors
**License:** MIT
**Last Updated:** November 2025
