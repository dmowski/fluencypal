# Live document with short/long term ideas

## Reader

Refactor webApp/src/features/Reader/utils/epubImport.ts

Split into separate modules into webApp/src/features/Reader/utils/epubImport/ folder.

After refactoring run all test to ensure everything is working.

±±±±±±±±±±±±±±±±±±±±±±±±±±±±±±

We have e2e that check epub to markdown import;
webApp/e2e/booksEpubToMarkdown.spec.ts

We have strange rendering on this case:

Update import to handle to more correctly. Try to create more general solution that fixing exactly this book case.

After our changes update e2e, and run all e2e (important) to check if it does not broke other parts of the app.

Reader info:
/webApp/src/features/Reader/AGENTS.md

±±±±±±±±±±±±±±±±±±±±±±±±±±±±±±

#### FEATURES

--- START: READY TO SUBMIT PROMPT

When open book, show book title (Browser tab title)
and when close, restore previous title
Book reader info
/webApp/src/features/Reader/AGENTS.md

Use some general approach of browser page titles.

--- END: READY TO SUBMIT PROMPT

- PWA

- Share books, highlights, but not book settings. (auth, storage)

=================================

We have e2e that check epub to markdown import;
webApp/e2e/booksEpubToMarkdown.spec.ts

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
