# Quiz Feature Guide

Applies to `webApp/src/features/Quiz/**`.

Do not confuse with `Goal/Quiz/` (onboarding survey) or `Case/quiz/` (interview landings).

## Purpose

Language quizzes tied to news articles today. Modular enough for other sources later (manual exams only — no PDF pipeline planned).

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
5. Normalize ids/options (`normalizeQuizDocument`) → `setDoc`

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
| `word-translation` | Local MC (if native ≠ target) |
| `fill-gap` | Local — all gaps must match |
| `read-and-answer` | Local MC |
| `listening` | Local MC; `audioText` always visible |
| `describe-picture-voice` | AI on submit; grounded by `imageDescription` from vision API |

Wrong MC answers: lazy **Why** via `useTextAi.generate`. Exam end: local score + optional **Get detailed feedback**.

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
  recordQuizCompletion.ts
  sanitizeForFirestore.ts
```

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
