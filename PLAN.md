# Live document with short/long term ideas

## Reader

- When we do resize, change color of temporary highlight to red, to make it more visible

- Shared books

===========

Not, let's implement share book modal.
On my books list menu (BookCard) (webApp/src/features/Reader/components/BooksList.tsx) add menu "Share"
when user click on it, we see list of user's emails
(We need too update data model of books to keep map of user ids with emails.)
On this popup, we see list of users, who is owner. And input to enter a new user email.
Please create an endpoint that returns user id by user email or null.
sanitize user email. in all cases do .toLowerCase().

When user inter a new email, and press on "Share", we need to show loader and if user exists, update document, and show confirmation that user is now has that book. If there's no such user, show error message that before sharing book with user, you need invite user to the app and they need to login. Think about UX on how better to do it.

Oh, in this popup we should be able to remove users if we owner, if we are not owners, just hide this control(s).

===========

Update delete books handling.
We have case, when the books is shared with others.
In case when there's only one user, just confirm deletion and remove, as is.

If I am not owner of the book, just remove my user id from list. Write e2e for that cases.

If I am owner, show custom confirmation, that deletion will remove the book from all users.
Show button "Delete for all", and "Open sharing settings" (to re-assign owner). And implement logic of reassigning ownership. Write e2e for that cases.

webApp/src/features/Reader/components/BooksList.tsx

===========

- Setup domain book.fluencypal.com

- Fix _long paragraph italic text on separate pages_

- Automatic re-import, create parser version

=================================

- Separate app/url/PWA/Vision of the app

[1] I have a reader and platform for practice speaking.
Simple solution: Is based on user's interests suggest some book, and track the progress of reading. How integrate talking? Maybe AI can discuss with user what they read, and provoke the user to talk about the topic?
What books to use? For what it needed?
[to continue]

[2] I have a reader.
Place it into a separate app.
What's uniq in this reader? - Better UX?
I think some user will like it. Maybe

[3] I have a reader. And human teacher.
I want to read book, and discuss it with my teacher. I want to share notes about the book with him, and keep it. And he can offer me books. And we keep track of books together. And teacher able to work on it with other students. We can see the progress. and explore role of AI here.

- Share books, highlights, but not book settings. (auth, storage)

=================================

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
