# FluencyPal Realtime Communicator — Implementation Plan

This document describes how to build a **custom realtime AI conversation service** in `realtime/`, replacing the current OpenAI Realtime (WebRTC) integration with a composable pipeline where **STT, LLM, and TTS are independently configurable** (model + provider).

It is based on `realtime/draft.md`, root `AGENTS.md`, `README.md`, and the existing web app conversation layer (`webApp/src/features/Conversation/`).

---

## 1. Goals and Non-Goals

### Goals

- **Composable AI stack**: separate providers/models for speech-to-text, text generation, and text-to-speech.
- **Streaming first**: user audio in, assistant text and/or audio out, with live transcript deltas.
- **Runtime control**: toggle AI voice output off to skip TTS cost; update system prompt mid-session (lesson corrections, webcam context).
- **Vendor independence via code config**: STT/LLM/TTS models and providers are chosen in server code / env — not exposed as mid-conversation user controls. Swapping OpenAI for another vendor is a deploy-time change, not a wire-protocol feature.
- **Voice at session start**: assistant voice comes from the user’s app settings and is sent once in `session.start` (no mid-session voice changes).
- **Firebase auth**: only authenticated FluencyPal users can open a session.
- **Token usage events**: server emits usage metadata for client-side analytics (MVP — no hard billing enforcement in this service).
- **Two conversation input modes**:
  - **RealTimeConversation** — continuous duplex, like a phone call (primary MVP target).
  - **PushToTalk** — user records a message, then AI responds.
- **Optional webcam frames** — protocol slot reserved; JPEG-to-LLM vision is deferred (see Decisions).
### Non-Goals (MVP)

- Mid-session model, provider, or voice changes (reconnect or new session if those ever change).
- VAD as a separate wire-protocol mode (webApp VAD is a workaround; RealTimeConversation covers call-like behavior).
- Replacing Firestore conversation persistence (keep in webApp as today).
- Payment / balance enforcement inside realtime service (webApp already tracks usage via `onAddUsage`).
- Vision / JPEG-to-LLM processing (protocol stub only).
- Additional LLM providers beyond OpenAI (e.g. Anthropic).
- Multi-region HA, autoscaling policy tuning, or custom ML models.
- Full production UI in Phase 1 (test harness only).

### Why not OpenAI Realtime?

The current stack (`initWebRtcConversation` → SDP exchange → OpenAI Realtime data channel) couples STT + reasoning + TTS. That makes it hard to:

- Use cheaper TTS (`gpt-4o-mini-tts`) while keeping a strong text model (`gpt-4o`).
- Change LLM provider in server config without rewriting STT/TTS legs.
- Skip TTS generation when the user mutes AI voice.
- Patch instructions mid-call reliably (`updateSessionSafe` is a workaround).

The new service **orchestrates three independent steps** behind one WebSocket protocol.

---

## 2. Current App Context (Integration Target)

Today the web app abstracts conversations through `ConversationInstance`:

```34:53:webApp/src/features/Conversation/ConversationInstance/types.ts
export type ConversationInstance = {
  addThreadsMessage: (message: string) => void;
  closeHandler: () => void;
  triggerAiResponse: () => Promise<void>;
  toggleMute: (mute: boolean) => void;
  toggleVolume: (isVolumeOn: boolean) => void;
  lockVolume: () => void;
  unlockVolume: () => void;
  sendWebCamDescription: (description: string) => void;
  sendCorrectionInstruction: (correction: string) => void;
  addUserMessageDelta: (delta: string) => void;
  completeUserMessageDelta: ({ removeMessage }: { removeMessage?: boolean }) => void;
  restartConversation: () => Promise<void>;
};
```

Realtime modes (`talk`, `role-play`, `news-discussion`) use WebRTC + OpenAI Realtime. Other modes use `initTextConversation` (HTTP chat + `/api/ttsStream`).

**Phase 3 target**: add `initRealtimeWsConversation` implementing the same `ConversationInstance` surface, so `useAiConversation.tsx` can switch transports with minimal UI changes.

