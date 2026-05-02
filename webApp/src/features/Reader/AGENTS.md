# Reader Feature Guide

This file applies to `webApp/src/features/Reader/**`.

## Structure

- `ReaderPage.tsx`: feature entry used by app routes; wires providers and selects list vs reader view.
- `components/`: UI and interactive view components.
- `hooks/`: feature state and browser integrations.
- `utils/`: pure helpers for pagination, selection/highlights, translation guards, and IndexedDB.
- `model/`: feature types and local sample data.

## Key Files

- `components/Reader.tsx`: main reading UI, paging, and paragraph rendering.
- `components/ReaderParagraph.tsx`: text selection, hover translation, and highlight interactions.
- `components/ReaderSpeechSettingsButton.tsx`: speech + reader visual settings panel.
- `hooks/useBooks.tsx`: books source of truth, persistence sync, and highlight mutations.
- `hooks/useReaderSettings.ts`: persisted reader/speech preferences.
- `hooks/useBrowserSpeech.ts`: browser speech synthesis integration.
- `utils/booksIndexedDb.ts`: IndexedDB storage layer for books.

## Import Rules

- Keep feature-local imports grouped by role:
  - UI imports from `components/*`
  - state from `hooks/*`
  - pure logic from `utils/*`
  - shared types from `model/types`
- Keep route-facing import stable through `ReaderPage.tsx`.

## Validation

After changing files in this feature:

1. Run `cd webApp && pnpm lint`.
2. Run targeted unit tests when changing parsing or text/selection logic.
3. For Reader and book flow behavior changes, run the targeted e2e spec at `webApp/e2e/books.spec.ts`.
4. Avoid running full e2e unless navigation or route behavior changed.

## E2E Coverage

- Primary Reader regression coverage lives in `webApp/e2e/books.spec.ts`.
- Prefer running that spec first for changes in book list, opening/reading books, pagination, or settings interactions.
