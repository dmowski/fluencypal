# Talk with AI

Founder-style voice practice on GPT-Live (`gpt-live-1`). A separate USD balance from practice hours. This is not FluencyPal Calls (`FluencyCall`).

Applies to `webApp/src/features/OpenAiLive/**`.

## Product rules

| Topic | Decision |
| --- | --- |
| Who sees the card | Full access (active subscription or hours on the practice balance) or a current top-5 game winner. Daily-task access does not count. |
| Balance | Separate ledger in USD micros. Credit it with `recordOpenAiLivePayment`, never by adding practice hours in `addPaymentLog`. A payment-log row still records the purchase so history and refunds can debit the live balance. |
| Price | $0.10 per minute, $6 per hour. Packs are 1, 3, and 10 hours. API cost and margin stay in `pricing.ts`. |
| Welcome | $1 once, the first time an eligible user loads the card. |
| Start | Blocked below $0.25. That covers OpenAI's connection charge. |
| Empty balance | Info modal first (`OpenAiLiveBalanceEndedModal`). Buy more hours opens `OpenAiLiveHoursModal`. Stripe runs only after the payment form is confirmed. |
| Accent | The teacher says it cannot analyze an accent. It can only check whether the speech is correct. Do not send accent requests to the backend. |
| Transcripts | Saved with `useChatHistory` as mode `open-ai-live`. The admin panel reads those conversation docs. |
| Preview | `/live-preview` uses the same access check and must not open a real GPT-Live session. |
| Copy | New strings use `i18n._('English')`. Do not run a full locale extract for this feature. |

## Architecture

```
OpenAiLive/
├── OpenAiLiveDashboardCard.tsx    # card, start, paywall, call overlay
├── OpenAiLiveStartModal.tsx       # teacher, then lesson
├── OpenAiLiveCall.tsx             # in-call UI
├── connectLiveCall.ts             # WebRTC, data channel, browser logs
├── useOpenAiLiveCall.ts           # session lifecycle, billing ticks, history
├── instructions.ts                # live prompt and backend prompt
├── pricing.ts                     # user price, welcome, billing cap
├── voices.ts                      # GPT-Live voices and sample URLs
├── teacherPlayback.ts             # unlock and play the teacher
└── backend/                       # session, billing, checkout
```

API routes under `webApp/src/app/api/openAiLive/*` stay thin. `requireOpenAiLiveUser` checks the same full-access rule as the card.

| Route | What |
| --- | --- |
| `POST /session` | Close any active session, create the GPT-Live WebRTC session, start billing |
| `POST /usage` | Bill elapsed time, about every 5 seconds |
| `POST /close` | Bill the remainder and mark the session closed |
| `POST /welcome` | Grant the $1 welcome once |
| `POST /checkout` | Stripe Checkout for hour packs. Product `open-ai-live` |

The Stripe webhook credits `users/{uid}/openAiLive/account` and writes a payment log (`open-ai-live`, or the paid-access row when hours come with Conversation). It does not touch the practice-hours balance. Withdrawing that payment debits the credited hours.

## Call

- Server creates the session: `POST https://api.openai.com/v1/live/sessions` with `model: gpt-live-1` and Responses delegation (`gpt-5.6-luna`).
- Browser: `RTCPeerConnection` and data channel `oai-events`. Do not send `session.start` on WebRTC.
- After `session.started`, greet with `session.instructions.append` (`delegation_id: null`).
- Live prompt follows [Prompting GPT-Live](https://developers.openai.com/api/docs/guides/live-prompting): role, backchannel, interruption, and delegation policy. The correctness procedure stays on the backend prompt.
- Mute replaces the mic track with silence and sends `session.input_audio.mute`. Do not set `micTrack.enabled = false`; that cuts the teacher.
- Unlock teacher audio inside the Start conversation click, before any `await`.
- The call overlay locks document scroll. Its background is an opaque gradient.
- Browser console: filter `[open-ai-live]`. Audio and transcript deltas log the event name only.

## Billing when the page dies

Usage ticks stop when the tab closes. The balance does not keep draining. The session can stay `active` until the next start, which closes it. One tick never charges more than 2 minutes (`OPEN_AI_LIVE_MAX_BILLING_GAP_MS`).

## Firestore

| Path | Who writes |
| --- | --- |
| `users/{uid}/openAiLive/account` | Admin SDK. The owner can read. |
| `users/{uid}/openAiLiveSessions/{sessionId}` | Admin SDK |
| `users/{uid}/openAiLivePayments/{paymentId}` | Admin SDK |

Client reads go through `db.documents`, not `db.docs`.

## Voices

Official GPT-Live voices only, in `voices.ts`. Samples are `webApp/public/audio/open-ai-live/{id}.mp3`. The chosen teacher is `localStorage` key `openAiLive.teacherVoice`. Do not read that key inside `useState`; it mismatches hydration.

## UI entry

- Dashboard: `OpenAiLiveDashboardCard` when `useCanUseOpenAiLive` is true.
- Preview: `webApp/src/app/live-preview/page.tsx`.

## Testing

```bash
cd webApp && pnpm exec jest src/features/OpenAiLive/pricing.test.ts
cd webApp && pnpm lint
```

Do not start a real GPT-Live call to check UI. Use `/live-preview`.
