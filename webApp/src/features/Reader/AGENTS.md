# Reader Feature Guide

This file applies to `webApp/src/features/Reader/**`.

## Structure

- `ReaderPage.tsx`: feature entry used by app routes; wires providers and selects list vs reader view.
- `components/`: UI and interactive view components.
- `components/Paragraph/libs/`: paragraph-specific, granular utility modules (offset mapping, selection reconciliation, DOM range restore, translation eligibility).
- `hooks/`: feature state and browser integrations.
- `utils/`: shared feature-level helpers (pagination and IndexedDB).
- `model/`: feature types and local sample data.

## Key Files

- `components/Reader.tsx`: main reading UI, paging, and paragraph rendering.
- `components/Paragraph/ReaderParagraph.tsx`: text selection, hover translation, and highlight interactions.
- `components/Paragraph/libs/selectionOffsetReconciliation.ts`: reconciles DOM offsets with selected text and duplicate substring anchors.
- `components/Paragraph/libs/absoluteCharOffsetFromDomPoint.ts`: resolves range endpoints to absolute paragraph offsets.
- `components/Paragraph/libs/selectionDomRestore.ts`: reapplies native browser selection after rerenders.
- `components/ReaderSpeechSettingsButton.tsx`: speech + reader visual settings panel.
- `hooks/useBooks.tsx`: books source of truth, persistence sync, and highlight mutations.
- `hooks/useReaderSettings.ts`: persisted reader/speech preferences.
- `hooks/useBrowserSpeech.ts`: browser speech synthesis integration.
- `utils/booksIndexedDb.ts`: IndexedDB storage layer for books.

## Import Rules

- Keep feature-local imports grouped by role:
  - UI imports from `components/*`
  - paragraph-local pure logic from `components/Paragraph/libs/*`
  - state from `hooks/*`
  - shared feature utilities from `utils/*`
  - shared types from `model/types`
- Keep route-facing import stable through `ReaderPage.tsx`.

## Paragraph Lib Naming

- Avoid generic `*helpers` names for paragraph logic.
- Use explicit, single-purpose module names (examples: `selectionOffsetReconciliation`, `pointerPositionFromMouseEvent`, `readerTextTranslationEligibility`).
- Keep each module focused on one concept and make exported names match behavior precisely.

## Validation

After changing files in this feature:

1. Run `cd webApp && pnpm lint`.
2. Run targeted unit tests when changing parsing or text/selection logic.
3. For Reader and book flow behavior changes, always run the targeted e2e specs at `webApp/e2e/books.spec.ts` and `webApp/e2e/booksImages.spec.ts` before finishing.
4. Avoid running full e2e unless navigation or route behavior changed.

## E2E Coverage

- Primary Reader regression coverage lives in `webApp/e2e/books.spec.ts`.
- Image import and EPUB image rendering setup coverage lives in `webApp/e2e/booksImages.spec.ts`.
- Prefer running these specs first for changes in book list, EPUB import/parsing, opening/reading books, pagination, or settings interactions.

## Reader Rendering Mode

- For Reader behavior changes (hover translate, spacing, highlights, popovers), validate `webApp/e2e/books.spec.ts`
