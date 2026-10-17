import { getDB } from '@/app/api/config/firebase';
import { sendEmail } from '@/app/api/email/sendEmail';
import { FieldValue } from 'firebase-admin/firestore';
import { allowsSpeakingNotification } from '../notificationRules';
import { AppNotification, ReviewDecision, RoomMember, SpeakingRoom } from '../types';
import { SPEAKING_CLUB_FOUNDER_UID } from '../types';
import { loadRoomNarrowing, loadSpeakingProfile, SpeakingProfile } from './access';
import { listRoomMembers } from './members';

const notifications = (userId: string) =>
  getDB().collection('users').doc(userId).collection('appNotifications');

const reads = (userId: string) =>
  getDB().collection('users').doc(userId).collection('speakingRoomReads');

const writeNote = async (
  userId: string,
  note: Omit<AppNotification, 'id' | 'read'>,
): Promise<void> => {
  const ref = notifications(userId).doc();
  await ref.set({ ...note, read: false });
};

const emailNote = async (profile: SpeakingProfile, title: string, body: string): Promise<void> => {
  if (!profile.email || !profile.emailAllowedByApp) return;
  try {
    await sendEmail({
      emailTo: profile.email,
      title,
      messageText: body,
      messageHtml: `<p>${body}</p><p><a href="https://app.fluencypal.com/practice?voiceChat=true">Open voice chat</a></p>`,
    });
  } catch (error) {
    console.error('Speaking club email failed', error);
  }
};

const deliver = async (params: {
  userId: string;
  roomId: string | null;
  kind: 'newMessages' | 'reviewJoiners' | 'newRooms';
  note: Omit<AppNotification, 'id' | 'read'>;
  emailTitle: string;
  emailBody: string;
}): Promise<void> => {
  const profile = await loadSpeakingProfile(params.userId);
  const narrowing = params.roomId ? await loadRoomNarrowing(params.userId, params.roomId) : null;
  if (
    allowsSpeakingNotification({
      prefs: profile.prefs,
      narrowing,
      transport: 'inApp',
      kind: params.kind,
    })
  ) {
    await writeNote(params.userId, params.note);
  }
  if (
    allowsSpeakingNotification({
      prefs: profile.prefs,
      narrowing,
      transport: 'email',
      kind: params.kind,
    })
  ) {
    await emailNote(profile, params.emailTitle, params.emailBody);
  }
};

export const notifyNewMessage = async (params: {
  room: SpeakingRoom;
  senderId: string;
  senderName: string;
}): Promise<void> => {
  const members = (await listRoomMembers(params.room.id)).filter(
    (member) => member.status === 'approved' && member.userId !== params.senderId,
  );
  await Promise.all(
    members.map(async (member) => {
      await reads(member.userId)
        .doc(params.room.id)
        .set({ unreadCount: FieldValue.increment(1) }, { merge: true });
      await deliver({
        userId: member.userId,
        roomId: params.room.id,
        kind: 'newMessages',
        emailTitle: `New voice message in ${params.room.title}`,
        emailBody: `${params.senderName} left a voice message in ${params.room.title}.`,
        note: {
          kind: 'newMessage',
          roomId: params.room.id,
          roomTitle: params.room.title,
          actorName: params.senderName,
          audience: 'member',
          createdAtIso: new Date().toISOString(),
        },
      });
    }),
  );
};

export const markRoomRead = async (userId: string, roomId: string): Promise<void> => {
  await reads(userId)
    .doc(roomId)
    .set({ unreadCount: 0, lastReadAtIso: new Date().toISOString() }, { merge: true });
  const snap = await notifications(userId).where('read', '==', false).limit(50).get();
  await Promise.all(
    snap.docs
      .filter((doc) => doc.data().roomId === roomId && doc.data().kind === 'newMessage')
      .map((doc) => doc.ref.set({ read: true }, { merge: true })),
  );
};

export const notifyReviewers = async (params: {
  room: SpeakingRoom;
  applicant: RoomMember;
}): Promise<void> => {
  const people = await listRoomMembers(params.room.id);
  const reviewerIds =
    params.room.reviewMode === 'alexOnly'
      ? [SPEAKING_CLUB_FOUNDER_UID]
      : people.filter((member) => member.status === 'approved').map((member) => member.userId);
  const ids = new Set(reviewerIds);
  ids.delete(params.applicant.userId);
  await Promise.all(
    [...ids].map((userId) =>
      deliver({
        userId,
        roomId: params.room.id,
        kind: 'reviewJoiners',
        emailTitle: `${params.applicant.username} wants to join ${params.room.title}`,
        emailBody: `${params.applicant.username} recorded an introduction for ${params.room.title}.`,
        note: {
          kind: 'reviewJoiner',
          roomId: params.room.id,
          roomTitle: params.room.title,
          actorName: params.applicant.username,
          audience: 'reviewer',
          createdAtIso: new Date().toISOString(),
        },
      }),
    ),
  );
};

export const notifyApplicant = async (params: {
  room: SpeakingRoom;
  applicantId: string;
  decision: ReviewDecision;
}): Promise<void> => {
  const accepted = params.decision === 'approved';
  await deliver({
    userId: params.applicantId,
    roomId: params.room.id,
    kind: 'reviewJoiners',
    emailTitle: accepted
      ? `You can join ${params.room.title}`
      : `Update about ${params.room.title}`,
    emailBody: accepted
      ? `Your introduction was accepted. You can speak in ${params.room.title}.`
      : `Your introduction to ${params.room.title} was not accepted this time.`,
    note: {
      kind: 'reviewJoiner',
      roomId: params.room.id,
      roomTitle: params.room.title,
      actorName: '',
      decision: params.decision,
      audience: 'applicant',
      createdAtIso: new Date().toISOString(),
    },
  });
};

export const notifyNewRoom = async (room: SpeakingRoom, creatorId: string): Promise<void> => {
  if (!room.isPublic) return;
  const snap = await getDB()
    .collection('users')
    .where('speakingNotifications.newRooms', '==', true)
    .limit(100)
    .get();
  await Promise.all(
    snap.docs
      .filter((doc) => doc.id !== creatorId)
      .map((doc) =>
        deliver({
          userId: doc.id,
          roomId: null,
          kind: 'newRooms',
          emailTitle: `New room: ${room.title}`,
          emailBody: `${room.title} is open. ${room.subtitle}`,
          note: {
            kind: 'newRoom',
            roomId: room.id,
            roomTitle: room.title,
            actorName: '',
            audience: 'member',
            createdAtIso: new Date().toISOString(),
          },
        }),
      ),
  );
};

export const saveGlobalPrefs = async (
  userId: string,
  prefs: SpeakingProfile['prefs'],
): Promise<void> => {
  await getDB()
    .collection('users')
    .doc(userId)
    .set({ speakingNotifications: prefs }, { merge: true });
};

export const saveRoomNarrowing = async (
  userId: string,
  roomId: string,
  narrowing: import('../types').RoomNotificationNarrowing,
): Promise<void> => {
  await getDB()
    .collection('users')
    .doc(userId)
    .collection('speakingRoomNotices')
    .doc(roomId)
    .set(narrowing);
};