Existing patterns to reuse:

| Concern                 | Existing reference                                                                    |
| ----------------------- | ------------------------------------------------------------------------------------- |
| Auth token verify       | `webApp/src/app/api/config/firebase.ts` → `validateAuthToken`                         |
| Usage event shape       | `UsageEvent` in `webApp/src/features/Ai/ai.ts`, handler in `webRtc/messageHandler.ts` |
| TTS model/voice         | `gpt-4o-mini-tts`, voices in `AiVoice` type                                           |
| Transcript deltas       | `onAddDelta`, `onMessage`, `onMessageOrder` in `ConversationConfig`                   |
| Webcam context          | `sendWebCamDescription` / `getWebCamDescriptionInstruction`                           |
| Mid-session instruction | `sendCorrectionInstruction`, `updateInstruction`                                      |

---

## 3. High-Level Architecture

```mermaid
flowchart TB
  subgraph client [Client - webApp or test page]
    Mic[Microphone stream]
    Cam[Webcam frames optional]
    WSClient[WebSocket client]
    UI[Transcript + call UI]
  end

  subgraph realtime [realtime/ service]
    WSS[WebSocket gateway]
    Auth[Firebase token verify]
    Session[Session orchestrator]
    Turn[Turn detector]
    subgraph providers [Provider adapters]
      STT[STT adapter]
      LLM[LLM adapter]
      TTS[TTS adapter]
      Vision[Vision context builder]
    end
    Usage[Usage emitter]
  end

  subgraph external [External APIs]
    OpenAI[OpenAI]
  end

  Mic --> WSClient
  Cam --> WSClient
  WSClient <-->|JSON + binary frames| WSS
  WSS --> Auth --> Session
  Session --> Turn
  Turn --> STT --> LLM
  LLM --> TTS
  Cam --> Vision --> LLM
  STT --> OpenAI
  LLM --> OpenAI
  TTS --> OpenAI
  Session --> Usage --> WSClient
  WSClient --> UI
```

### Core design principles

1. **One WebSocket per conversation session** — multiplex control (JSON) and audio (binary) on the same connection.
2. **Provider interfaces** — orchestrator never imports vendor SDKs directly.
3. **Session state on server** — conversation history, current instructions, feature flags (`voiceEnabled`, `micMuted`), pending partial transcripts.
4. **Client stays thin** — capture/play audio, render events; no API keys on client except Firebase ID token.
5. **Backpressure-aware streaming** — TTS starts on sentence boundaries or after LLM chunk flush, cancellable when user speaks or mutes voice.

---

## 4. Recommended Tech Stack

| Layer             | Choice                             | Rationale                                                      |
| ----------------- | ---------------------------------- | -------------------------------------------------------------- |
| Runtime           | Node.js 20+                        | Matches monorepo conventions (`trimAudios`, webApp API routes) |
| Language          | TypeScript strict                  | Consistent with rest of repo                                   |
| HTTP + WS server  | **Fastify** + `@fastify/websocket` | Lightweight, good WS ergonomics, easy health checks            |
| Package manager   | pnpm                               | Monorepo standard                                              |
| Dev runner        | `tsx`                              | Same as `helperProjects/trimAudios`                            |
| Validation        | `zod`                              | Wire protocol schemas                                          |
| OpenAI            | `openai` official SDK              | Already used in webApp                                         |
| Audio utils       | `ffmpeg-static` optional           | Transcode client codecs if needed                              |
| Test page         | Vite + vanilla TS or minimal React | Fast iteration in Phase 1                                      |
| Auth              | `firebase-admin`                   | Copy/adapt from webApp firebase config                         |

**Why a standalone service (not Next.js route)?**

Next.js API routes on Vercel are a poor fit for long-lived bidirectional WebSocket sessions. A dedicated Node process (Fly.io, Railway, Cloud Run, Render) is the standard pattern.

---

## 5. Repository Layout (Phase 1)

