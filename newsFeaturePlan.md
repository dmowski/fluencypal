# News Feature Implementation Plan

End-to-end plan for the "Current Events" news practice feature in [webApp/](webApp/).
Each step delivers something verifiable manually and is covered by at least one e2e
spec under [webApp/e2e/news/](webApp/e2e/news/) (new folder). Steps are designed to
land incrementally: after every step the app stays green (`pnpm lint`, `pnpm test:unit`,
`pnpm test:e2e`).

All feature code lives under `webApp/src/features/News/` unless noted otherwise.
Server endpoints live under `webApp/src/app/api/news/`.

---

## Step 0 — Scaffolding and shared types

**Goal:** Create the feature folder and TS types used by both the client and the
server. Nothing renders yet.

**Deliverables**

- `webApp/src/features/News/types.ts` exports:
  - `NewsLanguageComplexity = 'beginner' | 'middle' | 'advance'`
  - `NewsTopic` (string literal union of topics supported by gnews-io, e.g.
    `'general' | 'world' | 'nation' | 'business' | 'technology' | 'entertainment' | 'sports' | 'science' | 'health'`)
  - `NewsItem` (server-shaped record matching cache document, see Step 2)
  - `NewsItemSummary` (subset used in list responses: `id`, `title`, `subTitle`,
    `imageUrl`, `dateIso`, `countryCode`, `topic`)
- `webApp/src/app/api/news/types.ts` mirrors / re-exports the request and response
  contracts (`GetTodayNewsRequest/Response`, `GetNewsByIdRequest/Response`) using
  the same pattern as [webApp/src/app/api/translate/types.ts](webApp/src/app/api/translate/types.ts).
- `webApp/src/features/News/constants.ts` exports default topic, complexity, and
  topic option labels for the settings menu.

**Manual check**: `cd webApp && pnpm lint` passes.

---

## Step 1 — Empty dashboard card (UI only, no data)

**Goal:** Show a "Current Events" section on the dashboard with the `<StoreCard>`
in a stable empty state. No API calls yet. This unlocks the first e2e test against
`/practice`.

**Deliverables**

- `webApp/src/features/News/NewsDashboardCard.tsx`:
  - Renders [SectionHeader](webApp/src/features/Dashboard/CartsHeader.tsx) with
    `title={i18n._('Current Events')}` and
    `subTitle={i18n._('AI-generated English learning content inspired by current events')}`.
  - Renders [StoreCard](webApp/src/features/uiKit/Card/StoreCard/StoreCard.tsx) with:
    - `badge` = `settings.countryName ?? ''` (hidden when no country)
    - `title` = `i18n._('Loading news...')`
    - `items: []`
    - `emptyItemsStateText = i18n._('No news yet for your country today.')`
  - Uses [useSettings](webApp/src/features/Settings/useSettings.tsx); renders
    nothing while `settings.loading` (mirrors `GrammarImprovesCard`).
  - Adds a stable e2e selector: `data-testid="news-dashboard-card"`.
- Mount it inside the `home` block in
  [webApp/src/features/Dashboard/Dashboard.tsx](webApp/src/features/Dashboard/Dashboard.tsx),
  immediately above `<GrammarImprovesCard />`.

**E2E** — `webApp/e2e/news/dashboardCard.spec.ts`

- Navigates to `/practice`, signs in via the existing auth fixture.
- Asserts `data-testid="news-dashboard-card"` is visible.
- Asserts the title text `Current Events` is present.

**Manual check**: open `/practice`, see new section with empty card and country
badge if the test user has a country set.

---

## Step 2 — Firestore cache schema and helpers (no UI changes)

**Goal:** Define the cache layer used by both endpoints; cover with unit tests
against the emulator. No new HTTP routes yet.

**Cache shape** (`webApp/src/features/News/types.ts` `NewsItem`):

