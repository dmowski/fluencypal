# Project Guidelines

This repository is a monorepo with two active project areas:

- `webApp/`: Next.js application (primary product)
- `landing/`: Next.js application (Landing pages)
- `helperProjects/trimAudios/`: Node.js CLI pipeline for audio processing and upload
- `realtime/`: WebSocket AI conversation service (isolated package)

Instruction hierarchy uses nearest-file precedence:

- Root `AGENTS.md` applies by default.
- `webApp/AGENTS.md` overrides and extends this file for changes inside `webApp/`.
- `landing/AGENTS.md` overrides and extends this file for changes inside `landing/`.

## Build And Test

Use pnpm for all package operations.

- Web app install: `cd webApp && pnpm install`
- Web app dev: `cd webApp && pnpm dev`
- Web app typecheck (named lint): `cd webApp && pnpm lint`
- Web unit tests: `cd webApp && pnpm test:unit`
- Web e2e tests: `cd webApp && pnpm test:e2e`
  - All reader e2e tests live under `webApp/e2e/reader/` (12 spec files by concern)

- Trim audios install: `cd helperProjects/trimAudios && pnpm install`
- Trim audios typecheck: `cd helperProjects/trimAudios && pnpm typecheck`
- Trim audios full pipeline: `cd helperProjects/trimAudios && pnpm all`

- Realtime install: `cd realtime && pnpm install`
- Realtime dev (emulator + API + test client): `cd realtime && pnpm dev`
- Realtime checks (typecheck + test-client Vite build): `cd realtime && pnpm lint`
- Realtime unit tests: `cd realtime && pnpm test`
- Realtime API e2e (Firebase emulator + service): `cd realtime && pnpm test:e2e`
- Realtime browser e2e (Playwright): `cd realtime && pnpm test:e2e:browser`

When changing one area, run checks for that area first. Avoid running full Playwright by default unless the task touches e2e-sensitive behavior.

## Architecture

- `webApp/` is feature-oriented: UI routes in `webApp/src/app`, domain logic in `webApp/src/features`, shared integrations/helpers in `webApp/src/libs`.
- `helperProjects/trimAudios/` is a command-based CLI entrypoint at `helperProjects/trimAudios/src/index.ts` with commands under `helperProjects/trimAudios/src/commands`.
- Keep boundaries clear: do not import from `webApp/` into `helperProjects/trimAudios/`.

## Conventions

- TypeScript strictness is expected in both projects.
- In `webApp/`, `pnpm lint` means `tsc --noEmit` (no ESLint assumption).
- Respect path alias usage in `webApp/` (`@/*` -> `src/*`) and local module style in `trimAudios`.
- Follow existing formatting config in `webApp/prettier.config.cjs`.
- Prefer avoiding `useEffect` in UI code by default; favor explicit event handlers, derived state, and data flow that is easier to test.
- Use `useEffect` only when synchronizing with external systems (timers, subscriptions, imperative browser APIs) and keep those effects minimal and isolated.

## E2E Testing

- Do not add per-assertion `{ timeout }` values above 15 000 ms. If an operation genuinely takes longer, investigate a faster fixture or a better wait strategy instead of increasing the timeout — long timeouts make debugging slow.
- Wait for the specific UI signal that proves the operation completed (a new element appearing, a button becoming enabled, etc.) rather than waiting for intermediate states to disappear.

## Environment And Pitfalls

- Local Firebase emulator requires Java 11+ and ports configured in `webApp/firebase.json`.
- Production web builds require Sentry environment variables when sourcemap upload is enabled.
- `helperProjects/trimAudios` requires Node 20+.

## Key Docs

- Project setup and scripts: `README.md`
- Realtime service setup and wire protocol: `realtime/README.md`
- Firebase emulator workflow: `webApp/FIREBASE_EMULATOR_SETUP.md`
- Security reporting: `webApp/SECURITY.md`
- Web-specific coding guidance: `webApp/AGENTS.md`