```
realtime/
├── plan.md
├── draft.md
├── package.json
├── tsconfig.json
├── .env.example
├── src/
│   ├── index.ts                 # Fastify bootstrap, /health, WS upgrade
│   ├── config/
│   │   ├── env.ts
│   │   ├── firebase.ts          # adapted from webApp firebase admin init
│   │   └── models.ts            # default model map (STT/LLM/TTS)
│   ├── protocol/
│   │   ├── messages.ts          # zod schemas: client ↔ server events
│   │   └── audioCodec.ts        # PCM16 24kHz mono conventions
│   ├── session/
│   │   ├── SessionManager.ts
│   │   ├── ConversationSession.ts
│   │   ├── turnDetection.ts
│   │   └── history.ts
│   ├── providers/
│   │   ├── types.ts             # SttProvider, LlmProvider, TtsProvider interfaces
│   │   ├── registry.ts          # provider + model resolution
│   │   ├── openai/
│   │   │   ├── stt.ts             # gpt-4o-transcribe / mini (stream + batch)
│   │   │   ├── llm.ts             # chat completions streaming
│   │   │   └── tts.ts             # gpt-4o-mini-tts streaming
│   ├── usage/
│   │   ├── types.ts
│   │   └── emitUsage.ts
│   └── ws/
│       ├── handleConnection.ts
│       └── authenticate.ts
├── test-client/
│   ├── index.html
│   ├── main.ts                  # mic, WS, transcript panel, mute toggles
│   └── audio/
│       ├── capture.ts           # ScriptProcessor / AudioWorklet → PCM16
│       └── playback.ts          # queue MP3/PCM chunks
└── tests/
    ├── protocol.test.ts
    └── session.test.ts
```

Add `realtime/` to root documentation (`AGENTS.md` / `README.md`) in Phase 1 as a third monorepo area — **after** the skeleton runs locally.

---

## 6. Wire Protocol

### Connection lifecycle

1. Client obtains Firebase ID token (same as webApp: `auth.getToken()`).
2. Client opens WebSocket:
   - `wss://<host>/v1/session?token=<firebaseIdToken>` **or**
   - connect then first message `{ type: "session.start", token, config }` (preferred — avoids token in logs/URLs).
3. Server verifies token, creates `ConversationSession`, replies `{ type: "session.ready", sessionId }` (echoes effective mode/voice from client config; models are server-side only).
4. Bidirectional streaming until `session.end` or disconnect.

### Message categories

| Channel   | Format                | Purpose                               |
| --------- | --------------------- | ------------------------------------- |
| Control   | JSON text frames      | config, transcripts, usage, errors    |
| Audio in  | Binary frames         | user PCM16 chunks (prefixed optional) |
| Audio out | Binary frames         | TTS output chunks (mp3 or pcm)        |
| Vision    | JSON with base64 JPEG | reserved; not implemented in MVP      |

### Client → Server events (JSON)

```ts
// session.start — first message after connect
{
  type: "session.start",
  token: string,
  config: {
    languageCode: "en",
    mode: "RealTimeConversation" | "PushToTalk",
    voiceEnabled: boolean,
    micMuted: boolean,
    systemInstruction: string,
    voice: "shimmer" | "ash" | "marin" | "verse",  // from user settings; fixed for session
    conversationId?: string,
  }
}

// runtime updates (mid-session) — no model/voice changes
{ type: "session.update", patch: { systemInstruction?, voiceEnabled?, micMuted? } }

// user text (push-to-talk text path)
{ type: "user.text", text: string, messageId?: string }

// explicit end of user turn (push-to-talk)
{ type: "user.turn.commit", messageId?: string }

// discard partial user utterance
{ type: "user.turn.cancel", messageId?: string }

// request AI to speak (mirrors triggerAiResponse)
{ type: "assistant.trigger" }

// correction / lesson plan injection
{ type: "assistant.instruction", text: string, mode: "replace" | "append" }

// vision (reserved — not implemented in MVP)
{ type: "vision.frame", jpegBase64: string, capturedAt: number }

// control
{ type: "session.ping" }
{ type: "session.end" }
```

