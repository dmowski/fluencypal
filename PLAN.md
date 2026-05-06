# Live document with short/long term ideas

## Reader

Focus on testing. Cover:

### Phase 1: stabilizing e2e.

Manually debug hot e2e works, improve if needed.

### Phase 1: Split converted of epub to markdown.

We are going to write proper e2e test for this module.
webApp/src/features/Reader/utils/epubImport.ts

The goal of our testing is to stabilize epub to markdown converter

Your goal for now, it to create a separate page, "/book/test/epubImport"
On this page, will be show a list of test books with button "Parse",
and text areas with results of convertEpubFile.

Where to get tests book:
We already have some tests books that places here:
webApp/public/Reader/pride_and_prejudice.epub

Render them on /book/test/epubImport

For context about Reader, you can check this info about related modules.
webApp/src/features/Reader/AGENTS.md

Place that TestImportModule inside
webApp/src/features/Reader/test

After you finish creating that page, wait for my approve. Then we will write e2e.

---

= epub to markdown
= markdown to paragraph

- PWA

- Tune render of some words/cases. color

- Share books, highlights, but not book settings. (auth, storage)

=================================

Reader info:
/webApp/src/features/Reader/AGENTS.md

=================================

Books e2e tests (Run, update them while working on the tasks):
webApp/e2e/\*.spec.ts All e2e tests are book related

=================================

## What about more strict Role-plays

To force user to pronounce only prepared sentences

## Idea with Human as leader

The platforms could be provided as "Human teacher (leader) with AI assistant (helper)", where the human supervise and setup education environment

## Create component "Create Learning Plan"; to create it in the app

## Problem with quiz

- In just ask, and I don't see that I will get results

## Update Quiz. How to show user profit, wow moment, aha moment

- Mic access, and button "Start first call"
- How to show user's mistakes/improvements?
- How user feel improvements?

## How to improve VAD

## On landing page add block: "Practice scenario you afraid of"

Redirect directly to role-play practice page

## Hide "Cases" pages?