```
{
  id: string;                 // sha1(countryCode + dateIsoDay + sourceUrl)
  title: string;
  subTitle: string;
  content_origin: string;     // markdown from gNews description + content
  imageUrl: string;           // our storage URL (Step 4 fills this; placeholder for now)
  sourceImageUrl: string;     // original gNews image URL
  dateIso: string;            // gNews publishedAt
  countryCode: string;        // e.g. 'us'
  countryName: string;
  topic: NewsTopic;
  sourceUrl: string;
  versions: {
    beginner: string;         // markdown
    middle: string;
    advance: string;
  } | null;                   // null until AI rewrites complete
  createdAtIso: string;
}
```

**Firestore layout**: collection `news` keyed by `NewsItem.id`. Index on
`countryCode + topic + dateIso` (add to `webApp/firestore.indexes.json`).

**Deliverables**

- `webApp/src/app/api/news/cache.ts`:
  - `getCachedTodayNews({ countryCode, topic }): Promise<NewsItem[]>` — returns
    items whose `dateIso` day === today (UTC) for the country/topic.
  - `getCachedNewsById(id): Promise<NewsItem | null>`
  - `upsertCachedNews(item: NewsItem): Promise<void>`
  - Uses `getDB()` from
    [webApp/src/app/api/config/firebase.ts](webApp/src/app/api/config/firebase.ts).
- `webApp/src/app/api/news/buildNewsId.ts` — pure helper for the deterministic id.

**Test (unit, emulator)** — `webApp/src/app/api/news/cache.test.ts`

- Uses the Firebase emulator pattern (see existing translate cache test if any;
  otherwise mirror `webApp/src/app/api/translate/cache.ts`).
- Round-trips an item; asserts `getCachedTodayNews` filters by country/topic/day.

**Manual check**: start emulator, run `pnpm test:unit -- news/cache`.

---

## Step 3 — gNews fetch wrapper (server only, no UI)