### Server → Client events (JSON)

```ts
{ type: "session.ready", sessionId: string }

// partial transcripts (maps to onAddDelta)
{ type: "transcript.delta", messageId: string, role: "user" | "assistant", delta: string }

// finalized message (maps to onMessage)
{ type: "transcript.done", messageId: string, role: "user" | "assistant", text: string }

// speaking indicators
{ type: "user.speaking", active: boolean }
{ type: "assistant.speaking", active: boolean }

// item ordering for UI (maps to onMessageOrder)
{ type: "message.order", previousId: string, nextId: string }

// usage (maps to onAddUsage) — emit after each provider call
{
  type: "usage",
  usageId: string,
  stage: "stt" | "llm" | "tts" | "vision",
  model: string,
  usageEvent: { input_tokens, output_tokens, ... },
  priceUsd?: number,
  createdAt: number
}

{ type: "error", code: string, message: string, fatal?: boolean }
{ type: "session.pong" }
{ type: "session.ended" }
```

### Binary audio conventions

**MVP choice**: client sends **PCM16, 24 kHz, mono, little-endian** chunks (~100–250 ms). Simplest path for browser `AudioWorklet` capture and mobile compatibility; no extra decode step on server.

Prefix option (if multiplexing on one binary stream):

```
[1 byte type: 0x01=audio_in][4 byte length][payload]
```

Server TTS out: stream **MP3** chunks (matches existing `/api/ttsStream`) or raw PCM if client prefers Web Audio decode.

Document exact codec in `protocol/audioCodec.ts` and enforce max chunk size (e.g. 64 KB).

---

## 7. Provider Abstraction

### Interfaces

```ts
interface SttProvider {
  transcribeStream(
    input: AsyncIterable<AudioChunk>,
    opts: SttOptions,
  ): AsyncIterable<TranscriptEvent>;
  transcribeBatch(audio: Buffer, opts: SttOptions): Promise<TranscriptResult>;
}

interface LlmProvider {
  streamChat(messages: ChatMessage[], opts: LlmOptions): AsyncIterable<LlmChunk>;
}

interface TtsProvider {
  synthesizeStream(text: string, opts: TtsOptions): AsyncIterable<AudioChunk>;
  // optional: synthesizeStreamFromTokenStream for incremental TTS
}
```

### Default model map (from draft)

| Stage | Default model       | Default provider |
| ----- | ------------------- | ---------------- |
| STT   | `gpt-4o-transcribe` | OpenAI           |
| LLM   | `gpt-4o`            | OpenAI           |
| TTS   | `gpt-4o-mini-tts`   | OpenAI           |

Resolution order: **env vars → `config/models.ts` hardcoded defaults**. Clients do not send model or provider IDs.

### Changing models (developer workflow)

`providers/registry.ts` resolves `(stage, providerId, modelId)` from server config only. To swap vendors or models, change env / `config/models.ts` and redeploy — no client or protocol changes required.

Example env:

```bash
OPENAI_API_KEY=...
FIREBASE_STORAGE_SERVICE_ACCOUNT_CREDS=...
IS_FIREBASE_EMULATOR=true
REALTIME_PORT=8081
DEFAULT_LLM_PROVIDER=openai
DEFAULT_LLM_MODEL=gpt-4o
DEFAULT_STT_MODEL=gpt-4o-transcribe
DEFAULT_TTS_MODEL=gpt-4o-mini-tts
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:5173
```

---

## 8. Session Orchestrator Logic

### State machine (simplified)

```mermaid
stateDiagram-v2
  [*] --> Idle: session.ready
  Idle --> UserSpeaking: audio_in / speech detected
  UserSpeaking --> UserTurnReady: turn.commit OR silence timeout
  UserTurnReady --> Thinking: run LLM
  Thinking --> Speaking: voiceEnabled && TTS stream
  Thinking --> TextOnly: !voiceEnabled
  Speaking --> Idle: TTS done
  TextOnly --> Idle: transcript.done
  UserSpeaking --> Idle: turn.cancel
  Speaking --> UserSpeaking: user interrupt (barge-in)
```

