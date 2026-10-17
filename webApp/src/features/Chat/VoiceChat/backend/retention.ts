import { getDB } from '@/app/api/config/firebase';
import { recountRecentMessages } from './rooms';
import { deleteSpeakingAudio } from './storage';

const weekAgoIso = (): string => new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();

const introCutoffIso = (): string => new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();

/** Deletes expired recordings. Room messages last 7 days. Introduction audio lasts 30 days after a decision. */
export const purgeExpiredSpeakingData = async (): Promise<{ messages: number; intros: number }> => {
  let messages = 0;
  let intros = 0;
  const rooms = await getDB().collection('speakingRooms').limit(100).get();
  const week = weekAgoIso();
  const introCutoff = introCutoffIso();
  for (const room of rooms.docs) {
    while (messages < 200) {
      const old = await room.ref
        .collection('messages')
        .where('createdAtIso', '<', week)
        .limit(40)
        .get();
      if (old.empty) break;
      for (const item of old.docs) {
        const audioPath = item.data().audioPath;
        if (typeof audioPath === 'string') await deleteSpeakingAudio(audioPath);
        await item.ref.delete();
        messages += 1;
      }
      if (old.size < 40) break;
    }
    if (intros < 80) {
      const decided = await room.ref
        .collection('members')
        .where('decidedAtIso', '<', introCutoff)
        .limit(20)
        .get();
      for (const member of decided.docs) {
        const audioPath = member.data().introAudioPath;
        if (typeof audioPath !== 'string' || !audioPath) continue;
        await deleteSpeakingAudio(audioPath);
        const stillInRoom = member.data().status === 'approved';
        await member.ref.set(
          {
            introAudioPath: '',
            ...(stillInRoom ? {} : { introTranscript: '', introSuggestion: '', description: '' }),
          },
          { merge: true },
        );
        intros += 1;
      }
    }
    await recountRecentMessages(room.id).catch((error) => {
      console.error('Could not recount a room after retention', error);
    });
  }
  return { messages, intros };
};
