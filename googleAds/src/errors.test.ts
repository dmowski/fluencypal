import assert from 'node:assert/strict';
import test from 'node:test';

import { buildHeaders } from './client.js';
import { explainAdsFailure } from './errors.js';

test('explains production access errors with the Cloud project', () => {
  const explained = explainAdsFailure(
    403,
    {
      error: {
        message: 'The caller does not have permission',
        details: [
          {
            requestId: 'req-1',
            errors: [
              {
                message: 'Project is test-only.',
                errorCode: { authorizationError: 'CLOUD_PROJECT_NOT_APPROVED_FOR_PRODUCTION' },
              },
            ],
          },
        ],
      },
    },
    { cloudProject: 'fluencypal-ads' },
  );
  assert.match(explained.summary, /Project is test-only/);
  assert.equal(explained.requestId, 'req-1');
  assert.match(explained.hint ?? '', /Explorer access/);
  assert.match(explained.hint ?? '', /fluencypal-ads/);
});

test('explains a caller that is not on an ads account', () => {
  const explained = explainAdsFailure(
    401,
    {
      error: {
        message: 'Request is missing required authentication credential.',
        details: [
          {
            errors: [
              {
                message: 'The Google account is not associated with any Ads accounts.',
                errorCode: { authenticationError: 'NOT_ADS_USER' },
              },
            ],
          },
        ],
      },
    },
    { identity: 'ads-cli@fluencypal-campaigns.iam.gserviceaccount.com' },
  );
  assert.match(explained.summary, /not associated with any Ads accounts/);
  assert.doesNotMatch(explained.summary, /missing required authentication/);
  assert.match(explained.hint ?? '', /ads-cli@fluencypal-campaigns.iam.gserviceaccount.com/);
});

test('omits the developer token unless one is configured', () => {
  const headers = buildHeaders({ accessToken: 'token', loginCustomerId: '123' });
  assert.equal(headers.Authorization, 'Bearer token');
  assert.equal(headers['login-customer-id'], '123');
  assert.equal(headers['developer-token'], undefined);
  assert.equal(
    buildHeaders({ accessToken: 'token', developerToken: 'optional' })['developer-token'],
    'optional',
  );
});