### Mode behavior

| Mode                 | User input                      | Turn end                        | AI trigger                  |
| -------------------- | ------------------------------- | ------------------------------- | --------------------------- |
| RealTimeConversation | streaming audio while call open | server silence timer (~1–1.5 s) | auto after user turn        |
| PushToTalk           | audio or text while button held | `user.turn.commit` on release   | auto or `assistant.trigger` |

**MVP turn detection**: **RealTimeConversation first** — simple server silence timer on streamed PCM chunks. PushToTalk uses explicit `user.turn.commit`. (VAD in webApp today is a workaround for RealTimeConversation; this service does not expose a separate VAD mode.)

### Voice output gating

When `voiceEnabled === false`:

- Still run STT + LLM.
- Emit `transcript.delta` / `transcript.done` for assistant.
- **Do not** call TTS provider (zero TTS tokens).
- Emit `assistant.speaking: false`.

When user toggles voice off **during** TTS:

- Cancel active TTS stream (AbortController).
- Truncate assistant audio client-side.

This directly addresses the draft requirement to save tokens when AI voice is muted.

### Mid-session instruction updates

`session.update` or `assistant.instruction` merges into server-side `instructionState` (mirror `textConversation.ts`):

- `baseInitInstruction`
- `webCamDescription` (text derived from vision or legacy description string)
- `correction` (temporary override for next response)

On update, **do not reset** conversation history unless explicitly requested.

### Vision (deferred)

- Reserve `vision.frame` in the protocol and a no-op handler on the server.
- **Do not implement** vision processing in MVP.
- Later: client sends JPEG frames; server injects them into the LLM as multimodal input.
- Until then, webApp can keep sending text webcam descriptions via `assistant.instruction` / `session.update` (same as today’s `sendWebCamDescription`).

### Barge-in

When user starts speaking while assistant TTS is active:

1. Abort TTS + pending LLM if configured.
2. Send `{ type: "assistant.interrupted" }`.
3. Client stops audio playback immediately.

---

## 9. Security

### Authentication

Adapt `validateAuthToken` from `webApp/src/app/api/config/firebase.ts`:

- Verify Firebase ID token on `session.start`.
- Reject expired/invalid tokens with `{ type: "error", code: "auth.invalid", fatal: true }`.
- Support emulator mode via `IS_FIREBASE_EMULATOR=true`.

### Authorization (MVP)

- Any authenticated user may open a session.
- Rate limits: **webApp only** for MVP (`rateLimitRealtimeInit` stays in webApp; realtime service trusts authenticated sessions).

### Transport

- Require WSS in production.
- CORS / origin allowlist for test client and webApp domains.
- Max message size limits; rate-limit `session.start` per uid (in-memory MVP → Redis later).
- **Never** expose `OPENAI_API_KEY` to client.

### Secrets

- Keep `.env` gitignored (already in `realtime/.gitignore`).
- Document `.env.example` only.

---

## 10. Token Usage Events

Mirror the webApp `UsageEvent` shape so `conversationUsage.onAddUsage` can consume events with minimal mapping.

Emit usage:

| After                   | Stage    | Notes                                                 |
| ----------------------- | -------- | ----------------------------------------------------- |
| STT completion          | `stt`    | OpenAI transcription usage fields                     |
| Each LLM stream end     | `llm`    | Sum output tokens from stream                         |
| TTS synthesis           | `tts`    | Character-based or token estimate if API omits detail |
| Vision description call | `vision` | If using LLM to caption frames                        |

Emit cadence:

- **MVP**: after each provider call completes (simple, accurate enough for analytics).
- **Later**: periodic aggregates every N seconds for long realtime turns.

