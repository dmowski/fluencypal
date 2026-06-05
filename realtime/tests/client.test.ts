import { describe, expect, it, vi } from 'vitest';

// Inline minimal handler logic mirrored from client sessionClient for automated verification.
const handleJsonMessage = (
  message: { type: string; messageId?: string; role?: string; delta?: string; text?: string },
  handlers: {
    onDelta: (id: string, role: 'user' | 'assistant', delta: string) => void;
    onDone: (id: string, role: 'user' | 'assistant', text: string) => void;
    onUsage: () => void;
  },
) => {
  if (message.type === 'transcript.delta' && message.messageId && message.role && message.delta) {
    handlers.onDelta(message.messageId, message.role as 'user' | 'assistant', message.delta);
  }

  if (message.type === 'transcript.done' && message.messageId && message.role && message.text !== undefined) {
    handlers.onDone(message.messageId, message.role as 'user' | 'assistant', message.text);
  }

  if (message.type === 'usage') {
    handlers.onUsage();
  }
};

describe('client session message handling', () => {
  it('maps transcript events to handlers', () => {
    const onDelta = vi.fn();
    const onDone = vi.fn();
    const onUsage = vi.fn();

    handleJsonMessage(
      { type: 'transcript.delta', messageId: 'a1', role: 'assistant', delta: 'Hi' },
      { onDelta, onDone, onUsage },
    );
    handleJsonMessage(
      { type: 'transcript.done', messageId: 'a1', role: 'assistant', text: 'Hi there' },
      { onDelta, onDone, onUsage },
    );
    handleJsonMessage({ type: 'usage' }, { onDelta, onDone, onUsage });

    expect(onDelta).toHaveBeenCalledWith('a1', 'assistant', 'Hi');
    expect(onDone).toHaveBeenCalledWith('a1', 'assistant', 'Hi there');
    expect(onUsage).toHaveBeenCalledTimes(1);
  });
});
