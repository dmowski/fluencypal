# FluencyPal Calls

Scheduled group calls on Google Meet, with a chat for people who joined. This is not the Talk with AI voice feature (`OpenAiLive`).

Applies to `webApp/src/features/FluencyCall/**`.

## Product rules

| Topic                       | Decision                                                                                                                                                                                                    |
| --------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Who sees the dashboard card | Signed-in users. The card hides while calls, access, or the user's request are loading.                                                                                                                     |
| Who can join                | Full access (active subscription or hours on the balance), a current top-5 game winner, or an active group-call month pass. Daily-task access does not count. Parental-consent blocks still hide community. |
| Price                       | $2 for one month. A separate Stripe product, `fluency-call`. It does not renew, and it does not touch the practice-hours balance. Paying again extends from the later of now and the current end.           |
| Onboarding                  | The first "I'll join" opens "Before you join". Agree saves the time on the user document and joins. Close does not join. Later joins skip the modal.                                                         |
| Request                     | One request per user, for people who can join. The API writes it and sends Telegram. Admins accept or reject.                                                                                               |
| Schedule                    | Admins create each call, the Meet link, and the start time. Members do not write the call document.                                                                                                         |
| Visible calls               | Every `scheduled` call that is upcoming, or that started within the last 12 hours. `stopped` calls stay hidden. A person can join more than one.                                                            |
| Live                        | A listed call is live when `startsAtIso` is in the past. The row opens the Meet link. Stopping the call is a separate admin action.                                                                         |
| Chat                        | One community chat per call, space id `fluencyCall_{callId}`. Reuse `ChatSection`. Do not build a second messenger.                                                                                         |
| Times                       | Stored as UTC ISO. The card shows the viewer's timezone. Telegram uses Warsaw.                                                                                                                              |

## Architecture

```
FluencyCall/
├── FluencyCallDashboardCard.tsx   # list, paywall, conduct, chat
├── FluencyCallCardView.tsx        # layout from the group-conversations card
├── FluencyCallConnectedRow.tsx    # one call: RSVP, unread, join
├── FluencyCallConductModal.tsx    # one-time note before the first join
├── FluencyCallPaywallModal.tsx    # $2 month, then Stripe
├── FluencyCallChatModal.tsx       # chat + participants
├── CallsAdmin.tsx                 # schedule, start, stop, accept requests
├── fluencyCallStore.ts            # call and RSVP writes
├── fluencyCallChat.ts             # chat metadata for a call
├── pricing.ts                     # $2, month extension
├── callTime.ts                    # listed calls, viewer timezone labels
└── types.ts
```

API routes stay thin:

| Route                             | Who                                             | What                                                  |
| --------------------------------- | ----------------------------------------------- | ----------------------------------------------------- |
| `POST /api/fluency-call/request`  | Someone who can join                            | Save the request, notify Telegram                     |
| `POST /api/fluency-call/joiners`  | `DEV_EMAILS`                                    | Resolve joiner emails for the admin list              |
| `POST /api/fluency-call/checkout` | Signed-in user, not blocked by parental consent | Stripe Checkout for one month. Product `fluency-call` |

The Stripe webhook credits `users/{uid}/fluencyCall/account`. It does not call `addPaymentLog`.

## Firestore

| Path                                          | Who writes                                                         |
| --------------------------------------------- | ------------------------------------------------------------------ |
| `fluencyCalls/{callId}`                       | Admin (`isBlogAdmin`)                                              |
| `fluencyCalls/{callId}/rsvps/{userId}`        | That user only                                                     |
| `fluencyCallRequests/{userId}`                | API creates. Admin updates or deletes. Clients cannot create.      |
| `users/{uid}/fluencyCall/account`             | Admin SDK. The owner can read. `activeUntilIso` is the month pass. |
| `users/{uid}/fluencyCallPayments/{paymentId}` | Admin SDK. The owner can read.                                     |
| `users/{uid}.fluencyCallConductAgreedAtIso`   | That user, once they press Agree                                   |

Chat metadata lives at `users/{uid}/chats/fluencyCall_{callId}` with `type: 'fluencyCall'`.

## UI entry

- Dashboard: `FluencyCallDashboardCard` in `Dashboard.tsx`.
- Chat: `?callChatId=<call id>`.
- Paid return: `?fluencyCall=paid`. Cancelled checkout: `?fluencyCall=buy`.
- Admin: `CallsAdmin`.

## Testing

```bash
cd webApp && pnpm exec jest src/features/FluencyCall/callTime.test.ts src/features/FluencyCall/pricing.test.ts
cd webApp && pnpm exec vitest --config vitest.browser.config.ts --run src/features/FluencyCall
```

Browser tests cover the call list, empty state, request form, conduct modal, chat tabs, and the date picker. Screenshots are in `screenshots/`.
