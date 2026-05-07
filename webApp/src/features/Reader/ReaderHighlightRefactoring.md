# Reader Highlight & Selection Refactoring Plan

> Scope: `webApp/src/features/Reader/` — paragraph rendering (`components/Paragraph/`),
> selection/hover/highlight pipeline, popover hook, e2e support.
>
> Goal: Eliminate the recurring class of bugs caused by the current heuristic mapping
> between the markdown-rendered DOM and the source `paragraphText`. Make the system
> deterministic, debuggable, and testable in isolation so future changes do not
> regress.

---

## 1. Why this refactor

Recent bugs all share the same root cause:

| Symptom (recent fixes)                                                                     | Underlying defect                                                                                                                                                          |
| ------------------------------------------------------------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Spaces between highlighted words were transparent in markdown mode                         | `renderSpace` was undefined for `MarkdownTool` branch; two render paths drift apart                                                                                        |
| Hover + Y painted trailing space / next word                                               | `endIndex` was passed as exclusive where the highlight model is inclusive; multiple call sites have to remember the convention                                             |
| Click-selecting `remember` ended up selecting `, "just remember`                           | In markdown mode, the rendered `wordIndex` (from `markdown-to-jsx` traversal) drifts from the source `words[]` index. `getSafeWordMeta(wordIndex)` returned the wrong word |
| `renderSpace` signature change broke `renderWordsDirectly` branch (TS error after passing) | Two parallel renderers (`processStringChild` vs `renderWordsDirectly`) duplicate the contract                                                                              |
| Italic `me` rendered as the wrong source word                                              | Heuristic `resolveSourceWordMeta` had `'remember'.includes('me')` true and ranked substring matches equal to exact matches                                                 |
| Tests pass alone but flake in suite                                                        | Selection restore uses `requestAnimationFrame + setTimeout(60) + setTimeout(180)` chains that race with React re-renders triggered by popover open                         |

### Architectural problems

1. **No single source of truth for the `rendered token → source character range`
   mapping.** `ReaderMarkdown` walks markdown-to-jsx children and assigns sequential
   `wordIndex` values. `ReaderParagraph` then *guesses* the matching source word
   via `resolveSourceWordMeta` heuristics. Every guess is a future bug.
2. **`data-char-offset` is not guaranteed unique or monotonic.** When the heuristic
   maps two distinct rendered tokens to the same source range, multiple DOM nodes
   carry identical `data-char-offset` values. `applyNativeSelectionByOffsets`
   uses `querySelector` (first match), silently selecting the wrong span.
3. **Two render paths**: `processStringChild` (markdown) and `renderWordsDirectly`
   (plain). Whenever the contract changes (e.g. `renderSpace` signature) one path
   gets missed.
4. **Selection restoration is timer-based and idempotent only by accident.** Three
   restore strategies (`ByOffsets`, `ByText`, `ForWordElement`) are chained with
   delayed retries. Hard to reason about and inherently flaky.
5. **Reconciliation is sprinkled across call sites.** `reconcileSelectionOffsets`
   is called in `handleMouseUp`, `handleWordClick`, `onMouseEnter`, and
   `useReaderHighlightPopover.handleActiveColorSelect`, each with subtly
   different inputs.
6. **No structured debug surface.** Reproducing a bug requires browser dev tools
   plus console.log additions. There is no way for a Playwright test to assert
   "the rendered token map for paragraph 1 is correct" without scraping the DOM.
7. **Inclusive vs exclusive endpoint conventions are implicit.** `HighlightedText`
   uses inclusive `endIndex`; native `Range` uses exclusive `endOffset`; many
   helpers translate ad‑hoc.

---

## 2. Target architecture

### 2.1 Core invariants (declared in code)

These will become exported types + runtime assertions (dev/test only):

- `HighlightedText.endIndex` is **inclusive**.
- `RawSelectionRange.endExclusive` is **exclusive** (matches `Range.endOffset`).
- `data-char-offset` values **within a paragraph** are **unique** and
  **monotonically increasing** in DOM order.
- For every char in `paragraphText = words.join(' ')`, exactly one DOM node has
  `data-char-offset === absoluteOffset` (no gaps, no duplicates).

### 2.2 New module layout

```
webApp/src/features/Reader/components/Paragraph/
  ReaderParagraph.tsx                // thin shell; wires hooks/components
  ReaderMarkdown.tsx                 // pure markdown→token rendering
  libs/
    paragraphTokenMap.ts             // NEW: pure builder of RenderedToken[]
    paragraphTokenMap.test.ts        // NEW: exhaustive unit tests
    renderTokenSpan.tsx              // NEW: shared word/space/punct span
    selectionPipeline.ts             // NEW: single API for raw → reconciled selection
    selectionPipeline.test.ts
    selectionDomRestore.ts           // simplified; one strategy + one fallback
    invariants.ts                    // NEW: dev assertions + data-debug attrs
    debugLogger.ts                   // NEW: gated logger
    (existing files trimmed)
```

