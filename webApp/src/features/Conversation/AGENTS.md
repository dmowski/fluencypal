# Conversation

Live AI speaking practice: record messages, type chat, or join a full-screen call with webcam + AI avatar.

Applies to `webApp/src/features/Conversation/**`.

## Modes

| Mode     | UI                                                    | Input                                 |
| -------- | ----------------------------------------------------- | ------------------------------------- |
| `record` | Message list + footer recorder (`ConversationCanvas`) | Push-to-talk / recorded audio         |
| `chat`   | Same canvas, keyboard input                           | Text                                  |
| `call`   | Full-screen `CameraCanvas` + `CallButtons`            | Realtime mic (`RealTimeConversation`) |

Every started conversation sets `recordingVoiceMode` to **`RealTimeConversation`** and uses **`initWebRtcConversation`** (or experimental WS). `initTextConversation` is deprecated.

Record/chat still use local recorders/keyboard; submitted text is sent via WebRTC `conversation.item.create` and **optimistically** appended to local history in `webRtc/addThreadsMessage`.

Record and call share `CallEndMenu` (Exit / switch mode / Show results).

## Progress

Progress is **message-count based**, not AI-analyzed:

- Constant: `CONVERSATION_DONE_MESSAGE_COUNT` (`conversationProgress.ts`) = **10** total messages → 100%.
- Helpers: `getConversationProgressPercent`, `isConversationProgressComplete`.
- Call footer bar (`call-progress-bar`) always shows; at 100% keep controls and label the bar **Done**.
- Lesson plans are generated **before** start (`useLessonPlan.createLessonPlan`), injected into the system prompt at `startConversation`, then unused for runtime progress/corrections. Do not reintroduce background lesson-plan analysis during the call.

## Architecture

```
Conversation/
├── ConversationCanvas.tsx          # Record + chat shell; switches to call modal
├── CallEndMenu.tsx                 # Shared end menu (Exit / switch mode / Show results)
├── conversationProgress.ts         # Message-count → progress %
├── CallMode/
│   ├── CameraCanvas.tsx            # Call layout (avatar, webcam, subtitles)
│   ├── CallButtons.tsx             # Call footer controls + progress bar
│   ├── CallSettingsMenu.tsx        # Video on/off, mute, captions, mic picker
│   └── …
├── ConversationInstance/           # WebRTC / realtime WS session clients
├── quizTalk.ts                     # First quiz call (`quiz-talk`) about-you snapshot
├── useAiConversation/              # Orchestration, limits, stats, prompts (`getQuizTalkInstruction`)
├── ProcessUserInput/               # Corrections UX after user speech
├── conversationCanvasBrowserFixtures.tsx
└── ConversationCanvas.browser.test.tsx
```

- **Canvas props in, side effects out:** `ConversationCanvas` / `CameraCanvas` receive callbacks (`closeConversation`, `toggleConversationMode`, `addUserMessage`, …). Do not reach into route code from here.
- **Results entry:** **Show results** lives only in `CallEndMenu`, disabled until progress is 100%. Do **not** replace record/chat controls with “Mission complete / Open results” — users can keep talking after the bar hits Done.
- **End menu:** Red `CallEndIcon` opens shared `CallEndMenu`:
  - Call: **Exit**, **Switch to voice records**, **Show results**
  - Record: **Exit**, **Switch to Call mode**, **Show results**
