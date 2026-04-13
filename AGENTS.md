# Project Guidelines

This repository is a monorepo with two active project areas:

- `webApp/`: Next.js application (primary product)
- `landing/`: Next.js application (Landing pages)
- `helperProjects/trimAudios/`: Node.js CLI pipeline for audio processing and upload

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

- Trim audios install: `cd helperProjects/trimAudios && pnpm install`
- Trim audios typecheck: `cd helperProjects/trimAudios && pnpm typecheck`
- Trim audios full pipeline: `cd helperProjects/trimAudios && pnpm all`

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

## Environment And Pitfalls

- Local Firebase emulator requires Java 11+ and ports configured in `webApp/firebase.json`.
- Production web builds require Sentry environment variables when sourcemap upload is enabled.
- `helperProjects/trimAudios` requires Node 20+.

## Key Docs

- Project setup and scripts: `README.md`
- Firebase emulator workflow: `webApp/FIREBASE_EMULATOR_SETUP.md`
- Security reporting: `webApp/SECURITY.md`
- Web-specific coding guidance: `webApp/AGENTS.md`