### 2.3 The token map — single source of truth

A pure function:

```ts
// paragraphTokenMap.ts
export type RenderedToken =
  | { kind: 'word';  text: string; sourceStart: number; sourceEndExclusive: number; wordIndex: number }
  | { kind: 'space'; sourceStart: number;  sourceEndExclusive: number }
  | { kind: 'decorator'; markdownChars: string; sourceStart: number; sourceEndExclusive: number }
  | { kind: 'image' | 'link'; raw: string; sourceStart: number; sourceEndExclusive: number };

export interface ParagraphTokenMap {
  paragraphText: string;             // = words.join(' ')
  words: string[];
  tokens: RenderedToken[];           // in render order
  // Fast lookup helpers:
  tokenAtSourceOffset: (offset: number) => RenderedToken | null;
  sourceRangeForRenderedSlice: (renderedStart: number, renderedEnd: number) =>
    { sourceStart: number; sourceEndExclusive: number } | null;
}

export const buildParagraphTokenMap = (words: string[]): ParagraphTokenMap => { ... };
```

Key idea: build the token list **by parsing the same markdown source we render**,
keeping a *consuming cursor* over `paragraphText`. Each rendered token carries the
exact `sourceStart`/`sourceEndExclusive` it covers. No heuristic matching at
render time.

### 2.4 Rendering becomes a flat map

`ReaderMarkdown` (or a successor) walks the markdown AST once and emits
`RenderedToken[]`. `ReaderParagraph` maps each token to a span via a single
`renderTokenSpan` component that:

- Reads `sourceStart`/`sourceEndExclusive` directly off the token.
- Renders one `data-char-offset={sourceStart + i}` span per character.
- Looks up highlight color per char via `getCharColorAtOffset(sourceStart + i + paragraphStartCharOffset)`.

Spaces are rendered as a `kind: 'space'` token with its own char span carrying
`data-char-offset = (previous word).sourceEndExclusive`. The current dual
`renderSpace` contract disappears.

### 2.5 Single selection pipeline

```ts
// selectionPipeline.ts
export interface RawSelectionRange { startInclusive: number; endExclusive: number; text: string }

export const captureCurrentSelection = (paragraphElement: HTMLElement, tokenMap: ParagraphTokenMap): RawSelectionRange | null;
export const applySelection      = (paragraphElement: HTMLElement, range: RawSelectionRange): boolean;
export const reconcileSelection  = (range: RawSelectionRange, tokenMap: ParagraphTokenMap): RawSelectionRange | null;
```

All call sites (`handleMouseUp`, `handleWordClick`, `onMouseEnter`,
`useReaderHighlightPopover.handleActiveColorSelect`) call the same three
functions. Reconciliation logic lives in **one** place.

### 2.6 Robust selection restore (no timer chains)

Replace `requestAnimationFrame + setTimeout(60) + setTimeout(180)` with:

1. Apply selection synchronously after popover open.
2. Open a `MutationObserver` on the paragraph subtree, scoped to `data-reader-mutation-watch="true"`, that re-applies the selection if the
   captured spans were re-mounted. Disconnect after one re-application or after
   the popover closes.

This removes the time-based race that caused suite-only flakes.

### 2.7 Inclusive/exclusive helpers

Two tiny converters live in one file and are the only place the conversion
happens:

```ts
export const toInclusiveEnd = (endExclusive: number) => endExclusive - 1;
export const toExclusiveEnd = (endInclusive: number) => endInclusive + 1;
```

Highlight model APIs accept/return only `HighlightedText` (inclusive).
Selection APIs accept/return only `RawSelectionRange` (exclusive). The boundary
between them is a single helper.

---

## 3. Debug & observability

### 3.1 Data attributes (always on)

| Attribute                                       | Where                       | Purpose                                                                                  |
| ----------------------------------------------- | --------------------------- | ---------------------------------------------------------------------------------------- |
| `data-reader-token-kind`                        | every token span            | Quick filtering: `[data-reader-token-kind="space"]`                                      |
| `data-reader-token-source-start`                | every token span            | Source offset of token start                                                             |
| `data-reader-token-source-end-exclusive`        | every token span            | Source offset of token end                                                               |
| `data-reader-word-source-index`                 | word spans only             | The verified source `words[]` index this token covers                                    |
| `data-reader-paragraph-token-count`             | paragraph root              | Token count for sanity assertions                                                        |
| `data-reader-paragraph-source-text-length`      | paragraph root              | `paragraphText.length` for invariant checks                                              |

