import { collectSubtreeIds } from './messageTree';
import { VoiceChatMessage } from '../types';

const msg = (id: string, parentMessageId: string): VoiceChatMessage => ({
  id,
  senderId: 'u1',
  parentMessageId,
  audioPath: `voiceChat/audio/${id}.webm`,
  durationSec: 3,
  contentType: 'audio/webm',
  createdAtIso: new Date().toISOString(),
  createdAtUtc: Date.now(),
});

describe('collectSubtreeIds', () => {
  it('collects nested replies under a root', () => {
    const messages = [
      msg('root', ''),
      msg('a', 'root'),
      msg('b', 'a'),
      msg('other', ''),
      msg('c', 'other'),
    ];
    expect(collectSubtreeIds('root', messages).sort()).toEqual(['a', 'b', 'root'].sort());
  });
});
