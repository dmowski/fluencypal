# Voice chat — security and GDPR review

Reviewed 17 Oct 2026. Check an item only when the fix is in the code and the leftover data from the old behavior is gone.

- [x] already handled
- [ ] still open

Voice here is personal data. A transcript is the same conversation in text. An introduction is personal data too, and it is kept longer than a room message. OpenAI transcribes the audio (`gpt-4o-transcribe`) and writes the clearer version. OpenAI also draws the room picture from the room name and description. Email goes out through Resend. Files sit in Firebase Storage. None of that is named in the voice-chat screens.

## Already handled

- [x] Audio files are not public. `storage.rules` denies every path by default, and `speakingClubs/audio/…` has no allow rule. Playback goes through the API.
- [x] Message audio requires an approved member (`messages/[messageId]/audio`).
- [x] Introduction audio is limited to the speaker and someone who can review that room (`members/[userId]/audio`).
- [x] Clients cannot write rooms, members, or messages. Firestore writes are `false`. The Admin SDK writes them.
- [x] The public speaking-club API returns the room text, language, and counts. It does not return messages, transcripts, or member names.
- [x] `speakingBio` and notification settings live on `users/{uid}`. Other people cannot read that document.
- [x] In-app notes, read markers, and per-room notification choices are readable only by that user.
- [x] Browser and email notes say that a message exists. They do not include the transcript.
- [x] Deleting your own message also deletes its audio file.
- [x] The message menu is disabled for someone who has not joined, so the transcript button is not on screen. That does not hide the text. See the first open item.

## Open

### 1. Anyone signed in can read every transcript

- [x] Fixed

Visitors still see the preview (name, length, waves, like count) from the room API, and that preview refreshes every 20 seconds. People in the room still get new messages immediately. A private room stays in the signed-in list, because the checkbox is about the public website, not about hiding the room from people who already use FluencyPal. The likes map stays on the message document, and only members of that room can read it.

`firestore.rules` allows `read` on `speakingRooms/{roomId}`, `members`, and `messages` for every signed-in user. The room API does the same: `GET /api/speaking-clubs/{roomId}` returns full messages, including `transcript`, `correctedTranscript`, and `audioPath`, whether or not the caller has joined. `useLiveRoomMessages` subscribes to that collection for every open room, including a visitor.

The menu button does not matter. The text is in the Firestore listener and in the JSON response. A private room is not private either: `isPublic` only keeps it off the marketing site. `listRoomsForUser` still returns every room, and the rules let someone open a room they were never invited to.

The `likes` map on each message is a list of user ids. The API only sends a count, but the listener receives the map.

Member documents hold the introduction transcript, the suggestion, and the audio path for pending, rejected, and approved people. The API hides those fields from someone who cannot review. The client rules do not.

**Fix**

- Deny client reads of room documents and member documents. The app already loads those through the API.
- Allow a message read only when `speakingRooms/{roomId}/members/{uid}.status == 'approved'`.
- Start `useLiveRoomMessages` only for an approved member. A visitor keeps using the room API.
- Add a preview shape for everyone else: sender name, duration, like count, time, and `kind`. Omit transcript, corrected transcript, audio path, and the likes map.
- Use that preview in `listRoomMessages` when the viewer is not approved.
- Keep introduction fields out of the client. If the API still needs them, store them on `members/{userId}/intro/recording` and never return that document except to the speaker and a reviewer.

### 2. Deleting an account leaves the voice behind

- [x] Fixed

Deleting an account, or "Delete my voice data" in My profile, removes the recordings. The account itself stays when they only delete voice data. Removing someone from a room also deletes their introduction.

`POST /api/deleteAccount` deletes the user document (and its subcollections) and the Auth user. It does not touch `speakingRooms`. Messages, audio, introductions, likes, join lines, and other people's notification notes stay, still tied to the old uid and display name.

`removeRoomMember` only sets `status: rejected`. The introduction file and transcript stay. Sending a new introduction overwrites the file at `intros/{uid}` and can replace a recording that is already waiting for review.

**Fix**

- Add `deleteSpeakingData(userId)` and call it from account deletion before the Auth user is removed.
- Delete every message whose `senderId` is that user, and delete the audio.
- Delete introduction audio, then delete or anonymize every member document for that user.
- Remove that uid from `likes` and recompute `likeCount`.
- Replace the name on join lines and notification notes with "Deleted member", or delete those notes.
- Clear `speakingBio` with the user document (already happens if the user doc is deleted).
- On "remove from the room", delete the introduction audio and the transcript fields, not only the status.
- On a new introduction, delete the previous file if the path changed, and reject the upload when a request is already pending.

### 3. Room text is rendered as HTML on the public site

- [x] Fixed

Markdown such as bold and lists still works. Raw HTML does not. Room pictures have to be ones we generated. The email text is escaped.

Room rules, the topic, and the introduction prompt go through `markdown-to-jsx` in the app (`JoinRoomView`) and on the public speaking-club page (`landing`). Raw HTML is left on. A person who can edit a public room can put markup in those fields and it runs for anyone who opens the page.

The room picture is any `http` or `https` URL, then dropped into CSS `url(...)`. A URL that contains `)` can break out of that value. The browser then requests whatever the extra CSS points at.

Email HTML is built by string concat in `emailNote`. The room title and the sender name are not escaped.

**Fix**

- Turn on `disableParsingRawHTML` for these fields, or sanitize before render. Do this in both apps.
- Accept a preview URL only when it is one of the URLs just returned by `generateRoomPreviewUrls` (our own image host). Escape it before putting it in CSS.
- Escape text that goes into `messageHtml`.