- **Call settings:** Settings control opens `CallSettingsMenu` (video on/off for both camera tiles, mute AI voice, captions, select microphone). Mic on/off and end-call stay on the footer. Turning video off hides the teacher and learner tiles so captions can fill the call. Selected microphone is persisted in `localStorage` (`preferredMicrophoneId`) and applied live via `ConversationInstance.switchMicrophone`.
- **Results copy:** `useConversationsAnalysis` prompts must address the learner in second person (“You…”), never “the user”.
- **Quiz handoff:** `/practice?justTalk=open` auto-starts only when mic was primed on quiz **Start Speaking** (`fp_justTalkAutoStart` session flag: start unmuted). That first call uses conversation mode **`quiz-talk`**, not `talk`. The prompt reacts to `aboutUserTranscription` (session `fp_quizTalkAbout`, else `users/{uid}/quiz2/{lang}`) with a short acknowledgment + one easy follow-up. Do not change `talk` (dashboard / daily Just Talk) for this. Quiz asks for the browser mic on `micPermission` (`mic-permission-grant`) before the about clip; Start Speaking primes again for auto-start. Teacher voice and learn language come from Firestore user settings (anonymous auth starts at quiz entry, before teacher selection). Cold opens always show `JustTalkHandoffScreen` (`just-talk-handoff`) until **Enable microphone to start talking** (`enable-mic-just-talk`) and stay muted until that tap. Keep `justTalk=open` until the first user message; End call without speech returns to the same panel. Skip-all still goes to empty `/practice`. Start in **call** mode. To verify locally: finish quiz `goalReview` with mic allowed → `quiz-talk` call should start unmuted with the chosen teacher/learn language, no second tap; open `/practice?justTalk=open` cold → handoff panel only (no browser permission dialog until Enable mic).
- **Daily-task completion** for conversation-driven tasks lives in `useAiConversation/useConversationStat.ts` (see `src/features/Tasks/AGENTS.md`).
- **Alias word list:** `AliasGamePanel` is rendered inside `Messages` (not the record footer), so it shows in record, chat, and call. AI Alias (`rolePlayId=alias-game`) starts in **call** mode.

## `data-testid` hooks

| ID                           | Component                                        |
| ---------------------------- | ------------------------------------------------ |
| `conversation-canvas-record` | Record/chat canvas root                          |
| `conversation-canvas-call`   | Call canvas root                                 |
| `call-end-button`            | Red end-call control in `CallButtons`            |
| `call-end-menu`              | Shared `CallEndMenu` options (call + record)     |
| `call-settings-button`       | Call footer Settings control                     |
| `call-settings-menu`         | Call settings: video, mute, captions, select mic |
| `call-microphone-menu`       | Nested microphone picker from call settings      |
| `call-video-preview`         | Teacher + learner camera tiles in call layout    |
| `call-user-preview`          | User webcam tile in call layout                  |
| `call-progress-bar`          | Message-count progress strip on call footer      |
| `call-mic-toggle`            | Call footer mic on/off (`aria-pressed` = unmuted) |
| `conversation-review-modal`  | Post-call / Show results review steps            |
| `just-talk-handoff`          | Persistent Enable-mic screen after quiz `justTalk=open` |

## Testing

Browser screenshot tests: `ConversationCanvas.browser.test.tsx` + `conversationCanvasBrowserFixtures.tsx`.

| Screenshot                                        | Covers                                                                                                                |
| ------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------- |
| `conversation-canvas-record-*`                    | Goal-talk default, role-play states (still recordable at 100%), chat, recording                                       |
| `conversation-canvas-record-alias-word-list`      | Record canvas with Alias `AliasGamePanel` in `Messages`                                                               |
| `conversation-canvas-record-menu-results-ready`   | Record `CallEndMenu` with Show results enabled                                                                        |
| `conversation-canvas-call-*`                      | Call in progress / finish ready (Done on progress bar, strip under footer controls)                                   |
| `conversation-canvas-call-alias-word-list`        | Call canvas with Alias word list in `Messages`                                                                        |
| `conversation-canvas-call-end-menu`               | End-call menu while progress incomplete (Show results disabled)                                                       |
| `conversation-canvas-call-end-menu-results-ready` | End-call menu at 100% (Show results enabled)                                                                          |
| `conversation-canvas-call-settings-menu`          | Settings menu (video, mute, captions, select mic)                                                                     |
| `conversation-canvas-call-video-off`              | Call layout with both camera tiles hidden (captions only)                                                             |
| `conversation-canvas-call-results-*`              | Full-size review modal steps (leaderboard → summary → focus → improve → did-well → phrases-to-remember → next-lesson) |

Run:

```bash
cd webApp && pnpm lint
cd webApp && pnpm exec vitest --config vitest.browser.config.ts --run src/features/Conversation/ConversationCanvas.browser.test.tsx
# After visual changes, update baselines:
cd webApp && pnpm exec vitest --config vitest.browser.config.ts --run --update src/features/Conversation/ConversationCanvas.browser.test.tsx
```

Review updated PNGs under `screenshots/` before finishing.

## Copy (i18n)

User-facing strings use Lingui (`i18n._(...)`). After adding or changing them: `cd webApp && pnpm lang`.
