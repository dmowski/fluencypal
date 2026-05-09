# Live document with short/long term ideas

## Reader

### Synchronization of books.

When user is authorized, we need to synchronize user's books, settings, highlights. This is multi step process. This is needed when user read book on desktop and want's to continue reading on mobile device.

There's my vision on what we need to do:

- Update data model to provide changes info.
  I think we need to add these properties on Book interface (already done): UpdatedAtIso

- Update ReaderSettings (already done): updatedAtIso
  webApp/src/features/Reader/model/types.ts

- Specify database space for reader settings and avoid conflicts with other spaces
  webApp/firestore.rules

- Create a space for user data in storage:
  webApp/storage.rules

- Endpoint(s) to upload user's Books, and user's settings (I think we can do it on client). You need to update webApp/src/features/Firebase/firebaseDb.ts

- Then, most challenging, synchronization. I think we can create a separate hook, with context. Call it useBooksSync. Add context into webApp/src/features/Reader/ReaderPage.tsx
  And integrate this hook with webApp/src/features/Reader/hooks/useBooks.tsx

I think we don't need to sync "ReaderSettings", because it might be vary per user device. So keep it local for now. Focus only on book data.

Book paragraphs and originalFile we should store in store (not in firebase).

The challenge i see is reading progress:
When we sync reading progress, on different devices activePage, might be point to a different content.

Reader info:
webApp/src/features/Reader/AGENTS.md

For now, review code base, create me detailed implementation plan, call it ReaderSync.md.
As first step I want to address reading progress synchronization. Figure out on how to handle that.
And then next steps related to proper synchronization. add info on how to cover it with e2e, unit, etc.
This doc will be used as plan for implementing that feature.

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