Include `conversationId` passed from client in `session.start` so webApp analytics stay consistent.

---

## 11. Phase 1 — Local Service + Test Page

**Objective**: Prove the pipeline end-to-end on desktop browser.

### Step 1.1 — Project scaffold

- [x] Init `realtime/package.json` (pnpm, Node 20+, TypeScript, Fastify, ws, zod, dotenv, firebase-admin, openai).
- [x] Add scripts: `dev`, `start`, `typecheck`, `test`.
- [x] Add `.env.example`.
- [x] Implement `/health`.

### Step 1.2 — Firebase auth module

- [x] Port firebase admin init + `validateAuthToken` (storage helpers optional for MVP).
- [x] Unit test with emulator instructions in README snippet.
- [x] E2E test (`pnpm test:e2e`): Firebase emulator + `/v1/auth/verify` with real emulator ID tokens.

### Step 1.3 — Protocol + session skeleton

- [x] Define zod schemas for all JSON events.
- [x] `SessionManager` maps `sessionId → ConversationSession`.
- [x] Handle connect/disconnect cleanup (abort in-flight streams).

### Step 1.4 — OpenAI providers

- [x] **STT batch** first (simplest): accumulate user turn audio → `audio.transcriptions.create` with `gpt-4o-transcribe`.
- [x] **LLM stream**: `chat.completions` streaming with conversation history.
- [x] **TTS stream**: `audio.speech.create` with streaming response body.
- [x] Wire orchestrator: user turn → STT → LLM → optional TTS.

### Step 1.5 — WebSocket gateway

- [x] Authenticate on `session.start`.
- [x] Accept binary audio frames → buffer until turn commit.
- [x] Emit transcript + usage events.

### Step 1.6 — Test client (`test-client/`)

- [x] Connect / disconnect
- [x] Start session with textarea for system prompt
- [x] Push-to-talk button (hold to record, release to commit)
- [x] Live transcript panel (user + assistant deltas)
- [x] Toggles: mic mute, AI voice on/off
- [x] Token usage log panel

### Step 1.7 — RealTimeConversation (primary)

- [x] Stream mic chunks while call is active.
- [x] Server silence detection → auto commit turn.
- [x] Auto-trigger assistant response.
- [x] PushToTalk mode after RealTimeConversation works.

### Step 1.8 — Developer docs

- [x] `realtime/README.md`: setup, env vars, run test client, protocol overview.

**Phase 1 exit criteria**

- RealTimeConversation: streaming user speech → assistant text + audible reply.
- PushToTalk: hold/release → same pipeline.
- Muting AI voice skips TTS calls (verify via usage events).
- Mid-session instruction update (correction / webcam text) changes next reply.
- Invalid Firebase token rejected.

---

## 12. Phase 2 — Deploy + Cross-Device Testing

**Objective**: Run on HTTPS/WSS in the wild (mobile Safari, Android Chrome).

### Step 2.1 — Deploy to Fly.io

- [x] `Dockerfile`, `fly.toml`, `.dockerignore`
- [x] Deploy + WSS URL documented in `realtime/README.md`

Fly.io is the chosen host (WebSocket-friendly, good fit for long-lived sessions). Document `fly.toml`, secrets, and WSS URL in `realtime/README.md`.

Other options considered:

| Platform             | Pros                            | Cons                              |
| -------------------- | ------------------------------- | --------------------------------- |
| **Fly.io** ✓         | WebSocket-friendly, global edge | Ops learning curve                |
| **Railway / Render** | Simple deploy from repo         | Check WS timeout limits           |
| **Google Cloud Run** | Same cloud as Firebase          | WS support requires HTTP/2 config |

### Step 2.2 — Production hardening

- [x] TLS termination + `ALLOWED_ORIGINS` (Fly `force_https`; CORS + WS origin guard)
- [x] Structured logging (pino) with sessionId + uid
- [x] Graceful shutdown (drain sessions on SIGTERM/SIGINT)
- [x] Health + readiness probes (`/health`, `/ready`)
- [x] Basic metrics: active sessions, STT/LLM/TTS latency on `/health` and `/ready`

