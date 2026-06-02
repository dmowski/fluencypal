I want to create realtime communicator with AI endpoint.
I want you to create a new root folder, called realtime. Here, place file called plan.md. and describe architecture of creating realtime service.

Features I want to have:
Ability to setup my custom AI response engine. Custom text to voice, voice to text, text-to-text ai.

So I want in general set different models on different level.

For example:
to generate text, I want to use gpt-4o
for generate voice: gpt-4o-mini-tts
to voice-to-text: gpt-4o-transcribe

But I want to be able to change model and provider later. for example if I want to change text ai to anthropic, it should be posable.

And I want to work with streams. The user sends stream of voice text, and the system responding with stream of voice or/and text.

I thing it should be websocet connection, when user send voice as stream and text as events. and server response with stream of voice and events with messages.

This system designed for people that practice foreign languages speaking. On UI it looks like Google Call, with transcript available.
And there's a mode when the user able to record message (voice message or text message) and the system return text and pronounce that text.

And I want to be able to send image data: steam from webcam. It's an optional, nice to have. So AI can "see" the user. But user might turn-off video camera.
Additionally I want to control when the system generate voice output or not. For example when user muted AI voice, I don't want the system to spend tokens on generating voice, and keep only text generation.

Security:
Our main app uses firebase, so before init conversation we need to check that the user is valid authorized user. Example on how to validate user
webApp/src/app/api/config/firebase.ts you can copy it inside realtime folder.

Token usage:
For MVP, I want server dispatch events with info how much tokens spent. So you can do time to time, or as soon as AI generated some data. Our client will collect that info. It mostly for analytical internal analytical usage, user can spend as much as they want.

Keys:
on .env file (Don't read that file) I placed a OPENAI_API_KEY. So you can rely on it while developing your solution. Don't read that file.
FIREBASE_STORAGE_SERVICE_ACCOUNT_CREDS added as well

Tech stack:
I prefer node.js and typescript. Libs/frameworks you can pick on your own.

In current app approach we use open ai realtime. The problem is that it's extremely difficult to customize. Difficult to change voice, impossible to make meaning of AI better and use cheaper voice generation. Difficult to change system prompt in the middle of conversation.

Phases to implement:

1. On realtime folder we need to create an app for backend and test page where we can text communicator logic.
2. Deploy somewhere and test it on mobile device/different OS.
3. Integrate AUTH checks and integrate inside the app (webApp/src/features/Conversation/useAiConversation/useAiConversation.tsx). Figure out on how to connect real app with realtime module.
