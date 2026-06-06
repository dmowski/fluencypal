# Quiz Feature Guide

Applies to `webApp/src/features/Quiz/**`.

Do not confuse with `Goal/Quiz/` (onboarding survey) or `Case/quiz/` (interview landings).

## Purpose

Language quizzes tied to news articles today. Modular enough for other sources later (manual exams only — no PDF pipeline planned).

## Architecture

```mermaid
flowchart TD
  NM[NewsModal Take quiz]
  V[/api/quiz/describeImage]
  AI[useTextAi generateStrictJson]
  FS[(users/userId/quizzes/quizId)]

  NM --> UC[useCreateNewsQuiz]
  UC --> V
  UC --> AI
  UC --> FS
  QM[QuizModal] --> US[useQuizSession]
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

- **News:** `NewsModal` → **Take quiz** → `ensureNewsQuiz` → `openQuiz(id)`
- **Shell:** `QuizModal` in `GlobalModals.tsx` when `quizId` is set (stacks above news at `zIndex={1100}`)

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

### Caching

- AI draft JSON: `localStorage` space `quiz-generation-cache-v1`, key from `buildNewsQuizCacheKey` (includes vision description hash)
- Existing Firestore doc always wins — no re-generation

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
  createNewsQuiz/     — generation pipeline
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
