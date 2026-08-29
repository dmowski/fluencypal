# Interactive Lesson

Applies to `webApp/src/features/InteractiveLesson/**`.

Daily, client-side speaking practice: read a rule or text, answer by voice, get feedback, then a next lesson.

## Purpose

The learner opens one lesson, reads, records answers, and sees whether they were correct. Day by day the next lesson is generated from previous results (or from recent conversations / goal on the first lesson).

## Architecture

```
InteractiveLesson/
  types.ts                         — LessonPart, InteractiveLesson, store
  constants.ts                     — card images, AI model
  storage.ts                       — parse Firestore payloads
  interactiveLessonFirestore.ts    — getDoc/setDoc for the user lesson store
  uploadLessonAudio.ts             — spoken answers via /api/uploadFile
  lessonState.ts                   — promote, daily-done, answer apply
  collectConversationContext.ts    — last 30 messages across recent chats
  generateLesson.ts                — generateStrictJson → lesson
  generateAnswerFeedback.ts        — generateStrictJson → speech check
  generateLessonResults.ts         — generateStrictJson → closing
  useInteractiveLesson.ts          — session, persist, URL, generation
  InteractiveLessonDashboardCard.tsx
  InteractiveLessonModal.tsx
  SpeechAnswerPanelView.tsx        — presentational recorder UI (screenshot-friendly)
  LessonHistoryView.tsx
```

Generation and UI run in the browser. Persistence is Firestore; recordings are uploaded through `/api/uploadFile` and stored as URLs on the lesson parts.

## Entry

- Dashboard card **under Just Talk** (`InteractiveLessonDashboardCard`)
- Section header **History** opens previous finished lessons
- Modal URL: `interactiveLesson=open`, history: `interactiveLessonHistory=open`

## Data

Firestore: `users/{userId}/interactiveLessons/{targetLanguageCode}`

Owner read/write in `firestore.rules` (`match /interactiveLessons/{languageCode}`).

```
{
  currentLesson,
  nextLesson,          // pre-generated after "I am done"
  history[],           // finished lessons, newest first
  lastCompletedAtIso,
  languageCode,
  updatedAtIso
}
```

Spoken answers: upload audio → `userAudioUrl` on the part. Refresh mid-lesson reloads `currentLesson` from Firestore.

## Flow

1. Open card. If native language equals target language (or either is missing) → language setup + **Continue**.
2. If no current lesson → generate (loader: *We are preparing a lesson for you. Based on your previous interaction.*).
3. Render parts. `read` = read only. `speech` = record → submit → thinking bar → AI feedback. Keep the recording for playback and history.
4. **I am done** starts two requests in parallel: `LessonResults` and the next `InteractiveLesson`.
5. When results are ready, show them under the button and scroll there. **Next lesson** / **Finish**.
6. **Next lesson** opens the pre-generated lesson, or the preparing state if that request is still running.
7. **Finish** or closing a finished modal archives the lesson and makes `nextLesson` current.
8. Opening the card again after finish shows the new lesson (generates it if missing).
9. One finished lesson today → card uses the done image and **Done today**.

## Generation

`useTextAi.generateStrictJson`, model `gpt-5.6-luna`.

| When | Context |
| --- | --- |
| First lesson | Last 30 messages from the latest conversation; if that chat is short, walk previous chats. If still thin, user goal / `advancedUserRecords`. If none, a generic B1 lesson. |
| Later lessons | Previous lesson results and spoken answers. |

In-flight generation is deduped per storage key so Strict Mode remounts do not double-call AI.

## UI

- Modal chrome follows `NewsModal` (full-screen `CustomModal`, `#37373a`).
- Lesson markdown uses `NewsContentWithParagraphs` (voiceover + selection translate).
- Recording UI follows `SubmitForm` (mic / stop / visualizer / submit).
- Bottom fixed bar is **scroll progress** in the modal, not lesson-step progress.
- Speech check uses the cycling *Thinking / Understanding... / Analyzing* bar.

## Types

See `types.ts`. `LessonPart.type` is `"read" | "speech"`. A speech part becomes `LessonPartWithUserAnswer` after submit (`userVoiceTranscript`, `aiResultToUser`).

## Testing

```bash
cd webApp && pnpm lint
cd webApp && pnpm test:unit -- src/features/InteractiveLesson
cd webApp && pnpm exec vitest --config vitest.browser.config.ts --run src/features/InteractiveLesson/InteractiveLesson.browser.test.tsx
```

After visual changes, review `screenshots/*.png` and update with `--update` if needed.

After new `i18n._()` strings: `cd webApp && pnpm lang`.
