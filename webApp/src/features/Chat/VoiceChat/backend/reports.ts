import { getDB } from '@/app/api/config/firebase';
import { sendEmail } from '@/app/api/email/sendEmail';
import { loadSpeakingProfile } from './access';
import { escapeHtml } from './guards';
import { SpeakingClubError } from './http';
import { assertApprovedMember } from './messages';
import { getSpeakingRoom } from './rooms';
import { SPEAKING_CLUB_FOUNDER_UID } from '../types';

export const reportSpeakingContent = async (params: {
  reporterId: string;
  roomId: string;
  messageId: string;
  targetUserId: string;
  note: string;
}): Promise<void> => {
  const room = await getSpeakingRoom(params.roomId);
  if (!room) throw new SpeakingClubError('That room is not here.', 404);
  await assertApprovedMember(params.roomId, params.reporterId);
  if (!params.messageId && !params.targetUserId) {
    throw new SpeakingClubError('Choose a message or a person to report.');
  }
  const createdAtIso = new Date().toISOString();
  await getDB()
    .collection('speakingReports')
    .add({
      reporterId: params.reporterId,
      roomId: params.roomId,
      messageId: params.messageId,
      targetUserId: params.targetUserId,
      note: params.note.slice(0, 500),
      status: 'open',
      createdAtIso,
    });
  try {
    const alex = await loadSpeakingProfile(SPEAKING_CLUB_FOUNDER_UID);
    if (!alex.email) return;
    const about = params.messageId ? 'a message' : 'a person';
    const body = `Someone reported ${about} in ${room.title}.`;
    const detail = params.note ? `<p>${escapeHtml(params.note)}</p>` : '';
    await sendEmail({
      emailTo: alex.email,
      title: `Report in ${room.title}`,
      messageText: `${body}\n${params.note}`,
      messageHtml: `<p>${escapeHtml(body)}</p>${detail}`,
    });
  } catch (error) {
    console.error('Speaking club report email failed', error);
  }
};
