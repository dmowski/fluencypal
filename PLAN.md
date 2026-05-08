# Live document with short/long term ideas

## Reader

I have a problem with a specific voice "Google US English"

- Short keys does not work on RU keyboard. We need to use create better approach of detecting key letter.

- When the book is open, and the user press esc, show confirmation for closing (maybe native confirm dialog). Update existing e2e to handle that. Pay attention that there are cases when we need to do some actions and now showing this confirmation dialog.

- When the word is selected, next click on the word should unselect the word.

- Click on title (markdown): show highlight popup

- How to safely split markdown into chunks?
  For example case: _this is long italic test that we need to break in the middle_

- PWA

- Share books, highlights, but not book settings. (auth, storage)

=================================

We have e2e that check epub to markdown import;
webApp/e2e/booksEpubToMarkdown.spec.ts

Reader info:
/webApp/src/features/Reader/AGENTS.md

Books e2e tests (Run, update them while working on the tasks):
webApp/e2e/\*.spec.ts All e2e tests are book related

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
