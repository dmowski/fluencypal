import { getDB } from '@/app/api/config/firebase';
import { loadSpeakingProfile } from './access';
import { deleteSpeakingAudio } from './storage';
import { recountRecentMessages } from './rooms';

const DELETED_NAME = 'Deleted member';

const likeMap = (value: unknown): Record<string, true> => {
  if (!value || typeof value !== 'object') return {};
  const likes: Record<string, true> = {};
  for (const [userId, liked] of Object.entries(value as Record<string, unknown>)) {
    if (liked) likes[userId] = true;
  }
  return likes;
};

/** Removes this person's voice from rooms. Their FluencyPal account can stay. */
export const deleteSpeakingData = async (userId: string): Promise<void> => {
  const rooms = await getDB().collection('speakingRooms').limit(200).get();
  for (const room of rooms.docs) {
    const ownMessages = await room.ref.collection('messages').where('senderId', '==', userId).get();
    for (const item of ownMessages.docs) {
      const data = item.data();
      if (data.kind === 'join') {
        await item.ref.set({ senderName: DELETED_NAME, senderAvatarUrl: '' }, { merge: true });
        continue;
      }
      if (typeof data.audioPath === 'string') await deleteSpeakingAudio(data.audioPath);
      await item.ref.delete();
    }

    const liked = await room.ref.collection('messages').limit(300).get();
    for (const item of liked.docs) {
      const likes = likeMap(item.data().likes);
      if (!likes[userId]) continue;
      delete likes[userId];
      await item.ref.set({ likes, likeCount: Object.keys(likes).length }, { merge: true });
    }

    const memberRef = room.ref.collection('members').doc(userId);
    const member = await memberRef.get();
    if (member.exists) {
      const intro = member.data()?.introAudioPath;
      if (typeof intro === 'string') await deleteSpeakingAudio(intro);
      await memberRef.delete();
      const approved = await room.ref
        .collection('members')
        .where('status', '==', 'approved')
        .count()
        .get();
      await room.ref.set({ memberCount: approved.data().count }, { merge: true });
    }
    await recountRecentMessages(room.id).catch((error) => {
      console.error('Could not recount a room after voice deletion', error);
    });
  }

  try {
    const notes = await getDB()
      .collectionGroup('appNotifications')
      .where('actorId', '==', userId)
      .limit(100)
      .get();
    await Promise.all(
      notes.docs.map((note) => note.ref.set({ actorName: DELETED_NAME }, { merge: true })),
    );
  } catch (error) {
    console.error('Could not rename voice chat notes', error);
  }

  await getDB().collection('users').doc(userId).set({ speakingBio: '' }, { merge: true });
};

export const exportSpeakingData = async (userId: string) => {
  const profile = await loadSpeakingProfile(userId);
  const rooms = await getDB().collection('speakingRooms').limit(200).get();
  const memberships: object[] = [];
  const messages: object[] = [];
  const likes: object[] = [];
  for (const room of rooms.docs) {
    const title = typeof room.data().title === 'string' ? room.data().title : room.id;
    const member = await room.ref.collection('members').doc(userId).get();
    if (member.exists) {
      const data = member.data() || {};
      memberships.push({
        roomId: room.id,
        title,
        status: data.status || '',
        introTranscript: typeof data.introTranscript === 'string' ? data.introTranscript : '',
        requestedAtIso: typeof data.requestedAtIso === 'string' ? data.requestedAtIso : '',
      });
    }
    const own = await room.ref.collection('messages').where('senderId', '==', userId).get();
    own.docs.forEach((item) => {
      const data = item.data();
      if (data.kind === 'join') return;
      messages.push({
        roomId: room.id,
        title,
        createdAtIso: data.createdAtIso || '',
        durationSec: data.durationSec || 0,
        transcript: data.transcript || '',
        correctedTranscript: data.correctedTranscript || '',
      });
    });
    const roomMessages = await room.ref.collection('messages').limit(300).get();
    roomMessages.docs.forEach((item) => {
      const liked = item.data().likes;
      if (liked && typeof liked === 'object' && (liked as Record<string, unknown>)[userId]) {
        likes.push({
          roomId: room.id,
          messageId: item.id,
          createdAtIso: item.data().createdAtIso || '',
        });
      }
    });
  }
  return {
    exportedAtIso: new Date().toISOString(),
    bio: profile.bio,
    memberships,
    messages,
    likes,
  };
};
