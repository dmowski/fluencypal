# Quiz Feature Guide

Applies to `webApp/src/features/Quiz/**`.

## Entry Points

- **News quiz:** `NewsModal` → **Take quiz** → `ensureNewsQuiz` → `useQuizModal().openQuiz(id)`
- **Global shell:** `QuizModal` in `GlobalModals.tsx` (renders when `quizId` URL param is set)

## URL State

- `quizId` — empty = closed; set = quiz modal open
- Coexists with `newsId`; closing quiz clears only `quizId`

## Firestore

- Path: `users/{userId}/quizzes/{quizId}`
- Shape: `UserQuizRecord` (`quiz` + `progress` in one document)
- News id format: `news_{newsId}_{complexity}_{targetLanguageCode}`

## Hooks

| Hook | Role |
| --- | --- |
| `useQuizModal` | URL open/close |
| `useCreateNewsQuiz` | AI generation + first `setDoc` |
| `useQuizSession` | Load, answer, score, navigate, restart |

## Activity Types

`word-translation`, `fill-gap`, `read-and-answer`, `listening`, `describe-picture-voice`

News generator: 3 questions per included section type.

## Caching

- AI draft JSON cached in `localStorage` (`quiz-generation-cache-v1`) keyed by `buildNewsQuizCacheKey`
- Firestore doc still wins once saved — cache only speeds re-generation during dev / same browser

## Stats

- Completion recorded in `recordQuizCompletion` when exam is evaluated
- Path: `stats/quiz/stats/{quizId}` — `completionsUserIds` maps userId → ISO time
- Admin: **Quiz Done - 24h** on `/staats` (via `loadStats` API)

## Validation

```bash
cd webApp && pnpm lint
cd webApp && pnpm test:unit -- src/features/Quiz
```

After new `i18n._()` strings: `cd webApp && pnpm lang`

## Conventions

- No new API routes; AI via `useTextAi`, voice via `useAudioRecorder`
- Avoid `useEffect` / `useCallback` in new Quiz UI code
- Do not confuse with `Goal/Quiz` or `Case/quiz`
