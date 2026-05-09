# Reader Sync — Implementation Plan

> Multi-step plan for synchronizing the Reader's user data (books + highlights + reading position) across devices for authenticated users.
>
> Current state: books live in IndexedDB only ([webApp/src/features/Reader/utils/booksIndexedDb.ts](webApp/src/features/Reader/utils/booksIndexedDb.ts)) and the books context is local-first ([webApp/src/features/Reader/hooks/useBooks.tsx](webApp/src/features/Reader/hooks/useBooks.tsx)). No remote sync exists.

---

## 1. Scope And Non-Goals

In scope:

- Sync per-user **book metadata** (title, subtitle, author, chapters).
- Sync **highlights**.
- Sync **reading position** (the hardest part — covered first below).
- Store the heavy/static parts (paragraphs + originalFile bytes) in **Firebase Storage**, not Firestore.

Out of scope (explicitly):

- `ReaderSettings` sync — kept device-local (font size, columns, voice URI vary per device).
- Cross-user sharing of books.
- Real-time presence/cursor.
- Conflict resolution UI (we use last-writer-wins per-field by `updatedAtIso`, plus content-anchored progress).

---

## 2. The Hardest Problem First — Reading Progress Across Devices

### 2.1 Why `activePageIndex` Cannot Be The Source Of Truth

`activePageIndex` is a function of:

- `readerSettings.fontSize`, `lineHeight`, `paragraphGap`, `columns`, `columnGap`
- `contentWidth` / `contentHeight` (viewport-bound)
- `imageAspectRatioByHref` (which can differ until images load)
- the pagination algorithm in [webApp/src/features/Reader/utils/splitParagraphsIntoPages.tsx](webApp/src/features/Reader/utils/splitParagraphsIntoPages.tsx)

Page 42 on desktop ≠ page 42 on mobile. We must persist a **content-anchored** progress and re-derive the page locally on each device. The codebase already has the right primitive for this: `ReaderResizeWordAnchor` + [webApp/src/features/Reader/utils/readerPageAnchor.ts](webApp/src/features/Reader/utils/readerPageAnchor.ts) (`findTargetPageForWordAnchor`). We extend that pattern from "resize-only" to "cross-device".

### 2.2 Data Model Change — `readingPosition`

Replace ad-hoc `activePageIndex` sync with a content anchor stored on `Book`:

```ts
// webApp/src/features/Reader/model/types.ts
export interface ReadingPosition {
  paragraphIndex: number; // 0-based index into Book.paragraphs
  wordStartCharOffset: number; // char offset of first visible word inside that paragraph
  wordKey: string; // disambiguator copy of the word text (used for verification)
  // Diagnostic only, not authoritative:
  lastKnownPageIndex?: number;
  lastKnownColumns?: 1 | 2;
}

export interface Book {
  // ...
  readingPosition?: ReadingPosition;
  readingPositionUpdatedAtIso?: string;

  // Keep activePageIndex purely as a *device-local* cache;
  // do NOT push it to Firestore.
  activePageIndex?: number;
}
```

Rules:

- `activePageIndex` is **derived** (and locally cached for instant restore on the same device/layout). It is NOT synced.
- `readingPosition` is the **synced** authority.
- `readingPositionUpdatedAtIso` is bumped only when the user actually navigates (next/prev/chapter/click), not on every re-pagination.

### 2.3 Capturing The Position On Every Page Change

In [webApp/src/features/Reader/components/Reader.tsx](webApp/src/features/Reader/components/Reader.tsx), `setActivePage(...)` is the single mutation entry point for navigation. Wrap it so that:

1. Compute the first visible word on the new active spread (use the existing `pages[activePage - 1].lines[0].words[0]` shape; reuse the same builder used by `ReaderResizeWordAnchor`).
2. Call `books.setReadingPosition({ paragraphIndex, wordStartCharOffset, wordKey, lastKnownPageIndex, lastKnownColumns })` which:
   - updates `Book.readingPosition`
   - sets `readingPositionUpdatedAtIso = new Date().toISOString()`
   - persists to IndexedDB
   - debounces a write to Firestore (300–800 ms) to avoid one write per arrow-key press
