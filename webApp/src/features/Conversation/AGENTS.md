# Conversation

Live AI speaking practice: record messages, type chat, or join a full-screen call with webcam + AI avatar.

Applies to `webApp/src/features/Conversation/**`.

## Modes

| Mode | UI | Input |
| --- | --- | --- |
| `record` | Message list + footer recorder (`ConversationCanvas`) | Push-to-talk / recorded audio |
| `chat` | Same canvas, keyboard input | Text |
| `call` | Full-screen `CameraCanvas` + `CallButtons` | Realtime mic (`RealTimeConversation`) |

Every started conversation sets `recordingVoiceMode` to **`RealTimeConversation`** and uses the WebRTC (or experimental WS) transport. Record-mode overflow menu: `RecordingCanvasMenu` (Exit / Voice records / Keyboard / Call).

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
├── RecordingCanvasMenu.tsx         # Mode switcher + exit (record/chat)
├── conversationProgress.ts         # Message-count → progress %
├── CallMode/
│   ├── CameraCanvas.tsx            # Call layout (avatar, webcam, subtitles)
│   ├── CallButtons.tsx             # Call footer controls + progress bar
│   ├── CallEndMenu.tsx             # End-call menu (Close / Voice records / Show results)
│   └── …
├── ConversationInstance/           # WebRTC / realtime WS session clients
├── useAiConversation/              # Orchestration, limits, stats, prompts
├── ProcessUserInput/               # Corrections UX after user speech
├── conversationCanvasBrowserFixtures.tsx
└── ConversationCanvas.browser.test.tsx
```

- **Canvas props in, side effects out:** `ConversationCanvas` / `CameraCanvas` receive callbacks (`closeConversation`, `toggleConversationMode`, `addUserMessage`, …). Do not reach into route code from here.
- **Call end menu:** Red `CallEndIcon` opens `CallEndMenu` — **Close** (`fullExit`), **Switch to voice records** (`exit` → record mode), **Show results** (opens `ConversationReviewModal` over call; disabled until progress is 100%). Do not wire the end button to exit immediately.
- **Results copy:** `useConversationsAnalysis` prompts must address the learner in second person (“You…”), never “the user”.
- **Daily-task completion** for conversation-driven tasks lives in `useAiConversation/useConversationStat.ts` (see `webApp/AGENTS.md` → Daily Tasks).

## `data-testid` hooks

| ID | Component |
| --- | --- |
| `conversation-canvas-record` | Record/chat canvas root |
| `conversation-canvas-call` | Call canvas root |
| `call-end-button` | Red end-call control in `CallButtons` |
| `call-end-menu` | `CallEndMenu` options |
| `call-progress-bar` | Message-count progress strip on call footer |
| `conversation-review-modal` | Post-call / Show results review steps |

## Testing

Browser screenshot tests: `ConversationCanvas.browser.test.tsx` + `conversationCanvasBrowserFixtures.tsx`.

| Screenshot | Covers |
| --- | --- |
| `conversation-canvas-record-*` | Goal-talk default, role-play states, chat input, recording |
| `conversation-canvas-call-*` | Call in progress / finish ready (Done on progress bar) |
| `conversation-canvas-call-end-menu` | End-call menu while progress incomplete (Show results disabled) |
| `conversation-canvas-call-end-menu-results-ready` | End-call menu at 100% (Show results enabled) |
| `conversation-canvas-call-results-*` | Review modal steps over call (leaderboard → summary → focus → improve → did-well → next-lesson) |

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
