# Live document with short/long term ideas

## Reader

I have a list of improvements for book reader. do it step by step, and after each fix, run full set of e2e and tests.

When click on word, we see browser selection and popup. When we again click on that word, popup disappears (that's fine), but selection remains. I want to clean selection too.

---

Reader info (you can update it if needed):
webApp/src/features/Reader/AGENTS.md

- PWA

- Share books, highlights, but not book settings. (auth, storage)

=================================

We have e2e that check epub to markdown import;
webApp/e2e/booksEpubToMarkdown.spec.ts

Reader info:
webApp/src/features/Reader/AGENTS.md

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
