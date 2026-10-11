# FluencyPal Calls

Scheduled group calls on Google Meet, with one shared chat. This is not Talk with AI (`OpenAiLive`).

Applies to `webApp/src/features/FluencyCall/**`.

## Product rules

- **Who sees the card.** Signed-in users. Hide it while calls, access, or the user's request are loading. Parental-consent blocks hide it too.
- **Who can join.** Every signed-in user. A subscription, a game win, and the old month pass are not required.
- **Price.** Free. The old `fluency-call` Stripe product is no longer offered. Past payments stay in Payment History and can still be withdrawn. New Practice, Conversation, and Conversation 10 checkouts do not grant or advertise a group-call pass.
- **First join.** The first "I'll join" opens "Before you join". Agree saves the choice, joins, and sends Telegram. Close does not join and does not notify. Later joins skip that note and still send Telegram. Leaving a call does not notify.
- **Ad onboarding.** `/community-call` is a request form. No account. Two fields: interests (goal, topic, English level) and contact. A "What's next" note says Alex writes once he finds people who fit, then they pick a time that is comfortable for everyone, and that group calls are free. Submit sends Telegram. The confirmation says Alex will write soon and links to AI practice (`/quiz`). Old `?step=` links open this same form.
- **Request.** The public form does not save a Firestore request and does not require sign-in. `POST /api/community-call/request` sends Telegram. The signed-in time-slot API `POST /api/fluency-call/request` still exists for admins and is not the form on `/community-call`.
- **Dashboard card.** Signed-in practice dashboard shows the host video beside "Want to practice with people?" and **Open Request Form**. That button opens the same request form in a modal, without the "No account needed" line. It does not leave the dashboard. The card does not list the next call and has no language selector. Chat stays on the card.
- **Schedule.** Admins create each call, its Meet link, and its start time. Members do not write the call document. The practice card does not show that list.
- **Meet.** Opening Google Meet does not RSVP and does not send Telegram. Stopping a call is a separate admin action. The practice card does not show the Meet button.
- **Chat.** One room for every call and language: `fluencyCall_community`. The card shows the latest message, and older messages can be opened and paged. A person can edit or delete only their own messages. Translate replaces the text in place and can be turned back to the original. Reuse the existing chat writer. Do not build a second messenger. Old per-call rooms stay stored and are not shown.
- **Host intro.** The card can play a short intro from the host. It starts muted, and the viewer can turn the sound on and off.
- **Times.** Stored as UTC. The card shows the viewer's timezone. Telegram uses Warsaw.

## Data

| Route or path                                 | Who writes                                                         |
| --------------------------------------------- | ------------------------------------------------------------------ |
| `POST /api/community-call/request`            | Anyone. No account. Sends interests and contact to Telegram.       |
| `POST /api/fluency-call/request`              | Someone who can join. Saves a time-slot request and notifies Telegram. Not linked from the card. |
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
- Ad onboarding at `/community-call`. After submit, the page offers AI practice. It does not require an account.
- Chat on the card. An old `?callChatId=` link opens that same chat. It does not switch rooms.
- `?fluencyCall=paid` still shows the payment note. `?fluencyCall=buy` does not open a paywall.
- Admin schedule and requests.

## Testing

```bash
cd webApp && pnpm test:unit src/features/FluencyCall
cd webApp && pnpm exec vitest --config vitest.browser.config.ts --run src/features/FluencyCall
```
