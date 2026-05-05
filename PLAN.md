# Live document with short/long term ideas

## Reader

- Tune render of some words/cases. color

- Tune ui of settings
  webApp/src/features/Reader/components/ReaderSpeechSettingsButton.tsx
  On menu items, shows Right arrows on menu items or right side
  when info content is open show top section like row:
  [left icon | Title]

- Make reading page stable.
  webApp/src/features/Reader/components/Reader.tsx
  Show firstly title, subtitle and button "Read" (center it),
  when user press "Read" button, open last active page, without ReaderHeader (So we won't show title all the time when user reads the page)

  Update e2e test to pass with a new behavior.

  When user read the content, on bottom show active page and total pages. (remove this info from ReaderHeader)

  on ReaderSpeechSettingsButton.tsx instead of "Book info" render book title

- Share books, highlights, but not book settings.
  auth, storage

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
