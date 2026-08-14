# Chaturanga Lessons — Implementation Guide

**For: Antigravity (coding agent)**
**Stack: Express.js + MongoDB (Mongoose), vanilla JS frontend**
**Goal:** Rebuild the Lessons feature with a xiangqi.com-style UX (Topics → Lesson List → Lesson Player), and persist user progress to MongoDB instead of `localStorage` only.

---

## 0. Context

The current lessons page (`lessons.html` + `lesson-data.js` + `lesson-engine.js`) renders every lesson on one long scrolling page and stores progress only in the browser's `localStorage`. This guide rebuilds it as a three-level drill-down UI (matching xiangqi.com's UX pattern) and adds a real backend so progress survives across devices and logins.

A working frontend-only version of the new UI already exists (`lessons.html`, unchanged `lesson-data.js`, unchanged `lesson-engine.js`). **Do not throw that away** — Part A below documents its structure so you extend it correctly; Part B/C describe the backend and the wiring needed to replace the `localStorage`-only engine with a DB-backed one.

### Content model recap (already fixed, do not change)
- `lesson-data.js` exports `ChaturangaLessonData`: an array of **18 lessons**, each with `id` (`L001`…`L018`), `title`, `category` (one of `basics`, `opening`, `tactics`, `endgame`, `alliance`, `advanced`), `difficulty`, `culturalSource`, `moralLesson`, `completionReward`, `boardState`, and `steps[]` (each step = one "chapter": narration, instruction, expected move, highlight squares, arrows, success/wrong messages).
- A **"topic"** in the new UI = a `category`. A **"lesson"** in the new UI = one `ChaturangaLessonData` entry. A **"chapter"** in the new UI = one `steps[]` entry within a lesson.

---

## PART A — Frontend UI/UX

### A1. Information architecture (3 views, hash-routed)

```
#/                    → Topics grid (home)
#/topic/:category     → Lesson list within that topic
#/lesson/:lessonId    → Interactive lesson player (one chapter at a time)
```

No page reloads between views — everything is one HTML file (`lessons.html`) with a `route()` function that reads `location.hash` and re-renders `#app`.

**Checklist**
- [ ] Confirm `window.addEventListener('hashchange', route)` is wired.
- [ ] Confirm all internal links use `href="#/..."` (never full page navigation).
- [ ] Confirm `location.hash='#/'` fallback when an unknown lesson/topic id is requested.

### A2. View 1 — Topics grid (home)

Purpose: orientation + search, mirrors xiangqi.com's "All / NewBie / Beginner / Intermediate / Advanced" card list.

Elements, top to bottom:
1. Page title + subtitle (Cinzel serif, gold).
2. Search input — filters topics **and** lesson titles/`culturalSource` live on `input` event (debounce not required at this data size).
3. **Overall progress strip** — `completedLessons / totalLessons` with a horizontal bar. Pull this from the progress store (Part C), not localStorage directly, once the backend is wired.
4. **Topic card grid** — one card per category:
   - Left: colored icon tile (gradient background unique per category — see A3 palette).
   - Right: topic label, one-line description, `"N Lessons"` badge, difficulty badge, and a small **circular progress ring** (`done/total` for that category).
   - Whole card is a link to `#/topic/:category`.

**Checklist**
- [ ] 6 topic cards render (basics, opening, tactics, endgame, alliance, advanced).
- [ ] Progress ring percentage matches `completed lessons in category / total lessons in category`.
- [ ] Search with no match shows an explicit "no results" state — **never** silently render nothing (this caused a real bug earlier: a data-load failure looked identical to "0 search results" and confused the user). Any time the grid is empty, the code path must make it obvious *why*.

### A3. Visual design system

Reuse the app's existing gold/dark identity (do **not** copy xiangqi.com's red/cream skin — only its layout/interaction patterns).

