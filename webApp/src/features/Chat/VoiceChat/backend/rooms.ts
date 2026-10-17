import { getDB } from '@/app/api/config/firebase';
import { SupportedLanguage, supportedLanguages } from '@/features/Lang/lang';
import { DocumentData } from 'firebase-admin/firestore';
import { isRoomSlug, slugifyRoomTitle } from '../slug';
import {
  PublicSpeakingClub,
  RoomDraft,
  RoomListItem,
  RoomMembershipStatus,
  RoomReviewMode,
  SpeakingRoom,
} from '../types';
import { isAlexAccount } from './access';
import { SpeakingClubError } from './http';

const rooms = () => getDB().collection('speakingRooms');

const asReviewMode = (value: unknown): RoomReviewMode =>
  value === 'alexOnly' ? 'alexOnly' : 'allMembers';

const asLanguage = (value: unknown): SupportedLanguage =>
  supportedLanguages.includes(value as SupportedLanguage) ? (value as SupportedLanguage) : 'en';

export const toSpeakingRoom = (id: string, data: DocumentData): SpeakingRoom => ({
  id,
  slug: typeof data.slug === 'string' ? data.slug : id,
  title: typeof data.title === 'string' ? data.title : 'Room',
  subtitle: typeof data.subtitle === 'string' ? data.subtitle : '',
  previewImageUrl: typeof data.previewImageUrl === 'string' ? data.previewImageUrl : '',
  reviewMode: asReviewMode(data.reviewMode),
  joinPromptMarkdown: typeof data.joinPromptMarkdown === 'string' ? data.joinPromptMarkdown : '',
  isPublic: data.isPublic === true,
  rulesMarkdown: typeof data.rulesMarkdown === 'string' ? data.rulesMarkdown : '',
  discussMarkdown: typeof data.discussMarkdown === 'string' ? data.discussMarkdown : '',
  languageCode: asLanguage(data.languageCode),
  creatorId: typeof data.creatorId === 'string' ? data.creatorId : '',
  createdAtIso: typeof data.createdAtIso === 'string' ? data.createdAtIso : '',
  updatedAtIso: typeof data.updatedAtIso === 'string' ? data.updatedAtIso : '',
  memberCount: typeof data.memberCount === 'number' ? data.memberCount : 0,
  messagesLast7Days: typeof data.messagesLast7Days === 'number' ? data.messagesLast7Days : 0,
});

export const toPublicClub = (room: SpeakingRoom): PublicSpeakingClub => ({
  slug: room.slug,
  title: room.title,
  subtitle: room.subtitle,
  previewImageUrl: room.previewImageUrl,
  reviewMode: room.reviewMode,
  joinPromptMarkdown: room.joinPromptMarkdown,
  rulesMarkdown: room.rulesMarkdown,
  discussMarkdown: room.discussMarkdown,
  languageCode: room.languageCode,
  memberCount: room.memberCount,
  messagesLast7Days: room.messagesLast7Days,
});

const isPictureUrl = (value: string): boolean => {
  try {
    const url = new URL(value);
    return (url.protocol === 'https:' || url.protocol === 'http:') && value.length <= 800;
  } catch {
    return false;
  }
};

export const assertRoomInput = (input: RoomDraft): void => {
  if (input.title.trim().length < 2) throw new SpeakingClubError('Add a room name.');
  if (input.subtitle.trim().length < 2) throw new SpeakingClubError('Add a short description.');
  if (!isPictureUrl(input.selectedPreviewUrl)) {
    throw new SpeakingClubError('Choose a picture for the room.');
  }
  if (input.joinPromptMarkdown.trim().length < 10) {
    throw new SpeakingClubError('Tell people what to say in their introduction.');
  }
};

const uniqueSlug = async (title: string): Promise<string> => {
  const base = slugifyRoomTitle(title);
  for (let index = 0; index < 20; index += 1) {
    const candidate = index === 0 ? base : `${base}-${index + 1}`;
    const snap = await rooms().doc(candidate).get();
    if (!snap.exists) return candidate;
  }
  throw new SpeakingClubError('Try a different room name.');
};

