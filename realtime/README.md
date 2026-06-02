# FluencyPal Realtime Service

Custom WebSocket conversation backend for FluencyPal. See `plan.md` for architecture and phases.

## Setup

```bash
cd realtime
pnpm install
cp .env.example .env
# fill OPENAI_API_KEY and FIREBASE_STORAGE_SERVICE_ACCOUNT_CREDS
pnpm dev
```

Health check:

```bash
curl http://localhost:8081/health
```

WebSocket session endpoint (after step 1.3):

```
ws://localhost:8081/v1/session
```

First message must be `session.start` with a Firebase ID token. See `src/protocol/messages.ts` for the full wire protocol.

## Firebase auth (step 1.2)

The service verifies Firebase ID tokens the same way as `webApp/src/app/api/config/firebase.ts`.

Verify a token from the web app (or any Firebase client):

```bash
curl http://localhost:8081/v1/auth/verify \
  -H "Authorization: Bearer <firebase-id-token>"
```

### Emulator mode

1. Start the webApp Firebase emulators (see `webApp/FIREBASE_EMULATOR_SETUP.md`).
2. In `realtime/.env`:

```bash
IS_FIREBASE_EMULATOR=true
FIREBASE_PROJECT_ID=dark-lang
```

3. Sign in through the local web app emulator, copy the ID token, and call `/v1/auth/verify`.

When `IS_FIREBASE_EMULATOR=true`, the service sets:

- `FIREBASE_AUTH_EMULATOR_HOST=localhost:9099`
- `FIRESTORE_EMULATOR_HOST=localhost:8080`
- `FIREBASE_STORAGE_EMULATOR_HOST=localhost:9199`

## Scripts

| Command | Description |
| ------- | ----------- |
| `pnpm dev` | Realtime API server with reload |
| `pnpm dev:client` | Vite test UI on http://localhost:5173 |
| `pnpm build:client` | Production build of test client |
| `pnpm typecheck` | TypeScript check |
| `pnpm test` | Unit tests (mocked Firebase) |
| `pnpm test:e2e` | E2E tests (starts Firebase emulator + realtime if needed) |
| `pnpm test:all` | Unit + E2E + test client build |
| `pnpm build && pnpm start` | Production build |

### Automated verification

E2E tests spin up the Firebase emulator (from `webApp/`) and a realtime server on port `18081` when the emulator is not already running:

```bash
cd realtime
pnpm test:e2e
```

Requires Java 11+ and network access for `npx firebase-tools` on first run.

## Test client (step 1.6)

Manual UI for exercising the WebSocket session locally.

Terminal 1 — realtime API (with emulator + OpenAI env):

```bash
cd realtime
# IS_FIREBASE_EMULATOR=true in .env when using emulator auth
pnpm dev
```

Terminal 2 — Firebase emulator (if not already running via webApp):

```bash
cd webApp && pnpm dev:firebase-emulator
```

Terminal 3 — test client:

```bash
cd realtime && pnpm dev:client
```

Open http://localhost:5173, sign in (Auth emulator checkbox on), Connect, then:

- **PushToTalk**: hold **Hold to talk**, or send typed text.
- **RealTimeConversation**: choose mode, Connect, click **Start call**, speak naturally (server commits after ~1.2s silence), click **End call** to hang up.

The Vite dev server proxies `/v1` (HTTP + WebSocket) to `http://127.0.0.1:8081`.
