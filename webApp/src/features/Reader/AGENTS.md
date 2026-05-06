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
3. For Reader/book behavior changes, run targeted e2e early while iterating:
   - `cd webApp && pnpm test:e2e e2e/books.spec.ts`

- `cd webApp && pnpm test:e2e e2e/booksEpubToMarkdown.spec.ts` for EPUB import to markdown stability checks
- `cd webApp && pnpm test:e2e e2e/booksImages.spec.ts`
- `cd webApp && pnpm test:e2e e2e/booksLibrary.spec.ts` when library/list/import behavior changes

4. Before finishing any Reader change, always run the full e2e suite:

- `cd webApp && pnpm test:e2e`
