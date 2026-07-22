# Conversation restart — debug plan

Users report that a long conversation sometimes feels like it **restarts**: the AI re-introduces itself, loses thread, or the UI shows **"Reloading conversation..."**. This doc lists known restart paths, hypotheses (including cache), and how to narrow the root cause using Sentry + local checks.

## Known intentional restart paths (code today)

There are **two explicit triggers** in `useRestart.ts` / `useConversationUsage.tsx`:

| Trigger | Condition | Modes | What happens |
|--------|-----------|-------|----------------|
| **Message count** | `conversation.length > 0` and `length % N === 0` (`N = 40` founders, `130` others) | `talk`, `role-play` | Full transport restart after 10s wait; UI blocked |
| **Realtime usage / cache** | `rawAudioInputs > 5000` where `rawAudioInputs = audioTokens - cachedAudioTokens` on a `realtime` usage event | All modes using realtime transport | Sets `isNeedToResetNow` → same restart flow |

Restart implementation by transport:

- **WebRTC** (`restartWebRtc`): closes peer connection + data channel, opens a **new** session. On `open`, seeds context from `state.lastMessages.slice(-15)` via a **system** `conversation.item.create` (`seedConversationItems`). Does **not** call `onOpen()` when history exists (no fresh greeting trigger).
- **Realtime WebSocket** (`initRealtimeWsConversation.restartConversation`): disconnect + reconnect with same `systemInstruction`. **Does not seed** `lastMessages` into the new session (unlike WebRTC).
- **Text** (`initTextConversation`): `restartConversation` is a **no-op**.

UI: `PracticePage` renders `InfoBlockedSection` with **"Reloading conversation..."** while `isRestarting` is true (~10s + reconnect time).

## Production finding — DARK-LANG-HC (2026-07-19)

First Sentry event confirms the restart was **intentional**, not a mystery bug.

