# Live document with ideas

General strategy:

- Make my activity daily on FL
- Post on reddit
- redesign landing page
- write on twitter

## Advanced Practice

======

webApp/src/features/Dashboard/Dashboard.tsx

You are going to implement to feature, called InteractiveLesson.

It's should be fully client side feature.

Place all code and documentation inside webApp/src/features/InteractiveLesson
Create type.ts to store types. Agent MD for documentation.

## Goal

Give user ability to read rule and record answers. Form daily habit.
I am as learner, can open that feature, learn one lesson, answer questions and got results, if it was correct or not.
And step by step, day by day, the system should guide me to better speaking level.

## user voice transcript

Use this hook to take user's voice transcript
webApp/src/features/Audio/useAudioRecorder.tsx

## Testing

Screenshot testing, unit tests

## Render content

Use this module to render content
webApp/src/features/News/NewsContentWithParagraphs.tsx

It provide the rich functionality to voiceover content.

## Daily progress

If one lesson is done, mark card as done for today.

## native / target language

When I open that feature and my target language is equal to learning language, the system should ask me to change native or target language.

## Dashboard panel

Place new card under JustTalkCard

## Types

LessonPart {
contentMD: string // content that user will see on screen
type: "speech" | "read"
}

LessonResults {
motivationTextToUserMD: string // what the system shows when user finished the lesson
whatWentWellMD: string // next step with info of what was done perfectly
}

LessonPartWithUserAnswer extend LessonPart{
userVoiceTranscript: string; // when user recorder their message
aiResultToUser: string; // Validation from AI. Will be shown to user
}

InteractiveLesson {
parts: LessonPart[];
lessonResults: LessonResults | null;
createdAtIso: string;
title: string; // 3-5 words
subTitle: string; // 5-7 words
id: string;
}

Properties names can be updated when you see typos or you think it worth to update.

So in general, we operate with form of content: text to user to read only, text to user to read and answer.
Based on these flexible model, we can generate long text to read and then many parts to answer. For example task to translate from native to target language using voice. or describe meaning of the work, or finish the sentence. or share thoughts.

## UI/UX

On dashboard we see card "<InteractiveLesson>" card:

Use that image for card bg: https://storage.googleapis.com/dark-lang.firebasestorage.app/uploadedImages%2FMq2HfU3KrXTjNyOpPXqHSPg5izV2%2F1788035064139-Mq2HfU3KrXTjNyOpPXqHSPg5izV2.png

When Today's lesson is done: use that image
https://storage.googleapis.com/dark-lang.firebasestorage.app/uploadedImages%2FMq2HfU3KrXTjNyOpPXqHSPg5izV2%2F1788035150977-Mq2HfU3KrXTjNyOpPXqHSPg5izV2.png

When I open that card and my native and target language are the same - I see warnings and selectors to change them and button continue.

When everething is set up, I see loader: "We are preparing lesson for you. Based on your previous interaction.".
If no previous conversation, use info from user's goal, if no info from user create basic lesson for middle language level.

Use webApp/src/features/Ai/useTextAi.tsx generateStrictJson to generate strict json for lesson, parts,title, subTitle.
Once it's ready render it. Take modal style from here webApp/src/features/News/NewsModal.tsx

Each section has divider. During recording user's audio, it should be rendered indicator of recording and show visualizerComponent. you can take example here webApp/src/features/Chat/SubmitForm.tsx

After user finished recording audio, and pressed submit, show progress bar. like "Thinking, Understanding... Analyzing" and the give user's result.

When lesson is open, at the bottom on page, show progress bar that indicates page scroll, in current modal it will show user how big lesson is and how much they already done.

At the bottom, show button "I am done".

After pressing I am done, create 2 parallel AI requests: one for generate new lesson based on current and one request to generate LessonResults

Once LessonResults is ready show it under "I am done" button and scroll to that, the show 2 buttons "Next lesson", "Finish"

Next lesson - will open newly generate lesson (or show progress in case when requests is still loading).
Finish - just close modal.

Yes, and when I refresh page in the middle, I should see current lesson, so we won't loose data.

In case when I Pressed finished or close modal of finished lesson and open a that card again, i should see that newly generate lesson.

In case when that new lesson is not generated yet, generate it.

On <SectionHeader> add "buttonTitle" history, that open modal with list of previous lesson, so i can check/see my previous results.

Oh, and during answering question we need to keep user's audio record, so I can hear my voice, and hear it latter (in history).

## AI generator

For the first generation take info from last conversations (take last 30 messages). If not enough context in last conversation, take previous.

For other generations, use previous lessons results.

================================================

Name, daily progress, how to generate with AI, how to show tasks, where get ready to use components/hooks.

Read rule, do exercise, talk. 15 min in total.

- Read rule

- Read text

- Ask question by voice - meaning

- Ask question related to rule

- Translation to Target from Native

- Translation from native to Target

- Translate using Voice

- Suggestion evaluate the lesson:
  if it was useful? What topic you want to discuss next?

- Generate next rule based on mistakes

Mark done if done today

## Analytics

Keep analyzing

## Landing: Show real demo

## Redesign Daily questions/Chat - Foster community

- Show paywall blocker on daily chat cards and public.
  Check that messages in not marked as read when user does not have access

- Remove old messages after 4 days
  But not private DM messages
  Ensure firebase access rules check paid users

- Add onboarding daily task about Community
  - Message will be removed in 4 days
  - Be careful with words and calm, we all learners
  - Summarize what you heard, share support and ask a follow up question

- Weekly question: How are you? - Update daily question to repeat it
- Weekly question: Who are you?

## Main Issue

The biggest problem is how to return user. Engagements. People don't use it daily.
How they return to it - When we remember this. Ideal solution - is someone who can notify it.

Tech solution:
Sophisticated Daily Tasks that analyze you progress and propose what is good for you dynamically
