# Blog Feature

> **Maintenance rule:** Any change to feature functionality — new files, removed files, changed data shapes, new API endpoints, auth rule changes, or behavioural changes — must be reflected in this file before the task is considered done.

Provides the dynamic blog post editor for the admin panel, and a public API for the landing page.

## Structure

```
webApp/src/features/Blog/
  AGENTS.md                  — this file
  types.ts                   — source of truth for all data shapes (BlogDocMeta, BlogVersionDoc, PublicBlogPost)
  BlogAdmin.tsx              — admin list UI (embedded in AdminStats)
  BlogEditorModal.tsx        — thin orchestrator: wires useBlogDraft + subcomponents inside CustomModal
  BlogEditorHeader.tsx       — header row: title, published chip, language selector
  BlogEditorForm.tsx         — edit-tab form fields and action buttons
  BlogEditorPreview.tsx      — preview-tab rendered output
  useBlogDraft.ts            — hook: Firestore I/O, draft state, AI translation logic
  backend/
    blogService.ts           — server-side helpers using Firebase Admin SDK
```

## Data model

See `types.ts` for the authoritative TypeScript interfaces:

- `BlogDocMeta` — metadata stored at `blogs/{blogId}`
- `BlogVersionDoc` — localised content at `blogs/{blogId}/versions/{versionId}`
- `PublicBlogPost` — shape returned by the public API

The special version doc ID `"draft"` (constant `DRAFT_VERSION_ID` in `useBlogDraft.ts`) is
the working draft the editor writes to. Publishing snapshots the draft into a timestamped
version doc and updates `BlogDocMeta.publishedVersion` to that ID.

## Public API

- `POST /api/blog/getBlogs` — returns all published blogs (no auth required)
- `POST /api/blog/getBlog` — returns a single published blog by ID (no auth required)

Both endpoints read via the Admin SDK (bypassing Firestore rules) so they work
server-side without user credentials.

## Admin UI integration

`BlogAdmin` is rendered inside `AdminStats` when the "Blog" tab is active.
The same `useUrlState` pattern used by `StoryCreator` and `EmailsAdmin` is used.

## Translation

AI translation uses `useTextAi` from `@/features/Ai/useTextAi` (inside `useBlogDraft`).
EN content is always the source of truth. Translate buttons in `BlogEditorForm`:

- **Translate to this language** — translates only the currently selected language.
- **Translate to all languages** — iterates over all `supportedLanguages` sequentially.
