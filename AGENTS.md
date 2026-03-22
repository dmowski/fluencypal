# Project Guidelines

This repository is a monorepo with two active project areas:

- `web/`: Next.js application (primary product)
- `helperProjects/trimAudios/`: Node.js CLI pipeline for audio processing and upload

Instruction hierarchy uses nearest-file precedence:

- Root `AGENTS.md` applies by default.
- `web/AGENTS.md` overrides and extends this file for changes inside `web/`.

## Build And Test

Use pnpm for all package operations.

- Web app install: `cd web && pnpm install`
- Web app dev: `cd web && pnpm dev`
- Web app typecheck (named lint): `cd web && pnpm lint`
- Web unit tests: `cd web && pnpm test:unit`
- Web e2e tests: `cd web && pnpm test:e2e`

- Trim audios install: `cd helperProjects/trimAudios && pnpm install`
- Trim audios typecheck: `cd helperProjects/trimAudios && pnpm typecheck`
- Trim audios full pipeline: `cd helperProjects/trimAudios && pnpm all`

When changing one area, run checks for that area first. Avoid running full Playwright by default unless the task touches e2e-sensitive behavior.

## Architecture

- `web/` is feature-oriented: UI routes in `web/src/app`, domain logic in `web/src/features`, shared integrations/helpers in `web/src/libs`.
- `helperProjects/trimAudios/` is a command-based CLI entrypoint at `helperProjects/trimAudios/src/index.ts` with commands under `helperProjects/trimAudios/src/commands`.
- Keep boundaries clear: do not import from `web/` into `helperProjects/trimAudios/`.

## Conventions

- TypeScript strictness is expected in both projects.
- In `web/`, `pnpm lint` means `tsc --noEmit` (no ESLint assumption).
- Respect path alias usage in `web/` (`@/*` -> `src/*`) and local module style in `trimAudios`.
- Follow existing formatting config in `web/prettier.config.cjs`.

## Environment And Pitfalls

- Local Firebase emulator requires Java 11+ and ports configured in `web/firebase.json`.
- Production web builds require Sentry environment variables when sourcemap upload is enabled.
- `helperProjects/trimAudios` requires Node 20+.

## Key Docs

- Project setup and scripts: `README.md`
- Firebase emulator workflow: `web/FIREBASE_EMULATOR_SETUP.md`
- Security reporting: `web/SECURITY.md`
- Web-specific coding guidance: `web/AGENTS.md`