### 3.2 Dev/test invariants

`libs/invariants.ts` exposes `assertParagraphInvariants(rootEl)` that, when
`process.env.NODE_ENV !== 'production'` *or* `localStorage.getItem('readerDebug') === '1'`:

- Walks all `[data-char-offset]` and asserts uniqueness + monotonic order.
- Asserts the rendered text length equals
  `data-reader-paragraph-source-text-length`.
- Marks any violating span with `data-reader-invariant-violation="<reason>"`.
- Logs a structured object via `debugLogger`.

### 3.3 Gated structured logger

```ts
// debugLogger.ts
export const readerDebug = (event: string, payload: object) => {
  if (typeof window === 'undefined') return;
  if (window.localStorage?.getItem('readerDebug') !== '1') return;
  // Centralized format so log lines are greppable in Playwright.
  console.info(`[reader] ${event}`, payload);
};
```

Used at four key points:

1. `buildParagraphTokenMap` → emits `paragraphTokenMap.built` once per paragraph.
2. `captureCurrentSelection` → `selection.captured`.
3. `reconcileSelection` → `selection.reconciled` (with `before`, `after`).
4. `applySelection` → `selection.applied` (with strategy used).

### 3.4 E2E hooks

- A test-only function attached to `window.__reader__` (gated by `NEXT_PUBLIC_E2E === '1'`):
  - `__reader__.dumpParagraphTokenMap(paragraphIndex)`
  - `__reader__.getCurrentSelection()`
  - `__reader__.assertInvariants()`

E2E tests can call these via `page.evaluate` instead of scraping DOM with
heuristic regexes (which is what `assertOnlyWordHighlightedYellow` does today).

---

## 4. Migration phases

Each phase is independently shippable, behind no flag unless noted. After every
phase: `cd webApp && pnpm lint && pnpm test:unit && pnpm test:e2e`.

### Phase 0 — Lock down current behavior (no production code changes)

Goal: protect against regressions while we refactor.

- Add unit tests for `selectionOffsetReconciliation` covering current edge cases.
- Add unit tests asserting `data-char-offset` uniqueness on a small set of
  synthesized paragraphs (rendered through `ReaderParagraph` in JSDOM).
- Add a Playwright test `reader-token-map-invariants.spec.ts` that opens the
  seeded book and verifies `[data-char-offset]` uniqueness/monotonicity on
  every visible paragraph.

Exit criteria: full e2e green twice in a row.

### Phase 1 — Introduce the token map (read-only)

- Implement `paragraphTokenMap.ts` + tests. The builder must handle:
  plain text, `**bold**`, `_italic_`, `[link](href)`, `![alt](src)`, smart
  quotes, em-dashes, leading/trailing punctuation, multiple spaces, and the
  Gatsby paragraph used in e2e.
- Export from `ReaderParagraph` only as a memoized `useMemo` value; do **not**
  change render output yet.
- Add the `data-reader-paragraph-token-count` and
  `data-reader-paragraph-source-text-length` attributes to the paragraph root.
- Add `assertParagraphInvariants` and call it in dev/test render.

Exit criteria: invariants pass for every paragraph in the seeded book + every
e2e fixture.

### Phase 2 — Switch char span rendering to use the token map

- Replace `resolveSourceWordMeta` calls inside `renderWord`/`renderSpace` with
  direct token lookups (`tokenMap.tokens[i]`).
- Remove the heuristic `resolveSourceWordMeta` and its
  punctuation-fallback branch.
- Collapse `processStringChild` and `renderWordsDirectly` into one renderer
  that consumes `RenderedToken[]`.
- Add the new `data-reader-token-*` debug attributes.

Exit criteria:
- `pnpm lint` clean, all unit tests green.
- All current e2e green.
- No `data-char-offset` collisions (asserted by Phase-0 spec).

### Phase 3 — Single selection pipeline

- Move `reconcileSelectionOffsets` callers behind
  `selectionPipeline.reconcileSelection`.
- Centralize popover-apply reconciliation (`useReaderHighlightPopover`) through
  the same function; remove the special "single-word clamp" branch.
- Reduce `handleMouseUp` / `handleWordClick` / `onMouseEnter` to:
  ```ts
  const raw = captureCurrentSelection(...);
  const range = reconcileSelection(raw, tokenMap);
  applySelection(paragraphEl, range);
  onSelection(rangeToHighlight(range, paragraphStartCharOffset));
  ```

