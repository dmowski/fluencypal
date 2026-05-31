# Blog Feature

> **Maintenance rule:** Any change to feature functionality — new files, removed files, changed data shapes, new API endpoints, auth rule changes, or behavioural changes — must be reflected in this file before the task is considered done.

Provides the dynamic blog post editor for the admin panel, and a public API for the landing page.

## Structure

```
webApp/src/features/Blog/
  AGENTS.md                  — this file
  types.ts                   — source of truth for all data shapes (BlogDocMeta, BlogVersionDoc, BlogCategoryDocument, BlogPost)
  backend/blogMappers.ts       — localize Firestore docs to a single `lang` for the public API
  BlogAdmin.tsx              — admin list UI (embedded in AdminStats)
  BlogEditorModal.tsx        — thin orchestrator: wires useBlogDraft + subcomponents inside CustomModal
  BlogEditorHeader.tsx       — header row: title, published chip, language selector
  BlogEditorForm.tsx         — edit-tab form fields and action buttons
  BlogEditorPreview.tsx      — preview-tab rendered output
  BlogCategoryModal.tsx      — pick existing category or create a new one
  useBlogDraft.ts            — hook: Firestore I/O, draft state, AI translation logic
  useBlogCategories.ts       — hook: list/create/update/delete categories in blogMetadata
  blogCategoryUsage.ts       — scan blog version docs to see whether a category is referenced
  translateCategoryTitle.ts  — AI: English category title → all supportedLanguages
  backend/
    blogService.ts           — server-side helpers using Firebase Admin SDK
```

## Data model

See `types.ts` for the authoritative TypeScript interfaces:

- `BlogDocMeta` — metadata stored at `blogs/{blogId}`
- `BlogVersionDoc` — localised content at `blogs/{blogId}/versions/{versionId}`
- `BlogMetadataCategoryDoc` — parent doc at `blogMetadata/category`
- `BlogCategoryDocument` — category at `blogMetadata/category/categories/{categoryId}`
- `BlogPost` — single-locale shape returned by the public API (matches landing `BlogPost`)

The special version doc ID `"draft"` (constant `DRAFT_VERSION_ID` in `useBlogDraft.ts`) is
the working draft the editor writes to. Publishing snapshots the draft into a timestamped
version doc and updates `BlogDocMeta.publishedVersion` to that ID.

### Categories

Categories live outside individual blog posts:

```
blogMetadata/category                    — BlogMetadataCategoryDoc (parent anchor)
blogMetadata/category/categories/{id}  — BlogCategoryDocument
```

`BlogCategoryDocument` fields: `id`, `title` (per `SupportedLanguage`), `updatedAtIso`.

Each `BlogVersionDoc` stores `categoryId` referencing a category document ID. In the editor,
**Select category** / **Change category** opens `BlogCategoryModal` to pick an existing
category, create one (manual `id` + English title), edit an existing category, or delete one.
The current ID and English title are shown read-only when set.
Deletion is blocked when any **other** blog post's version doc (draft or published) still
references that category; the post currently being edited is excluded from that check, and
its `categoryId` is cleared locally if the delete succeeds.
On create/update, the English title is translated to all `supportedLanguages` via `useTextAi`
before the `BlogCategoryDocument` is written to Firestore.

## Public API

Both endpoints read via the Admin SDK (bypassing Firestore rules). Require `lang`
(`SupportedLanguage` code). Responses use the landing-aligned `BlogPost` shape (one locale per
field, plus resolved `category`).

- `GET|POST /api/blog/getBlogs?lang={code}` — `{ blogs: BlogPost[], categories: BlogCategorySummary[] }`
- `GET|POST /api/blog/getBlog?blogId={id}&lang={code}` — `{ blog: BlogPost | null }`

English is used as fallback when a translation key is missing for the requested `lang`.

## Admin UI integration

`BlogAdmin` is rendered inside `AdminStats` when the "Blog" tab is active.
The same `useUrlState` pattern used by `StoryCreator` and `EmailsAdmin` is used.

## Firestore security

Client reads/writes to `blogs/*` and `blogMetadata/category/*` require `isBlogAdmin()` in
`firestore.rules` (email `dmowski.alex@gmail.com`, same as `DEV_EMAILS` in
`src/features/DevTools/dev.tsx`). The public blog API uses the Admin SDK and is unaffected.

## Translation

AI translation uses `useTextAi` from `@/features/Ai/useTextAi` (blog drafts in `useBlogDraft`,
category titles in `useBlogCategories` via `translateCategoryTitle.ts`).
EN content is always the source of truth. Translate buttons in `BlogEditorForm`:

- **Translate to this language** — translates only the currently selected language.
- **Translate to all languages** — iterates over all `supportedLanguages` sequentially, each pass
  translating from the accumulated `updated` draft (`applyLocalizedPatch`). Using the initial
  English-only draft for every pass would overwrite prior languages (only the last would remain).
