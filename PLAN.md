# Live document with short/long term ideas

## News

1.  I just don't understand why each refresh, I see new news.
    It should remain the same during the day. Is it because cache mechanism doesn't work?
    Fix it.
    Each refresh should show the same day news.

2.  webApp/src/features/News/NewsDashboardCard.tsx use images from news on items, instead of currency icons

3.  We need translate titles and subtitles too. To user's target language.

4.  Update all places that has hardcoded "English". Our platform not only for "English" learning.
    Take it from webApp/src/features/Settings/useSettings.tsx languageCode.
    Update database structure to reflect that.

5.  I still see problem with news content, I selected category "Technology", but still see news about politic. Can we just remove topics at all. and just use most any news on selected country.

Fix this moments in order that feels appropriate to you. Ensure e2e updated too.

- Integrate with daily tasks

## Reader

- How to arrange call

- Setup domain book.fluencypal.com

- Tune logic of Markdown page splitting.
  Use proper markdown component to render content to check if it's fit.

- Fix _long paragraph italic text on separate pages_

- Automatic re-import, create parser version

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
