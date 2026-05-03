# Live document with short/long term ideas

## Reader helper?

- Markdown: Make h1-6 the same size as content, just different font weight

- Handle images.

We are going to implement supports of images from the book.

Before we start implementing, let's write e2e

I have test book: webApp/e2e/fixtures/Supercommunicators.epub

Write e2e:
You need to add this book, by clicking on "Add New Book", and upload this file, and ensure it added and after successfully parsing the fields are populated.
Then we need to press on "Add" button, wait for book to opens, and check that the text "Copyright © 2024 by Charles Duhigg" is rendered. add check that image (Cover ) src="../images/9780385697750_cover.jpg" is present. for now it's not rendered properly. and it's fine. We do just doing setup for the future development.

When e2e is written, we can start implementing image supports. I will describe my ideas about how to do it latter. But you can provide some your ideas on how to implement it for my case.

For this create a separate e2e tests called "booksImages.spec.ts",

Update agents.md (Reader folder)

- Add book UX: drag and drop

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
