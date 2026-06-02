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
| `pnpm dev` | Dev server with reload |
| `pnpm typecheck` | TypeScript check |
| `pnpm test` | Unit tests (mocked Firebase) |
| `pnpm test:e2e` | E2E tests (starts Firebase emulator + realtime if needed) |
| `pnpm test:all` | Unit + E2E |
| `pnpm build && pnpm start` | Production build |

### Automated verification

E2E tests spin up the Firebase emulator (from `webApp/`) and a realtime server on port `18081` when the emulator is not already running:

```bash
cd realtime
pnpm test:e2e
```

Requires Java 11+ and network access for `npx firebase-tools` on first run.
