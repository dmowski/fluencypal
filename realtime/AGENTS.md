# Realtime (`realtime/`) — agent guidelines

Overrides root `AGENTS.md` for work in this package.

FluencyPal's custom WebSocket conversation backend: **STT → LLM → TTS** over one socket (`/v1/session`). Replaces the coupled OpenAI Realtime (WebRTC) stack. Full setup, wire protocol, and deploy details: [`README.md`](./README.md).

## Package boundaries

- **Isolated package** — not part of the root pnpm workspace. Install and run scripts only inside `realtime/`.
- Do not import from `webApp/` or `helperProjects/`. The experimental webApp integration consumes this service over WebSocket only (see [`PHASE3_CHECKLIST.md`](./PHASE3_CHECKLIST.md)).
- Models and provider ids are **server-side only** (`src/config/env.ts`); clients never send them.

## Architecture

```text
realtime/
├── src/
│   ├── index.ts              # Fastify bootstrap, /health, WS routes
│   ├── auth/                 # Firebase token validation
│   ├── config/               # env, models, firebase config
│   ├── protocol/             # zod wire schemas + audio codec (source of truth)
│   ├── session/              # ConversationSession, turn detection, pipeline
│   ├── providers/openai/     # STT, LLM, TTS adapters
│   ├── usage/                # usage event emission
│   └── ws/                   # WebSocket connection handler
├── client/                   # React + Vite UI (bundled in Fly deploy)
├── e2e/                      # Vitest API e2e + Playwright browser e2e
├── tests/                    # Unit tests (mocked Firebase / providers)
├── e2e-cases.md              # Voice E2E test matrix
└── PHASE3_CHECKLIST.md       # webApp experimental rollout + manual QA
```

### Pipeline (current behavior)

| Stage | Behavior |
| ----- | -------- |
| **User speech** | Client streams PCM16; server buffers until turn end (silence detection or PTT commit). |
| **STT** | One batch request per user turn (`transcribeBatch` → full WAV). No streaming partial user transcript. |
| **LLM** | Streamed token deltas → `transcript.delta`; full reply → `transcript.done`. |
| **TTS** | Starts **after** full LLM text; MP3 chunks stream as binary frames. |

### Session modes

| Mode | Turn end | Assistant reply |
| ---- | -------- | ----------------- |
| **RealTimeConversation** | Server silence timer (~1.2 s after speech) | Auto after each user turn |
| **PushToTalk** | `user.turn.commit` on release | Auto after commit (or `assistant.trigger`) |

Silence detection: `src/session/turnDetection.ts`. Barge-in aborts in-flight LLM/TTS and emits `assistant.interrupted`. OpenAI aborts (`APIUserAbortError`) are normal cancellation — must not crash the process (`src/errors/isAbortError.ts`).

### Wire protocol

- Authoritative schemas: `src/protocol/messages.ts` (zod).
- Audio conventions: `src/protocol/audioCodec.ts`.
- First message must be JSON `session.start` with Firebase ID token.
- Input audio: PCM16, 24 kHz, mono. Output: MP3 chunks when `voiceEnabled`.

When changing message types or session lifecycle, update zod schemas first, then handlers, then e2e tests.

## Development

```bash
cd realtime
pnpm install
cp .env.example .env   # optional OPENAI_API_KEY for full conversation
pnpm dev               # emulator + API :8081 + client :5173
```

- `pnpm dev:api` — API only (set `IS_FIREBASE_EMULATOR=true` when emulator runs separately).
- `pnpm dev:client` — React client only.
- Firebase emulator: Java 11+; `pnpm dev` starts emulators if Auth (`9099`) is not already running. Reuses existing Firestore on `8080` if occupied (e.g. by `webApp` dev).
- After API restart during dev, reconnect WebSocket (Disconnect → Connect).

## Required checks before finishing

Always run from `realtime/`:

```bash
pnpm lint    # tsc --noEmit + vite build (client) — catches bad firebase imports etc.
pnpm test    # unit tests
pnpm audit   # dependency vulnerability check
```

Run `pnpm test:e2e` when changing auth, WebSocket protocol, or session lifecycle.

Run `pnpm test:e2e:voice` when changing turn detection, barge-in, STT/LLM/TTS voice flow (requires `OPENAI_API_KEY` + `pnpm e2e:fixtures:voice`). See [`e2e-cases.md`](./e2e-cases.md).

Run `pnpm test:e2e:browser` only when changing client UI flows.

Run `pnpm test:e2e:voice:browser` for full browser + real speech file mic (same prerequisites as voice API e2e).

Set `REUSE_DEV_SERVER=1` for browser e2e when `pnpm dev` is already running.

**Why `lint` includes `build:client`:** `tsc` only type-checks server `src/` and does not bundle `client/`. Vite/Rollup validates client imports (e.g. `FirebaseError` must come from `firebase/app`, not `firebase/auth`).

## E2E structure

| Suite | Command | Notes |
| ----- | ------- | ----- |
| API e2e | `pnpm test:e2e` | Vitest + WS client on port `18081`; `e2e/globalSetup.ts` starts emulator + server |
| Voice API e2e | `pnpm test:e2e:voice` | Real speech PCM over WebSocket; fixtures via `pnpm e2e:fixtures:voice` |
| Browser e2e | `pnpm test:e2e:browser` | Playwright + client on `:5173`; first run: `pnpm exec playwright install chromium` |
| Voice browser e2e | `pnpm test:e2e:voice:browser` | Chrome fake mic from normalized WAV fixtures (`pnpm e2e:fixtures:normalize`) |

Auth/session e2e runs without OpenAI. Voice suites require `OPENAI_API_KEY`.

## Conventions

- TypeScript strictness expected throughout.
- Import `FirebaseError` from `firebase/app`, not `firebase/auth` (same as `webApp`).
- Rate limiting: `@fastify/rate-limit` per IP; `/health` and `/ready` allowlisted. Tune via `RATE_LIMIT_*` env vars.
- Session idle timeout: `SESSION_IDLE_TIMEOUT_MS` (default 10 min). Mic audio and control messages reset the timer; `session.ping` does not.

## Deploy

Production Docker runs `pnpm build` + `pnpm build:client`. A green `pnpm lint` is required before `pnpm prod` (Fly.io).

Production WSS: `wss://fluencypal-realtime.fly.dev/v1/session`. Client UI is same-origin at `https://fluencypal-realtime.fly.dev/`.

## webApp integration

Experimental **Just Talk (custom realtime)** lives in `webApp/src/features/Dashboard/ExperimentalDashboardCard.tsx`. WebRTC remains the default elsewhere.

Env vars in `webApp/.env.local`:

```bash
NEXT_PUBLIC_REALTIME_WS_URL_DEV=ws://127.0.0.1:8081      # pnpm dev (emulator)
NEXT_PUBLIC_REALTIME_WS_URL_PROD=wss://fluencypal-realtime.fly.dev  # pnpm dev:prod
```

Reconnection MVP: fresh sessions only — no resume.

## Additional references

- [`README.md`](./README.md) — prerequisites, env vars, wire protocol tables, Fly deploy
- [`e2e-cases.md`](./e2e-cases.md) — voice E2E matrix
- [`PHASE3_CHECKLIST.md`](./PHASE3_CHECKLIST.md) — webApp rollout + manual QA
- [`../webApp/FIREBASE_EMULATOR_SETUP.md`](../webApp/FIREBASE_EMULATOR_SETUP.md) — emulator ports and workflow