### 4. A recording is stored before the server knows you may send it

- [x] Fixed

Limits are wide enough for a real conversation: 40 messages an hour, 6 introductions an hour, 5 new rooms a day. A browser that omits the audio type is treated as WebM. A long file is not stored as one second.

`POST …/messages` saves the file, then `createRoomMessage` checks membership. A person who has not joined still gets an object under `speakingClubs/audio/{roomId}/messages/`. The same happens for an introduction that is then rejected as too short, already pending, or already approved.

The content type is whatever the browser sent, and the audio route plays it back with that type. There is no allow-list and no `nosniff` header. There is no limit on how often someone can upload a 15 MB file, and no limit on how many rooms one account can create. A public room emails up to 100 people who opted into new rooms.

`readDuration` trusts the form field, so the stored length can be unrelated to the file.

**Fix**

- Check membership, pending state, and size before `saveSpeakingAudio`. Delete the file if the following write fails.
- Allow only `audio/webm`, `audio/ogg`, `audio/mp4`, `audio/mpeg`, and `audio/wav`. Serve those with `X-Content-Type-Options: nosniff`.
- Cap uploads per user (for example a few introductions and messages per hour) and cap room creation.
- Read duration from the decoded file, or ignore the client value when it is far from the file size.

### 5. "Seven days" is not actually enforced

- [x] Fixed

The live query and the API only read the last 7 days. An hourly job deletes older messages and, 30 days after a decision, the introduction recording. The short introduction text stays for people in the room, so "First intro message" still works. Rejected introductions lose that text too.

`dropOldMessages` runs only when someone lists a room through the API, and it deletes at most 30 documents. The live query has no date filter, so the browser downloads older messages and then hides them. If nobody opens the room, the audio and text stay.

Introduction audio has no retention at all.

**Fix**

- Query messages with `createdAtIso >= seven days ago` in both the API and the listener.
- Run a scheduled delete that pages through every room, deletes the documents, and deletes the audio, until none are left.
- Decide a retention for introductions (for example 30 days after a decision, immediately on erasure) and apply it in the same job.

### 6. People cannot export or fully erase their own voice

- [x] Fixed

Download and delete sit under My profile, away from Save. Delete asks for a second click. Report is a menu item for people in the room, with an optional note, and Alex gets an email. The host can remove someone else's message. Reviews are saved in a transaction.

A member can delete one of their own messages. They cannot download everything the room holds about them, delete every message at once, delete their introduction, or remove their bio from copies stored on member documents (`description` is the introduction text, cut to 280 characters).

There is no report and no block. The host can remove a person from the room and cannot remove that person's messages. A room in "everyone reviews" mode also has no way to take down a message that breaks the room rules.

`decideJoinRequest` writes the whole member document without a transaction. Two reviews at once can drop one decision.

**Fix**

- `GET /api/speaking-clubs/me/export` returns the bio, memberships, introductions, messages, and likes as a file for the signed-in user.
- `DELETE /api/speaking-clubs/me` runs the same cleanup as account deletion for this feature only.
- Let the host and Alex delete any message in the room. Record who deleted it and when, without keeping the audio.
- Add "Report" on a message and on a person. Store the report for Alex, and keep the reporter's id only as long as the report is open.
- Wrap the review write in a transaction that re-reads `approvals` before saving.

### 7. Alex can be impersonated by an unverified email

- [x] Fixed

Server checks use only the founder user id. The button on the practice page can still look at the email, because that only hides a button.

`isAlexAccount` is true when the uid is Alex's, or when the token's `email` is `dmowski.alex@gmail.com`. `verifyIdToken` does not check `email_verified`. The email claim is enough to review rooms, change room settings, and remove members.

**Fix**

- Trust only `SPEAKING_CLUB_FOUNDER_UID`.
- If the email check stays, require `decodedToken.email_verified === true` as well.

### 8. No notice, and no child gate, at the point of recording

- [x] Fixed

The notice is a short line next to Record and on the join form, with a link to the privacy policy. It does not block browsing the room. A child account that still needs a parent does not get the voice chat modal. The practice page already shows the parent screen before that. The privacy policy now has a speaking-club section.

The join screen explains the topic and the rules. It does not say that the recording is stored, transcribed by OpenAI, shown to the people who review the room, and then heard by members. Room messages do not say they are kept for seven days and then deleted. The privacy policy is not linked from this flow.

The rest of the app can require a parent before voice is used. Voice chat does not check that. A child account that can open the practice page can record, and that audio goes to OpenAI and to other people.

**Fix**

- Before the first introduction or room message, show a short notice: what is stored, who hears it, that OpenAI transcribes it, how long it stays, and a link to the privacy policy. Keep a `voiceConsentAtIso` on the user when they continue.
- Reuse the existing parental-consent block. If consent is still required, do not open voice chat.
- Add the same facts to the privacy policy: purpose, OpenAI, Resend, Firebase, seven-day messages, longer-lived introductions, and how to export or delete.

## Suggested order

1. Close client reads and strip the visitor payload (item 1).
2. Stop trusting the email claim (item 7).
3. Stop storing files before the check, and lock the content type (item 4).
4. Stop rendering raw HTML and untrusted picture URLs (item 3).
5. Make account deletion and "remove me" actually delete voice (items 2 and 6).
6. Enforce the seven-day delete on a schedule (item 5).
7. Add the notice, the child gate, export, and report (items 6 and 8).
