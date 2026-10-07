import assert from 'node:assert/strict';
import test from 'node:test';

import { formatTimeline, summarizeState, type StateSnapshot } from './report.js';

test('summarizes campaign status and 30-day cost', () => {
  const snapshot: StateSnapshot = {
    fetchedAt: '2026-10-07T00:00:00.000Z',
    customerId: '1234567890',
    customer: [
      {
        customer: {
          descriptiveName: 'FluencyPal',
          currencyCode: 'USD',
          timeZone: 'Europe/Warsaw',
          manager: false,
          testAccount: false,
        },
      },
    ],
    campaigns: [
      {
        campaign: { id: '9', name: 'Brand', status: 'PAUSED', advertisingChannelType: 'SEARCH' },
        campaignBudget: { amountMicros: '20000000' },
      },
    ],
    adGroups: [],
    ads: [
      {
        campaign: { name: 'Brand' },
        adGroup: { id: '4' },
        adGroupAd: {
          status: 'PAUSED',
          ad: {
            id: '8',
            type: 'RESPONSIVE_SEARCH_AD',
            responsiveSearchAd: { headlines: [{ text: 'Speak with AI' }] },
          },
        },
      },
    ],
    keywords: [],
    metrics: [{ metrics: { impressions: '10', clicks: '2', costMicros: '1500000', conversions: 1 } }],
    errors: [],
  };
  const text = summarizeState(snapshot);
  assert.match(text, /Customer 1234567890 FluencyPal/);
  assert.match(text, /1 paused/);
  assert.match(text, /1\.50 USD/);
  assert.match(text, /4~8/);
});

test('formats a mixed local and Google timeline', () => {
  const text = formatTimeline([
    {
      at: '2026-10-07T12:00:00.000Z',
      source: 'local',
      summary: 'Paused campaign customers/1/campaigns/2',
      actor: 'pause',
      ok: true,
    },
    {
      at: '2026-10-06 09:00:00',
      source: 'google',
      summary: 'UPDATE CAMPAIGN Brand status',
      actor: 'owner@example.com',
    },
  ]);
  assert.match(text, /local/);
  assert.match(text, /owner@example.com/);
});
