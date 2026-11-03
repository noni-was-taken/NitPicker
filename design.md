# Design — NitPicker

Extracted from the built app (not researched). Colors and fonts are pinned by the owner.

## Reader and job
Students preparing for the PhilNITS Fundamental IT Engineer (FE) exam. Short, repeated sessions, mostly laptop, often phone. Jobs: take a configured mock exam, browse/search past questions by year and topic, read notes.

## Character
Blunt, technical. A printed exam booklet that runs in a browser: hard borders, offset shadows, mono labels. Kind of product: a **tool** (like LeetCode, Anki), not a marketing site.

## Site map and flow
- `/` Home: entry, picks a job.
- `/mockexamprep` Prep: configure (type, timer, count, years, topics) → Start.
- `/mockexam` Exam: one question at a time, sticky progress bar → submit.
- `/mockexamresults` Results: score, per-category bars, review answers → back to Prep.
- `/previousexams` Vault: filter, expand a year, expand a question.
- `/notes` Notes: featured notes list.
- `*` 404.
Navigation: top bar (Notes, Mock Exam, Previous Exams, theme toggle) on every page.

## Page skeletons
- Prep (config): title block, preset row, two columns (settings left, live "Exam Specification" summary + start right).
- Exam: sticky progress bar, one question card, previous/next.
- Vault (list): title + counts, search + filters, year accordions, question accordions.
- Results: score summary, category/topic bars, per-question review.

## Rhythm
Dense, balanced. Sections divided by 2px borders and offset-shadow panels. One loud thing per screen (the black primary button or the big pool count).

## Emphasis
Primary action = solid black (white in dark) button with offset shadow. Accent blue is for numbers, selection and focus only.

## Color (pinned)
Tokens in `src/index.css` (`:root`, `html.dark`): `--bg`, `--surface-*`, `--text`, `--text-h`, `--border`, `--accent` (blue 600 / 500). Neutral = zinc. Status: green = correct, red = wrong (in pages, via Tailwind classes; **drift**, not yet tokens).
Light and dark both supported; dark is stored in `localStorage.theme`.

## Type (pinned)
Space Grotesk (headings), Inter (body), JetBrains Mono (labels, numbers, badges). Labels are small caps mono, 10-12px (**exception**, see below).

## Shape and depth
No radius (square). One method: 2px border + hard offset shadow (`--shadow-brut-sm/md`). Icons: Phosphor and Lucide (**drift**: two sets).

## Motion
Short (150ms) color/shadow/transform on hover and press; progress bars ease width. Reduced motion respected globally.

## Voice
Action buttons name the action ("Start mock exam"). Uppercase mono labels. No marketing copy.

## Constraints
- Neo-brutalist look: square corners, hard borders, offset shadows.
- Colors and fonts stay as they are (owner decision).
- Question content is vault Markdown; math is `$...$`, currency must be written `\$`.
- Works without an account; static site (Vite build in `dist/`).

## Components and states
Not built yet. Today: shared classes in `src/styles/components.css` (`btn-outline`, `btn-solid`, `card-brut`, `badge-brut`, `form-input`, modal). Most UI is still inline Tailwind in `src/pages/*.tsx`.

## Exceptions
- Mono labels at 10-12px and all-caps (craft floor says no all-caps above 13px; these are below it, kept for the booklet look).
- Progress bars animate `width` (simple; switch to scaleX if jank appears).

## Drift found (not fixed)
- Whole-page loading spinner on first paint of each route (lazy chunks).
- Two icon sets (Phosphor + Lucide).
- Status colors are raw Tailwind classes, not tokens.
- Inline Tailwind repeated across pages instead of components.
- Vault page is a very long list; dense at 390px.
- Many 2016-2020 questions are missing figures or have empty options (content, see QA notes).
