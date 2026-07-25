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

Each step is a vertical feature slice: ship UI + backend + tests together. Put e2e under `webApp/e2e/voice-chat/`. Mock only paid/unpaid entitlement and Telegram sends.

Research notes (do not treat existing Chat as drop-in):

- Do **not** reuse `useChat` / `ThreadsMessage`: text `content`, open `chat/**` rules, soft-delete without Storage cascade, public `makePublic()` audio.
- Reuse: nested `parentMessageId`, read/unread ideas, `StoreCard`, `showPaymentModal()`, `GlobalModals` + `useUrlState`, mic + `VoiceVisualizer` (no transcript), server Telegram helper, Vercel cron.
- Entitlements are server snapshots (paid ∨ live top-5), not client `isFullAppAccess`.

## Locked product decisions

1. **TTL:** 4 days (fix `PLAN.md` “5 days”).
2. **Intro audio:** join request itself; on approve, server posts it as the user’s first chat message.
3. **Room:** one global Voice Chat.
4. **Replies:** nested.
5. **Paid:** any real payment (`amountAdded > 0`), exclude `trial-days` / welcome trial grants.
6. **Game winner:** live top-5 only.
7. **UI entry:** `VoiceChatModal` via `GlobalModals` + `useUrlState`.
8. **Re-request:** 10 days after reject (`decidedAt`).
9. **Approvers:** `voiceChat/config.approverIds` (seed founder).
10. **Unread:** mark listened on any playback progress.

Constants: `VOICE_CHAT_MESSAGE_TTL_DAYS = 4`, `VOICE_CHAT_REREQUEST_COOLDOWN_DAYS = 10`.

Friendly copy targets (i18n later):

- Checklist: “Become a member”, “Share a short intro (~3 min)”, “Wait for approval”
- Pending: “Thanks — we’re reviewing your intro”
- Rejected: “Not this time. You can try again in X days”
- Approved card CTA: “Open Voice Chat”
- Rules note: “Messages are removed after 4 days”
- First visit in modal: “Your intro is already in the room. Listen to others, then reply when you’re ready.”

---

### Step 1 — Founder-only shell

**Ship:** `types.ts` constants + core types; `VoiceChatDashboardCard` on `Dashboard` (`StoreCard`, preview image, `items={[]}`, placeholder children); `VoiceChatModal` shell in `GlobalModals` / `useGlobalModals`; visible only when `auth.isFounder`.

**E2E:** card hidden for normal user; visible for founder; opens empty modal.

---

### Step 2 — Access entitlements + hard gates

**Ship:** Firestore tree + rules (deny client writes for entitlements/messages/membership decisions); private Storage prefix (never `makePublic`); `backend/entitlements.ts` + validate-paid / validate-game-winner APIs; hooks from payment + game points + daily reconcile; `assertCanRequestAccess` / `assertVoiceChatParticipant`.

**Data:**
- `voiceChat/config` — `approverIds`
- `voiceChat/entitlements/{uid}` — `isPaid`, `isGameWinner`
- `voiceChat/members/{uid}`, `voiceChat/messages/{messageId}`, read metadata under `users/{uid}/stats/...`

**Unit:** paid detector (trial vs real payment).
**E2E:** unpaid / non-winner cannot call participant APIs (list/play/send); founder flag still required for card visibility.

---

### Step 3 — Join checklist, paywall, intro request

**Ship:** card checklist with info blurbs; “Start” → paywall; intro recorder (~3 min, `VoiceVisualizer`, preview, no transcript); request-access API (upload intro → `pending`); block duplicate pending; Telegram on request (server-only); “Rules of chat” + 4-day retention note.

**E2E:** unpaid sees paywall path; entitled user records intro → pending state on card; Telegram mocked.

---

### Step 4 — Approve / reject (+ intro lands in chat)

**Ship:** seed `approverIds`; approver pending list on card; approve/reject APIs; on approve → post intro as root `isIntro` message + `postedIntroMessageId`; reject → `decidedAt` + 10-day re-request UI; requester sees approved/rejected in card children.

**Unit:** re-request cooldown; approve creates intro message.
**E2E:** approver approves → requester approved + intro message exists; reject → cooldown copy; re-request blocked until 10 days (time-travel/fixture).

---

### Step 5 — Listen: list, player, unread badge

**Ship:** list messages API + signed audio URLs; nested list UI in modal; custom player (pause, rewind, restart, progress, visualization); auto-advance to next; mark-listened on progress; dashboard unread badge after approved; first-visit friendly highlight (intro already posted).

**Unit:** unread count helper.
**E2E:** approved user opens modal, plays message → unread decreases; auto-advance to next; unapproved cannot fetch audio.

---

### Step 6 — Record reply (nested)

**Ship:** “Record Reply” on any message; recorder preview → send; nested `parentMessageId`; chronological play queue, nested visual layout.

**E2E:** reply under a message appears nested; plays in queue after parent (or in chronological order as implemented).

---

### Step 7 — Remove my message (cascade)

**Ship:** “Remove” on own messages; recursive reply subtree delete + Storage + read-metadata cleanup.

**Unit:** cascade planning for nested trees.
**E2E:** delete parent removes replies and audio objects; other users no longer see them.

---

### Step 8 — 4-day cleanup cron

**Ship:** `GET /api/voice-chat/cleanup` + `vercel.json` schedule; `CRON_SECRET`; delete messages older than 4 days with same cascade as Step 7; idempotent.

**E2E:** seed old message(+reply) → run cleanup → docs and storage gone; recent messages kept.

---

### Step 9 — Polish + handoff

**Ship:** i18n (`pnpm lang`); align `PLAN.md`; any remaining friendly copy; `pnpm lint`; full `pnpm test:e2e` once.
