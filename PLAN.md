# Live document with short/long term ideas

## Reader

Fix this warning, it's on reader booksList.tsx
[browser] Image with src "https://www.gutenberg.org/cache/epub/1342/pg1342.cover.medium.jpg" was detected as the Largest Contentful Paint (LCP). Please add the `loading="eager"` property if this image is above the fold.
Read more: https://nextjs.org/docs/app/api-reference/components/image#loading

- How to safely split markdown into chunks? In case when this text shows at the end ot the page, it might be broken on other page.
  For example case: _this is long italic test that we need to break in the middle_
  Page 1: _this is long
  Page 2: italic test that we need to break in the middle_

As a result Markdown render doesn't works properly.
Create a separate module for save md breaks. And integrate with our logic of rendering pages.

Reader info:
/webApp/src/features/Reader/AGENTS.md

- Click on title (markdown): show highlight popup

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