export const createSpeakingRoom = async (params: {
  creatorId: string;
  username: string;
  avatarUrl: string;
  input: RoomDraft;
}): Promise<SpeakingRoom> => {
  assertRoomInput(params.input);
  const slug = await uniqueSlug(params.input.title);
  const now = new Date().toISOString();
  const room: SpeakingRoom = {
    id: slug,
    slug,
    title: params.input.title.trim(),
    subtitle: params.input.subtitle.trim(),
    previewImageUrl: params.input.selectedPreviewUrl,
    reviewMode: params.input.reviewMode,
    joinPromptMarkdown: params.input.joinPromptMarkdown.trim(),
    isPublic: params.input.isPublic,
    rulesMarkdown: params.input.rulesMarkdown.trim(),
    discussMarkdown: params.input.discussMarkdown.trim(),
    languageCode: params.input.languageCode,
    creatorId: params.creatorId,
    createdAtIso: now,
    updatedAtIso: now,
    memberCount: 1,
    messagesLast7Days: 0,
  };
  const ref = rooms().doc(slug);
  await ref.set(room);
  await ref.collection('members').doc(params.creatorId).set({
    userId: params.creatorId,
    status: 'approved',
    username: params.username,
    avatarUrl: params.avatarUrl,
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
  return room;
};

export const updateSpeakingRoom = async (params: {
  roomId: string;
  actorId: string;
  actorEmail: string | null;
  input: RoomDraft;
}): Promise<SpeakingRoom> => {
  assertRoomInput(params.input);
  const ref = rooms().doc(params.roomId);
  const snap = await ref.get();
  if (!snap.exists) throw new SpeakingClubError('That room is not here.', 404);
  const current = toSpeakingRoom(snap.id, snap.data() || {});
  const isAdmin =
    current.creatorId === params.actorId ||
    isAlexAccount({ uid: params.actorId, email: params.actorEmail });
  if (!isAdmin) throw new SpeakingClubError('Only the room host can change these settings.', 403);
  const next: SpeakingRoom = {
    ...current,
    title: params.input.title.trim(),
    subtitle: params.input.subtitle.trim(),
    previewImageUrl: params.input.selectedPreviewUrl,
    reviewMode: params.input.reviewMode,
    joinPromptMarkdown: params.input.joinPromptMarkdown.trim(),
    isPublic: params.input.isPublic,
    rulesMarkdown: params.input.rulesMarkdown.trim(),
    discussMarkdown: params.input.discussMarkdown.trim(),
    languageCode: params.input.languageCode,
    updatedAtIso: new Date().toISOString(),
  };
  await ref.set(next);
  return next;
};

export const getSpeakingRoom = async (roomId: string): Promise<SpeakingRoom | null> => {
  if (!isRoomSlug(roomId)) return null;
  const snap = await rooms().doc(roomId).get();
  if (!snap.exists) return null;
  return toSpeakingRoom(snap.id, snap.data() || {});
};

const weekAgoIso = (): string => new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();

export const recountRecentMessages = async (roomId: string): Promise<number> => {
  const snap = await rooms()
    .doc(roomId)
    .collection('messages')
    .where('createdAtIso', '>=', weekAgoIso())
    .count()
    .get();
  const count = snap.data().count;
  await rooms().doc(roomId).set({ messagesLast7Days: count }, { merge: true });
  return count;
};

export const listRoomsForUser = async (params: {
  userId: string;
  email: string | null;
}): Promise<RoomListItem[]> => {
  const snap = await rooms().orderBy('createdAtIso', 'desc').limit(100).get();
  const items = await Promise.all(
    snap.docs.map(async (doc) => {
      const room = toSpeakingRoom(doc.id, doc.data());
      const [memberSnap, readSnap, previewSnap] = await Promise.all([
        doc.ref.collection('members').doc(params.userId).get(),
        getDB()
          .collection('users')
          .doc(params.userId)
          .collection('speakingRoomReads')
          .doc(doc.id)
          .get(),
        doc.ref.collection('members').where('status', '==', 'approved').limit(5).get(),
      ]);
      const status = memberSnap.exists ? (memberSnap.data()?.status as RoomMembershipStatus) : null;
      const unreadCount =
        status === 'approved' && typeof readSnap.data()?.unreadCount === 'number'
          ? readSnap.data()?.unreadCount
          : 0;
      return {
        room,
        unreadCount,
        membershipStatus: status,
        isAdmin:
          room.creatorId === params.userId ||
          isAlexAccount({ uid: params.userId, email: params.email }),
        memberPreviews: previewSnap.docs.map((memberDoc) => {
          const data = memberDoc.data();
          return {
            userId: memberDoc.id,
            username: typeof data.username === 'string' ? data.username : 'Learner',
            avatarUrl: typeof data.avatarUrl === 'string' ? data.avatarUrl : '',
          };
        }),
      } satisfies RoomListItem;
    }),
  );
  return items;
};

export const listPublicClubs = async (): Promise<PublicSpeakingClub[]> => {
  const snap = await rooms().where('isPublic', '==', true).limit(100).get();
  return snap.docs
    .map((doc) => toPublicClub(toSpeakingRoom(doc.id, doc.data())))
    .sort((a, b) => a.title.localeCompare(b.title));
};

export const getPublicClub = async (slug: string): Promise<PublicSpeakingClub | null> => {
  const room = await getSpeakingRoom(slug);
  if (!room || !room.isPublic) return null;
  return toPublicClub(room);
};