| Field | Value | Meaning |
|-------|-------|---------|
| Issue | [DARK-LANG-HC](https://pikapix.sentry.io/issues/DARK-LANG-HC) | `Conversation restart triggered` |
| **trigger** | `usage_cache_threshold` | Fired by `useConversationUsage`, not message count |
| **conversationLength** | **101** | Well below `messagesToRestart: 130` — message-count restart did **not** apply |
| **messagesUntilCountRestart** | 29 | Next count-based restart would be at 130 |
| **audioInputNew** (was `rawAudioInputs`) | **5917** | Just over the **5000** threshold on a single `response.done` usage event |
| **mode** | `talk` | WebRTC realtime (`type: realtime` usage) |
| **device** | iPad, Chrome iOS, production | User saw reload UI mid-conversation |

**Conclusion:** User hit the **realtime audio-input restart guard** after ~101 turns. One response carried ~5917 non-cached audio input units (OpenAI `input_token_details.audio_tokens - cached audio`), which triggered the 10s “Reloading conversation…” flow.

**Not the primary suspect for this event:** message-count restart, text-mode summary cache, or WebSocket missing seed (usage shape is WebRTC realtime).

**Sentry scrubbing note:** Original payload had `audioTokens: null`, `cachedAudioTokens: null` but `rawAudioInputs: 5917`. Sentry likely scrubbed keys containing `token`. Logging now uses scrub-safe names: `audioInputTotal`, `audioInputCached`, `audioInputNew` (flattened into event extra).

**Open tuning questions:**

1. Is **5000** too low if normal long sessions reach ~5917 new audio input before 130 messages?
2. Should restart require **consecutive** over-threshold turns, not a single spike?
3. After restart at 101 messages, user only gets ~10 seeded messages — may feel like “conversation reset” even though UI history is intact.

## Production finding — event #2 (2026-07-22)

Same issue [DARK-LANG-HC](https://pikapix.sentry.io/issues/7620738899/), `usage_cache_threshold` again.

| Field | Event #1 (Jul 19) | Event #2 (Jul 22) |
|-------|-------------------|-------------------|
| **conversationLength** | 101 | **38** |
| **messagesUntilCountRestart** | 29 | **92** |
| **audioInputNew** | 5917 | **5708** |
| **audioInputTotal** | (scrubbed) | **5708** |
| **audioInputCached** | (scrubbed) | **0** |
| **textInputTotal** | — | 1308 |
| **textInputCached** | — | 0 |
| **inputTotal** | — | 7016 |
| **outputTotal** | — | 274 |

**What this adds:**

1. **Not a “long chat” problem in message count** — restart at **38** messages, 92 messages before the 130 count-based restart.
2. **Same band of audio input** — both events fire just above **5000** (~5708–5917). The guard is a cliff at 5000, not gradual drift.
3. **Zero audio cache on event #2** — `audioInputCached: 0` means OpenAI billed the full **5708** audio input as non-cached on that turn. Text cache also 0 (`textInputCached: 0`). Restart was not “stale cache”; it was **uncached audio context size** on one `response.done`.
4. **Arithmetic check** — `audioInputTotal + textInputTotal ≈ inputTotal` (5708 + 1308 = 7016). Output (274) is separate and does **not** affect the restart rule.

**Emerging pattern (2 events, still observe):**

- Trigger = **one turn** where `audioInputNew > 5000`, almost always **~5.7k–5.9k**.
- Can happen **mid-session** (38 msgs), not only near 130.
- When `audioInputCached` is 0, the entire reported audio prompt for that inference counts as “new” — likely **cumulative conversation audio in the Realtime session context**, not a single utterance spike (needs more events to confirm).

**Still unknown:** Whether `audioInputCached` stays 0 often (cache not helping for audio) or event #1 also had low cache. Log `audioInputCached / audioInputTotal` ratio on every restart going forward.

## Token mechanics — what actually triggers restart (observation reference)

This section is the source of truth while we **observe only** (no fix yet). Goal: learn whether restarts correlate with token growth, and what a smooth alternative would need.

### Terminology

| Term | Meaning |
|------|---------|
| **OpenAI prompt cache** | OpenAI-side reuse of prior prompt content. Reported in usage as `cached_tokens_details.*`. Cheaper billing; we do **not** control invalidation. |
| **Our “restart”** | Full WebRTC teardown + new session (`restartWebRtc`). This **is** our cache/context reset — not an OpenAI API call to invalidate cache. |
| **Per-turn usage** | One `response.done` event per AI reply. Restart check runs on **each** event independently (not summed across the conversation). |

### The only token-based restart rule (WebRTC realtime)

Defined in `extractRealtimeUsageSnapshot.ts`:

```
audioInputNew = input_token_details.audio_tokens
              − cached_tokens_details.audio_tokens

restart if audioInputNew > 5000   (strictly greater than)
```

Constant: `REALTIME_AUDIO_INPUT_RESTART_THRESHOLD = 5000`.

**Applies only when** `usageLog.type === 'realtime'` (WebRTC `response.done` in `messageHandler.ts`).

**Does not apply to** experimental Realtime WebSocket (usage is mapped to `text` / `stt` / `tts`, never `realtime`).

### Token fields on each `response.done` (OpenAI `UsageEvent`)

**Input (can affect restart):**

| Field | Used for restart? | Role |
|-------|-------------------|------|
| `input_token_details.audio_tokens` | **Yes** (minuend) | Total audio input in the prompt for this inference |
| `input_token_details.cached_tokens_details.audio_tokens` | **Yes** (subtrahend) | Portion of that audio served from OpenAI prompt cache |
| `input_token_details.text_tokens` | No (logged only) | Text input in prompt |
| `input_token_details.cached_tokens_details.text_tokens` | No (logged only) | Cached text input |
| `input_token_details.cached_tokens` | No | Aggregate cached count (billing uses details breakdown) |
| `input_tokens` | No (logged only) | Total input tokens |

**Output (never triggers restart):**

| Field | Used for restart? | Role |
|-------|-------------------|------|
| `output_token_details.audio_tokens` | **No** | Audio the model generated (TTS side) |
| `output_token_details.text_tokens` | **No** | Text the model generated |
| `output_tokens` | No (logged only) | Total output tokens |

**Summary:** Only **non-cached audio input** on a **single** `response.done` triggers restart. Audio output, text input/output, and totals do not.

### Separate non-token restart (message count)

| Rule | Threshold | Modes |
|------|-----------|-------|
| Message count | `length % 130 === 0` (40 for founders) | `talk`, `role-play` only |

This is unrelated to tokens. DARK-LANG-HC fired at **101 messages** — message-count restart was **29 messages away**.

### How to read Sentry during observation

Filter: `Conversation restart triggered`, tag `trigger`.

| `trigger` | What to inspect |
|-----------|-----------------|
| `usage_cache_threshold` | `audioInputNew`, `audioInputTotal`, `audioInputCached`, `conversationLength`, tag `belowMessageCountThreshold` |
| `message_count_threshold` | `conversationLength` should equal `messagesToRestart` |

**Questions we are trying to answer with more events:**

1. Does `audioInputNew` grow roughly linearly with `conversationLength`, or spike on single long utterances?
2. At restart, is `audioInputCached` usually low (cache not helping) or high (threshold still exceeded)?
3. Do users who complain about “reset” always have `usage_cache_threshold`, or also `message_count_threshold`?
4. Is `audioInputNew` ever high while conversation still feels fine (false positive)?

### DARK-LANG-HC snapshot (first prod event)

- `audioInputNew`: **5917** (threshold 5000)
- `conversationLength`: **101** / 130
- `trigger`: `usage_cache_threshold`
- Interpretation: one AI turn’s usage reported ~5917 newly-billed audio input; our guard fired; user saw reload UI.

### Smooth conversation — options to evaluate later (not implementing now)

We do **not** yet know a reliable way to avoid restarts without regressing cost, latency, or context quality. Candidates to study after more Sentry data:

1. **Trim in-session context** via Realtime API (`conversation.item.delete` / session updates) instead of full reconnect.
2. **Raise or remove the 5000 guard** and accept higher per-turn cost until OpenAI cache catches up.
3. **Debounce** — restart only after N consecutive turns over threshold (reduces surprise reloads).
4. **Observe-only mode** — log over-threshold events to Sentry without calling `restartConversation` (would need a feature flag).
5. **Better re-seed on reconnect** — does not remove restart but reduces “feels like new conversation” (last ~10 messages today).

**Current stance:** keep restarts + Sentry logging; use token fields above to decide which option is justified.

## User-visible symptoms vs causes

| Symptom | Likely cause |
|---------|----------------|
| Full-screen "Reloading conversation..." | Intentional restart (`useRestart`) — check Sentry for trigger |
| AI re-introduces itself / "new conversation" tone | Fresh realtime session + weak context carry-over (only last 10–15 messages seeded on WebRTC; none on WS) |
| AI ignores earlier topics after ~130 messages | Expected if message-count restart fired; only tail of history is re-injected |
| Degraded replies before reload | OpenAI realtime **prompt cache** growth (`cached_tokens` vs new `audio_tokens`) — usage trigger tries to reset |
| Sudden restart without reload UI | Unlikely from `useRestart` alone — investigate transport errors, tab backgrounding, WebRTC disconnect |

## Hypothesis: stale / oversized realtime cache

`useConversationUsage` treats large **non-cached** audio input (`rawAudioInputs > 5000`) as a signal to restart immediately. Rationale in code comments: avoid memory / cost buildup on very long sessions.

**What we do not know yet:**

- Whether OpenAI's cached prompt state can produce **wrong** replies *before* our threshold fires (stale context without a visible reload).
- Whether **5000** is the right threshold for all session lengths (first prod event: restart at 101 msgs with **5917** new audio input).

**Confirmed from DARK-LANG-HC:** At least one user restart was **`usage_cache_threshold`**, not message count.

**Signals to compare in Sentry** (added in code):

- `trigger`: `message_count_threshold` vs `usage_cache_threshold`
- Tag `belowMessageCountThreshold`: `true` when usage trigger fired before count boundary
- `conversationLength`, `messagesToRestart`, `messagesUntilCountRestart`, `currentMode`
- Usage snapshot (scrub-safe): `audioInputTotal`, `audioInputCached`, `audioInputNew`, `textInputTotal`, `inputTotal`
- `seededMessageCount` (WebRTC open handler)

## Hypothesis: truncated history after restart

On WebRTC reopen:

1. `openHandler` takes **last 15** messages from `state.lastMessages`.
2. `buildTranscript` further keeps **last 10** and **800 chars per message**.

So after restart the model sees at most ~10 short messages as a system note, not the full Firestore/UI history. That can feel like a "restart" even when the UI message list is unchanged.

**Check:** Compare Sentry `seededMessageCount` + `conversationLength` at restart time. Large gap → context loss is expected, not a bug in message storage.

## Hypothesis: text-mode summary / response cache (non-realtime)

`textConversation.ts` maintains:

- Progressive **chunk summaries** (`SUMMARY_CHUNK_SIZE = 8`, `SUMMARY_KEEP_LAST = 7`)
- In-memory **`cacheProcessing`** keyed by hash of `systemMessage + textConversation`

If users report issues in **non-realtime** modes (`rule`, `words`, etc.), cache key collisions or summary drift are worth checking. Restarts are **not** wired for text mode today.

## Hypothesis: bugs in restart orchestration

Items to validate:

1. **`isNeedToResetNow` never reset to `false`** — after a usage-triggered restart, the flag stays `true`. The effect may not re-fire, but this is fragile if the hook remounts or logic changes.
2. **`conversation` closure in `restartConversation`** — `lastMessage` for Telegram comes from render closure; Sentry payload should use live length at restart time.
3. **Double restart guard** — `isRestartingRef` + 40s cooldown; verify overlapping triggers (message count at 130 **and** usage spike on same turn).
4. **Realtime WS missing seed** — if experimental WS is enabled, restart may drop all in-session context.
5. **Transport errors** — `onTransportError` closes conversation and shows init error; different from `isRestarting` but user may describe as "conversation died".

## Sentry queries (after deploy)

Filter: message `Conversation restart triggered`, tag `area:conversation`.

Useful breakdowns:

- Count by `trigger`
- `conversationLength` distribution at restart
- Founders (`messagesToRestart: 40`) vs regular users (`130`)
- Correlation: high `cachedAudioTokens` / `rawAudioInputs` before `usage_cache_threshold`

Add a dashboard or alert if restart rate spikes (e.g. > N per user per hour).

## Local / founder reproduction

1. **Founder account** (`auth.isFounder`) — restart every **40** messages in `talk` mode (faster loop).
2. Enable usage debug badge (uncomment in `useConversationUsage.tsx`) to watch `I:… (C:…) New:…` on screen.
3. Long `talk` session in WebRTC; note message count when UI reloads.
4. Compare AI behavior **before** reload (odd replies?) vs **after** (re-intro / topic reset?).
5. If using `experimentalRealtimeWs`, repeat and note whether context loss is worse (no seed).

## Manual code inspection checklist

When investigating a Sentry event:

- [ ] Which `trigger` fired?
- [ ] `currentMode` — is restart even enabled for this mode?
- [ ] `conversationLength` — exactly on threshold (`% 40` / `% 130`)?
- [ ] Usage fields — did cache threshold fire on first big turn or gradually?
- [ ] `seededMessageCount` — how much context was re-injected?
- [ ] User on WebRTC vs experimental WS vs text?
- [ ] Any nearby `Empty message from AI` or transport errors in same session?

## Fix ideas (only after root cause is confirmed)

Do **not** implement blindly — pick based on Sentry evidence.

### If message-count restart is the main complaint

- Raise `messagesToRestart` or make it time-based instead of count-based.
- Seed **more** history (with token budget) or summarize older messages like `textConversation` does.
- Soft restart: update session instructions without full WebRTC teardown.

### If usage/cache threshold fires too often

- Tune `rawAudioInputs > 5000` using production distribution.
- Debounce: require 2 consecutive over-threshold events.
- Reset `isNeedToResetNow` after successful restart.

### If context loss after restart is the issue

- Align `openHandler` (15) and `buildTranscript` (10) limits; document single constant.
- Port `seedConversationItems` (or equivalent) to **realtime WS** restart.
- Pass full `messages.conversation` from React state into restart instead of only `state.lastMessages` (guards against handler missing messages).

### If stale cache causes bad replies *before* restart

- Lower threshold or proactively restart on `cachedAudioTokens` ratio, not only raw inputs.
- On restart, force a session update that invalidates cache (verify OpenAI realtime API behavior).

### If text-mode cache/summary is involved

- Invalidate `cacheProcessing` when conversation length changes.
- Log summary chunk boundaries when `chunkCount` increases.

## Next steps

1. Ship Sentry instrumentation (see `reportConversationRestart.ts` + call sites).
2. Collect 1–2 weeks of events; classify by `trigger`.
3. Reproduce top scenario locally with founder threshold.
4. Choose one fix path from the table above based on data.