Exit criteria: code paths in `ReaderParagraph` for selection are <200 lines
total; cyclomatic complexity drops; all tests green.

### Phase 4 — MutationObserver-based restore

- Delete the `setTimeout(60)` + `setTimeout(180)` chain.
- Implement single-shot MutationObserver re-apply.
- Add unit tests under JSDOM that exercise: popover mounts → DOM mutates →
  selection re-applied.

Exit criteria: full e2e suite green twice consecutively (current flake target).

### Phase 5 — E2E refactor

- Rewrite `assertOnlyWordHighlightedYellow`,
  `assertPhraseHighlightedYellowWithSpaces`, and the selection helpers to use
  `__reader__` test hooks where it removes brittle DOM scraping.
- Keep at least one DOM-level assertion per scenario as a smoke check.

Exit criteria: e2e flake disappears under N=5 reruns of full suite.

### Phase 6 — Cleanup

- Remove dead code: `wordIndexSafeMeta.ts` (replaced by token map),
  `resolveSourceWordMeta`, `getCoreWordSelectionMeta` (move logic into the
  token-map builder), single-word clamp in popover.
- Update `webApp/AGENTS.md` to point to this doc as the source of truth for
  Reader selection/highlight rules.
- Delete `/memories/repo/reader-highlight-stability.md` notes that are now
  enforced by code/tests; keep only the ones still relevant.

---

## 5. Risk register

| Risk                                                                                 | Mitigation                                                                                            |
| ------------------------------------------------------------------------------------ | ----------------------------------------------------------------------------------------------------- |
| `markdown-to-jsx` AST changes between versions                                       | Build the token map from the **markdown string** + a dedicated mini-parser, not from the JSX output   |
| EPUB-imported markdown contains exotic constructs (tables, code, nested emphasis)    | Phase 1 unit fixtures must include real EPUB-derived paragraphs from `webApp/e2e/fixtures`            |
| MutationObserver fires too aggressively on popover                                   | Scope observer to `paragraphRef.current`, ignore attribute mutations, debounce within one rAF         |
| Token map memo invalidates on every render                                           | Key on `(paragraphText, paragraphIndex)`; freeze tokens; never mutate                                 |
| Phase-2 char-offset format change breaks saved highlights                            | Highlight storage already uses `paragraphStartCharOffset + sourceOffset`; format unchanged            |
| Bigger PRs → review pain                                                             | Each phase ships separately with green e2e                                                            |

---

## 6. Acceptance criteria for the whole refactor

1. **Determinism**: For any markdown paragraph, the rendered DOM has unique &
   monotonic `data-char-offset` values; verified by an always-on e2e invariant
   test.
2. **No heuristic word matching at render time.** A grep for
   `includes(normalizedRendered)` / `getSafeWordMeta` returns nothing under
   `webApp/src/features/Reader/`.
3. **Single restore path.** No `setTimeout` calls inside `ReaderParagraph` or
   selection libs.
4. **Single reconciliation call site abstraction.** `reconcileSelectionOffsets`
   is called from exactly one wrapper (`selectionPipeline.reconcileSelection`).
5. **Debugability**: Setting `localStorage.readerDebug = '1'` produces a clear
   structured trace of every selection event; `__reader__.dumpParagraphTokenMap`
   is callable from devtools and from Playwright.
6. **Stability**: Full `pnpm test:e2e` passes 5 consecutive runs with no
   flakes (current baseline: 1 in ~3 runs flakes on the
   `partial selection does not collapse for whenever/feel phrase` test).

---

## 7. Out of scope

- Pagination logic (`splitParagraphsIntoPages.tsx`) — only consume its output.
- Translation pipeline (`useReaderHighlightPopover` translation lifecycle).
- Mobile resize behavior (`useReaderSettings`) — already addressed.
- Changing the on-disk highlight storage format.

---

## 8. References

- `webApp/src/features/Reader/components/Paragraph/ReaderParagraph.tsx`
- `webApp/src/features/Reader/components/Paragraph/ReaderMarkdown.tsx`
- `webApp/src/features/Reader/components/Paragraph/libs/selectionOffsetReconciliation.ts`
- `webApp/src/features/Reader/components/Paragraph/libs/selectionDomRestore.ts`
- `webApp/src/features/Reader/components/Paragraph/libs/wordIndexSafeMeta.ts`
- `webApp/src/features/Reader/hooks/useReaderHighlightPopover.ts`
- `webApp/e2e/books.spec.ts`
- `webApp/e2e/libs/books/assertions.ts`
- `webApp/e2e/libs/books/interactions.ts`
- `/memories/repo/reader-highlight-stability.md`
