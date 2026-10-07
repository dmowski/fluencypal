import assert from 'node:assert/strict';
import test from 'node:test';

import {
  adStatus,
  currencyToMicros,
  formatMicros,
  normalizeCustomerId,
  parseKeyword,
  validateResponsiveSearchAd,
} from './validate.js';

test('normalizes hyphenated customer ids and rejects conversion-tag length', () => {
  assert.equal(normalizeCustomerId('123-456-7890'), '1234567890');
  assert.throws(() => normalizeCustomerId('16463260124'), /not a customer id/);
});

test('maps stop and active onto API statuses', () => {
  assert.equal(adStatus('stop'), 'PAUSED');
  assert.equal(adStatus('active'), 'ENABLED');
});

test('converts currency amounts to micros and formats them back', () => {
  assert.equal(currencyToMicros('12.5'), '12500000');
  assert.equal(formatMicros('12500000'), '12.50');
  assert.throws(() => currencyToMicros('0'), /greater than 0/);
});

test('parses keyword match types and defaults to phrase', () => {
  assert.deepEqual(parseKeyword('learn english'), { text: 'learn english', matchType: 'PHRASE' });
  assert.deepEqual(parseKeyword('EXACT:fluency pal'), { text: 'fluency pal', matchType: 'EXACT' });
});

test('checks responsive search ad limits', () => {
  const valid = validateResponsiveSearchAd({
    finalUrl: 'https://www.fluencypal.com/learn',
    headlines: ['Speak with AI', 'Daily speaking', 'FluencyPal'],
    descriptions: ['Practice real conversations.', 'Feedback after every reply.'],
  });
  assert.equal(valid.headlines.length, 3);
  assert.throws(
    () =>
      validateResponsiveSearchAd({
        finalUrl: 'https://www.fluencypal.com',
        headlines: ['One', 'Two'],
        descriptions: ['Only one description here.', 'Second'],
      }),
    /3 to 15 headlines/,
  );
  assert.throws(
    () =>
      validateResponsiveSearchAd({
        finalUrl: 'https://www.fluencypal.com',
        headlines: ['x'.repeat(31), 'Two', 'Three'],
        descriptions: ['First description.', 'Second description.'],
      }),
    /30 characters/,
  );
});
