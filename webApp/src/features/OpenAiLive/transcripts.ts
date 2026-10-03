import { ConversationMessage } from '@/features/Conversation/conversation';

export type LiveTranscriptLine = {
  id: string;
  role: 'user' | 'assistant';
  text: string;
  closed: boolean;
};

export const liveTranscriptToMessages = (lines: LiveTranscriptLine[]): ConversationMessage[] =>
  lines
    .filter((line) => line.text.trim().length > 0)
    .map((line) => ({
      id: line.id,
      isBot: line.role === 'assistant',
      text: line.text,
      isInProgress: !line.closed,
    }));

const textField = (event: Record<string, unknown>, key: string) =>
  typeof event[key] === 'string' ? event[key] : '';

export const appendLiveTranscript = (
  lines: LiveTranscriptLine[],
  event: Record<string, unknown>,
): LiveTranscriptLine[] => {
  const type = typeof event.type === 'string' ? event.type : '';
  const role = type.includes('input_transcript')
    ? 'user'
    : type.includes('output_transcript')
      ? 'assistant'
      : null;
  if (!role) return lines;

  const delta = textField(event, 'delta');
  const full = textField(event, 'text') || textField(event, 'transcript');
  const isDone = type.endsWith('.done');
  const last = lines[lines.length - 1];

  if (isDone) {
    if (last && last.role === role && !last.closed) {
      return [...lines.slice(0, -1), { ...last, text: full || last.text, closed: true }];
    }
    if (!full) return lines;
    return [...lines, { id: `${role}-${lines.length}`, role, text: full, closed: true }];
  }

  const fragment = delta || full;
  if (!fragment) return lines;
  if (last && last.role === role && !last.closed) {
    return [...lines.slice(0, -1), { ...last, text: last.text + fragment }];
  }
  return [...lines, { id: `${role}-${lines.length}`, role, text: fragment, closed: false }];
};
