# Voice Chat

Voice rooms inside the practice app. People record messages. They do not type in the room.

## Product rules

| Topic               | Decision                                                                                                                                                          |
| ------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Rooms               | Many rooms. A person creates one from the room list.                                                                                                              |
| Joining             | A short spoken introduction is reviewed before the person can speak.                                                                                              |
| Review              | Either everyone already in the room, or Alex.                                                                                                                     |
| Messages            | A flat list. Voice only. A clearer version is shown before send.                                                                                                  |
| Public rooms        | Listed at `https://www.fluencypal.com/speaking-club` and `/speaking-club/{slug}`.                                                                                 |
| Missing public room | HTTP 404 with a note and the other public rooms, so old links stay useful.                                                                                        |
| Notifications       | Browser, email, and in-app. A room can only make the main settings quieter. New rooms are off until someone turns them on. Quiet hours silence browser and email. |
| Admins              | The person who created the room, and Alex.                                                                                                                        |

## Architecture

```
webApp/src/features/Chat/VoiceChat/
├── VoiceChatModal.tsx
├── SpeakingNotificationSettings.tsx
├── SpeakingBrowserNotifications.tsx
├── api/speakingClubClient.ts
├── backend/
└── components/
```

API routes under `webApp/src/app/api/speaking-clubs/*` stay thin.

Firestore writes go through the Admin SDK. A signed-in client may subscribe to messages only after they have joined that room. Room documents, member documents, transcripts for visitors, and audio files stay on the server.

| Path                                          | Purpose                     |
| --------------------------------------------- | --------------------------- |
| `speakingRooms/{roomId}`                      | Room settings and counts    |
| `speakingRooms/{roomId}/members/{userId}`     | Membership and introduction |
| `speakingRooms/{roomId}/messages/{messageId}` | Voice messages              |
| `users/{uid}/appNotifications/{id}`           | In-app notes                |
| `users/{uid}/speakingRoomReads/{roomId}`      | Unread count                |
| `users/{uid}.speakingNotifications`           | Main notification choices   |

Private audio lives under `speakingClubs/audio/…`.

## UI entry

- Practice dashboard group card: **Request a call** and **Open voice chat**.
- After the signed-in request form is sent, **Open voice chat** is offered.
- Modal: `?voiceChat=true`. A room: `?voiceRoom={slug}`. Anonymous visitors do not see it.
- Avatars and usernames come from the game. A bio is `users/{uid}.speakingBio`.
- Visitors see the last 7 days as a preview: name, length, and like count. They do not get the transcript or the recording. The preview refreshes every 20 seconds.
- An approved member listens to `speakingRooms/{roomId}/messages`, so a message from someone else shows up immediately. Audio is fetched only for approved members.
- Messages older than 7 days are deleted when the room is opened and by the hourly `/api/speaking-clubs/retention` job. Introduction audio is deleted 30 days after a decision.
- My profile can download a text file of your voice data, or delete it. Deleting the FluencyPal account deletes it too.
- Notification settings: `?voiceNotifications=true`. Profile tab: `?voiceSettings=profile`.
- Room settings tab: `?voiceRoomTab=settings|notifications|members`. Pending reviews open `members`.
- The review email uses that People link: `voiceChat=true&voiceRoom={slug}&voiceRoomTab=members`.

## Testing

Browser checks that need Auth and Firestore: `webApp/EMULATOR_TESTING.md`.

`pnpm emulator:review-fixture` puts a waiting person in `review-alex` (Alex only) and `review-together` (everyone in the room). Sign in as Alex, open the People tab, and use **Welcome them**.

```bash
cd webApp && pnpm lint
cd webApp && pnpm test:unit -- --testPathPattern=VoiceChat/notificationRules
cd webApp && pnpm exec vitest --config vitest.browser.config.ts --run src/features/Chat/VoiceChat/VoiceChat.browser.test.tsx
cd webApp && pnpm exec playwright test e2e/voice-chat/shell.spec.ts
```

Landing pages:

```bash
cd landing && pnpm lint
cd landing && pnpm test:unit -- src/app/api/sitemap/generateSitemap.test.ts
```

## Copy

User-facing strings use `i18n._()`. Run `pnpm lang` from `webApp/` after changing them.
