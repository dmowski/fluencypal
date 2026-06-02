import type { TranscriptRole } from '../protocol/messages.js';

export type HistoryMessage = {
  id: string;
  role: TranscriptRole;
  text: string;
  createdAt: number;
};

export class ConversationHistory {
  private messages: HistoryMessage[] = [];

  append(message: HistoryMessage): void {
    this.messages.push(message);
  }

  list(): HistoryMessage[] {
    return [...this.messages];
  }

  clear(): void {
    this.messages = [];
  }

  get size(): number {
    return this.messages.length;
  }
}
