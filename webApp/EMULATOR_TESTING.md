# Testing the web app on the Firebase emulator

Use this when a change depends on sign-in, Firestore, or an API route. A typecheck or a mocked browser test does not show whether a button wrote the right document.

Emulator data is in memory. Restarting `pnpm dev` wipes users, rooms, and payments. Run the persona commands again.

## Start

From `webApp/`:

```bash
pnpm dev
```

Wait until both are up:

- Emulator UI: http://127.0.0.1:4000/ (Auth `9099`, Firestore `8080`, Storage `9199`)
- App: http://localhost:3000 (`✓ Ready` / `Local:`)

`pnpm dev` sets `IS_FIREBASE_EMULATOR` and `NEXT_PUBLIC_IS_FIREBASE_EMULATOR`. `pnpm dev:only` does not. API routes then talk to production, or the page has no `__darkEngTest` sign-in helper. Do not use `dev:only` for these checks.

Needs Java 11+. The script clears ports `3000`, `3001`, `4000`, `4400`, `8080`, `9099`, and `9199`.

If http://localhost:3000 does not answer but http://127.0.0.1:4000 does, Next has stopped and the emulator is still up. Start Next only, so the emulator memory is kept:

```bash
cd webApp && IS_FIREBASE_EMULATOR=true NEXT_PUBLIC_IS_FIREBASE_EMULATOR=true pnpm exec next dev --turbopack
```

`pnpm dev` kills the emulator ports and the seeded users disappear.

Confirm the emulator answers:

```bash
curl -s -o /dev/null -w "%{http_code}\n" http://127.0.0.1:4000/
curl -s -o /dev/null -w "%{http_code}\n" http://127.0.0.1:9099/
```

Both should print `200`.

## Personas

The in-app sign-in wall is Google or a magic email link. Neither works in an automated browser. These commands create password users and seed `users/{uid}` so `/practice` skips the language picker.

```bash
cd webApp && pnpm emulator:personas
```

One person at a time: `pnpm emulator:alex`, `pnpm emulator:full`, `pnpm emulator:free`.

| Persona | Email | Password | What they are |
| --- | --- | --- | --- |
| Alex | `dmowski.alex@gmail.com` | `AlexTest123!` | Fixed uid `Mq2HfU3KrXTjNyOpPXqHSPg5izV2`. Reviews rooms set to Alex only. Paid for a year. |
| Full access | `full-access@example.com` | `FullAccess123!` | `users/{uid}/usage/totalUsage.activeSubscriptionTill` is a year ahead. |
| Free | `free-user@example.com` | `FreeUser123!` | No subscription and 0 hours. Five filler scores keep them off the game top 5, so a win does not grant access. |

Each command prints a `signIn` line. On http://localhost:3000/practice , after the page has loaded:

```js
await window.__darkEngTest.anonymousAuthReady;
await window.__darkEngTest.signInWithEmailAndPassword(
  window.__darkEngTest.auth,
  'dmowski.alex@gmail.com',
  'AlexTest123!',
);
```

Reload `/practice`. The dashboard should show the practice home, not “Let's create an account”.

`window.__darkEngTest` exists only when the page was built with `NEXT_PUBLIC_IS_FIREBASE_EMULATOR=true`. If it is missing, the dev server was not started with `pnpm dev`.

How to tell them apart after sign-in:

- Alex and Full access can keep using paid practice. Free hits the free-user limit.
- Only Alex can welcome someone in a room whose review mode is Alex only.
- A full-access member can welcome someone only when the room asks everyone in the room, and only after they themselves are an approved member.

`pnpm emulator:test-user` (`agent-test@example.com` / `TestPassword123!`) remains for older Playwright helpers. It is not Alex, not paid, and not the free persona.

## Voice-chat review

```bash
cd webApp && pnpm emulator:review-fixture
```

This creates the three personas and two English rooms. The free user is waiting in both. Running it again puts that person back to waiting.

| Room | Who may welcome them | URL |
| --- | --- | --- |
| Review Alex | Alex, one click | http://localhost:3000/?voiceChat=true&voiceRoom=review-alex&voiceRoomTab=members |
| Review Together | Alex and Full access must both welcome them | http://localhost:3000/?voiceChat=true&voiceRoom=review-together&voiceRoomTab=members |

Sign in as Alex, open the first URL, and click **Welcome them**. The free user leaves “Waiting for a review” and shows under “People in this room”.

On Review Together, Alex’s click stays on the waiting list and says they are waiting for the other people. Sign out, sign in as Full access, and click **Welcome them**. The free user then joins the room.

Sign in as the free user on the same URL. They see the join state, not the welcome button.

## Calling the API without the browser

`pnpm emulator:alex` prints `idToken`. It expires in about an hour.

```bash
curl -s -X POST http://localhost:3000/api/speaking-clubs/review-alex/review \
  -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"targetUserId":"FREE_UID","decision":"approved"}'
```

`FREE_UID` is `waitingUserId` from `pnpm emulator:review-fixture`. A working welcome returns `"status":"approved"`. A 500 with “Something went wrong” means the write failed.

## After you change code

1. Leave `pnpm dev` running so Next reloads the route.
2. Re-seed with `pnpm emulator:review-fixture` if the previous click already welcomed them.
3. Sign in as the persona who should be allowed to do the thing, and do the click. Then sign in as someone who should not, and confirm they cannot.
