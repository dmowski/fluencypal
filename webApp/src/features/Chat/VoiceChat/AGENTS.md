# Voice Chat Feature

## Overview

Voice Chat should be a place to safe and comfortable space for talking about anything around limited number of people.

## Feature principle:

No text transcripts, no option to write text.
When listen, ability to to rewind and see visualization

## UI

On dashboard, let's create a card called "Voice chat with people"
webApp/src/features/Dashboard/Dashboard.tsx
Use this image as preview
https://storage.googleapis.com/dark-lang.firebasestorage.app/uploadedImages%2FMq2HfU3KrXTjNyOpPXqHSPg5izV2%2F1785015399032-Mq2HfU3KrXTjNyOpPXqHSPg5izV2.png

Use webApp/src/features/uiKit/Card/StoreCard/StoreCard.tsx without items,
On new users, in children of StoreCard.tsx we should see to required action items needed to done

1. Be paid user
2. Record audio about yourself about 3 mins
3. Get approve

Near each point we need to add info section with description of why it's needed.

Add button with "Rules of chat". Add mention that messages are removing after some days.

## Play user message

Create a custom audio player what allows to rewind, pause, restart and see progress of playing audio.
When finishing one message, start another message.

## Recording message

Use VoiceVisualizer to show user's recording. Alow user to re listen it before sending.

## Reply functionality

Near each message, show the button "Record Reply", after clicking on it, the recording will start and after finishing recording it will be option to listen and send.

## Remove my message

On my messages, there's should be a button "Remove" my message. In case it there's some replies, remove them too. Remove audio files from storage as well.

## Remove old messages

Create a cron job that removes messages older that 4 days.

## Notifications

On dashboard card show number of new messages(un listened). When user pass onboarding.

## Onboarding

After approval, the intro recording is already in the chat. Soften the empty/first-visit state — e.g. highlight the thread and invite them to listen and reply: “Your intro is here — listen to others and send a reply when you’re ready.” Avoid “Send your first Hello” once the intro message already exists.

## PayWall

On dashboard card, as required step show button "Start" near "be paid" label. When user click on it, show paywall.

## Approves

By default, only founder can approve new joiners.
Send telegram notification when someone requested the access. And on UI, show list of request with buttons "Approve" and "Reject". On both cases, show it to users on the page in "VoiceChatDashboardCard children content".
But create placeholder/technical possibility to set multiple number of approvers.

## Feature flag

For the beginning, hide that feature (from dashboard) for all users but founder (webApp/src/features/Auth/useAuth.tsx isFounder).

## Technical notes

Add necessary types here
webApp/src/features/Chat/VoiceChat/types.ts

Make separate space for voice chat
webApp/firestore.rules

Ensure it provide good safety: Unpaid users (or none game winners), users without approve, should not be able to listen other messages data. It might be challenging to create such firestore rules. To simplify that you can do this: create backend function that validates data. You can create a separate function for paid users and separate function for game winner.

endpoint: validate game rate function: call it when someone became a new top-5 winner. and it updates dedicated collection for game winners.

endpoint: validate paid users: call it when someone bought subscription (or daily with cron): this function will check all users (or user how requested it), and updated dedicated true/false collection.

In general voice chat feature should be more or less independent from other chat related feature on the app.

Places all code inside
webApp/src/features/Chat/VoiceChat. for backend endpoints use tight files that calls functions that places inside webApp/src/features/Chat/VoiceChat/backend

## Testing coverage

Utilize e2e tests to validate functionality. Avoid mocking something (except paid/unpaid users) and sending telegram messages.

# Implementation steps

Research notes (do not treat existing Chat as drop-in):

