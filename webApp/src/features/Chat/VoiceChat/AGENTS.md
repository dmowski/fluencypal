# Voice Chat Feature

## Overview

Voice Chat should be a place to safe and comfortable space for talking about anything around limited number of people.

## Feature principle:

No text transcripts, no option to write text.
When listen, ability to to rewind and see visualization

## UI

On dashboard, let's create a card called "Voice chat with people"
webApp/src/features/Dashboard/Dashboard.tsx
Use this image as preview
https://storage.googleapis.com/dark-lang.firebasestorage.app/uploadedImages%2FMq2HfU3KrXTjNyOpPXqHSPg5izV2%2F1785015399032-Mq2HfU3KrXTjNyOpPXqHSPg5izV2.png

Use webApp/src/features/uiKit/Card/StoreCard/StoreCard.tsx without items,
On new users, in children of StoreCard.tsx we should see to required action items needed to done

1. Be paid user
2. Record audio about yourself about 3 mins
3. Get approve

Near each point we need to add info section with description of why it's needed.

Add button with "Rules of chat". Add mention that messages are removing after some days.

## Play user message

Create a custom audio player what allows to rewind, pause, restart and see progress of playing audio.
When finishing one message, start another message.

## Recording message

Use VoiceVisualizer to show user's recording. Alow user to re listen it before sending.

## Reply functionality

Near each message, show the button "Record Reply", after clicking on it, the recording will start and after finishing recording it will be option to listen and send.

## Remove my message

On my messages, there's should be a button "Remove" my message. In case it there's some replies, remove them too. Remove audio files from storage as well.

## Remove old messages

Create a cron job that removes messages older that 4 days.

## Notifications

On dashboard card show number of new messages(un listened). When user pass onboarding.

## Onboarding

How to ask to introduce yourself: highlight the first messages. "Send you first 'Hello'"

## PayWall

On dashboard card, as required step show button "Start" near "be paid" label. When user click on it, show paywall.

## Approves

By default, only founder can approve new joiners.
Send telegram notification when someone requested the access. And on UI, show list of request with buttons "Approve" and "Reject". On both cases, show it to users on the page in "VoiceChatDashboardCard children content".
But create placeholder/technical possibility to set multiple number of approvers.

## Feature flag

For the beginning, hide that feature (from dashboard) for all users but founder (webApp/src/features/Auth/useAuth.tsx isFounder).

## Technical notes

Add necessary types here
webApp/src/features/Chat/VoiceChat/types.ts

Make separate space for voice chat
webApp/firestore.rules

Ensure it provide good safety: Unpaid users (or none game winners), users without approve, should not be able to listen other messages data. It might be challenging to create such firestore rules. To simplify that you can do this: create backend function that validates data. You can create a separate function for paid users and separate function for game winner.

endpoint: validate game rate function: call it when someone became a new top-5 winner. and it updates dedicated collection for game winners.

endpoint: validate paid users: call it when someone bought subscription (or daily with cron): this function will check all users (or user how requested it), and updated dedicated true/false collection.

In general voice chat feature should be more or less independent from other chat related feature on the app.

Places all code inside
webApp/src/features/Chat/VoiceChat. for backend endpoints use tight files that calls functions that places inside webApp/src/features/Chat/VoiceChat/backend

## Testing coverage

Utilize e2e tests to validate functionality. Avoid mocking something (except paid/unpaid users) and sending telegram messages.

# Implementation steps

Need to research and create a steps
