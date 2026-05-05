# Live document with short/long term ideas

## Reader

---

Update
webApp/src/features/Reader/components/ReaderSpeechSettingsButton.tsx

For now, it will take more responsibilities.

It will be single point for settings, chapter, and later bookmarks, etc.

Call this component BookInfoButton. place it as before: top,left corner

Create a standalone component for settings.

On BookInfoButtonModal show list of menus: "Settings" and "Chapters".

When user click on Settings, show settings with left arrow button (<ChevronLeft />)
When user click on Chapters, show chapters with left arrow button (<ChevronLeft />)
left arrow button should be placed on top left corner of InfoModal.

Chapters component: webApp/src/features/Reader/components/ReaderChaptersPopover.tsx
you can refactor it as you want.

And remove Chapters from here
webApp/src/features/Reader/components/ReaderHeader.tsx and here
webApp/src/features/Reader/components/Reader.tsx

Ensure e2e pass, update them if needed (most probably we need to update them)

---

On book Info Modal, add menu item "Highlights", and when user click on it, show list of highlights. Each of the show it as text around highlight, highlighted text with that color. and when user click on them, the page should be redirected to that place.

Write e2e to check that feature, run and ensure other e2e pass too

---

- Tune render of some words/cases. color
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
