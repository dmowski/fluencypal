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

- Whether users who report "restart" hit the **message-count** threshold, the **usage/cache** threshold, or something else entirely.
- Whether OpenAI's cached prompt state can produce **wrong** replies *before* our threshold fires (stale context without a visible reload).
- Whether `rawAudioInputs > 5000` is the right threshold (too low → frequent restarts; too high → bad behavior before restart).

**Signals to compare in Sentry** (added in code):

- `trigger`: `message_count_threshold` vs `usage_cache_threshold`
- `conversationLength`, `messagesToRestart`, `currentMode`
- Usage snapshot: `audioTokens`, `cachedAudioTokens`, `rawAudioInputs`
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
