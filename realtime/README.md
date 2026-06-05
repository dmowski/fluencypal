# FluencyPal Realtime Service

Custom WebSocket conversation backend for FluencyPal. Replaces the coupled OpenAI Realtime (WebRTC) stack with an independent **STT → LLM → TTS** pipeline over one WebSocket.

### Pipeline (current behavior)

| Stage | How it works |
| ----- | ------------ |
| **User speech** | Client streams PCM16 chunks; server buffers until turn end (silence detection or PTT commit). |
| **STT** | One batch request per user turn (`transcribeBatch` → full WAV). No streaming partial user transcript. |
| **LLM** | Streamed token deltas → `transcript.delta`; full reply → `transcript.done`. |
| **TTS** | Starts **after** the full LLM text is ready; MP3 chunks stream to the client as binary frames. |

### Related docs

| Doc | Purpose |
| --- | ------- |
| [`e2e-cases.md`](./e2e-cases.md) | Voice E2E test matrix (real speech, no mocks) |
| [`PHASE3_CHECKLIST.md`](./PHASE3_CHECKLIST.md) | Experimental webApp integration + manual QA |
| [`AGENTS.md`](./AGENTS.md) | Agent / CI commands for this package |

## Prerequisites

- Node.js 20+
- pnpm
- Java 11+ (Firebase emulator for local auth and e2e tests)
- OpenAI API key (STT / LLM / TTS)

This package is **isolated** from the pnpm workspace — install dependencies inside `realtime/` only.

## Quick start

```bash
cd realtime
pnpm install
cp .env.example .env
# Optional for full conversation: set OPENAI_API_KEY in .env
pnpm dev
```

`pnpm dev` starts everything you need locally:

1. Firebase emulators (Auth, Firestore, Storage) if not already running
2. Realtime API on port **8081** with `IS_FIREBASE_EMULATOR=true`
3. Test client on http://127.0.0.1:5173 (opens in your browser)

Sign in with **Google** on the test page (Auth emulator checkbox is on by default), click **Connect**, and talk.

Health check:

```bash
curl http://127.0.0.1:8081/health
```

WebSocket endpoint (proxied through the test client in dev):

```
ws://127.0.0.1:8081/v1/session
```

