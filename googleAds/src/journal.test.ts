import assert from 'node:assert/strict';
import { mkdtempSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import test from 'node:test';

import { appendJournal, readJournal } from './journal.js';

test('appends and reads the local change journal', () => {
  const file = join(mkdtempSync(join(tmpdir(), 'ads-journal-')), 'operations.jsonl');
  appendJournal(file, {
    at: '2026-10-07T12:00:00.000Z',
    source: 'local',
    command: 'pause',
    ok: true,
    summary: 'Paused campaign 1',
    customerId: '123',
  });
  appendJournal(file, {
    at: '2026-10-07T13:00:00.000Z',
    source: 'local',
    command: 'note',
    ok: true,
    summary: 'Keep the brand campaign paused until copy is reviewed.',
  });
  const entries = readJournal(file);
  assert.equal(entries.length, 2);
  assert.equal(entries[1]?.summary, 'Keep the brand campaign paused until copy is reviewed.');
});