3. Keep updating `activePageIndex` locally (instant UX) but never push it to Firestore.

### 2.4 Restoring On A New Device

When a `Book` is loaded (from IndexedDB or from Firestore-merged-with-local) AND `paragraphs` are available locally:

1. If `readingPosition` is set, run a resolver:
   - `findTargetPageForWordAnchor({ pages, anchor: readingPosition })` (already implemented for resize).
   - If found → `setActivePage(targetPage)` without bumping `readingPositionUpdatedAtIso`.
   - If NOT found (paragraph index out of range, or `wordKey` mismatch — happens if the book was re-imported / re-paginated by EPUB pipeline changes), fall back to:
     a) Locate the closest paragraph by `paragraphIndex` clamp; jump to its first page.
     b) Surface a one-time non-blocking toast: _"Resumed near your last position"_.
2. If `paragraphs` are not yet loaded (Storage download pending), show "Restoring your place…" and resolve once paragraphs land.

### 2.5 Last-Writer-Wins For Position

When pulling a remote `readingPosition`:

- If `remote.readingPositionUpdatedAtIso > local.readingPositionUpdatedAtIso` → adopt remote and re-resolve to a local page.
- If equal/older → keep local.
- If a navigation happens _during_ a pending pull, the local change wins (its ISO is newer).

This keeps the rule simple and eliminates the activePage-mismatch problem entirely.

---

## 3. Storage Layout

### 3.1 Firestore — Light Metadata (Per User)

Path conventions follow existing pattern in [webApp/src/features/Firebase/firebaseDb.ts](webApp/src/features/Firebase/firebaseDb.ts) (`users/{uid}/...`):

```
users/{uid}/readerBooks/{bookId}        // Book metadata document (NO paragraphs, NO file)
```

Document shape (`ReaderBookDoc`):

```ts
{
  id: string;
  title: string;
  subtitle: string;
  author: string;
  chapters?: BookChapterNavigationItem[];
  imageAspectRatioByHref?: Record<string, number>;

  highlights?: HighlightedText[];
  highlightsUpdatedAtIso?: string;

  readingPosition?: ReadingPosition;
  readingPositionUpdatedAtIso?: string;

  dataUpdatedAtIso?: string;          // bumped when title/author/paragraphs change
  paragraphsBlobPath?: string;        // pointer into Storage
  originalFileBlobPath?: string;      // pointer into Storage (optional)

  schemaVersion: 1;
  createdAtIso: string;
  updatedAtIso: string;               // top-level doc updatedAt (any field)
}
```

Why per-book documents (not one big `readerBooks` doc): bounded size, partial updates, future large libraries.

Add to `db.collections` and `db.documents`:

```ts
readerBooks: (userId?: string) =>
  userId ? dataPointCollection<ReaderBookDoc>(`users/${userId}/readerBooks`) : null,

readerBook: (userId?: string, bookId?: string) =>
  userId && bookId ? dataPointDoc<ReaderBookDoc>(`users/${userId}/readerBooks/${bookId}`) : null,
```

### 3.2 Firestore Rules

Add inside the existing `match /users/{userId} { ... }` block in [webApp/firestore.rules](webApp/firestore.rules) **before** the catch-all `match /{document=**}` rule:

```
match /readerBooks/{bookId} {
  allow read, write: if isUser(userId);
}
```

(Strict schema validation can be added later, mirroring the `dailyQuestionsAnswers` pattern.)

### 3.3 Storage Layout

[webApp/storage.rules](webApp/storage.rules) is currently `deny by default`. Add a per-user namespace:

