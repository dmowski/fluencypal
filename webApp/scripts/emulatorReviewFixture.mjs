#!/usr/bin/env node
/**
 * Rooms with a person waiting for review. Requires `pnpm dev`.
 *
 *   cd webApp && pnpm emulator:review-fixture
 *
 * Alex only:  /?voiceChat=true&voiceRoom=review-alex&voiceRoomTab=members
 * Whole room: /?voiceChat=true&voiceRoom=review-together&voiceRoomTab=members
 *
 * Safe to run again. The free user goes back to "waiting".
 */
import { getFirestore } from 'firebase-admin/firestore';
import { ensurePersona } from './emulatorPersonas.mjs';

const pendingMember = (user, now) => ({
  userId: user.uid,
  status: 'pending',
  username: user.displayName,
  avatarUrl: '',
  description: 'I am learning and I would like to join this room.',
  introAudioPath: '',
  introTranscript: 'I am learning and I would like to join this room.',
  introSuggestion: '',
  introDurationSec: 12,
  requestedAtIso: now,
  approvals: {},
});

const approvedMember = (user, now) => ({
  userId: user.uid,
  status: 'approved',
  username: user.displayName,
  avatarUrl: '',
  description: '',
  introAudioPath: '',
  introTranscript: '',
  introSuggestion: '',
  introDurationSec: 0,
  requestedAtIso: now,
  decidedAtIso: now,
  lastOnlineIso: now,
  approvals: {},
});

const roomDoc = (id, title, reviewMode, creatorId, memberCount, now) => ({
  id,
  slug: id,
  title,
  subtitle: 'A room for trying the review buttons',
  previewImageUrl: '',
  reviewMode,
  joinPromptMarkdown: 'Tell us a little about yourself.',
  isPublic: false,
  rulesMarkdown: 'Listen to the whole message before you answer.',
  discussMarkdown: 'We talk about everyday things.',
  languageCode: 'en',
  creatorId,
  createdAtIso: now,
  updatedAtIso: now,
  memberCount,
  messagesLast7Days: 0,
});

const main = async () => {
  const alex = await ensurePersona('alex');
  const full = await ensurePersona('full');
  const free = await ensurePersona('free');
  const db = getFirestore();
  const now = new Date().toISOString();

  const rooms = [
    {
      id: 'review-alex',
      title: 'Review Alex',
      reviewMode: 'alexOnly',
      hosts: [alex],
    },
    {
      id: 'review-together',
      title: 'Review Together',
      reviewMode: 'allMembers',
      hosts: [alex, full],
    },
  ];

  for (const room of rooms) {
    const ref = db.collection('speakingRooms').doc(room.id);
    await ref.set(roomDoc(room.id, room.title, room.reviewMode, alex.uid, room.hosts.length, now));
    for (const host of room.hosts) {
      await ref.collection('members').doc(host.uid).set(approvedMember(host, now));
    }
    await ref.collection('members').doc(free.uid).set(pendingMember(free, now));
  }

  console.log(
    JSON.stringify(
      {
        alex: { email: alex.email, password: alex.password, signIn: alex.signIn },
        full: { email: full.email, password: full.password, signIn: full.signIn },
        free: { email: free.email, password: free.password, signIn: free.signIn },
        waitingUserId: free.uid,
        rooms: rooms.map((room) => ({
          id: room.id,
          reviewMode: room.reviewMode,
          url: `http://localhost:3000/?voiceChat=true&voiceRoom=${room.id}&voiceRoomTab=members`,
        })),
      },
      null,
      2,
    ),
  );
};

main().catch((error) => {
  console.error(error.message || error);
  process.exit(1);
});
