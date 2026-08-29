import { Conversation } from '@/features/Conversation/conversation';
import { collectConversationContext } from './collectConversationContext';

const makeConversation = (id: string, texts: string[]): Conversation => ({
  id,
  messagesCount: texts.length,
  messages: texts.map((text, index) => ({
    id: `${id}-${index}`,
    isBot: index % 2 === 0,
    text,
  })),
  messageOrder: {},
  createdAt: 0,
  createdAtIso: '',
  updatedAt: 0,
  updatedAtIso: '',
  languageCode: 'en',
  mode: 'talk',
  rolePlayId: null,
});

describe('collectConversationContext', () => {
  it('takes the last messages from the newest conversation first', () => {
    const newest = makeConversation('new', ['a', 'b', 'c', 'd']);
    const older = makeConversation('old', ['x', 'y']);

    const result = collectConversationContext([newest, older], 3);

    expect(result.messageCount).toBe(3);
    expect(result.messages.map((message) => message.text)).toEqual(['b', 'c', 'd']);
  });

  it('walks previous conversations when the latest one is short', () => {
    const newest = makeConversation('new', ['hello', 'hi']);
    const older = makeConversation('old', ['one', 'two', 'three', 'four']);

    const result = collectConversationContext([newest, older], 5);

    expect(result.messageCount).toBe(5);
    expect(result.messages.map((message) => message.text)).toEqual([
      'hello',
      'hi',
      'two',
      'three',
      'four',
    ]);
  });

  it('formats learner and AI lines', () => {
    const conversation = makeConversation('c1', ['How are you?', 'I am fine']);
    const result = collectConversationContext([conversation], 10);

    expect(result.text).toContain('AI: How are you?');
    expect(result.text).toContain('Learner: I am fine');
  });
});
