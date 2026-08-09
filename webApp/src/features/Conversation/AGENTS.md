# Conversation

Live AI speaking practice: record messages, type chat, or join a full-screen call with webcam + AI avatar.

Applies to `webApp/src/features/Conversation/**`.

## Modes

| Mode | UI | Input |
| --- | --- | --- |
| `record` | Message list + footer recorder (`ConversationCanvas`) | Push-to-talk / recorded audio |
| `chat` | Same canvas, keyboard input | Text |
| `call` | Full-screen `CameraCanvas` + `CallButtons` | VAD, push-to-talk, or realtime mic |

Mode is a `ConversationMode` setting toggled via `toggleConversationMode`. Record-mode overflow menu: `RecordingCanvasMenu` (Exit / Voice records / Keyboard / Call).

## Architecture

```
Conversation/
├── ConversationCanvas.tsx          # Record + chat shell; switches to call modal
├── RecordingCanvasMenu.tsx         # Mode switcher + exit (record/chat)
├── CallMode/
│   ├── CameraCanvas.tsx            # Call layout (avatar, webcam, subtitles)
│   ├── CallButtons.tsx             # Call footer controls
│   ├── CallEndMenu.tsx             # End-call menu (Close / Switch to voice records)
│   └── …
├── ConversationInstance/           # WebRTC / realtime WS session clients
├── useAiConversation/              # Orchestration, limits, stats, prompts
├── ProcessUserInput/               # Corrections UX after user speech
├── conversationCanvasBrowserFixtures.tsx
└── ConversationCanvas.browser.test.tsx
```

- **Canvas props in, side effects out:** `ConversationCanvas` / `CameraCanvas` receive callbacks (`closeConversation`, `toggleConversationMode`, `addUserMessage`, …). Do not reach into route code from here.
- **Call end vs switch mode:** In call mode, red `CallEndIcon` opens a menu — **Close** (`fullExit` → `closeConversation`) vs **Switch to voice records** (`exit` → `toggleConversationMode('record')`). Do not wire the end button to exit the call immediately.
- **Daily-task completion** for conversation-driven tasks lives in `useAiConversation/useConversationStat.ts` (see `webApp/AGENTS.md` → Daily Tasks).

## `data-testid` hooks

| ID | Component |
| --- | --- |
| `conversation-canvas-record` | Record/chat canvas root |
| `conversation-canvas-call` | Call canvas root |
| `call-end-button` | Red end-call control in `CallButtons` |
| `call-end-menu` | `CallEndMenu` options (Close / Switch to voice records) |

## Testing

Browser screenshot tests: `ConversationCanvas.browser.test.tsx` + `conversationCanvasBrowserFixtures.tsx`.

| Screenshot | Covers |
| --- | --- |
| `conversation-canvas-record-*` | Goal-talk default, role-play states, chat input, recording |
| `conversation-canvas-call-*` | Call role-play in progress / finish ready |
| `conversation-canvas-call-end-menu` | End-call menu open on call canvas |

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
