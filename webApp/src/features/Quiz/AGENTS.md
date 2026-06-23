# Quiz Feature Guide

Applies to `webApp/src/features/Quiz/**`.

Do not confuse with `Goal/Quiz/` (onboarding survey) or `Case/quiz/` (interview landings).

## Purpose

Language quizzes tied to news articles today. Manual exams (English/Polish) and Polish state-style B1 practice. Official Polish B1 PDFs are parsed under `Polish/` for authoring reference.

## Architecture

```mermaid
flowchart TD
  NM[NewsModal Take quiz]
  P[pendingNewsQuizCreate]
  QM[QuizModal opens immediately]
  UC[useCreateNewsQuiz]
  V[/api/quiz/describeImage]
  AI[useTextAi generateStrictJson]
  FS[(users/userId/quizzes/quizId)]

  NM -->|openNewsQuiz| P
  NM --> QM
  QM -->|LoadingShapes + caption| UC
  UC --> V
  UC --> AI
  UC --> FS
  QM --> US[useQuizSession]
  US --> FS
```

| Layer | Responsibility |
| --- | --- |
| **Definition** | `QuizDocument` — sections, questions, correct answers, evaluation instructions |
| **Progress** | `QuizProgress` — index, answers, per-question results, exam result |
| **Creator** | `useCreateNewsQuiz` — vision + AI draft + normalize + first Firestore write |
| **Session** | `useQuizSession` — load, navigate, score, explain, restart |
| **URL** | `useQuizModal` — `quizId` query param |

Both definition and progress live in one Firestore document: `UserQuizRecord`.

## Entry Points

- **News:** `NewsModal` → **Take quiz** → `openNewsQuiz(input)` (modal opens immediately; generation runs inside `QuizModal`)
- **Exams:** `ExamsDashboardCard` → `ensureManualExam` / `ensureStateExam` → `openQuiz(id)` (hardcoded `Quiz/exam/*`; filtered by `settings.languageCode`; no AI generation)
- **Polish B1 Writing:** dashboard group `Polish B1 — Pisanie` → `ExamVariantPicker` (30 variants + random) → `exam/polishB1Writing/*`
- **Polish B1 Speaking:** dashboard group `Polish B1 — Mówienie` → `ExamVariantPicker` (30 variants + random) → `exam/polishB1Speaking/*`
- **Shell:** `QuizModal` in `GlobalModals.tsx` when `quizId` is set (stacks above news at `zIndex={1100}`)

## Quiz Creation UX

When the user starts a quiz from a news article:

1. `openNewsQuiz` sets `quizId` in the URL and stores `CreateNewsQuizInput` in `pendingNewsQuizCreate`.
2. `QuizModal` opens right away (news modal stays open underneath).
3. While `useCreateNewsQuiz` runs (~1 minute for a new quiz), show `LoadingShapes` and the caption *Creating your quiz... This usually takes about a minute.*
4. On success, Firestore updates and `useQuizSession` loads the first question.
5. On failure, show an error with **Try again** (pending input is kept until success).

Existing Firestore quiz docs skip generation; `ensureNewsQuiz` returns the cached record quickly.

**Single generation guarantee:** `runOncePerQuizId` (`newsQuizCreateInFlight.ts`) deduplicates concurrent `ensureNewsQuiz` calls for the same `quizId` (covers React Strict Mode remounts and rapid retries). A second `getDoc` runs inside the lock before any AI/vision requests start.

## URL State

| Param | Meaning |
| --- | --- |
| `quizId` empty | Quiz closed |
| `quizId` set | Quiz open; `newsId` may still be set underneath |

## Firestore

- Path: `users/{userId}/quizzes/{quizId}`
- News id: `news_{newsId}_{complexity}_{targetLanguageCode}`
- Rules: `users/{userId}/quizzes/{quizId}` — owner read/write

## News Quiz Generation

