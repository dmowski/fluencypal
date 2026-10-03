# FluencyPal Calls

Scheduled group calls on Google Meet, with a chat for people who joined. This is not the Talk with AI voice feature (`OpenAiLive`).

Applies to `webApp/src/features/FluencyCall/**`.

## Product rules

| Topic | Decision |
| --- | --- |
| Who sees the dashboard card | Signed-in users. The card hides while calls or the user's request are loading. |
| Who can request or join | Full access: active subscription, hours on the balance, or a current top-5 game winner (`access.canReadCommunity`). |
| Request | One request per user. The API writes it and sends Telegram. Admins accept or reject. |
| Schedule | Admins create the call, the Meet link, and the start time. Members do not write the call document. |
| Visible call | Latest `scheduled` call that has already started, otherwise the next upcoming one. `stopped` calls stay hidden. |
| Live | Countdown hits zero when `startsAtIso` is in the past. Stopping the call is a separate admin action. |
| Chat | One community chat per call, space id `fluencyCall_{callId}`. Reuse `ChatSection`. Do not build a second messenger. |
| Times | Stored as UTC ISO. The card shows the viewer's local time. Telegram uses Warsaw. |

## Architecture

```
FluencyCall/
├── FluencyCallDashboardCard.tsx   # empty state, countdown, join, chat
├── FluencyCallChatModal.tsx       # chat + participants
├── CallsAdmin.tsx                 # schedule, start, stop, accept requests
├── fluencyCallStore.ts            # call and RSVP writes
├── fluencyCallChat.ts             # chat metadata for a call
├── callTime.ts                    # countdown, visible call, local time
└── types.ts
```

API routes stay thin:

| Route | Who | What |
| --- | --- | --- |
| `POST /api/fluency-call/request` | Member with full access | Save the request, notify Telegram |
| `POST /api/fluency-call/joiners` | `DEV_EMAILS` | Resolve joiner emails for the admin list |

## Firestore

| Path | Who writes |
| --- | --- |
| `fluencyCalls/{callId}` | Admin (`isBlogAdmin`) |
| `fluencyCalls/{callId}/rsvps/{userId}` | That user only |
| `fluencyCallRequests/{userId}` | API creates. Admin updates or deletes. Clients cannot create. |

Chat metadata lives at `users/{uid}/chats/fluencyCall_{callId}` with `type: 'fluencyCall'`.

## UI entry

- Dashboard: `FluencyCallDashboardCard` in `Dashboard.tsx`.
- Chat: `?callChatId=<call id>`.
- Admin: `CallsAdmin`.

## Testing

```bash
cd webApp && pnpm exec jest src/features/FluencyCall/callTime.test.ts
cd webApp && pnpm exec vitest --config vitest.browser.config.ts --run src/features/FluencyCall
```

Browser tests cover the card, empty state, request form, chat tabs, and the date picker. Screenshots are in `screenshots/`.
