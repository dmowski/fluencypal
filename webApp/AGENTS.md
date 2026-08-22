# Web Project Guidelines

This file applies to work under `web/` and overrides root defaults when there is a conflict.

## Fast Validation

Run the smallest relevant checks before finishing:

- Always after TypeScript changes: `pnpm lint`
- For unit-level logic/components: `pnpm test:unit`
- For DOM-dependent component behavior (real-browser rendering, real click/selection, actual layout): `pnpm test:unit:browser`
- For end-to-end behavior changes: run e2e tests and do not skip e2e.
  - Reader behavior changes: `cd webApp && pnpm test:e2e`

Before final handoff for webApp changes, run full e2e once:

- `cd webApp && pnpm test:e2e`

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

- After adding or changing any `i18n._('...')` strings, run `pnpm lang` from
  `webApp/`. This extracts messages from source and AI-translates the catalogs
  in `src/locales/*.po` for every supported language in one step. Requires
  `OPENAI_API_KEY` to be set in `.env`.

## Environment Gotchas

- Firebase emulator setup and required ports are documented in `FIREBASE_EMULATOR_SETUP.md`.
- Emulator usage requires Java 11+.
- Production Sentry upload paths require Sentry env vars; do not treat missing vars as code regressions in local-only tasks.

## E2E Test Structure

All reader e2e specs live under `e2e/reader/` (one file per concern). Shared helpers are exported from `e2e/libs/reader.ts`; the individual modules live under `e2e/libs/books/`.

## Component (Browser) Tests

Real-browser component tests use Vitest + `vitest-browser-react` driven by the
`@vitest/browser-playwright` provider (Chromium). Run them with
`pnpm test:unit:browser` (config: `vitest.browser.config.ts`). They give Jest-
speed feedback for things that depend on real DOM layout, real events, or
markdown-to-jsx output — the cases where jsdom is not faithful enough but a
full Playwright e2e is overkill.

- File naming: co-locate next to the component as `<Name>.browser.test.tsx`
  (the existing example is
  `src/features/Reader/components/Paragraph/ReaderParagraph.browser.test.tsx`).
- Use these tests to lock down render-layer invariants (data attributes,
  DOM structure, click → emitted payload) that are easy to regress and slow to
  catch via Playwright.
- Keep them deterministic and isolated: render the component directly, do not
  spin up the app router, do not import e2e helpers.
- A passing browser test is NOT a substitute for an e2e regression test when
  the bug only reproduces against real markdown/EPUB input — add coverage at
  the layer where the bug actually lives.

## Quiz

News-linked quizzes in `src/features/Quiz/`:

- Entry: **Take quiz** in `NewsModal`
- URL: `quizId` via `useQuizModal`; Firestore: `users/{userId}/quizzes/{quizId}`
- Generation: AI for MC/reading sections; OpenAI vision via `POST /api/quiz/describeImage` for the single speaking question
- Full architecture: `src/features/Quiz/AGENTS.md`

## Daily Tasks

Daily and legacy user tasks live in `src/features/Tasks/`. Full architecture (plans, completion wiring, Firestore, access unlock): `src/features/Tasks/AGENTS.md`.

## Reader Highlight / Selection

When modifying `src/features/Reader/components/Paragraph/`, `useReaderHighlightPopover`, or related e2e helpers under `e2e/libs/books/`:

- `paragraphTokenMap.ts` is the single source of truth for token offsets; invariants are enforced by `e2e/reader/tokenMap.spec.ts` and `e2e/reader/debugBridge.spec.ts`.
- All selection capture/restore flows through `selectionPipeline.ts` + `selectionRestoreObserver.ts` (MutationObserver-based). Do not add ad-hoc setTimeout-based restore calls.
- Debug surface: `window.__reader__` exposes `dumpParagraphTokenMap`, `dumpAllParagraphs`, `getCurrentSelection`, `assertInvariants` (read-only DOM scrape, safe in any environment).
- No heuristic word matching: `resolveSourceWordMeta` / `getSafeWordMeta` were removed; use `getCoreWordSelectionMeta` instead.

## Additional References

- `../README.md`
- `FIREBASE_EMULATOR_SETUP.md`
- `src/features/Reader/AGENTS.md` — Reader-specific coding rules, e2e helper structure, and targeted test commands