1. Resolve sections (`resolveIncludedSections`) — 3 questions per type; **1** for `describe-picture-voice`
2. If article has `imageUrl` → `POST /api/quiz/describeImage` (OpenAI vision, `gpt-4o`)
3. AI generates JSON for non-speaking sections only (`generateNewsQuizDraft`)
4. Speaking section appended deterministically from vision text (`buildDescribePictureSection`)
5. Normalize ids/options (`normalizeQuizDocument`) — AI marks `isCorrect` per option; ids assigned by index → `setDoc`

**No learner profile / aiUserInfo** is passed into generation.

Existing Firestore quiz doc is returned as-is; generation runs only when no doc exists for that `quizId`.

## API

| Endpoint | Role |
| --- | --- |
| `POST /api/quiz/describeImage` | Auth required; `{ imageUrl }` → `{ description }` |

Client: `api/describeImageRequest.ts`. Logic: `backend/describeImage.ts`.

## Activity Types

| Type | Scoring |
| --- | --- |
| `word-translation` | Local MC (if native ≠ target). `native-to-target`: prompt in native lang, options in target. `target-to-native`: opposite. Invalid if promptText equals any option (dropped in normalize). |
| `fill-gap` | Local — all gaps must match |
| `read-and-answer` | Local MC |
| `listening` | Local MC; `audioText` always visible |
| `describe-picture-voice` | AI on submit; grounded by `imageDescription` from vision API |
| `writing-text` | AI on submit; word-count bounds; state/writing exams |
| `monologue-voice` | AI on submit; state B1 speaking monologue |

Wrong MC answers: lazy **Why** via `useTextAi.generate` — practical fix-it explanation (why wrong, why correct, how to avoid next time; no motivational filler). Target language in prompt; `languageCode` on the API is usage-only. Speaking: voice feedback uses the same target-language rule. Exam end: local score + optional **Get detailed feedback**.

## Stats

- `recordQuizCompletion` on `submitExam` → `stats/quiz/stats/{quizId}`
- Admin card: **Quiz Done - 24h** (`loadStats` API)

## Folder Layout

```
Quiz/
  AGENTS.md
  types.ts
  useQuizModal.tsx
  api/describeImageRequest.ts
  backend/describeImage.ts, types.ts, getAllQuizStats.ts
  createNewsQuiz/     — generation pipeline, useAutoCreatePendingNewsQuiz
  pendingNewsQuizCreate.ts — in-memory create input between NewsModal and QuizModal
  session/            — useQuizSession, scoring, navigation
  components/         — QuizModal, activities, progress bar
  exam/               — manual exams (e.g. `englishB2Exam.ts`, `ensureManualExam.ts`)
  exam/polishB1Writing/ — B1 writing-only exam (30 variants)
  exam/statePolishB1/ — full state-format B1 pilot exam
  Polish/             — parsed exam markdown + writing variants (see `Polish/readme.md`)
  recordQuizCompletion.ts
  sanitizeForFirestore.ts
```

## Polish B1 materials (`Polish/`)

Third-party exam PDFs from the State Certification Commission. Parsed markdown lives under `Polish/parsed/` (no binary `source/` folder). Regenerate with `Polish/scripts/build-parsed.py`.
- `parsed/exams/{date}/` — cleaned exam papers + listening transcripts
- `parsed/module-specs/` — official module guides (`writing.md` = writing rubric)
- `parsed/typescript/` — structured indexes (`parsedExamSessions.ts`)
- `writing/variants.ts` — **original** app content (30 writing variants; not copied from PDFs)

Regenerate parsed markdown: `cd webApp/src/features/Quiz/Polish/scripts && python3 build-parsed.py`. See `Polish/readme.md`.

## Conventions

- Avoid `useEffect` / `useCallback` in new Quiz UI code
- Strip `undefined` before Firestore writes (`sanitizeForFirestore`)
- Unit tests only (no Quiz e2e)

## Validation

```bash
cd webApp && pnpm lint
cd webApp && pnpm test:unit -- src/features/Quiz
```

After new `i18n._()` strings: `cd webApp && pnpm lang`