### Step 2.3 — Mobile-oriented audio

- [x] AudioWorklet capture with ScriptProcessor fallback
- [x] Mobile warmup delay before capture (~2.5 s on iOS/Android)
- [x] Autoplay unlock on Connect / Start call + playback error logging

### Step 2.4 — Streaming STT upgrade (optional)

- [ ] Phase 1 uses batch transcribe per utterance; upgrade to streaming STT in Phase 2 if latency on mobile is unacceptable.

### Step 2.5 — Load smoke test

- [x] `pnpm load:smoke` — 5 concurrent sessions script
- [x] Verifies session cleanup via `/health` activeSessions

**Phase 2 exit criteria**

- Test client works on at least one iOS and one Android device over WSS.
- Reconnection strategy documented (fresh session vs resume — MVP: fresh).

---

## 13. Phase 3 — webApp Integration

**Objective**: Replace OpenAI Realtime WebRTC for `talk`, `role-play`, `news-discussion` modes.

### Step 3.1 — New conversation adapter

Create `webApp/src/features/Conversation/ConversationInstance/realtimeWs/`:

| Method                                             | WS mapping                                                            |
| -------------------------------------------------- | --------------------------------------------------------------------- |
| `closeHandler`                                     | `session.end`, close socket                                           |
| `toggleMute`                                       | pause/resume audio gating client-side + `session.update { micMuted }` |
| `toggleVolume`                                     | `session.update { voiceEnabled }`                                     |
| `triggerAiResponse`                                | `assistant.trigger`                                                   |
| `sendCorrectionInstruction`                        | `assistant.instruction`                                               |
| `sendWebCamDescription`                            | `session.update` vision text or `vision.frame`                        |
| `addUserMessageDelta` / `completeUserMessageDelta` | `user.text` + deltas for typed mode                                   |
| `restartConversation`                              | end session + new `session.start` with same config                    |

Map server events → existing `ConversationConfig` callbacks (same as `messageHandler.ts`).

### Step 3.2 — Experimental rollout

- [ ] Env `NEXT_PUBLIC_REALTIME_WS_URL=wss://...`
- [ ] Gate access via `webApp/src/features/Dashboard/ExperimentalDashboardCard.tsx` for a limited set of users
- [ ] Keep WebRTC path for users not on the experiment until stable

### Step 3.3 — Auth bridge

- [ ] Client passes Firebase token in `session.start` via existing `getAuthToken`.
- [ ] No server-side rate limits in MVP (webApp owns enforcement).

### Step 3.4 — Usage pipeline

- [ ] Map `usage` events to existing `UsageLog` + `calculateUsagePrice` (extend price tables for discrete STT/TTS models if needed).

### Step 3.5 — UI verification

- [ ] `CallButtons`, transcript view, mute/volume, lesson plan corrections
- [ ] E2e: one happy-path talk mode spec under `webApp/e2e/reader/` or conversation-specific folder

### Step 3.6 — Retire WebRTC path (later)

- [ ] Remove SDP / ephemeral token flow for conversation modes once stable
- [ ] Keep `/api/realtimeTranscript` until standalone STT WS exists or reuse new service

**Phase 3 exit criteria**

- Production talk mode uses custom realtime service.
- Usage analytics parity ±5% vs old path on test scenarios.
- No regression in non-experimental conversation paths (WebRTC fallback for non-experiment users).

---

## 14. Testing Strategy

**Rule**: every feature must be verifiable without manual steps. Prefer automated e2e over “curl with your token”.

| Layer                | Tool                          | Scope |
| -------------------- | ----------------------------- | ----- |
| Unit                 | `pnpm test` (vitest, mocked)  | protocol parsing, auth errors, orchestrator logic |
| E2E                  | `pnpm test:e2e` (vitest)      | Firebase emulator (from `webApp/`) + realtime on port `18081`; real ID tokens |
| OpenAI pipeline      | e2e with `OPENAI_API_KEY`     | STT / LLM / TTS integration (later steps; may use real tokens) |
| Test client UI       | playwright (Phase 2)          | mic via PCM fixtures, not live human |
| webApp integration   | existing Playwright + emulator | `ExperimentalDashboardCard` flow |

