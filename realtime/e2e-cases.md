# Realtime voice E2E — test cases

These tests run against a **live dev stack** (Firebase Auth emulator + realtime API on port `8081` or `18081`, optional test client on `5173`). They use **real OpenAI** STT / LLM / TTS and **real speech audio** (recorded fixtures or OpenAI-generated WAV), not mocked providers or mocked WebSockets.

## Prerequisites

| Requirement | Why |
|-------------|-----|
| `OPENAI_API_KEY` in `realtime/.env` | STT, LLM, TTS |
| Java 11+ | Firebase emulator (via `webApp`) |
| Voice fixtures | `pnpm e2e:fixtures:voice` (once) → `e2e/fixtures/voice/*.wav` |
| `ffmpeg` or `ffmpeg-static` | Fixture script converts TTS MP3 → WAV |

## How to run

```bash
cd realtime
pnpm e2e:fixtures:voice          # first time / when phrases change
pnpm test:e2e:voice              # API-level voice (Vitest, port 18081)
pnpm test:e2e:voice:browser      # Browser + test client (port 8081 + 5173)
REUSE_DEV_SERVER=1 pnpm test:e2e:voice:browser   # if `pnpm dev` already running
```

## Case index

| ID | Suite | Priority | Summary |
|----|--------|----------|---------|
| VC-01 | API + browser | P0 | Session connects; greeting produces assistant transcript + TTS |
| VC-02 | API | P0 | After greeting playback window, user says “Hello” → STT user turn + assistant reply |
| VC-03 | API | P0 | User speech without greeting → STT + assistant reply (no spurious `assistant.interrupted`) |
| VC-04 | API | P1 | Mic stays open through greeting; no interrupt before user speaks |
| VC-05 | browser | P1 | Full UI: sign-in → connect → start call → listening → user transcript appears |
| VC-06 | API | P2 | Push-to-talk style: stream speech then explicit `user.turn.commit` |
| VC-07 | API | P2 | Barge-in: loud user audio during assistant TTS aborts assistant output |
| VC-08 | browser | P2 | Debug log shows `tts_played` and no `server_interrupted` after idle user turn |

## VC-01 — Greeting on call start

**Goal:** Opening a real-time call triggers `assistant.trigger` flow end-to-end.

**Steps (API):**

1. Start session (`RealTimeConversation`, voice on).
2. Send `assistant.trigger`.
3. Wait for `transcript.done` role `assistant` (non-empty).
4. Wait for `assistant.speaking` active false.
5. Optionally collect binary TTS bytes (length > 0).

**Pass:** Assistant text received; no fatal `error` message.

**Steps (browser):** Sign in (emulator) → Connect → Start call → status shows greeting then listening.

**Pass:** Assistant message visible in `#transcript`; usage log contains `LLM` and `TTS`.

---

## VC-02 — “Hello” after greeting (regression)

**Goal:** User speech after the assistant greeting is heard and answered — not swallowed by spurious barge-in.

**Steps:**

1. Complete VC-01 greeting.
2. Wait estimated playback window + margin (~500 ms).
3. Stream fixture `hello.wav` as PCM chunks (~100 ms cadence) for ~2 s, then silence ≥ turn-detector silence window (~1.2 s).
4. Wait for `usage` stage `stt`, `transcript.done` role `user`, then role `assistant`.

**Pass:**

- User transcript non-empty (STT heard speech).
- Assistant transcript non-empty.
- No `assistant.interrupted` between end of greeting playback and user `transcript.done`.

**Fail signals:** Only `assistant.interrupted`, no `stt` usage; empty user transcript.

---

## VC-03 — User turn without greeting

**Goal:** Mid-session speech is committed without starting from greeting.

**Steps:**

1. Start session; do **not** send `assistant.trigger`.
2. Stream `hello.wav` + silence.
3. Assert STT + assistant reply.

**Pass:** User and assistant `transcript.done`; no fatal error.

---

## VC-04 — Greeting without early interrupt

**Goal:** Mic tail / room noise during greeting does not fire barge-in before real user speech.

**Steps:**

1. `assistant.trigger`; stream low-energy silence fixture (or no user fixture) during first 2 s of greeting.
2. Assert no `assistant.interrupted` before assistant `transcript.done`.

**Pass:** Zero interrupts during greeting generation.

---

## VC-05 — Browser happy path (real mic file)

**Goal:** Chromium plays a real speech WAV into `getUserMedia`; app sends real PCM to server.

**Setup:** Launch with `--use-file-for-fake-audio-capture=<hello-48k.wav>` (looping speech, not synthetic tone).

**Steps:**

1. Sign in, connect, unmute mic, start call.
2. Wait for greeting playback (status “listening…” or assistant transcript).
3. Hold call long enough for turn detector + STT (fixture loops “Hello”).

**Pass:** `#transcript .message.user` visible; assistant follow-up visible; `#debug-log` contains `transcript.done` for user.

---

## VC-06 — Explicit commit after audio

**Goal:** Push-to-talk style commit still works with real audio chunks.

**Steps:**

1. Session mode `PushToTalk` or stream audio then `user.turn.commit`.
2. Stream `hello.wav`, send `user.turn.commit`.

**Pass:** User transcript from STT.

---

## VC-07 — Barge-in during assistant speech

**Goal:** Intentional interrupt while assistant is generating cancels output.

**Steps:**

1. `assistant.trigger` with slow/large reply (long system prompt or wait until `assistant.speaking` active).
2. Stream loud fixture `loud-interrupt.wav` during TTS.

**Pass:** `assistant.interrupted` observed; pipeline recovers (optional follow-up turn).

---

## VC-08 — Playback completes (browser)

**Goal:** Assistant voice is not cut off without a matching server interrupt.

**Steps:**

1. Complete VC-05 flow.
2. Read `#debug-log` text.

**Pass:** Contains `tts_played` / `playback_done`; no `server_interrupted` after user turn unless VC-07.

---

## Non-goals (this suite)

- Mocked WebSocket or OpenAI responses
- Unit-level turn-detector thresholds (see `tests/`)
- webApp Experimental card UI (separate `webApp/e2e`); optional follow-up with same fixtures

## Fixture phrases

| File | Spoken text | Use |
|------|-------------|-----|
| `hello-24k-mono.wav` | “Hello.” | VC-02, VC-03, VC-05 |
| `hello-48k-mono.wav` | “Hello.” | Chrome fake mic capture |
| `silence-24k-mono.wav` | ~300 ms silence | VC-04 padding |
| `loud-interrupt-24k-mono.wav` | “Excuse me, stop.” | VC-07 |

Regenerate after changing phrases: `pnpm e2e:fixtures:voice`.

## CI notes

- Skip voice suites when `OPENAI_API_KEY` or fixtures are missing (clear skip message).
- API voice uses port **18081** (isolated). Browser voice uses **8081** + **5173** (same as `pnpm dev`).
- Timeouts: 180 s per test (OpenAI latency).
