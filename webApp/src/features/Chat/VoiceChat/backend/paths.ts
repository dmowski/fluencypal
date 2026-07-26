export const ENTITLEMENTS_COLLECTION = 'voiceChatEntitlements';
export const MEMBERS_COLLECTION = 'voiceChatMembers';
export const MESSAGES_COLLECTION = 'voiceChatMessages';
export const CONFIG_COLLECTION = 'voiceChat';
export const CONFIG_DOC = 'config';

export const voiceChatAudioObjectPath = (id: string, extension: string) =>
  `voiceChat/audio/${id}.${extension}`;
