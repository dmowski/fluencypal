# FluencyPal Calls

Scheduled group calls on Google Meet, with one shared chat. This is not Talk with AI (`OpenAiLive`).

Applies to `webApp/src/features/FluencyCall/**`.

## Product rules

- **Who sees the card.** Signed-in users. Hide it while calls, access, or the user's request are loading. Parental-consent blocks hide it too.
- **Who can join.** Every signed-in user. A subscription, a game win, and the old month pass are not required.
- **Price.** Free. The old `fluency-call` Stripe product is no longer offered. Past payments stay in Payment History and can still be withdrawn. New Practice, Conversation, and Conversation 10 checkouts do not grant or advertise a group-call pass.
- **First join.** The first "I'll join" opens "Before you join". Agree saves the choice, joins, and sends Telegram. Close does not join and does not notify. Later joins skip that note and still send Telegram. Leaving a call does not notify.
- **Ad onboarding.** `/community-call` shows upcoming English calls, then native language, then an account, then the practice dashboard. Page language is asked only when the native language is not a site language. There is no language-to-learn step, no payment step, and no date step. An empty list still continues. A schedule row names that time on the native step. English is the call language. The landing hero, Show more, and footer open the calls list. An old `?step=language` link opens the calls list. An old `?step=membership` or `?step=waiting` link opens the practice dashboard.
- **Request.** One request per user, for people who can join. It asks which language to practise, starting from the user's target language when that language can be taught here, otherwise English. Proposing a time stays available when calls are already listed. The API saves it and sends Telegram. Admins accept or reject.
- **Schedule.** Admins create each call, its Meet link, and its start time. Members do not write the call document.
- **Visible calls.** Every scheduled call that is upcoming, or that started within the last 12 hours. Stopped calls stay hidden. The card features an ongoing listed call, otherwise the earliest upcoming one. The other-times list includes that featured call. Each time has its own "Who's joining". The language menu filters the list. A call with no language is English. A person can join more than one.
- **Meet.** A listed call is live once its start time has passed. Opening Google Meet does not RSVP and does not send Telegram, and the link stays available before the start. When nothing is listed, use the latest real link saved for the selected language, including an older or stopped call. If that language has no link, the button stays visible and disabled. Stopping a call is a separate admin action.
- **Chat.** One room for every call and language: `fluencyCall_community`. The card shows the latest message, and older messages can be opened and paged. A person can edit or delete only their own messages. Translate replaces the text in place and can be turned back to the original. Reuse the existing chat writer. Do not build a second messenger. Old per-call rooms stay stored and are not shown.
- **Host intro.** The card can play a short intro from the host. It starts muted, and the viewer can turn the sound on and off.
- **Times.** Stored as UTC. The card shows the viewer's timezone. Telegram uses Warsaw.

## Data

| Route or path                                 | Who writes                                                         |
| --------------------------------------------- | ------------------------------------------------------------------ |
| `POST /api/fluency-call/request`              | Someone who can join. Saves the request and notifies Telegram.     |
| `POST /api/fluency-call/joiners`              | `DEV_EMAILS`. Resolves joiner emails for the admin list.           |
| `POST /api/fluency-call/checkout`             | Unused. Old Stripe Checkout for one month. Do not link it.         |
| `fluencyCalls/{callId}`                       | Admin (`isBlogAdmin`)                                              |
| `fluencyCalls/{callId}/rsvps/{userId}`        | That user only                                                     |
| `fluencyCallRequests/{userId}`                | API creates. Admin updates or deletes. Clients cannot create.      |
| `users/{uid}/fluencyCall/account`             | Admin SDK. The owner can read. `activeUntilIso` is the month pass. |
| `users/{uid}/fluencyCallPayments/{paymentId}` | Admin SDK. The owner can read.                                     |
| `users/{uid}.fluencyCallConductAgreedAtIso`   | That user, once they press Agree                                   |

The Stripe webhook credits the month pass and writes the payment so Payment History and contract withdrawal can reverse it. It does not add practice hours.

## Where it appears

- Practice dashboard, for a signed-in user.
- Ad onboarding at `/community-call`. The last step opens the dashboard with `?communityCall=ready`.
- Chat on the card. An old `?callChatId=` link opens that same chat. It does not switch rooms.
- `?fluencyCall=paid` still shows the payment note. `?fluencyCall=buy` does not open a paywall.
- Admin schedule and requests.

## Testing

```bash
cd webApp && pnpm test:unit src/features/FluencyCall
cd webApp && pnpm exec vitest --config vitest.browser.config.ts --run src/features/FluencyCall
```
