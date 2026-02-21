import { SeedMsg } from './types';

export const buildTranscript = (messages: SeedMsg[]) => {
  // keep it short to avoid recreating the same cost problem
  const MAX_CHARS_PER_MSG = 800;

  return messages
    .slice(-10)
    .map((m) => {
      const who = m.isBot ? 'Assistant' : 'User';
      const text = (m.text || '').trim().slice(0, MAX_CHARS_PER_MSG);
      return `${who}: ${text}`;
    })
    .join('\n');
};
