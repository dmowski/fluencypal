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
  lessonErrors.ts                  — user-facing lesson error token
  InteractiveLessonDashboardCard.tsx
  InteractiveLessonModals.tsx      — lesson + history, mounted in GlobalModals
  InteractiveLessonModal.tsx
  InteractiveLessonModalContent.tsx
  SpeechAnswerPanel.tsx            — recorder hook + SpeechAnswerPanelView
  LessonHistoryView.tsx
  LessonProgressView.tsx
  LessonProgressModal.tsx
  audioProgress.ts                 — first 10 / last 10 spoken answers
```

Generation and UI run in the browser. Persistence is Firestore; spoken answers upload privately through `/api/uploadFile?visibility=private` and play back through an authenticated GET.

## Entry

- Dashboard card **under Just Talk** (`InteractiveLessonDashboardCard`)
- Daily tasks row (`DailyTasksDashboardCard`) — mixed with `grammar-improvement`, never both the same day; start opens the lesson modal
- Modals live in `GlobalModals` via `InteractiveLessonModals`
- Section header **Progress** opens first/last spoken answers and previous finished lessons
- Modal URL: `interactiveLesson=open`, progress: `interactiveLessonProgress=open`

## Data

Firestore: `users/{userId}/interactiveLessons/{targetLanguageCode}`

Owner read/write in `firestore.rules` (`match /interactiveLessons/{languageCode}`).

```
{
  currentLesson,
  nextLesson,          // pre-generated after "I am done"
  history[],           // finished lessons, newest first
  lastCompletedAtIso,
  audioProgress,       // first 10 + last 10 spoken answers, totalCount (compare after 110)
  languageCode,
  updatedAtIso
}
```

Spoken answers: upload audio → `userAudioUrl` on the part. Refresh mid-lesson reloads `currentLesson` from Firestore.

## Flow

1. Open card. If native language equals target language (or either is missing) → language setup + **Continue**.
2. If no current lesson → generate (loader: *We are preparing a lesson for you, based on your previous practice.*).
3. Render parts. First `read` = a 4-5 paragraph how-to (simple words, examples, optional native-language gloss). Second `speech` = **read this text aloud** (play control still available). Later `speech` = record → stop → auto-check. Last `speech` = 2-3 minute open talk. Feedback is spoken automatically. **Answer again** / **Read again** replaces the previous take.
4. **Finish lesson** marks today’s `interactive-lesson` daily task done, then starts two requests in parallel: `LessonResults` and the next `InteractiveLesson`.
4b. **Skip this lesson** immediately drops the current lesson (not marked done, daily task stays open) and generates a completely different language form. No confirmation.
5. When results are ready, show them under the button and scroll there. **Next lesson** / **Finish**.
6. **Next lesson** opens the pre-generated lesson, or the preparing state if that request is still running.
7. **Finish** or closing a finished modal archives the lesson and makes `nextLesson` current.
8. Opening the card again after finish shows the new lesson (generates it if missing).
9. One finished lesson today → card uses the done image and **Done today**.

## Generation

`useTextAi.generateStrictJson`, model `gpt-5.4`.

Each lesson trains **one checkable language form** (article, tense, chunk, contrast). Not “talk clearly” / “present better”.

The **first part** is a longer how-to (4-5 short paragraphs): when to use the form, when not to, bolded examples, optional native-language gloss.

The **second part is always speech**: a short text that uses the form, which the learner reads aloud (they can play it first). Feedback checks they read the passage, not a free answer.

The **last part is always a 2–3 minute open talk** on a concrete topic. Short quiz-like speech items stay in the middle. Next lessons are generated from those long talks, because one-sentence checks do not show enough language to teach from.

| When | Context |
| --- | --- |
| First lesson | Last 30 messages from the latest conversation; if that chat is short, walk previous chats. If still thin, user goal / `advancedUserRecords`. If none, a B1 lesson on one form. Last part: open talk. |
| Later lessons | Open talks first, then previous results and short answers. Recent titles/subtitles are banned so the next lesson changes category instead of looping (e.g. another -ing variant). |

In-flight generation is deduped per storage key so Strict Mode remounts do not double-call AI.

## UI

- Modal chrome follows `NewsModal` (full-screen `CustomModal`, `#37373a`).
- Lesson and feedback markdown use `Markdown` (`variant="rule"`). Tapping a word plays it immediately, then opens translate if available.
- Recording UI follows `SubmitForm` (mic / stop / visualizer / submit).
- Speech check keeps the record button in place and shows the cycling *Thinking / Understanding... / Analyzing* bar beside it.
- Every part has a small play control at the end of the text (`AudioPlayIcon` → streaming TTS).
- The second part shows **Read aloud** (not **Record answer**). The play control stays so they can listen first.
- Bottom fixed bar is **scroll progress** in the modal, not lesson-step progress.

## Types

See `types.ts`. `LessonPart.type` is `"read" | "speech"`. A speech part becomes `LessonPartWithUserAnswer` after submit (`userVoiceTranscript`, `aiResultToUser`). `isReadAloudPart` is the second part when it is `speech` and not the last open talk. `isOpenTalkPart` is the last `speech` part.

## Testing

Browser tests render the same components the app mounts (`InteractiveLessonModalContent`, `LanguageSetupView`, `SpeechAnswerPanel`, dashboard card, history). Do not rebuild that UI in a fixture file.

```bash
cd webApp && pnpm lint
cd webApp && pnpm test:unit -- src/features/InteractiveLesson
cd webApp && pnpm exec vitest --config vitest.browser.config.ts --run src/features/InteractiveLesson/InteractiveLesson.browser.test.tsx
```

After visual changes, review `screenshots/*.png` and update with `--update` if needed.

After new `i18n._()` strings: `cd webApp && pnpm lang`.
