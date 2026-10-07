import assert from 'node:assert/strict';
import test from 'node:test';

import {
  buildResponsiveSearchAdMutation,
  buildSearchCampaignMutation,
  buildStatusMutation,
  resolveApplyMode,
} from './plans.js';

const copy = {
  headlines: ['Speak with AI', 'Daily speaking', 'FluencyPal'],
  descriptions: ['Practice real conversations.', 'Feedback after every reply.'],
  finalUrl: 'https://www.fluencypal.com',
};

test('dry-run is the default and confirm conflicts with validate', () => {
  assert.equal(resolveApplyMode({}), 'dry-run');
  assert.equal(resolveApplyMode({ confirm: true }), 'apply');
  assert.throws(() => resolveApplyMode({ confirm: true, validate: true }), /either --confirm/);
});

test('status updates only the status field', () => {
  const body = buildStatusMutation({
    resourceName: 'customers/123/campaigns/9',
    status: 'PAUSED',
    validateOnly: false,
  });
  assert.deepEqual(body.operations, [
    {
      update: { resourceName: 'customers/123/campaigns/9', status: 'PAUSED' },
      updateMask: 'status',
    },
  ]);
});

test('new responsive search ads are paused unless asked otherwise', () => {
  const body = buildResponsiveSearchAdMutation({
    customerId: '123-456-7890',
    adGroupId: '55',
    status: 'PAUSED',
    validateOnly: true,
    ...copy,
  });
  assert.equal(body.validateOnly, true);
  const create = (body.operations[0] as { create: { status: string; adGroup: string } }).create;
  assert.equal(create.status, 'PAUSED');
  assert.equal(create.adGroup, 'customers/1234567890/adGroups/55');
});

test('search campaign creation stays paused and declares no EU political ads', () => {
  const body = buildSearchCampaignMutation({
    customerId: '99',
    name: 'Brand search',
    dailyBudget: '20',
    status: 'PAUSED',
    validateOnly: false,
    keywords: [{ text: 'learn english', matchType: 'PHRASE' }],
    ...copy,
  });
  const campaign = (
    body.mutateOperations[1] as {
      campaignOperation: { create: { status: string; containsEuPoliticalAdvertising: string } };
    }
  ).campaignOperation.create;
  const budget = (
    body.mutateOperations[0] as { campaignBudgetOperation: { create: { amountMicros: string } } }
  ).campaignBudgetOperation.create;
  const ad = (
    body.mutateOperations.at(-1) as { adGroupAdOperation: { create: { status: string } } }
  ).adGroupAdOperation.create;
  assert.equal(budget.amountMicros, '20000000');
  assert.equal(campaign.status, 'PAUSED');
  assert.equal(campaign.containsEuPoliticalAdvertising, 'DOES_NOT_CONTAIN_EU_POLITICAL_ADVERTISING');
  assert.equal(ad.status, 'PAUSED');
  assert.equal(body.mutateOperations.length, 5);
});
