# Phase 3 — handoff checklist

Code-complete for the **experimental** path. WebRTC remains default for all non–Experimental Lab entry points.

## Done in repo

- [x] `realtimeWs/` conversation adapter (Just Talk / `mode: 'talk'`)
- [x] Experimental Lab UI + `experimentalRealtimeWs` flag
- [x] `NEXT_PUBLIC_REALTIME_WS_URL_DEV` / `_PROD` selection via emulator flag
- [x] Auth: `getIdToken(true)`, emulator-token detection, UI errors
- [x] Usage mapping (STT / LLM / TTS → `UsageLog`)
- [x] Playwright: `webApp/e2e/conversation/experimentalRealtime.spec.ts` (mocked WS)
- [x] Unit tests: `resolveRealtimeWsAuthToken.test.ts`

## Your manual tasks

### 1. Local `.env.local` (webApp)

```bash
NEXT_PUBLIC_REALTIME_WS_URL_DEV=ws://127.0.0.1:8081
NEXT_PUBLIC_REALTIME_WS_URL_PROD=wss://fluencypal-realtime.fly.dev
```

| Goal | Command | Also run |
|------|---------|----------|
| Local stack | `pnpm dev` | `cd realtime && pnpm dev` |
| Localhost → Fly | `pnpm dev:prod` | Fly secrets (below) |

### 2. Fly production (for `dev:prod` / app.fluencypal.com later)

```bash
fly secrets set ALLOWED_ORIGINS='https://fluencypal-realtime.fly.dev,https://app.fluencypal.com,http://localhost:3000'
# Ensure present:
# FIREBASE_STORAGE_SERVICE_ACCOUNT_CREDS (dark-lang)
# OPENAI_API_KEY
```

Add billing on Fly if trial machines stop after ~5 minutes.

### 3. Device QA (cannot be automated here)

- [ ] iOS Safari: greeting, mute, volume, barge-in
- [ ] Android Chrome: same
- [ ] Compare usage $ vs one WebRTC Just Talk session (±5% rough check)

### 4. Optional product follow-ups

- [ ] Add `NEXT_PUBLIC_REALTIME_WS_URL_PROD` to Vercel production env when ready to expose beyond localhost
- [ ] Widen rollout beyond Experimental Lab
- [ ] Step 3.6: retire WebRTC for talk (only after QA sign-off)
