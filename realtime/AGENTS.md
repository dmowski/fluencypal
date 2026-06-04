# Realtime (`realtime/`) — agent guidelines

Overrides root `AGENTS.md` for work in this package.

## Required checks before finishing

Always run from `realtime/`:

```bash
pnpm lint    # tsc --noEmit + vite build (test-client) — catches bad firebase imports etc.
pnpm test    # unit tests
pnpm audit   # dependency vulnerability check
```

Run `pnpm test:e2e` when changing auth, WebSocket protocol, or session lifecycle.

Run `pnpm test:e2e:voice` when changing turn detection, barge-in, STT/LLM/TTS voice flow (requires `OPENAI_API_KEY` + `pnpm e2e:fixtures:voice`). See `e2e-cases.md`.

Run `pnpm test:e2e:browser` only when changing test-client UI flows.

Run `pnpm test:e2e:voice:browser` for full browser + real speech file mic (same prerequisites as voice API e2e).

**Why `lint` includes `build:client`:** `tsc` only type-checks server `src/` and does not bundle `test-client/`. Vite/Rollup validates client imports (e.g. `FirebaseError` must come from `firebase/app`, not `firebase/auth`).

## Firebase client imports

Match `webApp`: import `FirebaseError` from `firebase/app`, not `firebase/auth`.

## Deploy

Production Docker runs `pnpm build` + `pnpm build:client`. A green `pnpm lint` is required before `pnpm prod`.