- Do **not** reuse `useChat` / `ThreadsMessage` as the data model: it requires `content: string`, open `chat/**` rules for any signed-in user, soft-delete without cascading Storage cleanup, and public `uploadedAudios` via `makePublic()`.
- Reuse UX ideas only: nested `parentMessageId` chains, per-user read metadata / unread counts, `StoreCard` + dashboard card composition, `useAccess().showPaymentModal()`, `GlobalModals` + `useUrlState` modal pattern, mic + `VoiceVisualizer` (without transcription), `sentSupportTelegramMessage` from server-only paths, Vercel cron in `vercel.json`.
- Entitlement must be server-owned snapshots (paid ∨ live top-5), not client `isFullAppAccess`.

## Phase 0 — Locked product decisions

1. **TTL:** 4 days (update root `PLAN.md` from “5 days”).
2. **Intro audio:** ~3 min recording *is* the join request. On approve, server posts that same audio into the global chat as the user’s first message.
3. **Room:** one global Voice Chat.
4. **Replies:** nested (`parentMessageId` tree).
5. **Paid:** any real payment (`PaymentLog.amountAdded > 0`) excluding trial (`type !== 'trial-days'`; also ignore pure welcome/trial grants). Not subscription-active-only.
6. **Game winner:** live top-5 only (no grace).
7. **UI entry:** `VoiceChatModal` registered in `GlobalModals.tsx` via `useGlobalModals` / `useUrlState` (same pattern as public chat).
8. **Reject / re-request:** rejected users may re-request after **10 days** from `decidedAt`.
9. **Approvers:** `voiceChat/config.approverIds: string[]` (seed with founder UID).
10. **Unread:** mark listened on **any playback progress** (first `timeupdate` / progress > 0).

Constants to put in `types.ts` / backend: `VOICE_CHAT_MESSAGE_TTL_DAYS = 4`, `VOICE_CHAT_REREQUEST_COOLDOWN_DAYS = 10`.

## Phase 1 — Types, data model, rules skeleton

1. Fill `types.ts`: config, entitlements, member/request status, voice message (no transcript), read metadata, dashboard/checklist view-model, constants above.
2. Firestore (dedicated tree, not `/chat`):
   - `voiceChat/config` — `{ approverIds: string[] }`
   - `voiceChat/entitlements/{uid}` — `{ isPaid, isGameWinner, updatedAt }`
   - `voiceChat/members/{uid}` — `{ status: pending|approved|rejected, introAudioPath, introDurationSec?, requestedAt, decidedAt?, decidedBy?, postedIntroMessageId? }`
   - `voiceChat/messages/{messageId}` — `{ audioPath, durationSec, senderId, parentMessageId, createdAt, isIntro? }`
   - `users/{uid}/stats/voiceChatReadMetadata` — listened message id map
3. Storage: private prefix `voiceChat/...` — **never** `makePublic()`. Intro audio stays private; on approve it is referenced (or copied) into a message doc.
4. Rules: deny-by-default client writes for messages/membership/entitlements (Admin SDK via APIs). Clients may read own member doc; message/audio access only through authorized APIs + signed URLs (or rules that check entitlement + approved member docs if feasible).
5. Keep independent from existing Chat send/delete paths.

## Phase 2 — Backend entitlements + membership

1. `backend/entitlements.ts` + thin `/api/voice-chat/*` routes:
   - **validate-paid:** `isPaid` if user has any non-trial payment with amount > 0 (scan `users/{uid}/payments`). Hook after `addPaymentLog` / webhooks; daily cron reconcile (batch or on-demand).
   - **validate-game-winner:** recompute live top-5 from `game2/gamePoints`; write `isGameWinner` for all affected uids; call after point changes + daily reconcile. Dropping out of top-5 clears access unless still `isPaid`.
2. `assertCanRequestAccess(uid)`: auth + (isPaid ∨ isGameWinner).
3. `assertVoiceChatParticipant(uid)`: auth + entitlement + `status === 'approved'` — used by list/play/send/delete/listen.
4. Membership APIs:
   - **request:** upload intro audio → `status: pending` (block if pending, or if rejected and `now < decidedAt + 10d`).
   - **list pending:** caller ∈ `approverIds`.
   - **approve:** verify approver → `approved` → **create message** from intro audio (root message, `isIntro: true`) → set `postedIntroMessageId` → Telegram optional ack.
   - **reject:** verify approver → `rejected` + `decidedAt` (card shows rejected + re-request countdown).
   - Telegram on new request via server helper only (mock in e2e).