The first message on the socket must be JSON `session.start` with a Firebase ID token. See [Wire protocol](#wire-protocol).

## Environment variables

Copy `.env.example` to `.env`. All variables are read at startup via `src/config/env.ts`.

| Variable | Required | Default | Description |
| -------- | -------- | ------- | ----------- |
| `REALTIME_PORT` | No | `8081` | HTTP + WebSocket listen port |
| `NODE_ENV` | No | `development` | `development`, `test`, or `production` |
| `ALLOWED_ORIGINS` | No | `http://localhost:3000,http://localhost:5173` | Comma-separated CORS origins |
| `OPENAI_API_KEY` | Yes* | — | OpenAI key for STT, LLM, and TTS |
| `FIREBASE_STORAGE_SERVICE_ACCOUNT_CREDS` | Yes** | — | Firebase admin service account JSON string |
| `FIREBASE_PROJECT_ID` | No | `dark-lang` | Firebase project id |
| `FIREBASE_STORAGE_BUCKET` | No | `dark-lang.firebasestorage.app` | Storage bucket |
| `IS_FIREBASE_EMULATOR` | No | `false` | Set automatically by `pnpm dev`; set `true` manually for `pnpm dev:api` |
| `DEFAULT_STT_MODEL` | No | `gpt-4o-transcribe` | Server-side STT model |
| `DEFAULT_LLM_MODEL` | No | `gpt-4o` | Server-side LLM model |
| `DEFAULT_TTS_MODEL` | No | `gpt-4o-mini-tts` | Server-side TTS model |
| `RATE_LIMIT_ENABLED` | No | `true` | Per-IP HTTP rate limiting (off when `NODE_ENV=test`) |
| `RATE_LIMIT_MAX` | No | `200` | Max requests per IP per window (excludes `/health`, `/ready`) |
| `RATE_LIMIT_WINDOW_MS` | No | `60000` | Rate limit window in ms |
| `RATE_LIMIT_AUTH_VERIFY_MAX` | No | `30` | Max `/v1/auth/verify` calls per IP per window |
| `RATE_LIMIT_WS_MAX` | No | `20` | Max WebSocket upgrade attempts per IP per window |
| `SESSION_IDLE_TIMEOUT_MS` | No | `600000` (10 min; `0` in tests) | Close session after no user audio/control |

\* Required for conversation pipeline tests and manual calls with voice. E2E auth/session tests run without OpenAI.

\** Optional when `IS_FIREBASE_EMULATOR=true` (emulator accepts unsigned tokens).

Models are **server-side only** — clients never send model or provider ids. Change env vars and redeploy to swap models.

### Rate limiting (DDoS / abuse)

`@fastify/rate-limit` applies per client IP (uses `X-Forwarded-For` on Fly). `/health` and `/ready` are allowlisted for probes. Excess traffic receives `429` with `{ code: "rate_limit_exceeded" }`. Tune via `RATE_LIMIT_*` env vars. Run `pnpm audit` periodically for dependency vulnerabilities.

### Firebase emulator mode

`pnpm dev` starts the Firebase emulators automatically when the Auth emulator (`9099`) is not already running (requires Java 11+). If another process already uses Firestore port `8080` (for example a leftover emulator or `webApp` dev), the dev script starts **auth + storage only** and reuses the existing Firestore instance on `8080`.

To run the API alone against an emulator you start separately:

1. Start Firebase emulators (see `webApp/FIREBASE_EMULATOR_SETUP.md`):

   ```bash
   cd webApp && pnpm dev:firebase-emulator
   ```

2. In `realtime/.env`:

   ```bash
   IS_FIREBASE_EMULATOR=true
   FIREBASE_PROJECT_ID=dark-lang
   ```

3. Start the API:

   ```bash
   cd realtime && pnpm dev:api
   ```

When `IS_FIREBASE_EMULATOR=true`, the service sets:

   - `FIREBASE_AUTH_EMULATOR_HOST=localhost:9099`
   - `FIRESTORE_EMULATOR_HOST=localhost:8080`
   - `FIREBASE_STORAGE_EMULATOR_HOST=localhost:9199`

Verify a token:

```bash
curl http://localhost:8081/v1/auth/verify \
  -H "Authorization: Bearer <firebase-id-token>"
```

## Scripts

| Command | Description |
| ------- | ----------- |
| `pnpm dev` | **One command dev stack**: emulator + API (`tsx watch`) + Vite test client with HMR (+ opens browser) |
| `pnpm dev:api` | Realtime API only with hot reload (`tsx watch`) |
| `pnpm dev:client` | Vite test UI only on http://127.0.0.1:5173 (HMR) |
| `pnpm build:client` | Production build of test client |
| `pnpm lint` | TypeScript check (`tsc --noEmit`) |
| `pnpm test` | Unit tests (mocked Firebase / providers) |
| `pnpm test:e2e` | API-level e2e (Vitest + WS client on port `18081`) |
| `pnpm test:e2e:voice` | Real voice E2E — OpenAI STT/LLM/TTS + speech WAV fixtures (see `e2e-cases.md`) |
| `pnpm test:e2e:browser` | Browser e2e (Playwright + real test client UI) |
| `pnpm test:e2e:voice:browser` | Browser voice E2E — real speech via Chrome fake mic file |
| `pnpm e2e:fixtures:voice` | Generate optional TTS hello fixtures (OpenAI) |
| `pnpm e2e:fixtures:normalize` | Convert user recordings (`*.wav`) → `*-48k-mono.wav` for browser e2e |
| `pnpm test:e2e:browser:ui` | Playwright interactive UI mode |
| `pnpm test:all` | Unit + API e2e + browser e2e + test client build |
| `pnpm load:smoke` | Concurrent session smoke test (needs emulator + API) |
| `pnpm prod` | Redeploy to Fly.io (`fly deploy`) |
| `pnpm prod:open` | Open production test page in browser |
| `pnpm build && pnpm start` | Production build and run locally |

First-time browser e2e setup:

```bash
cd realtime
pnpm exec playwright install chromium
```

### Automated verification

```bash
cd realtime
pnpm test                 # unit tests
pnpm test:e2e             # API e2e (auth, session, optional OpenAI pipeline)
pnpm e2e:fixtures:voice   # once: real speech WAV fixtures (needs OPENAI_API_KEY)
pnpm test:e2e:voice       # real voice API e2e (no mocks)
pnpm test:e2e:browser     # browser e2e (sign-in, connect, typed turn, PTT UI)
pnpm test:e2e:voice:browser
pnpm test:all             # full suite
```

**API e2e** (`vitest`) uses `e2e/globalSetup.ts` to start the Firebase emulator and a realtime server on port **18081**.

**Voice E2E** streams real speech PCM over WebSocket (or plays a speech WAV into Chromium’s mic). Requires `OPENAI_API_KEY` and fixtures from `pnpm e2e:fixtures:voice`. Test matrix: [`e2e-cases.md`](./e2e-cases.md).

**Browser e2e** (`playwright`) starts the same stack as `pnpm dev` (ports **8081** + **5173**), then drives the test client in Chromium with fake microphone permissions. The typed-message spec calls real OpenAI when `OPENAI_API_KEY` is set.

Set `REUSE_DEV_SERVER=1` to skip restarting the dev stack when `pnpm dev` is already running.

## Test client

The test client is included in `pnpm dev`. For advanced workflows you can run `pnpm dev:api` and `pnpm dev:client` separately (with the emulator started via `webApp`).

**Hot reload:** `pnpm dev` watches `realtime/src/` and restarts the API automatically. The test UI at http://127.0.0.1:5173 hot-reloads via Vite when you edit `test-client/`. Keep the `pnpm dev` terminal running; you do not need to restart it for code changes. After an API restart, reconnect the WebSocket session (Disconnect → Connect) if the call stopped working.

**All-in-one (recommended):**

```bash
cd realtime
pnpm dev
```

Open http://127.0.0.1:5173, click **Sign in with Google**, then **Connect**, then:

| Mode | How to use |
| ---- | ---------- |
| **PushToTalk** | Hold **Hold to talk** and release to commit, or send typed text + commit |
| **RealTimeConversation** | Select mode, Connect, **Start call**, speak naturally (server commits after ~1.2 s silence), **End call** to hang up |

Toggles: mic mute, AI voice on/off (voice off skips TTS but still runs STT + LLM). Usage events appear in the log panel.

**Barge-in:** Keep sending mic PCM while unmuted. The server may abort in-flight **LLM/TTS generation** on loud user speech and emit `assistant.interrupted`. Playback is not cut client-side; only the server drives interrupts.

The Vite dev server proxies `/v1` (HTTP + WebSocket) to `http://127.0.0.1:8081`.

## Wire protocol

Authoritative schemas: `src/protocol/messages.ts` (zod). Audio conventions: `src/protocol/audioCodec.ts`.

### Connection lifecycle

1. Client opens `ws://<host>/v1/session`.
2. Client sends **first message** — JSON `session.start` with Firebase ID token and session config.
3. Server verifies token, creates `ConversationSession`, replies `session.ready` with `sessionId` and effective config.
4. Client sends JSON control messages and binary audio frames until `session.end` or disconnect.

### When connections close

| Event | What happens |
| ----- | ---------------- |
| User clicks **Disconnect** or closes the tab | Client sends `session.end` (on `pagehide`); server disposes session and closes the WebSocket. |
| Browser closes the socket (network, crash) | Server `close` handler runs → session removed from memory. |
| No user activity for `SESSION_IDLE_TIMEOUT_MS` (default 10 min) | Server sends `session.ended`, closes socket (`idle timeout`). Mic audio and control messages reset the timer; `session.ping` does not. |

You do not need a custom close for normal cases — the WebSocket `close` event is the default cleanup path. Idle timeout is needed so abandoned tabs do not hold server sessions and OpenAI work forever.

Binary frames are detected when the payload does not start with `{` (JSON). Raw PCM16 chunks are accepted without a prefix.

### Session config (`session.start.config`)

| Field | Type | Notes |
| ----- | ---- | ----- |
| `languageCode` | string | e.g. `en` |
| `mode` | `RealTimeConversation` \| `PushToTalk` | See mode behavior below |
| `voiceEnabled` | boolean | `false` skips TTS (STT + LLM still run) |
| `micMuted` | boolean | Server ignores incoming audio when true |
| `systemInstruction` | string | Base system prompt |
| `voice` | `shimmer` \| `ash` \| `marin` \| `verse` | Fixed for session (from user settings) |
| `conversationId` | string? | Optional analytics id from webApp |

### Client → server (JSON)

| `type` | Purpose |
| ------ | ------- |
| `session.start` | First message; auth + config |
| `session.update` | Patch `systemInstruction`, `voiceEnabled`, or `micMuted` |
| `session.ping` | Keepalive → `session.pong` |
| `session.end` | Graceful close → `session.ended` |
| `user.text` | Typed user input (PushToTalk) |
| `user.turn.commit` | End user turn (PushToTalk) |
| `user.turn.cancel` | Discard buffered user audio/text |
| `assistant.trigger` | Request assistant reply without new user input |
| `assistant.instruction` | Mid-session correction (`mode`: `replace` \| `append`) |
| `vision.frame` | Reserved stub (not implemented) |

### Server → client (JSON)

| `type` | Purpose |
| ------ | ------- |
| `session.ready` | Session accepted |
| `transcript.delta` | Streaming partial transcript |
| `transcript.done` | Finalized user or assistant message |
| `user.speaking` | User speech activity indicator |
| `assistant.speaking` | `active: true` only after the first TTS audio chunk is sent; `active: false` when the stream ends. Use for UI “assistant talking” (not during LLM-only generation). |
| `assistant.interrupted` | Barge-in — server aborted LLM/TTS; clients should stop playback and discard buffered TTS |
| `usage` | Token usage after each STT / LLM / TTS call |
| `error` | `{ code, message, fatal? }` |
| `session.pong` / `session.ended` | Control replies |

### Binary audio

**Input (client → server):** PCM16, 24 kHz, mono, little-endian. Chunks ~100–250 ms (~4800 bytes). Max chunk size 64 KB.

Optional prefixed framing: `[0x01][uint32 BE length][payload]`.

**Output (server → client):** MP3 chunks from TTS when `voiceEnabled` is true.

### Mode behavior

| Mode | User input | Turn end | Assistant reply |
| ---- | ---------- | -------- | ----------------- |
| **RealTimeConversation** | Continuous mic while call is open | Server silence timer (~1.2 s after speech) | Auto after each user turn |
| **PushToTalk** | Audio or text while button held | `user.turn.commit` on release | Auto after commit (or `assistant.trigger`) |

Silence detection uses RMS on PCM chunks (`src/session/turnDetection.ts`). When the user speaks during assistant output, the server aborts in-flight TTS/LLM and sends `assistant.interrupted`. OpenAI aborts (`APIUserAbortError`) are treated as normal cancellation — they must not crash the Node process (see `src/errors/isAbortError.ts`).

**Production impact if the API process crashes:** Fly runs one machine per deploy; an uncaught exception exits the process, so every open WebSocket drops (`ECONNREFUSED` until Fly restarts the VM). Health checks on `/health` and `/ready` fail; `auto_start_machines` brings a new instance up, but all in-flight conversations are lost and clients must reconnect.

### Example: minimal session flow

```text
→ { "type": "session.start", "token": "...", "config": { ... } }
← { "type": "session.ready", "sessionId": "...", ... }

→ [binary PCM16 chunks while speaking]
← { "type": "user.speaking", "active": true }
← { "type": "user.speaking", "active": false }
← { "type": "transcript.done", "role": "user", "text": "..." }
← { "type": "usage", "stage": "stt", ... }
← { "type": "transcript.delta", "role": "assistant", "delta": "..." }
← { "type": "transcript.done", "role": "assistant", "text": "..." }
← { "type": "usage", "stage": "llm", ... }
← [binary MP3 chunks if voiceEnabled]
← { "type": "usage", "stage": "tts", ... }

→ { "type": "session.end" }
← { "type": "session.ended" }
```

## Project layout

```text
realtime/
├── src/
│   ├── index.ts              # Fastify bootstrap, /health, WS routes
│   ├── auth/                 # Firebase token validation
│   ├── config/               # env, models, firebase config
│   ├── protocol/             # zod wire schemas + audio codec
│   ├── session/              # ConversationSession, turn detection, pipeline
│   ├── providers/openai/     # STT, LLM, TTS adapters
│   ├── usage/                # usage event emission
│   └── ws/                   # WebSocket connection handler
├── test-client/              # Vite manual test UI
├── e2e/                      # Vitest + Playwright e2e; see e2e-cases.md
├── e2e-cases.md              # Voice E2E test matrix
├── PHASE3_CHECKLIST.md       # webApp experimental rollout
└── tests/                    # Unit tests
```

## Deploy (Fly.io)

### Prerequisites

- [Fly.io](https://fly.io) account and [`flyctl`](https://fly.io/docs/hands-on/install-flyctl/) installed
- Firebase service account JSON for production auth (not emulator)
- OpenAI API key

### First deploy

```bash
cd realtime

# One-time: create the app (name must match fly.toml or edit fly.toml first)
fly apps create fluencypal-realtime

# Set secrets (service account as single-line JSON string)
fly secrets set \
  OPENAI_API_KEY=sk-... \
  FIREBASE_STORAGE_SERVICE_ACCOUNT_CREDS='{"type":"service_account",...}' \
  FIREBASE_PROJECT_ID=dark-lang \
  ALLOWED_ORIGINS=https://fluencypal-realtime.fly.dev,https://app.fluencypal.com

fly deploy
```

After deploy:

```bash
fly status
curl https://fluencypal-realtime.fly.dev/health
curl https://fluencypal-realtime.fly.dev/ready
```

WebSocket URL for clients:

```text
wss://fluencypal-realtime.fly.dev/v1/session
```

### Test page (built into the deploy)

The Docker image includes the **test client** as static files. After deploy, open:

```text
https://fluencypal-realtime.fly.dev/
```

That is the same UI as local `pnpm dev` (sign in, Connect, Start call). WebSocket and API are **same origin** — no `VITE_REALTIME_WS_URL` needed on Fly.

**Uncheck “Use Firebase Auth emulator”** and sign in with Google (production Firebase).

**Mobile sign-in:** the test client uses Firebase `initializeAuth` with `browserPopupRedirectResolver` (same pattern as `webApp`) and **redirect** on phones and Safari. In Firebase Console → **Authentication → Settings → Authorized domains**, add:

- `fluencypal-realtime.fly.dev`
- `localhost` (local dev)

If Google is blocked (e.g. Instagram in-app browser), use **Sign in with email** on the test page.

Redeploy anytime:

```bash
cd realtime
pnpm prod
pnpm prod:open   # opens the test page in your browser
```

TLS/WSS is terminated by Fly (`force_https = true` in `fly.toml`). Allowed WebSocket origins:

- `https://fluencypal-realtime.fly.dev` — bundled test client (same origin)
- `https://app.fluencypal.com` — production web app
- `http://localhost:3000` — local webApp against prod WSS (optional; set via `fly secrets`)

The Fly app URL is also merged automatically from `FLY_APP_NAME`. If you set `ALLOWED_ORIGINS` via `fly secrets`, include the URLs above.

### webApp experimental integration

Experimental **Just Talk (custom realtime)** lives in `webApp/src/features/Dashboard/ExperimentalDashboardCard.tsx`. WebRTC remains the default everywhere else. See [`PHASE3_CHECKLIST.md`](./PHASE3_CHECKLIST.md) for env vars and manual QA.

In `webApp/.env.local`:

```bash
# pnpm dev (Firebase emulator) + local realtime on 8081
NEXT_PUBLIC_REALTIME_WS_URL_DEV=ws://127.0.0.1:8081

# pnpm dev:prod (production Firebase) → Fly WSS
NEXT_PUBLIC_REALTIME_WS_URL_PROD=wss://fluencypal-realtime.fly.dev
```

Selection is automatic from `NEXT_PUBLIC_IS_FIREBASE_EMULATOR` (`true` for `pnpm dev`, `false` for `pnpm dev:prod`). Do not use emulator auth against Fly — use `pnpm dev:prod` for prod WSS from localhost.

Reconnection: **MVP uses fresh sessions** — disconnect and Connect again; no resume.

### Production endpoints

| Path | Purpose |
| ---- | ------- |
| `GET /health` | Liveness + active session count + pipeline latency metrics |
| `GET /ready` | Readiness (503 while draining on shutdown) |
| `GET /v1/auth/verify` | Token check (optional) |
| `WS /v1/session` | Conversation session |

### Load smoke test (local)

With Firebase emulator + API running:

```bash
cd realtime
pnpm load:smoke
```

Expect `Active sessions after test: 0` — confirms disconnect cleanup.
