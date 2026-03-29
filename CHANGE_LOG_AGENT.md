# Change Log Agent Instructions

Run these steps every week to generate fresh changelog files for social media and GitHub.

---

## What to produce

1. **`PUBLISH_CHANGE_LOG.md`** — 2 social media posts (Twitter/Threads) covering the most important user-facing features shipped that week.
2. **`CHANGELOG.md`** — Full technical changelog for GitHub, grouped by category.

Both files already exist. **Prepend** the new week's content at the top, keeping all previous entries below.

---

## Step 1 — Collect last week's commits

Run:

```bash
git log --since="7 days ago" --format="%H|%ad|%s" --date=short --no-merges
```

Note the **first commit hash** (oldest, last line of output) and the **last commit hash** (newest, first line of output). You will include both in the files.

---

## Step 2 — Write PUBLISH_CHANGE_LOG.md

Rules:

- **Exactly 2 posts.** No more.
- Focus only on **user-facing features** — things a learner using the app would notice or care about.
- Ignore: refactors, language file updates (`lang`), internal tooling, Sentry tracking, plans.md edits, `ref` commits.
- Write in a direct, casual tone. No corporate language. Short paragraphs.
- Each post should have a one-line hook, then 2–3 sentences of explanation.
- Include a header with the date range and first/last commit hashes.

Template:

```md
# Social Media Change Log — Week of [START DATE] to [END DATE]

> **Commits:** `[FIRST_HASH_SHORT]` → `[LAST_HASH_SHORT]`
> **Period:** [YYYY-MM-DD] to [YYYY-MM-DD]

---

### Post 1 — [Feature name]

[Hook line]

[2–3 sentences explaining what the user experiences differently.]

---

### Post 2 — [Feature name]

[Hook line]

[2–3 sentences explaining what the user experiences differently.]
```

---

## Step 3 — Write CHANGELOG.md

Rules:

- Use standard Keep-a-Changelog format.
- Group changes under: `Added`, `Changed`, `Removed`, `Fixed`, `Security`, `Infrastructure`.
- Each entry: short description + `(short_hash)` at the end.
- Skip pure `ref`, `lang`, and `plans.md` commits — unless they introduce something meaningful.
- Include the commit range link in the header.

Template:

```md
# Changelog

All notable changes to this project are documented here.

---

## [Unreleased] — [START DATE] to [END DATE]

**Commits:** [`SHORT_FIRST...SHORT_LAST`](../../compare/FULL_FIRST_HASH...FULL_LAST_HASH)

---

### Added

- ...

### Changed

- ...

### Removed

- ...

### Fixed

- ...

### Security

- ...

### Infrastructure

- ...
```

---

## Commit filtering guide

| Commit message pattern            | Include in publish log | Include in changelog   |
| --------------------------------- | ---------------------- | ---------------------- |
| Feature: new UI component or flow | Yes                    | Yes                    |
| Refactor (ref)                    | No                     | No                     |
| Lang / localization update        | No                     | No                     |
| Bug fix (user-visible)            | Sometimes (if notable) | Yes                    |
| Security / auth improvement       | No                     | Yes                    |
| Infrastructure / scripts          | No                     | Yes                    |
| plans.md edits                    | No                     | No                     |
| Sentry tracking added             | No                     | Yes (Security section) |

---

## Repeat weekly

Each Sunday (or start of week), run the git command above and regenerate both files by overwriting the previous week's content.