5. Seed/ensure `voiceChat/config.approverIds` includes founder UID.

## Phase 3 — Messages API (send / play / delete / cleanup)

1. Upload + create message (approved members only); support nested `parentMessageId`.
2. List messages for global room (ordered for player queue: depth-first or chronological — pick chronological for auto-advance simplicity; nest visually in UI).
3. Signed URL (or streaming) endpoint for audio; no public objects.
4. **mark-listened:** on first playback progress from client.
5. **delete own message:** recursively delete entire reply subtree + storage objects + read-metadata keys.
6. Cron `GET /api/voice-chat/cleanup` (4-day TTL) in `vercel.json`, authorize with `CRON_SECRET`, cascade replies + storage, idempotent.

## Phase 4 — Client feature module (founder-gated UI)

Folder: `webApp/src/features/Chat/VoiceChat/` (+ `api/`, `backend/`, components).

1. Feature flag: dashboard card only if `auth.isFounder`. Server still enforces access.
2. `VoiceChatDashboardCard` on `Dashboard.tsx`:
   - `StoreCard` + preview image, `items={[]}`
   - children checklist: (1) Be paid → Start → paywall (2) Record ~3 min intro / re-request if cooldown elapsed (3) Get approve — each with info why
   - show pending / rejected(+days left) / approved states
   - “Rules of chat” (placeholder copy ok for v1) + “messages remove after 4 days”
   - unread badge after approved + onboarded
   - approver UI: pending list Approve/Reject
3. `VoiceChatModal` in `GlobalModals.tsx` + `useGlobalModals` URL flag (e.g. `voiceChat`); open from card when approved.
4. Inside modal: nested message list, no text, no transcripts.
5. Custom player: pause / rewind / restart / progress / visualization; end → next; mark listened on progress.
6. VoiceChat recorder wrapper (`VoiceVisualizer`, preview, send) — **no** `/api/transcript`.
7. “Record Reply” on any message (nested).
8. “Remove” on own messages → cascade API.
9. Onboarding highlight after approve: “Send your first 'Hello'” (intro may already be posted by approve — treat that as first message; prompt only if somehow missing / encourage next hello as product copy).

## Phase 5 — Wire integrations

1. Payment webhooks / `addPaymentLog` → validate-paid for that uid.
2. Game points increase + daily job → validate-game-winner.
3. i18n via `i18n._(...)`, then `pnpm lang`.
4. Align `PLAN.md` Voice Chat bullets (4-day delete, modal, etc.).

## Phase 6 — Testing

1. Unit: unread helpers, nested cascade delete, paid detector (trial vs real), re-request cooldown, approve→intro message creation.
2. E2E `webApp/e2e/voice-chat/` (mock only paid/unpaid + Telegram):
   - hidden for non-founder; visible for founder
   - unpaid / unapproved cannot list or play
   - request with intro → approve posts intro into chat; reject shows 10-day cooldown
   - nested reply → play progress clears unread → auto-advance
   - remove parent removes reply tree + storage
   - cleanup cron removes >4 day messages
3. `pnpm lint`, targeted e2e, full `pnpm test:e2e` before handoff.

## Suggested build order (vertical slices)

1. Types + constants + empty founder-only dashboard card + `VoiceChatModal` shell in `GlobalModals`.
2. Entitlements (paid non-trial + live top-5) + rules deny + validate endpoints/crons.
3. Membership request (intro upload) / approve-reject + Telegram + checklist UI + paywall Start; **approve posts intro message**.
4. List/play with signed URLs + custom player (mark listened on progress) + unread badge.
5. Nested reply send + preview recorder.
6. Cascade delete + 4-day cleanup cron.
7. E2E hardening.
