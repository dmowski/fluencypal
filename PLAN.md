# Live document with short/long term ideas

## Essay helper

/webApp/src/features/Essay

Create a feature that helps with recording essay/posts.
But we have to use voice recording as main way for writing essay.

To get user transcripts use
webApp/src/features/Audio/useVadAudioRecorder.tsx

UI of feature:
On top button: [Start recording | Stop recording]

When user start recording, show block with transcripts.
useVadAudioRecorder is almost realtime transcribing, so user should see transcript while narrating

Folder structure:
/webApp/src/features/Essay/types.ts interfaces that will be used on feature
/webApp/src/features/Essay/Essay.tsx - main component to record essay

/webApp/src/features/Essay/EssayText.tsx
component that accept
text:string,
isRecording:boolean,
onDelete: function,
onContinueRecording: function - when user press "Record More". We cannot trigger onContinueRecording when isRecording is true
onUpdate: (newText:string)
EssayText.tsx is rendering essay. and at the bottom it renders
buttons: [Record More], [Edit], [Delete]
Edit - when clicked, instead of plain text it shows textarea with button save

/webApp/src/features/Essay/useEssay.ts
Hook with context, that handle state for essays. There are can be many essays. Use localstorage as database

Edge cases:
when there no essay, and user press "Start recording" - create a new empty essay and use it to populate results from the button.

When has more that one essay and stopper recording show buttons
[Continue recording last essay] [Record new essay]

Run "pnpm lint" to ensure it pass

place Essay/Essay.tsx into webApp/src/app/testUi/testComponents/TestPage.tsx

---

Implement "Analyze" button feature.
On Essay/EssayText.tsx create button "Analyze",
that will use useTextAi generate to analyze current essay and return markdown analysis of it.

Criteria to analyze:

- Style: how well essay is written
- Grammar mistakes and how to fix them

Render markdown using webApp/src/features/uiKit/Markdown/Markdown.tsx
Keep analysis in useEssay

## How to record user's voice

## How to improve VAD. instant grammar correction

## scenario/realtime improvements

## On landing page: add block: Practice scenario you afraid of

Redirect directly to role-play practice page

## Hide "cases" pages

## Add more role plays

## Review video about "Fluently", fix problem that I have

What makes my app different and uniq. How to compete others like "Fluency".
My superpower is transparency. I am not company shaped by investors.
What superpower of competitors: speed, popularity, quality.
They build what scalable. So, I need to build what is none-scalable at core. Meet each user in person.
They build what profitable. So, I need to build what is none-profitable at core. Meet each user in person.
Create community "Community". Community about what? Practice speaking. i don't know

ok. I think I need to recall why I am doing it. First things that came to my mind: fun, money, freedom.
yeah, rock'n'roll. So, yeah let's do rock'n'roll.
