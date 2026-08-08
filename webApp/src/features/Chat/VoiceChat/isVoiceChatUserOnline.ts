import dayjs from 'dayjs';

/** Same threshold as GameStatRow / chat avatars. */
const ONLINE_WITHIN_MINUTES = 5;

export const isVoiceChatUserOnline = (lastVisit: string | null | undefined): boolean =>
  lastVisit ? dayjs().diff(dayjs(lastVisit), 'minute') < ONLINE_WITHIN_MINUTES : false;
