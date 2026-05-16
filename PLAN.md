# Live document with short/long term ideas

## News

### Feature overview

We are going to create feature that shows news in our app for practice speaking foreign languages.

The app folder is webApp.

The feature:
On dashboard (webApp/src/features/Dashboard/Dashboard.tsx) we add a new card <NewsDashboardCard> (place it in the feature folder webApp/src/features/News)

In this card we need to show
<SectionHeader title={i18n.\_('Current Events')} subTitle={"AI-generated English learning content inspired by current events"} />

In card (<StoreCard />), badge (property) should be user's country full name
StoreCard title should be first title of the first news.

And StoreCard.items should be 3 news from api. For image, use image provided from api

When user press on card or item, we need to show modal with content provided by api. and button [Discuss with ai]

You can take example of how to start Ai conversation:
webApp/src/features/Dashboard/Grammar/GrammarImprovementModal.tsx (practiceWithAi).

Modals, should be placed in
webApp/src/features/Modal/GlobalModals.tsx

For rendering news content, use Markdown render. variant "rule" . Ensure when we click on work, the user will see translation.
Take example here: webApp/src/features/Dashboard/Grammar/GrammarImprovementModal.tsx
webApp/src/features/uiKit/Markdown/Markdown.tsx

<Markdown
variant="rule"
onWordClick={
translator.isTranslateAvailable
? (word, element) => {
translator.translateWithModal(word, element);
}
: undefined
}

> {'\n' + improvement.description}
> </Markdown>

### Settings

Near dashboard card, show settings icon, where user can change complexity level and topic of news,
Example how to render settings icon
webApp/src/features/Dashboard/PlanDashboardCards.tsx

### Env:

I already added env key to .env that has key for gnews-io
GNEWS_API_KEY

### News extraction:

You can use that lib to extract news:
https://www.npmjs.com/package/@gnews-io/gnews-io-js

## Endpoints to create:

/api/news/getTodayNews (params: country name, topic)

/api/news/getNewsById (params: id)

Near endpoint code, create client side function covered with TS that helps to do requests.
Example of client side request function: webApp/src/app/api/translate/translateRequest.ts

### Client state management:

Because in this feature we will use api endpoints, it work to create a hook with react context, that handle loading todays news on start (when user country is here) and expose data.
Please ensure we don't trigger endpoint twice on start.
And it provide ability to change news complexity: NewsLanguageComplexity, by default is middle

### How to get user country?

webApp/src/features/Settings/useSettings.tsx use this hook and data from userSettings. country: string | null;
countryName: string | null;

### Database - for cache:

webApp/src/app/api/config/firebase.ts here's api for work with database on server side.

## Cache strategy:

After extracting news from gNews, and parsing with AI, store in database cache.

### How to process news:

We need these info from each conversation:
title: string
subTitle: string
content_origin: string
imageUrl: string
data (use iso string): string
countryCode: string;
topic: string

And we need to process these data with ai and process images:

#### Images

Image should be taken from api and placed on our storage, so client will be able to render it on UI, to outside we give uploaded to our service image (do not minimize it, just copy)

#### Content

Because our app is intended to people who practice foreign language, we need to create 3 version of content:
for beginners, for middle, for advanced students.
To handle it, use ai. You can use this lib: webApp/src/app/api/ai/generateTextWithAi.ts

I think we can generate each version in parallel.
In system prompt ensure we don't add any ai response wrapper like "Here's your simplified version."

For language level, create a TS type, like NewsLanguageComplexity = 'beginner' | 'middle' | 'advance' (or so)

As output we need to expose these versions.

### TS:

Cover enpoints with TS, like webApp/src/app/api/translate. in this folder we have types.ts use this approach.

### E2E/unit/linter:

After each changes ensure it properly covered with tests:
UI - is covered with e2e. Rely mostly on e2e. and run them after each big changes. add new tests after a new functionality (step) is added.
If something work unstable, stabilize it first before continue work.

### Folder structure

Place all related code, types, inside folder webApp/src/features/News

### URL for e2e,

http://localhost:3000/practice

This is URL of the app, for now we don't have e2e that tests that functionality, so you will be needed to create it.

### Goal for now

For now, analyze code base and create file "newsFeaturePlan.md" and place here plan split by steps. Each step should be covered by E2E and provide something we can test manually.

=====

- Create API that expose country level news. Rephrase each news with AI. create 3 version for each news. (beginner, middle, advanced), return as markdown. Save in cache. In our database. use GNEWS_API_KEY

- Create card on dashboard. With title. For now, only render it. Badge is "{COUNTRY}"

- On reader, use my markdown reader (black theme). refactor it to make it possible. Or create regular Markdown?

- Add feature "Discuss with AI"

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