```
match /users/{userId}/reader/{bookId}/{fileName} {
  allow read, write: if request.auth != null && request.auth.uid == userId;
  // Soft size limit to avoid abuse:
  allow write: if request.resource.size < 25 * 1024 * 1024; // 25 MB
}
```

Files we upload per book:

- `users/{uid}/reader/{bookId}/paragraphs.json.gz` — gzipped JSON of `Book.paragraphs` (array of `BookParagraph`).
- `users/{uid}/reader/{bookId}/original.epub` — optional, only if the user imported a real EPUB and wants the original on the other device.
- `users/{uid}/reader/{bookId}/images/{hrefSafe}` — optional later phase; for v1 we re-extract from the EPUB on download.

Why Storage (not Firestore) for paragraphs: a long EPUB is multi-MB; single Firestore docs cap at 1 MB, and per-paragraph subcollections would explode read cost.

---

## 4. Book Lifecycle With Sync

### 4.1 On Add / Import

`useBooks.addBook(...)` flow becomes:

1. Build `Book` locally as today and save to IndexedDB (unchanged).
2. If signed in:
   - Upload `paragraphs.json.gz` to Storage; get `paragraphsBlobPath`.
   - Optionally upload `originalFile` if present and < 25 MB.
   - Set `dataUpdatedAtIso = nowIso`.
   - Write Firestore doc with everything **except** `paragraphs` and `originalFile`.
3. If offline or anonymous, queue an "upload pending" flag in IndexedDB; the sync hook drains the queue when auth + connectivity return.

### 4.2 On Mutation (highlight, position, rename)

Update IndexedDB synchronously, then debounce-write to Firestore. Each mutation bumps the relevant `*UpdatedAtIso`. Position updates use a longer debounce (e.g. 800 ms) since the user pages rapidly.

### 4.3 On Delete

Delete: IndexedDB → Firestore doc → Storage objects (best-effort; failures logged but not blocking).

### 4.4 On Sign-In (Initial Sync)

This is `useBooksSync`'s main job (see §5).

---

## 5. `useBooksSync` Hook

New file: `webApp/src/features/Reader/hooks/useBooksSync.tsx`.

Responsibilities (no `useEffect`-heavy synchronization in UI components — confine effects to this hook, which is exactly the “sync with external system” case allowed by user memory):

1. Subscribe to `users/{uid}/readerBooks` collection via `onSnapshot`.
2. On each remote snapshot, compute a per-book diff vs local IndexedDB and apply per-field merge by `*UpdatedAtIso`:

   | Field group          | Conflict rule                                                          |
   | -------------------- | ---------------------------------------------------------------------- |
   | `title/author/...`   | newer `dataUpdatedAtIso` wins                                          |
   | `highlights[]`       | newer `highlightsUpdatedAtIso` wins (whole-array replace, see §5.2)    |
   | `readingPosition`    | newer `readingPositionUpdatedAtIso` wins                               |
   | paragraphs (Storage) | download iff `paragraphsBlobPath` exists AND local has none for bookId |

3. After local mutation, push to Firestore via debounced writers (one per field group to minimize churn).
4. Expose state: `{ status: 'idle' | 'syncing' | 'error', lastSyncIso, pendingUploads }`.

Provide as React context next to `BooksProvider`:

```tsx
// ReaderPage.tsx
<AuthProvider>
  <BooksProvider>
    <BooksSyncProvider>
      {" "}
      {/* new */}
      <ReaderSettingsProvider>
        <ReaderComponent />
      </ReaderSettingsProvider>
    </BooksSyncProvider>
  </BooksProvider>
</AuthProvider>
```

`BooksSyncProvider` consumes `useBooks()` (already context-based) and `useAuth()` to drive sync. `useBooks` itself stays storage-agnostic; sync code calls its existing `updateBook`-style API rather than poking IndexedDB directly. This keeps the boundary clean per Reader/AGENTS.md.

