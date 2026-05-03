# Web Project Guidelines

This file applies to work under `web/` and overrides root defaults when there is a conflict.

## Fast Validation

Run the smallest relevant checks before finishing:

- Always after TypeScript changes: `pnpm lint`
- For unit-level logic/components: `pnpm test:unit`
- For end-to-end behavior changes: run targeted Playwright specs and do not skip e2e.
  - Reader behavior changes: `cd webApp && pnpm test:e2e e2e/books.spec.ts`
  - Other feature behavior changes: run the nearest targeted spec(s) from inside `webApp/`

Prefer targeted tests first. Run full `pnpm test` only when cross-cutting behavior changed.

## Build And Runtime

- Local dev entrypoint: `pnpm dev` (uses Firebase emulator helper script)
- Standalone Next dev: `pnpm dev:only`
- Production build: `pnpm build`

When validating production behavior, remember Playwright config starts the app with build + start.

## Architecture Boundaries

- Routes and layouts live in `src/app` (App Router).
- Domain and UI feature modules live in `src/features`.
- Shared integrations/utilities live in `src/libs`.
- Locale catalogs and i18n assets live in `src/locales`.

Before introducing new top-level folders under `src/`, match existing feature-first organization.

## Conventions

- Use TypeScript strict-safe patterns; avoid `any` unless there is a clear boundary reason.
- Use alias imports where appropriate: `@/` maps to `src/`.
- Keep changes consistent with `prettier.config.cjs`.
- `pnpm lint` is typecheck only (`tsc --noEmit`), so do not assume ESLint auto-enforcement.
- Prefer avoiding `useEffect` in feature/component code; choose event-driven handlers, derived state, or explicit hook APIs first.
- Introduce `useEffect` only when required for external synchronization, and keep effect scope small to reduce test flakiness.

## i18n And Content

- Lingui is used for localization.
  Example of using on client:

```ts
import { useLingui } from '@lingui/react';
const { i18n } = useLingui();
i18n._('Speaking');
```

## Environment Gotchas

- Firebase emulator setup and required ports are documented in `FIREBASE_EMULATOR_SETUP.md`.
- Emulator usage requires Java 11+.
- Production Sentry upload paths require Sentry env vars; do not treat missing vars as code regressions in local-only tasks.

## Additional References

- `../README.md`
- `FIREBASE_EMULATOR_SETUP.md`