**Goal:** Wrap [`@gnews-io/gnews-io-js`](https://www.npmjs.com/package/@gnews-io/gnews-io-js)
in a single typed helper so callers don't depend on the third-party shape.

**Deliverables**

- `pnpm add @gnews-io/gnews-io-js` in `webApp/`.
- `webApp/src/app/api/news/fetchGNews.ts`:
  - `fetchGNewsTopHeadlines({ countryCode, topic, max }): Promise<RawGNewsArticle[]>`
  - Reads `process.env.GNEWS_API_KEY`; throws a typed error if missing.
  - Maps to a small internal `RawGNewsArticle` shape so the rest of the code is
    not coupled to the lib.
- `webApp/src/app/api/news/__fixtures__/gnews.json` for tests.

**Test (unit)** — `webApp/src/app/api/news/fetchGNews.test.ts`

- Mocks the lib client and asserts the mapper output, missing-key error, and
  default `max=3`.

**Manual check**: temporary one-off node script not required — covered by tests.

---

## Step 4 — Image proxy upload (server only)

**Goal:** Copy the gNews image into our Firebase storage and return our URL.

**Deliverables**

- `webApp/src/app/api/news/copyImageToStorage.ts`:
  - `copyNewsImageToStorage({ sourceUrl, newsId }): Promise<string>`
  - Downloads the image (no resizing, no re-encoding), uploads it via the
    `getBucket()` API used in
    [webApp/src/app/api/uploadFile/uploadFileToStorage.ts](webApp/src/app/api/uploadFile/uploadFileToStorage.ts),
    under `newsImages/<newsId>.<ext>`, `makePublic()`, returns the public URL.
  - Idempotent: if a file with that name exists, returns the existing public URL.

**Test (unit, emulator)** — `webApp/src/app/api/news/copyImageToStorage.test.ts`

- Mocks `fetch` to return a small PNG; asserts the file lands in the emulator
  bucket and the returned URL is non-empty.

**Manual check**: trigger via the Step 5 endpoint and inspect the bucket.

---

## Step 5 — AI rewrite into 3 complexities (server only)

**Goal:** Produce `versions.beginner / middle / advance` markdown in parallel
from `content_origin` using
[generateTextWithAi](webApp/src/app/api/ai/generateTextWithAi.ts).

**Deliverables**

- `webApp/src/app/api/news/rewriteNewsForLevels.ts`:
  - `rewriteNewsForLevels({ title, content_origin }): Promise<NewsItem['versions']>`
  - Runs three `generateTextWithAi` calls in `Promise.all`, one per complexity.
  - System prompt rules:
    - Output **markdown only**, no wrappers like "Here is your simplified...".
    - Preserve the news facts; reword to the target CEFR level
      (beginner ≈ A1–A2, middle ≈ B1, advance ≈ C1).
    - Keep length close to the original; do not invent facts.
    - Avoid headings above H2; do not include the original title.
- `webApp/src/app/api/news/prompts.ts` — exported prompt builders, easy to unit-test.

**Test (unit)** — `webApp/src/app/api/news/rewriteNewsForLevels.test.ts`

- Mocks `generateTextWithAi`; asserts all three keys are produced, the user
  prompt contains the original content, and any leading wrapper line is stripped
  defensively.

---

## Step 6 — `/api/news/getTodayNews` endpoint + client wrapper

**Goal:** First externally-callable endpoint. Returns 3 cached news summaries for
the given country and topic; populates cache (image + AI versions) on miss.

**Deliverables**

- `webApp/src/app/api/news/getTodayNews/route.ts`:
  - `POST { countryCode, countryName, topic }` → `{ items: NewsItemSummary[] }`.
  - Flow: cache hit → return; else `fetchGNewsTopHeadlines` (max 3) →
    `copyNewsImageToStorage` per article → `rewriteNewsForLevels` per article
    (all parallel per article) → `upsertCachedNews` → return summaries.
  - Auth via `validateAuthToken` (matching the existing route style).
  - Server-side de-dupe lock to avoid double work for concurrent requests:
    keep an in-memory `Map<key, Promise>` keyed by `countryCode|topic|dayIso`.
- `webApp/src/app/api/news/getTodayNews/getTodayNewsRequest.ts` — typed fetch
  wrapper mirroring
  [translateRequest.ts](webApp/src/app/api/translate/translateRequest.ts).

**E2E** — `webApp/e2e/news/getTodayNews.spec.ts`

- Page-level test using Playwright's `request` fixture against the running dev
  server with mocked network: intercept the upstream gNews call via a server
  test hook OR via a `__test_news_seed__` admin endpoint (preferred: seed
  Firestore directly using the existing emulator-aware test util).
- Asserts the endpoint returns 3 summaries with required fields.

**Manual check**: `curl` with a real GNEWS_API_KEY in a dev shell (optional);
otherwise rely on the e2e spec.

---

## Step 7 — `/api/news/getNewsById` endpoint + client wrapper

**Goal:** Fetch a single full news record including all complexity versions.

**Deliverables**

- `webApp/src/app/api/news/getNewsById/route.ts`:
  - `POST { id }` → `{ item: NewsItem }`; 404-style `{ item: null }` if missing.
- `webApp/src/app/api/news/getNewsById/getNewsByIdRequest.ts` — typed wrapper.

**E2E** — `webApp/e2e/news/getNewsById.spec.ts`

- Seeds an item into Firestore emulator, calls the endpoint via Playwright
  `request`, asserts `versions` keys and content.

---

## Step 8 — `useNews` React context (client state)

**Goal:** Single source of truth for today's news on the client, with guards
against duplicate fetches.

**Deliverables**

- `webApp/src/features/News/useNews.tsx`:
  - `NewsProvider` wraps the dashboard subtree (mounted in
    [webApp/src/app/[lang]/practice/page.tsx](webApp/src/app/) or the existing
    providers root — confirm location during implementation).
  - State: `items: NewsItemSummary[] | null`, `isLoading`, `error`,
    `complexity: NewsLanguageComplexity` (default `'middle'`),
    `topic: NewsTopic` (default `'general'`).
  - Trigger fetch the first time `settings.country` becomes non-null, OR when
    `topic` changes. Implementation uses a `useRef<{ inFlightKey: string }>`
    guard so React 18 strict-mode double-mount does **not** fire twice (per
    project preference to avoid `useEffect`-driven sync where possible, the
    fetch is kicked off from a small `useEffect` that depends on
    `(country, topic)` and is guarded by the ref — this is the one place a
    minimal effect is necessary because it syncs to an external system).
  - Persists `complexity` and `topic` in `localStorage` under
    `news.settings.v1`.
  - Exposes `getNewsById(id)` that calls the endpoint with in-memory caching.

**Test (unit)** — `webApp/src/features/News/useNews.test.tsx`

- React Testing Library: renders provider twice in strict mode, asserts the
  request wrapper was called once.

---

## Step 9 — Dashboard card with live data

**Goal:** Populate `NewsDashboardCard` from `useNews`.

**Deliverables**

- Update `NewsDashboardCard` to read from `useNews()`:
  - `StoreCard.title` = `items?.[0]?.title ?? i18n._('Loading news...')`.
  - `StoreCard.previewImageUrl` = `items?.[0]?.imageUrl`.
  - `StoreCard.items` = `items?.map(...)` (3 rows), each with
    `iconBgColor` cycling through a small palette and an `onClick` that opens
    the news modal (see Step 11).
  - Click on the card itself opens the first item.

**E2E** — `webApp/e2e/news/dashboardCard.spec.ts` (extends Step 1 spec)

- Mocks `/api/news/getTodayNews` with three fixture items.
- Asserts the country badge, first item title rendered as card title, and three
  row items.

**Manual check**: with emulator + dev server, set the test user country to e.g.
`US`, reload `/practice`, see card populated.

---

## Step 10 — Settings icon next to the card

**Goal:** Let the user change complexity and topic. Mirrors the
[Settings IconButton + Menu pattern](webApp/src/features/Dashboard/PlanDashboardCards.tsx).

**Deliverables**

- New component `webApp/src/features/News/NewsSettingsMenu.tsx`:
  - `IconButton` with `Settings` lucide icon, rendered in the same row as
    `SectionHeader` inside `NewsDashboardCard`.
  - Menu with two sub-sections:
    - Complexity (radio): Beginner / Middle / Advance.
    - Topic (radio): the union from Step 0.
  - Selecting an option calls `useNews().setComplexity` / `setTopic`.
- Changing topic triggers refetch (handled in Step 8 dependency).
- Changing complexity only changes how the modal renders content (no refetch).
- Add `data-testid="news-settings-button"` and per-option testids.

**E2E** — `webApp/e2e/news/settings.spec.ts`

- Opens menu, switches topic, asserts new fetch was issued with new topic param.
- Switches complexity, asserts no extra `getTodayNews` request.

---

## Step 11 — News modal in `GlobalModals` (no AI conversation yet)

**Goal:** Click on the card or any item opens a modal with the full news in the
current complexity rendered via `Markdown` variant `rule`, with word-click
translation.

**Deliverables**

- `webApp/src/features/News/NewsModal.tsx`:
  - Built on `CustomModal` (same as
    [GrammarImprovementModal](webApp/src/features/Dashboard/Grammar/GrammarImprovementModal.tsx)).
  - On open, calls `useNews().getNewsById(id)` (cached) → shows the
    `versions[complexity]` markdown.
  - Header: title, date, country, topic chip.
  - Body: `<Markdown variant="rule" onWordClick={translator.isTranslateAvailable ? (w, el) => translator.translateWithModal(w, el) : undefined}>{'\n' + content}</Markdown>`.
  - Footer: disabled `[Discuss with AI]` button (wired in Step 12).
  - Loading state: `LoadingShapes` (matches Grammar modal).
- `webApp/src/features/News/useNewsModal.tsx`:
  - URL-state-backed hook using `useUrlState` (`newsId` param), matching the
    pattern in
    [useGlobalModals](webApp/src/features/Modal/useGlobalModals.tsx).
- Mount `<NewsModal />` inside
  [GlobalModals.tsx](webApp/src/features/Modal/GlobalModals.tsx).
- Wire card / item `onClick` to `useNewsModal().openNews(id)`.

**E2E** — `webApp/e2e/news/modal.spec.ts`

- Mocks today's news and `getNewsById`.
- Clicks first item → modal opens with markdown content, complexity switcher
  works (re-renders with different version), closing via backdrop/`Esc` clears
  the URL param.
- Clicks a word → translation modal appears (existing translator behavior).

---

## Step 12 — "Discuss with AI" action

**Goal:** Start an AI conversation seeded with the news content, mirroring
`practiceWithAi` from
[GrammarImprovementModal](webApp/src/features/Dashboard/Grammar/GrammarImprovementModal.tsx).

**Deliverables**

- In `NewsModal`, implement `discussWithAi`:
  - Requests mic via `getMediaVideoStreams()` (same try/catch as Grammar modal).
  - Calls `settings.setConversationMode('record')`.
  - Calls `aiConversation.startConversation({ mode: 'news-discussion', ruleToLearn: buildNewsDiscussionPrompt(item, complexity), conversationMode: 'record' })`.
  - Closes the modal after a short delay.
- Add `mode: 'news-discussion'` to the existing conversation mode union (one-line
  type addition, plus any switch coverage in
  `useAiConversation` — confirm during implementation, may require a default
  prompt branch).
- `webApp/src/features/News/buildNewsDiscussionPrompt.ts`:
  - Pure function that returns the system prompt: short instruction to discuss
    the news topic, ask follow-up questions, push the user to speak more, avoid
    re-explaining facts the user can read.
  - Unit-tested.

**E2E** — `webApp/e2e/news/discuss.spec.ts`

- Mocks today's news and getNewsById.
- Stubs `aiConversation.startConversation` and `getMediaVideoStreams` via a
  test hook (existing pattern in reader tests).
- Clicks `[Discuss with AI]`, asserts the stub was called with `mode === 'news-discussion'`
  and the prompt includes the news title.

---

## Step 13 — Loading / error / no-country states

**Goal:** Stable UX edge cases, easy to e2e.

**Deliverables**

- `NewsDashboardCard` renders:
  - Skeleton title while `isLoading`.
  - `emptyItemsStateText` when API returns 0 items.
  - When `!settings.country`: hide the card entirely (do not call the API).
- `NewsModal` shows a retry button on error.

**E2E** — `webApp/e2e/news/states.spec.ts`

- Three cases: loading, error (mock 500), no-country (mock user with null
  country). Each asserts the expected DOM.

---

## Step 14 — Final pass: i18n, lint, full e2e

**Goal:** Ship-ready quality bar.

- Add new strings to lingui catalogs and run `pnpm updateLanguage`.
- `cd webApp && pnpm lint`
- `cd webApp && pnpm test:unit`
- `cd webApp && pnpm test:e2e` (full suite per project AGENTS.md).
- Update [CHANGELOG.md](CHANGELOG.md) with a short entry.

---

## Open questions to resolve while implementing

1. Where exactly the `NewsProvider` is mounted (page vs. shared providers root).
2. Whether `aiConversation.startConversation` supports new modes without a
   server-side prompt change — check
   `webApp/src/features/Conversation/useAiConversation/useAiConversation` during
   Step 12.
3. Confirm the gNews country code mapping for users where `settings.country`
   stores a non-ISO value; if needed, add a small `countryCodeMap.ts`.
4. Whether the existing e2e infra already has a Firestore-seed util usable from
   spec files; if not, create one in `webApp/e2e/libs/news/` as part of Step 6.

---

## File map (target layout)

```
webApp/src/features/News/
  types.ts
  constants.ts
  NewsDashboardCard.tsx
  NewsSettingsMenu.tsx
  NewsModal.tsx
  useNews.tsx
  useNewsModal.tsx
  buildNewsDiscussionPrompt.ts

webApp/src/app/api/news/
  types.ts
  cache.ts
  buildNewsId.ts
  fetchGNews.ts
  copyImageToStorage.ts
  rewriteNewsForLevels.ts
  prompts.ts
  getTodayNews/
    route.ts
    getTodayNewsRequest.ts
  getNewsById/
    route.ts
    getNewsByIdRequest.ts

webApp/e2e/news/
  dashboardCard.spec.ts
  settings.spec.ts
  modal.spec.ts
  discuss.spec.ts
  states.spec.ts
  getTodayNews.spec.ts
  getNewsById.spec.ts
```
