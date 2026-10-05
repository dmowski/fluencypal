# FluencyPal Calls

Scheduled group calls on Google Meet, with a chat for people who joined. This is not the Talk with AI voice feature (`OpenAiLive`).

Applies to `webApp/src/features/FluencyCall/**`.

## Product rules

| Topic                       | Decision                                                                                                                                                                                                    |
| --------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Who sees the dashboard card | Signed-in users. The card hides while calls, access, or the user's request are loading.                                                                                                                     |
| Who can join                | Practice paid access (an active subscription), a current top-5 game winner, or an active community-call pass. Daily-task access does not count. Parental-consent blocks still hide community. |
| Price                       | $2 for one month on its own (`fluency-call`), or included in every paid-access plan for the week, month, or year purchased. It does not renew, and it does not touch the practice-hours balance. Paying again extends from the later of now and the current end. |
| Onboarding                  | The first "I'll join" opens "Before you join". Agree saves the time on the user document, joins, and sends Telegram. Close does not join and does not notify. Later joins skip the modal and send Telegram. Leaving a call does not notify. Ad traffic uses `/community-call`: language, upcoming calls, native language, page language only when that language is not a site language, email and password, then the $2 pass or Not now. Not now says membership is required to enter and can be confirmed anytime, then opens the practice dashboard. This path does not collect a date. The landing feature `group-conversations` opens this path. Ad traffic uses `/community-call`: language, upcoming calls, native language, page language only when native is not a site language, email and password, then the $2 pass or Not now. Not now says membership is required to enter and can be confirmed anytime, then opens the practice dashboard. This path does not collect a date. |
| Request                     | One request per user, for people who can join. The form asks which language to practise. The choices are `supportedLanguagesToLearn`. It starts on the user's target language when that language is in the list, otherwise English, and they can change it. The propose action stays on the card when conversations are already listed. The API writes it and sends Telegram. Admins accept or reject. |
| Schedule                    | Admins create each call, the Meet link, and the start time. Members do not write the call document.                                                                                                         |
| Visible calls               | Every `scheduled` call that is upcoming, or that started within the last 12 hours. `stopped` calls stay hidden. The card's top-right language menu filters that list. On a narrow card the closed control shows only the flag; the open menu still names each language. A call with no language code is English. A person can join more than one. |
| Live                        | A listed call is live when `startsAtIso` is in the past. The row opens the Meet link. Stopping the call is a separate admin action.                                                                         |
| Chat                        | One community chat per call, space id `fluencyCall_{callId}`. Reuse `FlatChat`. Do not build a second messenger.                                                                                            |
| Times                       | Stored as UTC ISO. The card shows the viewer's timezone. Telegram uses Warsaw.                                                                                                                              |

## Architecture

```
FluencyCall/
├── FluencyCallDashboardCard.tsx   # list, paywall, conduct, chat
├── CommunityCallOnboarding.tsx    # ad path: language, calls, account, $2 pass
├── CommunityCallScheduleStep.tsx  # upcoming calls before the account
├── CommunityCallNativeStep.tsx    # native language
├── communityCallSteps.ts          # which steps this visitor still needs
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

The Stripe webhook credits `users/{uid}/fluencyCall/account` and writes `users/{uid}/payments/{paymentId}` so Payment History and contract withdrawal can reverse the pass. It does not add practice hours.

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
- Ad onboarding: `/community-call`. After Not now, the dashboard opens with `?communityCall=ready`.
- Chat: `?callChatId=<call id>`.
- Paid return: `?fluencyCall=paid`. Cancelled checkout: `?fluencyCall=buy`.
- Admin: `CallsAdmin`.

## Testing

```bash
cd webApp && pnpm exec jest src/features/FluencyCall/callTime.test.ts src/features/FluencyCall/pricing.test.ts src/features/FluencyCall/communityCallSteps.test.ts
cd webApp && pnpm exec vitest --config vitest.browser.config.ts --run src/features/FluencyCall
```

Browser tests cover the call list, empty state, request form, conduct modal, chat tabs, and the date picker. Screenshots are in `screenshots/`.
