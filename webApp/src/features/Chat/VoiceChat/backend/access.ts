import { getDB, validateAuthToken } from '@/app/api/config/firebase';
import { AuthUserInfo } from '@/app/api/config/type';
import { UserSettings } from '@/features/Settings/userSettings';
import { parseRoomNarrowing, parseSpeakingNotificationPrefs } from '../notificationRules';
import { RoomNotificationNarrowing, SpeakingNotificationPrefs } from '../types';
import { isAlexAccount } from './guards';
import { SpeakingClubError } from './http';

export { isAlexAccount };

export interface SpeakingProfile {
  userId: string;
  email: string;
  username: string;
  avatarUrl: string;
  bio: string;
  prefs: SpeakingNotificationPrefs;
  emailAllowedByApp: boolean;
}

export const requireSpeakingUser = async (request: Request): Promise<AuthUserInfo> => {
  const user = await validateAuthToken(request);
  if (!user.uid) throw new SpeakingClubError('Sign in to continue.', 401);
  return user;
};

export const loadSpeakingProfile = async (userId: string): Promise<SpeakingProfile> => {
  const snap = await getDB().collection('users').doc(userId).get();
  const data = snap.data() as UserSettings | undefined;
  const username = data?.displayName?.trim() || 'Learner';
  return {
    userId,
    email: data?.email?.trim() || '',
    username,
    avatarUrl: data?.photoUrl?.trim() || '',
    bio: data?.speakingBio?.trim() || '',
    prefs: parseSpeakingNotificationPrefs(data?.speakingNotifications),
    emailAllowedByApp: data?.isSendEmailNotifications !== false,
  };
};

export const markVoiceNoticeSeen = async (userId: string): Promise<void> => {
  await getDB()
    .collection('users')
    .doc(userId)
    .set({ voiceNoticeSeenAtIso: new Date().toISOString() }, { merge: true });
};

export const saveSpeakingBio = async (userId: string, bio: string): Promise<string> => {
  const clean = bio.trim().slice(0, 500);
  await getDB().collection('users').doc(userId).set({ speakingBio: clean }, { merge: true });
  return clean;
};

export const loadRoomNarrowing = async (
  userId: string,
  roomId: string,
): Promise<RoomNotificationNarrowing> => {
  const snap = await getDB()
    .collection('users')
    .doc(userId)
    .collection('speakingRoomNotices')
    .doc(roomId)
    .get();
  return parseRoomNarrowing(snap.data());
};
