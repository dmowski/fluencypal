# Web Project Guidelines

This file applies to work under `web/` and overrides root defaults when there is a conflict.

## Fast Validation

Run the smallest relevant checks before finishing:

- Always after TypeScript changes: `pnpm lint`
- For unit-level logic/components: `pnpm test:unit`
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

## Environment Gotchas

- Firebase emulator setup and required ports are documented in `FIREBASE_EMULATOR_SETUP.md`.
- Emulator usage requires Java 11+.
- Production Sentry upload paths require Sentry env vars; do not treat missing vars as code regressions in local-only tasks.

## E2E Test Structure

All reader e2e tests live under `e2e/reader/`:

| File                     | What it covers                                                 |
| ------------------------ | -------------------------------------------------------------- |
| `import.spec.ts`         | EPUB import via picker, drag-and-drop, validation errors       |
| `library.spec.ts`        | Gutenberg live library browse and download                     |
| `epubToMarkdown.spec.ts` | EPUB → markdown snapshot tests (slow, 4 books)                 |
| `rendering.spec.ts`      | Tab title, paragraph indent, markdown/italic/heading rendering |
| `resize.spec.ts`         | Resize anchor + temporary highlight                            |
| `chapters.spec.ts`       | Chapter list uniqueness, chapter jump navigation               |
| `selection.spec.ts`      | Text selection, partial selection, Ctrl+A                      |
| `highlights.spec.ts`     | Yellow highlight apply, hover-key highlight, highlight list    |
| `voice.spec.ts`          | Voice preview, word click speech, selection speech             |
| `translation.spec.ts`    | Translate-on-hover tooltip and popover                         |
| `tokenMap.spec.ts`       | data-char-offset uniqueness/monotonicity invariants            |
| `debugBridge.spec.ts`    | window.**reader** API smoke test                               |

Shared helpers live in `e2e/books.helpers.ts` (barrel) and `e2e/libs/books/`.

## Reader Highlight / Selection

When modifying `src/features/Reader/components/Paragraph/`, `useReaderHighlightPopover`, or related e2e helpers under `e2e/libs/books/`:

- `paragraphTokenMap.ts` is the single source of truth for token offsets; invariants are enforced by `e2e/reader/tokenMap.spec.ts` and `e2e/reader/debugBridge.spec.ts`.
- All selection capture/restore flows through `selectionPipeline.ts` + `selectionRestoreObserver.ts` (MutationObserver-based). Do not add ad-hoc setTimeout-based restore calls.
- Debug surface: `window.__reader__` exposes `dumpParagraphTokenMap`, `dumpAllParagraphs`, `getCurrentSelection`, `assertInvariants` (read-only DOM scrape, safe in any environment).
- No heuristic word matching: `resolveSourceWordMeta` / `getSafeWordMeta` were removed; use `getCoreWordSelectionMeta` instead.

## Additional References

- `../README.md`
- `FIREBASE_EMULATOR_SETUP.md`
