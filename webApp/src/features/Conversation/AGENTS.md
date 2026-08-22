# Conversation

Live AI speaking practice: record messages, type chat, or join a full-screen call with webcam + AI avatar.

Applies to `webApp/src/features/Conversation/**`.

## Modes

| Mode | UI | Input |
| --- | --- | --- |
| `record` | Message list + footer recorder (`ConversationCanvas`) | Push-to-talk / recorded audio |
| `chat` | Same canvas, keyboard input | Text |
| `call` | Full-screen `CameraCanvas` + `CallButtons` | Realtime mic (`RealTimeConversation`) |

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
│   └── …
├── ConversationInstance/           # WebRTC / realtime WS session clients
├── useAiConversation/              # Orchestration, limits, stats, prompts
├── ProcessUserInput/               # Corrections UX after user speech
├── conversationCanvasBrowserFixtures.tsx
└── ConversationCanvas.browser.test.tsx
```

- **Canvas props in, side effects out:** `ConversationCanvas` / `CameraCanvas` receive callbacks (`closeConversation`, `toggleConversationMode`, `addUserMessage`, …). Do not reach into route code from here.
- **Results entry:** **Show results** lives only in `CallEndMenu`, disabled until progress is 100%. Do **not** replace record/chat controls with “Mission complete / Open results” — users can keep talking after the bar hits Done.
- **End menu:** Red `CallEndIcon` opens shared `CallEndMenu`:
  - Call: **Exit**, **Switch to voice records**, **Show results**
  - Record: **Exit**, **Switch to Call mode**, **Show results**
- **Results copy:** `useConversationsAnalysis` prompts must address the learner in second person (“You…”), never “the user”.
- **Daily-task completion** for conversation-driven tasks lives in `useAiConversation/useConversationStat.ts` (see `src/features/Tasks/AGENTS.md`).

## `data-testid` hooks

| ID | Component |
| --- | --- |
| `conversation-canvas-record` | Record/chat canvas root |
| `conversation-canvas-call` | Call canvas root |
| `call-end-button` | Red end-call control in `CallButtons` |
| `call-end-menu` | Shared `CallEndMenu` options (call + record) |
| `call-progress-bar` | Message-count progress strip on call footer |
| `conversation-review-modal` | Post-call / Show results review steps |

## Testing

Browser screenshot tests: `ConversationCanvas.browser.test.tsx` + `conversationCanvasBrowserFixtures.tsx`.

| Screenshot | Covers |
| --- | --- |
| `conversation-canvas-record-*` | Goal-talk default, role-play states (still recordable at 100%), chat, recording |
| `conversation-canvas-record-menu-results-ready` | Record `CallEndMenu` with Show results enabled |
| `conversation-canvas-call-*` | Call in progress / finish ready (Done on progress bar) |
| `conversation-canvas-call-end-menu` | End-call menu while progress incomplete (Show results disabled) |
| `conversation-canvas-call-end-menu-results-ready` | End-call menu at 100% (Show results enabled) |
| `conversation-canvas-call-results-*` | Full-size review modal steps (leaderboard → summary → focus → improve → did-well → next-lesson) |

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
