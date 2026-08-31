# Web Project Guidelines

This file applies to work under `web/` and overrides root defaults when there is a conflict.

## Fast Validation

Run the smallest relevant checks before finishing:

- Always after TypeScript changes: `pnpm lint`
- For unit-level logic/components: `pnpm test:unit`
- For end-to-end behavior changes: `pnpm test:e2e` (or targeted Playwright spec)

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

## Custom Analytics

Landing embed only (`src/features/Analytics/Custom/`). Do not import from `webApp/`.

Schema, daily report, SEO/GEO reading, and intervention log live in:

- `../webApp/src/features/Analytics/Custom/AGENTS.md`
- `../webApp/src/features/Analytics/Custom/INTERVENTIONS.md`

When asked “what's going today?”, follow that guide (`cd webApp && pnpm analytics:export`). Keep landing `protocol.ts` event fields in sync with webApp ingest (`page_view`, `click`, `scroll_depth`, `page_leave` plus CTA/UTM/scroll). Landing owns the visitor id (cookie + `?fpv=` on app links); do not import from `webApp/`.

## Additional References

- `../README.md`
- `FIREBASE_EMULATOR_SETUP.md`
