# Voice Chat

Voice-only room for a small group. No text transcripts, no typing — record, listen, reply, remove.

## Product rules

| Topic | Decision |
| --- | --- |
| Room | One global voice chat |
| Access | Paid membership **or** live top-5 game winner, plus host approval |
| Intro | ~3 min audio submitted with join request; on approve, server posts it as the user's first message (`isIntro`) |
| Replies | Nested (`parentMessageId`) |
| Retention | Messages removed after **4 days** (`VOICE_CHAT_MESSAGE_TTL_DAYS`) |
| Re-request after reject | **10 days** (`VOICE_CHAT_REREQUEST_COOLDOWN_DAYS`) |
| Paid detection | Real payment (`amountAdded > 0`); exclude `trial-days` / `welcome` |
| Unread | Mark listened on any playback progress |
| Feature flag | Dashboard card visible only when `auth.isFounder` (modal opens via URL for any signed-in user; APIs enforce access) |
| Approvers | `voiceChat/config.approverIds` (seeded with founder UID) |

Constants live in `types.ts`.

## Architecture

```
webApp/src/features/Chat/VoiceChat/
├── VoiceChatDashboardCard.tsx   # onboarding checklist, pending approvals, unread badge
├── VoiceChatModal.tsx           # message thread + root recorder
├── api/voiceChatClient.ts       # browser fetch wrappers
├── backend/                     # domain logic (routes import from here)
├── components/                  # player, recorder, message list
└── types.ts
```

API route files under `webApp/src/app/api/voice-chat/*` stay thin; business logic belongs in `backend/`.

**Do not reuse** text-chat `useChat` / `ThreadsMessage` / public `makePublic()` audio. **Do reuse** nested replies pattern, `StoreCard`, `showPaymentModal()`, `GlobalModals` + `useUrlState`, mic + `VoiceVisualizer` (recording only), server Telegram helper, Vercel cron.

### Firestore (API-only writes)

| Path | Purpose |
| --- | --- |
| `voiceChat/config` | `approverIds` |
| `voiceChatEntitlements/{uid}` | `isPaid`, `isGameWinner` snapshots |
| `voiceChatMembers/{uid}` | join request / approval state |
| `voiceChatMessages/{messageId}` | message metadata |
| `users/{uid}/stats/voiceChatReadMetadata` | listened flags |

Private storage prefix: `voiceChat/audio/…` (never `makePublic()`).

Entitlement hooks: `addPaymentLog.ts` → `validatePaidForUser`; game points update → `validateGameWinners`.

### API surface

| Route | Notes |
| --- | --- |
| `GET /status` | Checklist + unread + pending list for approvers |
| `POST /request-access` | Upload intro (min 5s), Telegram notify |
| `POST /decide` | Approve / reject |
| `GET\|POST /messages` | List / send (participant gate) |
| `DELETE /messages/[id]` | Cascade delete own subtree + storage |
| `GET /messages/[id]/audio` | Signed audio stream |
| `POST /mark-listened` | Unread decrement |
| `POST /validate-paid` | Reconcile paid snapshot |
| `POST /validate-game-winner` | Reconcile top-5 winners |
| `GET /cleanup` | Cron: delete messages older than TTL |

## UI entry

- **Dashboard:** `VoiceChatDashboardCard` on `Dashboard.tsx` (founder-only for now).
- **Modal:** `VoiceChatModal` via `GlobalModals` / `?voiceChat=true`.
- **Checklist copy:** Become a member → Share intro (~3 min) → Wait for approval.
- **First visit in modal:** Friendly intro highlight when messages exist (not on empty shell).
- **Rules dialog:** Kindness, voice-only, 4-day retention, self-remove.

## `data-testid` hooks

| ID | Component |
| --- | --- |
| `voice-chat-dashboard-card` | Dashboard card |
| `voice-chat-pending-list` | Approver pending requests |
| `voice-chat-modal` | Modal root |
| `voice-chat-recorder` | Recorder panel |
| `voice-chat-player` | Audio player |
| `voice-chat-message-{id}` | Message row |
| `voice-chat-empty` | Empty thread state |

## Testing

Helpers: `webApp/e2e/libs/voice-chat.ts` (founder auth, paid seeding, API fixtures, Telegram mock).

Specs: `webApp/e2e/voice-chat/*.spec.ts`

| Spec | Covers |
| --- | --- |
| `shell.spec.ts` | Founder-only card, modal shell |
| `access.spec.ts` | Entitlement / approval API gates, reject cooldown |
| `onboarding.spec.ts` | Request access, approver UI, intro posted on approve |
| `messages.spec.ts` | Unread, listen UI, cascade delete |
| `cleanup.spec.ts` | TTL cron |

**Allowed mocks:** paid/unpaid entitlements (seed payments or Firestore), Telegram (never sent when `IS_FIREBASE_EMULATOR=true` or `E2E_DISABLE_TELEGRAM=true`; browser stubs in `e2e/libs/telegram.ts` via `e2e/voice-chat/fixtures.ts`).

**Avoid mocking:** message list, approval flow, storage cascade, player progress — exercise real API + emulator.

Unit tests: `backend/paidDetector.test.ts`, `backend/messages.cascade.test.ts` (`collectSubtreeIds`).

Run:

```bash
cd webApp && pnpm lint
cd webApp && pnpm test:unit -- --testPathPattern=VoiceChat
cd webApp && pnpm exec playwright test e2e/voice-chat
```

## Copy targets (i18n)

Dashboard card strings use Lingui. All Voice Chat UI copy is wrapped with `i18n._()` — run `pnpm lang` after changing user-facing text.
