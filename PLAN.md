# Live document with short/long term ideas

## Reader helper?

- On header, show percentage progress, like "{current_page} / {total_pages} / {percentage}%"
  current_page should be one active page. in case of too columns, show the one number and total count of pages/2 (there's a space for logic) (unit tests)

- Move "Voice Over Selected Sext" (boolean) into settings, true by default. When false, do not play text (playText)

- When press: ctrl+A, select only content in pages, do not select other text. do not trigger show highlight popup or voiceover. (cover with e2e)

- Handle images: I see the case when image is too high for single page, it goes outside the page. Do we need to shrink width to fit the page? (It's visible when screen is 1400px / 700px. The first cover image is not fit into view port.)

### Drag and drop

- Add drag and drop support on main page (book list), so when i put epub file, it will be added to my books. We need to show progress bar.

- On Add Modal, show large section drag-and-drop (but handle drop area at whole page), add info that only epub is supported. If not supported file dropped, show error. Show inputs only for localhost url. Along with drag-and-drop show button to upload file. Update e2e test by covering drag-and-drop and update existing tests.

### Navigation

On top of page, show text "Chapters", when user press this link, we show popover with list of chapters, when user clicks on chapter, we need to redirect to that page. Update all necessary part to allow it. For now we don't have info about navigation.

For popup bg use this color #FFF3DD with #222 text color. Navigation can be nested

(Write e2e to check it with existing test book).

### Sharing

- Share books, but not settings

### EXTREME MVP:

1. Find a good book in Polish
2. Start reading it in MacOS native book reader
3. In parallel start conversation with FluencyPal
4. Read book aloud and time to time asks FluencyPal

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
