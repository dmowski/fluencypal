import { appendFileSync, mkdirSync, readFileSync } from 'node:fs';
import { dirname } from 'node:path';

export type JournalEntry = {
  at: string;
  source: 'local';
  command: string;
  ok: boolean;
  summary: string;
  customerId?: string;
  resourceName?: string;
  requestId?: string;
  detail?: unknown;
};

export function appendJournal(filePath: string, entry: JournalEntry): void {
  mkdirSync(dirname(filePath), { recursive: true });
  appendFileSync(filePath, `${JSON.stringify(entry)}\n`, 'utf8');
}

export function readJournal(filePath: string): JournalEntry[] {
  let text: string;
  try {
    text = readFileSync(filePath, 'utf8');
  } catch (error) {
    if (error && typeof error === 'object' && 'code' in error && error.code === 'ENOENT') {
      return [];
    }
    throw error;
  }

  const entries: JournalEntry[] = [];
  const lines = text.split('\n');
  for (let index = 0; index < lines.length; index += 1) {
    const line = lines[index]?.trim();
    if (!line) continue;
    try {
      entries.push(JSON.parse(line) as JournalEntry);
    } catch {
      throw new Error(`Could not parse ${filePath} line ${index + 1}.`);
    }
  }
  return entries;
}

export function clipDetail(value: unknown): unknown {
  const text = JSON.stringify(value);
  if (!text || text.length <= 4000) return value;
  return { truncated: text.slice(0, 4000) };
}
