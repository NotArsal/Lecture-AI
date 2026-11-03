# Lecture-AI (talk2notes) — DESIGN.md

> **Authoritative Design System Reference for Lecture-AI**  
> Format: [Google Stitch / getdesign.md Specification](https://getdesign.md/)  
> Visual Identity: **Deep Focus Academic** (Linear meets Notion & Craft)

---

## 1. Design Philosophy & Identity

Lecture-AI transforms unstructured speech, long lectures, and YouTube videos into structured, revision-ready study packs. The interface must reflect **intellectual clarity, high focus, and tactile delight**:

1. **Content-First, Not Decor-First:** Prioritize legibility, study density, and clean typography. Avoid decorative gradient blur clouds or artificial AI neon effects.
2. **Tactile Micro-Interactions:** Buttons, drag-and-drop zones, flashcards, and tabs respond smoothly with subtle spring physics and clear visual feedback.
3. **Purposeful Visual Hierarchy:** Headers, key takeaways, and flashcard answers use deliberate contrast to enable rapid scanning and deep revision.
4. **Terminal & Markdown Heritage:** Honor the student and developer workflow with crisp monospaced code blocks, ASCII tree diagrams, and one-click Obsidian/Markdown exports.

---

## 2. Color System & Semantic Tokens

### Primary Palette (Sky / Scholarly Blue)
| Token | Hex | Role |
| :--- | :--- | :--- |
| `primary-50` | `#f0f9ff` | Subtle badge backgrounds, active pill highlights |
| `primary-100` | `#e0f2fe` | Hover states on light pills, secondary borders |
| `primary-200` | `#bae6fd` | Light dividers, subtle focus rings |
| `primary-500` | `#0ea5e9` | Vibrant interactive highlights, progress indicators |
| `primary-600` | `#0284c7` | Main interactive primary color (buttons, active tabs) |
| `primary-700` | `#0369a1` | Hover state for primary buttons |
| `primary-900` | `#0c4a6e` | Deep contrast text on primary backgrounds |

### Neutrals (Slate / Editorial Canvas)
| Token | Hex | Role |
| :--- | :--- | :--- |
| `slate-50` | `#f8fafc` | Page canvas background |
| `slate-100` | `#f1f5f9` | Muted card backgrounds, subtle dropzone wells |
| `slate-200` | `#e2e8f0` | Standard card and input border |
| `slate-300` | `#cbd5e1` | Hover border for interactive cards |
| `slate-500` | `#64748b` | Timestamps, subtitles, secondary metadata |
| `slate-700` | `#334155` | Body prose, readable paragraphs |
| `slate-900` | `#0f172a` | Primary titles, headlines, high-contrast labels |

### Semantic Status Tokens
| State | Light Bg | Border | Text | Role |
| :--- | :--- | :--- | :--- | :--- |
| **Success** | `emerald-50` | `emerald-200` | `emerald-700` | Quiz correct answer, upload complete |
| **Warning** | `amber-50` | `amber-200` | `amber-800` | Token limit notices, format warnings |
| **Error** | `rose-50` | `rose-200` | `rose-800` | Validation errors, failed downloads |
| **YouTube** | `red-50` | `red-200` | `red-600` | YouTube player controls, badges |
| **Terminal**| `slate-950` | `slate-800` | `emerald-400` | ASCII diagrams, terminal outputs |

---

## 3. Typography System

* **Primary Font Stack:** `Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif`
* **Monospace Stack:** `"JetBrains Mono", ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace`

| Level | Size | Weight | Tracking | Line Height | Usage |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Display H1** | `2.25rem` (36px) | 800 (Bold) | `-0.025em` | `1.2` | Hero title, lecture main title |
| **Section H2** | `1.5rem` (24px) | 700 (Bold) | `-0.02em` | `1.3` | Bento section titles, Tab content headers |
| **Subsection H3**| `1.125rem` (18px) | 600 (Semibold)| `-0.01em` | `1.4` | Card titles, concept terms, question prompts |
| **Body Large** | `1.0rem` (16px) | 400 (Regular) | `normal` | `1.75` | Lecture detailed notes prose |
| **Body Medium**| `0.875rem` (14px) | 500 (Medium) | `normal` | `1.5` | Tabs, buttons, definitions, list items |
| **Caption/Tag**| `0.75rem` (12px) | 600 (Semibold)| `+0.025em` | `1.4` | Meta badges, word counts, difficulty chips |

---

## 4. Spacing, Elevation & Radii

* **Spacing Grid:** 4px baseline (`0.25rem`). Standard containers use `p-4` (16px) or `p-6` (24px).
* **Corner Radii:**
  * Base inputs, badges, buttons: `rounded-lg` (8px).
  * Main cards, modals, player: `rounded-xl` (12px).
  * Large wrappers, hero container: `rounded-2xl` (16px).
  * Pills, status indicators: `rounded-full` (9999px).
* **Borders & Shadows:**
  * Crisp single-pixel borders (`border border-slate-200`).
  * Elevation: `shadow-sm` for resting cards, `shadow-md` on hover, `shadow-xl` for active floating modals.

---

## 5. Component Anatomy & Interaction Patterns

### 1. Fluid Sliding Tabs (21st.dev Pattern)
* Replaces static borders with a continuous sliding highlight container.
* Active tab has a subtle background pill (`bg-white shadow-sm border border-slate-200 text-primary-700 font-semibold`) or an animated motion underline.
* Inactive tabs have smooth color transitions on hover (`text-slate-500 hover:text-slate-900`).

### 2. Bento Grid Study Dashboard
* Appears at the top of the lecture notes view.
* Provides a 4-card overview:
  1. **Reading Time & Word Count:** Icon + Large stat + readable time estimate.
  2. **Study Pack Stats:** Number of Flashcards ready + Quiz questions count.
  3. **Key Concepts Preview:** Horizontal scrolling or wrapping topic badges.
  4. **Source & Format Quick Info:** Original audio/video file name + language tag.

### 3. Tactile 3D Flashcards
* Perspective wrapper: `perspective: 1000px`.
* Smooth 180° flip on click or spacebar.
* Clear visual distinction between Front (Question/Term) and Back (Explanation/Context).
* Quick mastery rating buttons: `Review Again`, `Good`, `Mastered`.

### 4. Glowing Audio Dropzone
* Subtle border with pulsating accent on drag hover.
* Soundwave animation during drag-over.
* Clear file type and limit indicators.

### 5. Animated ASCII Terminal Visualizer (ascii-magic Pattern)
* Used during processing (transcription + summarization) to provide engaging visual feedback.
* Dynamic soundwave/thinking characters (` ▂▃▄▅▆▇█` or ASCII waves) indicating active AI computation.
* Option to export/copy **ASCII Mind-Map** for Obsidian or terminal-based knowledge management.

---

## 6. Strict Anti-Patterns for AI & Contributors

1. ❌ **Do NOT use generic purple-indigo neon gradient soup:** Stick to the editorial Slate and Sky/Scholarly blue palette.
2. ❌ **Do NOT use arbitrary, hardcoded HEX values:** Always use tokens from `tailwind.config.js` or the palette above.
3. ❌ **Do NOT add nested alert boxes:** One concise toast or contextual banner is enough.
4. ❌ **Do NOT hide interactive states:** Every button must have clear `:hover`, `:focus-visible`, and `:active` styles.
5. ❌ **Do NOT neglect keyboard navigation:** All interactive controls must respond to `Enter`, `Space`, or arrows.