### 5.1 Wire `useBooks` For Remote Updates

Add an internal mutator on the `useBooks` context (not exported to UI):

```ts
applyRemoteBookSnapshot(remote: ReaderBookDoc, paragraphsLoader: () => Promise<BookParagraph[]>): void
```

Used only by `useBooksSync`. UI keeps using existing `applySelectedHighlight`, `removeHighlight`, `setActivePage`, etc.

### 5.2 Highlights — Why Whole-Array Replace Is Acceptable For v1

Highlights are small and the user’s “last touch” intent is usually to add/remove one. Whole-array LWW by `highlightsUpdatedAtIso` is simple and predictable. If we later see real conflicts (two devices editing concurrently), upgrade to a **set merge** keyed on `(paragraphIndex, startIndex, endIndex, color)` with per-highlight `updatedAtIso` and tombstones.

### 5.3 Paragraphs Download — When And How

A book document arrives without `paragraphs`. The hook:

1. Inserts the book stub into `useBooks` so the list shows it as “Available”.
2. Lazily downloads paragraphs **on first open** (not eagerly) to avoid spending bandwidth on never-opened books.
3. While downloading, `BooksList` shows a small spinner; opening shows a "Loading book…" placeholder. Once paragraphs land, `applyRemoteBookSnapshot` fills them and `readingPosition` resolution runs (§2.4).

---

## 6. Step-By-Step Implementation Order

Work in this order so each step is testable in isolation:

1. **Types**
   - Add `ReadingPosition` and rename `readProgress*` → `readingPosition*` in [webApp/src/features/Reader/model/types.ts](webApp/src/features/Reader/model/types.ts). Mark `activePageIndex*` as device-local (drop the `*UpdatedAtIso` for it).

2. **Position capture**
   - In `useBooks.setActivePage`, also compute and store `readingPosition` from the live `pages` snapshot (helper exposed by `Reader.tsx` via callback, or compute lazily on the next render before persistence).
   - Unit-test the position derivation purely against `pages` fixtures.

3. **Position restore**
   - On book open, if `readingPosition` is present, resolve via `findTargetPageForWordAnchor`. Fall back to nearest-paragraph clamp.
   - Unit-test the resolver against synthetic `pages`.

4. **Firestore rules + Storage rules**
   - Add `users/{uid}/readerBooks/{bookId}` and `users/{uid}/reader/{bookId}/...` rules. Verify with the emulator (see [webApp/FIREBASE_EMULATOR_SETUP.md](webApp/FIREBASE_EMULATOR_SETUP.md)).

5. **`firebaseDb.ts`**
   - Add `readerBooks` collection and `readerBook` document accessors plus `ReaderBookDoc` type alias.

6. **Storage helpers**
   - New module `webApp/src/features/Reader/server/readerStorage.ts` with `uploadParagraphsBlob`, `downloadParagraphsBlob`, `deleteBookBlobs`. Gzip via `CompressionStream` (browser-native).

7. **`useBooksSync` hook + provider**
   - Subscribe / merge / debounced writers. Wire into `ReaderPage.tsx`.

8. **Initial-sync UX**
   - Spinner on `BooksList` while first snapshot loads (only when signed in and IndexedDB has no books). Avoid UI flicker for returning local users.

9. **Cleanup**
   - Background delete of orphaned blobs (best-effort) on `deleteBook`.

10. **Telemetry**
    - Sentry breadcrumbs for: rules denial, storage 4xx/5xx, position resolution fallback, paragraph download size.

---

## 7. Test Strategy

### 7.1 Unit Tests (Jest)