| Token | Value | Usage |
|---|---|---|
| `--gold` | `#c9a84c` | headings, active states, primary CTA |
| `--gold2` | `#f0cc7a` | gradient highlight partner to `--gold` |
| `--dark` / `--dark2` / `--dark3` | `#0f0c06` / `#17130a` / `#1f1a0f` | page bg / card bg / hover bg |
| `--text` | `#e3dcc9` | body text |
| `--muted` / `--muted2` | `#948c78` / `#6d6656` | secondary text |
| `--ok` / `--bad` | `#4ade80` / `#f87171` | correct/wrong move feedback |

Category accent colors (topic tile gradients — pick colors that stay legible against dark bg):
- `basics` → green (`#5c7a52` → `#7c9473`)
- `opening` → purple (`#5a4f7c` → `#7a6ba0`)
- `tactics` → crimson (`#9c4a3f` → `#c06a52`)
- `endgame` → maroon (`#7a3b3b` → `#a35555`)
- `alliance` → blue (`#3f6b8a` → `#5a8fae`)
- `advanced` → gold (`#c9a84c` → `#f0cc7a`)

Typography: `Cinzel` (serif) for all headings/titles, `Outfit` (sans) for body/UI text — already loaded via Google Fonts link tags, keep as-is.

**Checklist**
- [ ] No hardcoded colors outside the token list above (use CSS custom properties so a future theme switch — `theme-*` classes already exist on `<html>` — still works).
- [ ] Icons via Font Awesome (`fa-solid`), one distinct icon per category (pawn/arrow/crosshairs/flag/handshake/brain).

### A4. View 2 — Topic detail (lesson list)

Purpose: browse the 3 lessons inside a topic before committing to one — mirrors xiangqi.com's "Chariot / Cannon / Horse" list under "Pieces and Moves".

Elements:
1. Breadcrumb: `Lessons / {Topic label}`.
2. Topic header: icon badge (same gradient as its card), title, description.
3. **Lesson list** — one row per lesson:
   - Icon tile (category color) with a small green checkmark badge overlaid **if completed**.
   - Title (numbered) + `culturalSource` as italic subtitle.
   - Right side: `"N Chapters"` (= `steps.length`) and difficulty badge.
   - Chevron affordance, whole row links to `#/lesson/:id`.

**Checklist**
- [ ] Completed lessons show the checkmark badge (pulled from progress store).
- [ ] Row order matches the lesson's order in `ChaturangaLessonData` for that category.

### A5. View 3 — Lesson player

Purpose: play one lesson, one chapter (step) at a time — mirrors xiangqi.com's Chariot lesson screen (board left, instructions + "Chapter 1/6" + Hint button right).

Layout: two columns on desktop (board left, sticky panel right), single column stacked on mobile (`≤860px`).

**Board column:**
- File labels (a–h) above the board.
- 8×8 board rendered from `boardState`/live `boardMap`, using existing piece image path convention (`../../images/pieces/{color}_{piece}.webp`) with a text-glyph fallback (`onerror`) — keep this exactly as-is, it's already working.
- SVG overlay layer for arrows (used by Hint).
- "Red to move" turn pill below the board.

