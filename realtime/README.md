# FluencyPal Realtime Service

Custom WebSocket conversation backend for FluencyPal. Replaces the coupled OpenAI Realtime (WebRTC) stack with an independent **STT → LLM → TTS** pipeline over one WebSocket.

See `plan.md` for architecture, phases, and webApp integration targets.

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
# Edit .env — see Environment variables below
pnpm dev
```

Health check:

```bash
curl http://localhost:8081/health
```

WebSocket endpoint:

```
ws://localhost:8081/v1/session
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
| `IS_FIREBASE_EMULATOR` | No | `false` | Set `true` for local Auth emulator |
| `DEFAULT_STT_MODEL` | No | `gpt-4o-transcribe` | Server-side STT model |
| `DEFAULT_LLM_MODEL` | No | `gpt-4o` | Server-side LLM model |
| `DEFAULT_TTS_MODEL` | No | `gpt-4o-mini-tts` | Server-side TTS model |

\* Required for conversation pipeline tests and manual calls with voice. E2E auth/session tests run without OpenAI.

\** Optional when `IS_FIREBASE_EMULATOR=true` (emulator accepts unsigned tokens).

Models are **server-side only** — clients never send model or provider ids. Change env vars and redeploy to swap models.

### Firebase emulator mode

1. Start Firebase emulators (see `webApp/FIREBASE_EMULATOR_SETUP.md`):

   ```bash
   cd webApp && pnpm dev:firebase-emulator
   ```

2. In `realtime/.env`:

   ```bash
   IS_FIREBASE_EMULATOR=true
   FIREBASE_PROJECT_ID=dark-lang
   ```

3. When `IS_FIREBASE_EMULATOR=true`, the service sets:

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
| `pnpm dev` | Realtime API server with reload (`tsx watch`) |
| `pnpm dev:client` | Vite test UI on http://localhost:5173 |
| `pnpm build:client` | Production build of test client |
| `pnpm typecheck` | TypeScript check |
| `pnpm test` | Unit tests (mocked Firebase / providers) |
| `pnpm test:e2e` | E2E tests (Firebase emulator + realtime on port `18081`) |
| `pnpm test:all` | Unit + E2E + test client build |
| `pnpm build && pnpm start` | Production build and run |

### Automated verification

```bash
cd realtime
pnpm test        # 27 unit tests
pnpm test:e2e    # auth, session lifecycle, optional OpenAI pipeline
pnpm test:all    # full suite
```

E2E harness (`e2e/globalSetup.ts`) starts the Firebase emulator from `webApp/` and a realtime server on port **18081** when the emulator is not already running. Requires Java 11+ and network access for `npx firebase-tools` on first run.

Pipeline e2e (`e2e/pipeline.e2e.ts`) calls real OpenAI when `OPENAI_API_KEY` is set; otherwise it skips.

## Test client

Manual UI for exercising the WebSocket session locally.

**Terminal 1** — realtime API:

```bash
cd realtime
pnpm dev
```

**Terminal 2** — Firebase emulator (if not already running):

```bash
cd webApp && pnpm dev:firebase-emulator
```

**Terminal 3** — test client:

```bash
cd realtime && pnpm dev:client
```

Open http://localhost:5173, sign in (Auth emulator checkbox), click **Connect**, then:

| Mode | How to use |
| ---- | ---------- |
| **PushToTalk** | Hold **Hold to talk** and release to commit, or send typed text + commit |
| **RealTimeConversation** | Select mode, Connect, **Start call**, speak naturally (server commits after ~1.2 s silence), **End call** to hang up |

Toggles: mic mute, AI voice on/off (voice off skips TTS but still runs STT + LLM). Usage events appear in the log panel.

The Vite dev server proxies `/v1` (HTTP + WebSocket) to `http://127.0.0.1:8081`.

## Wire protocol

Authoritative schemas: `src/protocol/messages.ts` (zod). Audio conventions: `src/protocol/audioCodec.ts`.

### Connection lifecycle

1. Client opens `ws://<host>/v1/session`.
2. Client sends **first message** — JSON `session.start` with Firebase ID token and session config.
3. Server verifies token, creates `ConversationSession`, replies `session.ready` with `sessionId` and effective config.
4. Client sends JSON control messages and binary audio frames until `session.end` or disconnect.

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
| `assistant.speaking` | Assistant TTS activity |
| `assistant.interrupted` | Barge-in — stop playback client-side |
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

Silence detection uses RMS on PCM chunks (`src/session/turnDetection.ts`). When the user speaks during assistant output, the server aborts in-flight TTS/LLM and sends `assistant.interrupted`.

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
├── e2e/                      # Vitest e2e (emulator + server)
└── tests/                    # Unit tests
```

## Phase 1 exit criteria

- [x] RealTimeConversation: streaming speech → assistant text (+ audio when voice on)
- [x] PushToTalk: hold/release → same pipeline
- [x] Muting AI voice skips TTS (check `usage` events — no `stage: "tts"`)
- [x] Mid-session `assistant.instruction` changes next reply
- [x] Invalid Firebase token rejected with fatal error

Next: **Phase 2** — Fly.io deploy, WSS, mobile audio testing. See `plan.md`.
