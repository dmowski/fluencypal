# Reader Feature Guide

This file applies to `webApp/src/features/Reader/**`.

## Structure

- `ReaderPage.tsx`: route-facing entry for Reader feature; switches list vs reader flow.
- `components/`: Reader UI and interaction surface.
- `components/Paragraph/`: markdown paragraph rendering and selection/highlight interactions.
- `components/Paragraph/libs/`: paragraph-specific pure utilities (offset mapping, DOM restore, pointer and popover math).
- `hooks/`: stateful feature orchestration (books, imports, settings, highlights, shortcuts).
- `utils/`: shared Reader helpers (EPUB conversion pipeline, pagination, image sizing, progress math, IndexedDB).
- `api/`: Reader-focused request clients.
- `server/`: Reader server-side data integrations.
- `model/`: Reader types and local sample/test data.

## Key Files

- `components/Reader.tsx`: main reading UI and pagination render loop.
- `components/Paragraph/ReaderMarkdown.tsx`: markdown-to-word rendering, internal chapter links, image handling.
- `components/Paragraph/ReaderParagraph.tsx`: text selection, hover translation, and highlight interactions.
- `components/Paragraph/libs/selectionOffsetReconciliation.ts`: reconciles browser selection offsets against source text.
- `components/Paragraph/libs/absoluteCharOffsetFromDomPoint.ts`: maps DOM points to paragraph absolute offsets.
- `components/Paragraph/libs/selectionDomRestore.ts`: restores native selection after rerenders.
- `hooks/useDroppedEpubImport.ts`: drop/import orchestration and progress state.
- `hooks/useBooks.tsx`: Reader books source of truth, persistence sync, and highlight mutation API.
- `hooks/useReaderSettings.ts`: persisted Reader/speech settings.
- `utils/epubImport.ts`: EPUB to markdown/plain text conversion and chapter/image extraction.
- `utils/splitParagraphsIntoPages.tsx`: markdown/text to Reader paragraph/page segmentation.
- `utils/booksIndexedDb.ts`: IndexedDB persistence layer.

## Import And Boundary Rules

- Keep feature-local imports grouped by role:
  - UI from `components/*`
  - paragraph-local pure logic from `components/Paragraph/libs/*`
  - state orchestration from `hooks/*`
  - shared Reader utilities from `utils/*`
  - shared Reader types from `model/types`
- Keep route-facing integration stable through `ReaderPage.tsx`.
- Do not import from app-route code into Reader internals; keep Reader self-contained under `src/features/Reader`.

## Paragraph Lib Naming

- Avoid generic `*helpers` module names for paragraph logic.
- Prefer explicit, single-purpose names such as `selectionOffsetReconciliation`, `pointerPositionFromMouseEvent`, and `readerTextTranslationEligibility`.
- Keep each module focused on one concept and align export names with behavior.

## Behavioral Guardrails

- Preserve selection stability and offset correctness when changing paragraph tokenization or DOM wrappers.
- Treat EPUB conversion and paragraph splitting as one pipeline; validate both when touching either side.
- Reader visual/speech settings are local preferences (`useReaderSettings` + localStorage). If you add share/export behavior, include book content and highlights, but exclude local Reader settings payload.

## Validation

After changing files in this feature, run the smallest relevant checks first:

1. `cd webApp && pnpm lint`
2. `cd webApp && pnpm test:unit` when changing Reader parsing, pagination, highlight logic, or selection math.
3. For Reader/book behavior changes, run targeted e2e early while iterating — all specs live under `e2e/reader/`:
   - Selection/highlight behavior: `pnpm test:e2e -- e2e/reader/selection.spec.ts e2e/reader/highlights.spec.ts`
   - Speech/voice: `pnpm test:e2e -- e2e/reader/voice.spec.ts`
   - Translation: `pnpm test:e2e -- e2e/reader/translation.spec.ts`
   - Rendering/pagination: `pnpm test:e2e -- e2e/reader/rendering.spec.ts e2e/reader/resize.spec.ts`
   - EPUB import: `pnpm test:e2e -- e2e/reader/import.spec.ts`
   - EPUB → markdown regression: `pnpm test:e2e -- e2e/reader/epubToMarkdown.spec.ts`
   - Gutenberg library: `pnpm test:e2e -- e2e/reader/library.spec.ts`
   - Chapter navigation: `pnpm test:e2e -- e2e/reader/chapters.spec.ts`
   - Token map invariants: `pnpm test:e2e -- e2e/reader/tokenMap.spec.ts`
   - Debug bridge: `pnpm test:e2e -- e2e/reader/debugBridge.spec.ts`

4. Before finishing any Reader change, always run the full e2e suite:

   `cd webApp && pnpm test:e2e`

## E2E Helper Structure

All e2e helpers for the Reader are under `e2e/libs/books/` and re-exported via `e2e/libs/reader.ts`. Import from `../libs/reader` in spec files.

| Module                   | Responsibility                                        |
| ------------------------ | ----------------------------------------------------- |
| `shared.ts`              | Constants (`BOOK_TITLE`, `BOOK_SUBTITLE`) and types   |
| `navigation.ts`          | Open/navigate book page helpers                       |
| `locators.ts`            | Element locators (criticizing word, popover, buttons) |
| `uiSettings.ts`          | Settings popover open/close and toggle controls       |
| `speech.ts`              | Speech synthesis mock, voice spoken assertions        |
| `interactions.ts`        | Word click/hover/select/highlight interactions        |
| `selectionAssertions.ts` | Selection text, persistence, cursor assertions        |
| `highlightAssertions.ts` | Highlight popover and yellow-highlight assertions     |
| `renderingAssertions.ts` | Pagination fit and text rendering assertions          |
| `translation.ts`         | Translation mock and translated text assertion        |
| `imports.ts`             | EPUB import helpers (file picker, drag-and-drop)      |