**Right panel:**
- Breadcrumb + back-to-topic link.
- Lesson title + `culturalSource`.
- **Narration card** (gold-bordered) — current step's `narration`.
- **Instruction row** — current step's `instruction`, prefixed with an arrow icon.
- **Status line** — success (green) / wrong (red) feedback after a move attempt, cleared on step change.
- **Chapter box**:
  - `"Chapter X/Y"` label.
  - Horizontal progress bar (`(currentStep+1)/totalSteps`).
  - **Hint button** — toggles: (a) a pulsing outline on the step's `highlight` squares, (b) draws the step's `arrows[]` on the SVG overlay. Hint state resets to off whenever a move is attempted or the chapter advances.
  - Share button (copies the lesson's URL) and Restart button (re-initializes the lesson from chapter 1).
- **Completion panel** (hidden until the lesson's last chapter is solved): award icon, badge pill (`completionReward`), moral lesson text (`moralLesson`), and a **"Continue to: {next lesson title}"** button — or, if it's the last lesson in its topic, a "Back to {topic}" button.

**Interaction rules**
- Click a square you own → select it (highlight `.selected`).
- Click a second square → attempt the move; on success, board updates and either the next chapter's narration/instruction load, or (on the final chapter) the completion panel appears and progress is saved.
- On wrong move, the piece visually reverts and the status line shows `wrongMessage`.
- If a step has `allowAnyMove: true`, any click on the highlighted target advances the chapter (used for "click here to continue" narration-only steps).

**Checklist**
- [ ] Selecting, moving, wrong-move revert, and chapter advance all work exactly as in the existing `lesson-engine.js` API (`startLesson`, `validatePlayerMove`, `getCurrentStepData`).
- [ ] Progress bar and "Chapter X/Y" update on every chapter change.
- [ ] Hint never mutates board state, only display.
- [ ] On completion, the lesson is marked complete **once** (idempotent — see Part B for why this matters server-side too).

### A6. Micro-interactions
- Topic cards: lift + border-glow on hover (`translateY(-3px)`, box-shadow).
- Lesson rows: background shift + border-glow on hover.
- Hint pulse: CSS `@keyframes` box-shadow pulse on highlighted squares, ~1s loop, stops when hint is toggled off.
- Progress bars/rings animate width/stroke-dashoffset with a short transition (`.3s`) whenever their underlying value changes.

### A7. Responsive & accessibility
- [ ] `≤860px`: player layout stacks to one column, board square size (`--sq`) shrinks (e.g. 56px → 40px), right panel becomes static (not sticky) and full-width.
- [ ] `≤900px` (topics grid): grid becomes 1 column.
- [ ] All interactive elements (cards, rows, buttons, squares) are real `<a>`/`<button>`/clickable `<div>` with `cursor:pointer` — add `tabindex`/`role="button"` + `Enter`/`Space` keyboard handling to board squares if keyboard play is in scope for this milestone (flag as stretch goal if not).
- [ ] Color contrast: status text (green/red) and gold-on-dark text should meet at least WCAG AA for normal text.

---

## PART B — Backend (Express.js + MongoDB)

### B1. Assumptions (confirm/adjust against the real codebase before coding)

- There is already an authenticated user session available server-side (JWT in `Authorization: Bearer` header, or a session cookie) exposing `req.user._id` (or equivalent) in protected routes. If this doesn't exist yet, stub a minimal `requireAuth` middleware per B4 and flag it for the app's real auth system to replace.
- MongoDB connection (`mongoose.connect(...)`) is already established elsewhere in the app's entrypoint (`server.js`/`app.js`) — this guide only adds new models/routes, not connection bootstrapping.
- Guests (not logged in) may still use the lessons UI; their progress stays in `localStorage` only, exactly as today, until they log in (see C2 for the sync/merge flow).

### B2. Data model

Create a **shared, backend-owned list of valid lesson IDs/step counts** so the API never trusts the client for integrity-sensitive fields. This is a small JSON, not the full lesson content:

```js
// server/data/lessonsMeta.js
// Keep this in sync with the frontend's lesson-data.js (id, category, steps.length only).
module.exports = [
  { id: 'L001', category: 'basics',   totalSteps: 3 },
  { id: 'L002', category: 'basics',   totalSteps: 4 },
  // ...L003–L018, one entry per lesson in lesson-data.js
];
```
- [ ] Generate this file from `lesson-data.js` (id, category, `steps.length`) — write a tiny one-off Node script that parses `lesson-data.js` and emits `lessonsMeta.js`, so it's never hand-maintained out of sync. Re-run it whenever lessons are added/edited.

**Mongoose schema:**

```js
// server/models/LessonProgress.js
const mongoose = require('mongoose');

const lessonProgressSchema = new mongoose.Schema({
  userId:       { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  lessonId:     { type: String, required: true },          // e.g. 'L001'
  category:     { type: String, required: true },          // denormalized, from lessonsMeta
  status:       { type: String, enum: ['in_progress', 'completed'], default: 'in_progress' },
  currentStep:  { type: Number, default: 0 },
  totalSteps:   { type: Number, required: true },
  badgeAwarded: { type: String },
  completedAt:  { type: Date },
  attempts:     { type: Number, default: 0 },               // optional: increments on wrong moves, for analytics
}, { timestamps: true });

lessonProgressSchema.index({ userId: 1, lessonId: 1 }, { unique: true });

module.exports = mongoose.model('LessonProgress', lessonProgressSchema);
```

- [ ] One document per `(userId, lessonId)` pair — never duplicate. The compound unique index enforces this; all writes must be **upserts**, never blind inserts.

### B3. API endpoints

All routes are mounted under `/api/lessons` and require auth unless noted.

| Method | Route | Body | Purpose |
|---|---|---|---|
| GET | `/api/lessons/progress` | — | Returns the logged-in user's full progress snapshot. |
| POST | `/api/lessons/:lessonId/step` | `{ currentStep }` | Upserts in-progress state as the user advances chapters (called after every successful step, not just completion). |
| POST | `/api/lessons/:lessonId/complete` | `{ badge }` | Marks a lesson completed. Idempotent. |
| POST | `/api/lessons/sync` | `{ completed: string[], inProgress: { [lessonId]: number } }` | One-time merge of guest `localStorage` progress into the DB right after login (see C2). |

**GET `/api/lessons/progress` — response shape:**
```json
{
  "completed": ["L001", "L002"],
  "inProgress": { "L003": 2 },
  "byCategory": {
    "basics": { "completed": 2, "total": 3 },
    "opening": { "completed": 0, "total": 3 }
  }
}
```
- `byCategory` is computed server-side from `lessonsMeta.js` + the user's docs — this is exactly what feeds the topic-card progress rings in A2, so the frontend doesn't need to know lesson counts itself beyond what it already has locally.

**POST `/api/lessons/:lessonId/step`**
- Validate `lessonId` against `lessonsMeta.js` → 404 if unknown.
- Validate `currentStep` is an integer `0 ≤ currentStep ≤ totalSteps`.
- Upsert: `{ userId, lessonId }` → set `currentStep`, `category`, `totalSteps`, `status: 'in_progress'` (only if not already `completed` — never downgrade a completed lesson back to in-progress from a stale client step call; see B5).
- Response: `204 No Content` or the updated doc.

**POST `/api/lessons/:lessonId/complete`**
- Validate `lessonId` exists.
- Upsert with `status: 'completed'`, `currentStep: totalSteps`, `completedAt: new Date()` **only if not already completed** — if already completed, just return the existing doc unchanged (200) instead of re-setting `completedAt` (keeps the original completion timestamp, avoids double-awarding anything tied to completion in the future, e.g. XP).
- Response: the updated doc + the freshly computed `byCategory` summary (so the frontend can update progress rings without a second round trip).

**POST `/api/lessons/sync`** (called once, right after login, if the client detects non-empty guest `localStorage` progress)
- For each `lessonId` in `body.completed` not already completed server-side → mark completed (`completedAt: now`).
- For each `[lessonId, step]` in `body.inProgress` → only apply if the lesson isn't already completed **and** the server's `currentStep` for that lesson (if any) is less than the incoming `step` (never regress progress on merge).
- Response: the full merged progress snapshot (same shape as GET `/progress`), so the client can overwrite its local state and clear `localStorage` afterward.

**Checklist**
- [ ] All four routes implemented under `server/routes/lessons.js`, mounted in the main router as `app.use('/api/lessons', requireAuth, lessonsRouter)`.
- [ ] `lessonId` is validated against `lessonsMeta.js` on every write route — reject unknown ids with `400`.
- [ ] `totalSteps` for a write always comes from `lessonsMeta.js` server-side, never trusted from the request body — prevents a malicious client from claiming a 1-step lesson is "complete" after a fake single move.

### B4. Auth middleware (stub if the real one doesn't exist yet)

```js
// server/middleware/requireAuth.js
module.exports = function requireAuth(req, res, next) {
  // Replace with the app's real session/JWT verification.
  if (!req.user || !req.user._id) {
    return res.status(401).json({ error: 'Not authenticated' });
  }
  next();
};
```
- [ ] Flag this file clearly with a `TODO` if it's a stub, so it gets swapped for the app's real auth before merging.

### B5. Business logic details (edge cases to handle explicitly)

- [ ] **No regression on completed lessons.** A `POST .../step` call arriving after the user already completed that lesson (e.g. a stale request from a race condition, or the user replaying a finished lesson) must **not** downgrade `status` back to `in_progress`. Check current `status` before writing.
- [ ] **Idempotent completion.** Calling `POST .../complete` twice for the same lesson must not create duplicate documents (enforced by the unique index) or overwrite `completedAt`/`badgeAwarded` the second time.
- [ ] **Unknown lesson IDs are always a 400/404**, never silently accepted — this is the integrity boundary described in B3.
- [ ] **Category correctness.** `category` written to each doc must come from `lessonsMeta.js`, not the client, so `byCategory` aggregation is always trustworthy even if the client is stale/malicious.

### B6. Error handling & validation

- [ ] Wrap all route handlers in try/catch (or an async-handler wrapper) and return `{ error: string }` JSON with an appropriate status code (`400` bad input, `401` unauthenticated, `404` unknown lesson, `500` unexpected).
- [ ] Add basic request validation (e.g. `express-validator` or manual checks) for `currentStep` type/range and `lessonId` format before touching the DB.

---

## PART C — Frontend ⇄ Backend integration

### C1. Add a `progress-store.js` abstraction

This sits between `lesson-engine.js`/`lessons.html` and either `localStorage` or the API, so the UI code never has to know which one is active.

```js
// lessons/progress-store.js
globalThis.ChaturangaProgressStore = (function () {
  function isLoggedIn() {
    // Replace with the app's real auth-state check (e.g. a global currentUser, a cookie flag, etc.)
    return !!globalThis.currentUser;
  }

  async function getProgress() {
    if (!isLoggedIn()) return localProgress();
    const res = await fetch('/api/lessons/progress', { credentials: 'include' });
    if (!res.ok) return localProgress(); // fail open to local cache rather than breaking the UI
    return res.json();
  }

  async function saveStep(lessonId, currentStep) {
    localSaveStep(lessonId, currentStep); // always mirror locally too, for instant UI + offline safety
    if (!isLoggedIn()) return;
    fetch(`/api/lessons/${lessonId}/step`, {
      method: 'POST', credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ currentStep }),
    }).catch(() => {}); // network hiccup shouldn't break the lesson UI
  }

  async function markComplete(lessonId, badge) {
    localMarkComplete(lessonId);
    if (!isLoggedIn()) return;
    return fetch(`/api/lessons/${lessonId}/complete`, {
      method: 'POST', credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ badge }),
    });
  }

  async function syncGuestProgressOnLogin() {
    const local = localProgress();
    if (!local.completed.length && !Object.keys(local.inProgress).length) return;
    const res = await fetch('/api/lessons/sync', {
      method: 'POST', credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(local),
    });
    if (res.ok) clearLocalProgress(); // server is now source of truth
  }

  // ...localProgress()/localSaveStep()/localMarkComplete()/clearLocalProgress()
  // reuse the exact logic already in lesson-engine.js's loadProgress()/saveProgress().

  return { getProgress, saveStep, markComplete, syncGuestProgressOnLogin };
})();
```

**Checklist**
- [ ] `progress-store.js` is the **only** place that decides "localStorage vs API" — no other file makes that check.
- [ ] Every write mirrors to `localStorage` first (instant UI feedback, offline resilience), then fires the API call in the background.
- [ ] Network failures on write **never** block or roll back the in-lesson UI — the user should never lose a completed step visually because of a flaky request.

### C2. Guest → logged-in migration

- [ ] Call `ChaturangaProgressStore.syncGuestProgressOnLogin()` once, right after a successful login (hook it into whatever the app's existing "on login success" code path is).
- [ ] After a successful sync, refetch `GET /api/lessons/progress` and re-render the currently visible view so the UI reflects the merged server state immediately.

### C3. Update `lesson-engine.js`

- [ ] Replace direct `localStorage` reads/writes in `isCompleted`, `saveProgress`, `_saveInProgress`, `loadProgress` with calls into `ChaturangaProgressStore` (which still uses `localStorage` under the hood for guests — the engine's public API/shape doesn't need to change, only its internals).
- [ ] Because store calls are now async, functions like `isCompleted(lessonId)` become `async isCompleted(lessonId)` — audit every call site in `lessons.html` (topic grid checkmarks, lesson list checkmarks, progress rings, completion handling) and `await` them, or pre-fetch the whole progress snapshot once per view render and pass it down synchronously (**preferred** — avoids a network round-trip per checkmark render).

**Recommended pattern:** at the top of `renderTopics()`, `renderTopic()`, and `renderLessonPlayer()`, do:
```js
const progress = await ChaturangaProgressStore.getProgress();
```
and pass `progress` into the render helpers instead of calling `isCompleted()` repeatedly per-lesson. This keeps rendering synchronous and fast after the one fetch.

### C4. Update `lessons.html`

- [ ] `route()` becomes `async route()`.
- [ ] On a successful chapter advance (`handleResult`'s `res.nextStep` branch), call `ChaturangaProgressStore.saveStep(lessonId, newStep)`.
- [ ] On lesson completion (`res.complete` branch), call `ChaturangaProgressStore.markComplete(lessonId, res.badge)` **before** re-rendering the completion panel, but don't block the panel render on the network response (see C1's "never block UI" rule).
- [ ] Topic-grid progress rings and topic-detail checkmarks should read from the single fetched `progress` snapshot (C3), not re-derive from `localStorage`.

---

## PART D — Testing checklist

**Frontend**
- [ ] Fresh guest user: complete a full lesson end-to-end, confirm checkmark + progress ring update without a page reload.
- [ ] Refresh mid-lesson: confirm `currentStep` resumes correctly (guest via `localStorage`, logged-in via API).
- [ ] Hint button: confirm it highlights the right squares/arrow and turns off after a move.
- [ ] Mobile viewport (`≤860px`): confirm board shrinks and panel stacks below it, nothing overflows horizontally.

**Backend**
- [ ] `POST /:lessonId/step` with an unknown `lessonId` → `400`/`404`, not a silent success.
- [ ] `POST /:lessonId/complete` called twice → second call doesn't change `completedAt` or create a duplicate doc.
- [ ] `POST /:lessonId/step` called with a stale/lower step *after* the lesson is already `completed` → status stays `completed`.
- [ ] `POST /sync` with a mix of already-completed and new lessons → only new ones get written; no existing `completedAt` is overwritten.
- [ ] Unauthenticated request to any `/api/lessons/*` route → `401`.

**Integration**
- [ ] Complete 2 lessons as a guest, then log in → both appear as completed server-side after sync, and `localStorage` guest cache is cleared afterward.
- [ ] Two browser tabs, same logged-in user: complete a lesson in tab A, refresh tab B → tab B shows it completed.

---

## PART E — Rollout steps (suggested order of work)

1. Generate `lessonsMeta.js` from `lesson-data.js`.
2. Add `LessonProgress` model + migration/index creation.
3. Build the 4 API routes + `requireAuth` (or wire to existing auth) + validation.
4. Write backend tests from Part D before touching the frontend.
5. Add `progress-store.js`, wire it into `lesson-engine.js` and `lessons.html` per Part C.
6. Manual QA against the Part D frontend/integration checklists.
7. Ship behind a feature flag if the app has one, otherwise deploy directly since guests still degrade gracefully to `localStorage`.

---

## PART F — Stretch goals (optional, not required for this milestone)

- Keyboard navigation for board squares (accessibility).
- Server-computed leaderboards (e.g. "fastest to complete all Basics lessons") using the same `LessonProgress` collection.
- Analytics on `attempts` (wrong-move count) per lesson to identify confusing steps.
- Category-level "badges" awarded when all lessons in a category are completed (would need a small additional model, e.g. `CategoryBadge`).