| File                                      | What to cover                                                               |
| ----------------------------------------- | --------------------------------------------------------------------------- |
| `model/readingPosition.test.ts` (new)     | derive position from `pages`; round-trip through resolver                   |
| `utils/readerPageAnchor.test.ts` (extend) | mismatched `wordKey`, paragraph-out-of-range, two-column normalization      |
| `hooks/useBooksSync.merge.test.ts` (new)  | LWW per field group; remote-newer vs local-newer; absent timestamps as `0`  |
| `server/readerStorage.test.ts` (new)      | gzip encode/decode round-trip on a fixture book                             |
| `hooks/useBooks.position.test.ts` (new)   | `setActivePage` updates `readingPosition` + ISO; navigation in 2-col layout |

Run: `cd webApp && pnpm test:unit`.

### 7.2 E2E Tests (Playwright, under `webApp/e2e/reader/`)

Add `webApp/e2e/reader/sync.spec.ts` with the following scenarios. Use the Firestore + Storage emulators (see [webApp/FIREBASE_EMULATOR_SETUP.md](webApp/FIREBASE_EMULATOR_SETUP.md)) and the existing reader e2e helpers in `e2e/libs/books/`.

Helpers to add (mirroring existing structure documented in [webApp/src/features/Reader/AGENTS.md](webApp/src/features/Reader/AGENTS.md)):

- `e2e/libs/books/auth.ts` — sign-in helper for emulator.
- `e2e/libs/books/sync.ts` — wait helpers (`waitForBookSynced(bookId)`, `seedRemoteBook(...)`).

Scenarios:

1. **Anonymous → sign-in upload**: import EPUB anonymously, sign in, expect a Firestore doc and a Storage paragraphs blob to appear; sign out, clear IndexedDB, sign back in, expect the book to reappear with same title.
2. **Highlight round-trip**: device A creates a highlight; device B (second browser context, same user) sees it without page reload (live `onSnapshot`).
3. **Reading position cross-layout**: device A on 1-column / large font reads to mid-book; device B on 2-column / small font opens the same book and lands on a page whose first visible paragraph contains the same `wordKey`.
4. **Position fallback**: tamper with the local paragraphs (re-import shortened version), confirm fallback to nearest paragraph and the toast appears once.
5. **Offline mutation queue**: go offline, create a highlight, go online, confirm Firestore receives it and `pendingUploads` returns to 0.
6. **Delete propagates**: delete on A, B's `BooksList` removes the entry within one snapshot tick.
7. **Settings stay local**: change `fontSize` on A; confirm B's `fontSize` does NOT change (and no Firestore write happens for settings).

Run targeted: `cd webApp && pnpm test:e2e -- e2e/reader/sync.spec.ts`.

### 7.3 Full Suite (per AGENTS.md)

Always finish with `cd webApp && pnpm test:e2e` because the project leans on e2e and they’re cheap to run.

---

## 8. Risks And Mitigations

| Risk                                                     | Mitigation                                                                   |
| -------------------------------------------------------- | ---------------------------------------------------------------------------- |
| Re-import of EPUB shifts `paragraphIndex`                | `wordKey` mismatch detection + nearest-paragraph fallback (§2.4)             |
| Write storms from rapid paging                           | Debounce position writes (≈800 ms) and coalesce to one per book              |
| Storage cost from large EPUBs                            | gzip + 25 MB rule cap; lazy paragraph download                               |
| Concurrent highlight edits across devices                | Document the LWW behavior; upgrade to set-merge if real conflicts surface    |
| `useEffect` overuse drifting against project conventions | Keep sync effects only in `useBooksSync` (external-system boundary)          |
| Rules misconfiguration leaking other users' books        | Cover with emulator-based rules unit tests and an e2e cross-user denial test |

---

## 9. Out-Of-Scope Follow-Ups (Tracked Here For Later)

- Set-merge highlights with tombstones.
- Per-paragraph delta sync (only if paragraphs ever become editable in-app).
- Server-side sourcemap for image extraction so we don’t ship images per device.
- `ReaderSettings` partial sync (e.g. only `translateToLanguage` and `language` could be safely synced — explicitly deferred per the user’s instruction to keep all settings local for now).
