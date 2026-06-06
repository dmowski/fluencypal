# Live document with short/long term ideas

## Questions

=================================

## Exams/quiz

## Overview

I want to create quiz/exam feature. When user can go through questions/activities and improve/check their knowledge.

## Activities

Quiz can contain several types. they might have similar component.

### Word translation

Available only when user has native language != target language.

Use see text (word or sentence) on one language, and options with translations on another language. It might be target-> native or native->target

### Fill gap in the sentence/text: text, gap, and options to pick.

Use see the text with gaps to fill. When click on gap, the user see options to select. Once all gaps is filled, task can be submitted by the user.

### Read text and answer quiz: questions with options

User see text, and one question and options to answer.

### Describe picture with voice

User see picture, question and button to record answer. Once user recorded something, they can listen what they recorded and submit or re-record.

### Listening

Use has button "Play", the ai will play the text. and user has question and options to select. You can check how we work with ai voice here
webApp/src/features/Audio/AudioPlayIcon.tsx

## UI

Exam/quiz is open in modal. On top left corner there's a button back. That redirect to previous question. or close the modal if it's first question.

On top center user see title of quiz's chapter. For example, "Reading" or "Listening", or "Question"

## AI

Use webApp/src/features/Ai/useTextAi.tsx to generate text and json for quiz and analyze answers

## Translation

Use client hook to translate text to native language
webApp/src/features/Translation/useTranslate.tsx

## Voice capturing/Transcribe

## Interfaces

## Code style

Avoid using useEffect, useCallback.

## Folder structure

Place code inside: webApp/src/features/Quiz

## Backend

Do not create backend endpoints. Use only client side libs.

## Testing strategy

Do not write e2e. Check only with unit tests.

## Documentation

Update webApp/AGENTS.md and readme we it will be helpful for next development

## Database

webApp/src/features/Firebase/firebaseDb.ts
Use 'react-firebase-hooks/firestore' to work with database

## What is needed now.

Ask me clarification questions about the feature.
Implement architecture and detailed plan inside webApp/src/features/Quiz/plan.md

Implement types.ts with all necessary interfaces.

### MVP

Integrate with News webApp/src/features/News/NewsModal.tsx

So, the user after reading news cal take Quiz on that news.
Quiz should be generated based on user's language and complexity of news language. And it should be saved to database. On user level database. So we need to allocate collection for user's quizzes.

## How we plan to use that feature

It should be flexible to able us to emulate exams/tests/ check user's language level. Tests cold be small, like 2-3 questions, or complex. that could take 2 hours to pass.

In quiz data, should be instructions to evaluate each answer and test in general.

Later I want implement feature Upload PDF with exam description and based on that document we will create quiz/exam.

So we should have several part of the exam:

1. Progress State - data that described current state of progress. On which question user now, answers, results. So, on each change we should update that state and when user reload the page, nothing should be lost

2. Quiz itself - data represent quiz. Correct answers, evaluate criterial (instruction to llm to evaluate result.). Type of question. Sections. How to evaluate exam at the end.

3. Quiz creator - for now it's only for news. Function or better hook.
   We pass news data (title,content), user's target language, maybe additional info about user, maybe goal of the quiz. and that module should create quiz.

4. Synchronization. Module or hook, that contain quiz and function to change progress. UI should work with this hook. Not sure about naming.

++++++++++++++++++++++++++++++++++++

## Realtime service

Improve UX. Sign in / and start talking

## News

Turn off news provider. Use free version

## Alias

Init hotjar on offline alias

## News: They should be interesting for me.

webApp/src/features/News/AGENTS.md

Create news stats. Something like that
/stats/news/stats/{news_id}

properties in that document :

viewsUserIds: Record<string, string> // userId, viewsIsoTime
updatedAtIso:string;

the on admin panel
webApp/src/features/Analytics/AdminStats/AdminStats.tsx
Create a new card with "News Read - 24h"
Count of views per last 24 hours.

Mark news as read when user spend 30 second on
webApp/src/features/News/NewsModal.tsx

======

Add category: original. Make it default. and don't use AI for that

## Blogs

webApp/src/features/Blog/AGENTS.md

- Test coverage
- Working with google calendar
- Working with AI prompt
- Working with Tasks

## Reader: Search feature

Reader info: webApp/src/features/Reader/AGENTS.md

## Alias game: create better version

- Write proper e2e tests.
- Add anonymized analytics
- Create separate landing page
- PWA for it?
- Ad for ai english
- Analytics on landing page

## App: Community call

## Microphone access: Instruction on fail

## Microphone access: On first start

## App: More realistic web calls

- How to setup custom realtime communicator

=================================

## Approve to use the app (Community)

## SEO, GEO

- Hide "Cases" pages
- Alias: remove from landing page
  To make domain more focused? Move to a separate landing?

Privacy and Security/ Two-Step Verification / Forget password>? / Having trouble accessing your email?