E2E harness: `realtime/e2e/globalSetup.ts` starts Firebase emulator (if not running) and the realtime server, then tears both down.

Avoid live mic in CI; use recorded PCM fixtures.

---

## 15. Risks and Mitigations

| Risk                                | Impact               | Mitigation                                                                   |
| ----------------------------------- | -------------------- | ---------------------------------------------------------------------------- |
| Latency higher than OpenAI Realtime | UX feels sluggish    | streaming LLM text immediately; sentence-chunk TTS; streaming STT in Phase 2 |
| iOS WebSocket + audio quirks        | Broken on mobile     | early Phase 2 device testing; AudioWorklet + warmup                          |
| Token usage mismatch                | Analytics drift      | normalize usage events; log raw provider payloads in debug                   |
| Long sessions memory growth         | Server OOM           | cap history length + summarization (reuse text conversation summary pattern) |
| Vision deferred but protocol grows    | Unused code paths    | stub handler only; implement when JPEG-to-LLM is scheduled                   |

---

## 16. Decisions (locked)

| Topic | Decision |
| ----- | -------- |
| **Deployment** | Fly.io (WebSocket-friendly default) |
| **Monorepo** | `realtime/` stays **isolated** — own `package.json`, not a pnpm workspace package |
| **MVP mode priority** | **RealTimeConversation** first, then PushToTalk |
| **STT (Phase 1)** | **Batch transcribe per utterance**; streaming STT optional in Phase 2 |
| **Extra LLM providers** | **Not planned** (no Anthropic adapter); vendor swap is future server-config work only |
| **Models / voice** | Set in **server env / code** before deploy; **voice** from user settings at **`session.start` only** — no mid-session model or voice changes |
| **Vision** | Reserve `vision.frame` in protocol; **not implemented** in MVP; later JPEG → LLM |
| **Conversation history** | **Full history on server** for the session; server may summarize internally; **no Firestore writes** from realtime |
| **Rate limits** | **webApp only** for MVP |
| **Audio format** | **PCM16 24 kHz mono** (simplest for browser + mobile MVP) |
| **Rollout** | Experimental entry via `ExperimentalDashboardCard.tsx`; WebRTC remains for non-experiment users |
| **OpenAI keys** | Single **`OPENAI_API_KEY` in `realtime/.env`** for MVP (no key rotation) |
| **Persistence** | Realtime service is **stateless w.r.t. Firestore**; webApp saves messages |

---

## 17. Suggested Implementation Order (Summary)

```text
Phase 1 (local)
  scaffold → auth → protocol → STT batch → LLM stream → TTS stream → WS → test client
  → RealTimeConversation → PushToTalk → voice mute gating → mid-session instruction update

Phase 2 (deploy)
  Fly.io + WSS → mobile audio → optional streaming STT → soak test

Phase 3 (product)
  ConversationInstance adapter → ExperimentalDashboardCard rollout → usage mapping → e2e
```

---

## 18. References

- Draft requirements: `realtime/draft.md`
- Firebase auth pattern: `webApp/src/app/api/config/firebase.ts`
- Conversation contract: `webApp/src/features/Conversation/ConversationInstance/types.ts`
- Current WebRTC realtime: `webApp/src/features/Conversation/ConversationInstance/webRtc/`
- Text + TTS path: `webApp/src/features/Conversation/ConversationInstance/textConversation.ts`, `webApp/src/app/api/ttsStream/route.ts`
- Usage handling: `webApp/src/features/Conversation/ConversationInstance/webRtc/messageHandler.ts`
- Integration hook: `webApp/src/features/Conversation/useAiConversation/useAiConversation.tsx`
