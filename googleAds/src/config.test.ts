import assert from 'node:assert/strict';
import test from 'node:test';

import { missingCredentialFields, parseClientSecretJson, parseEnvFile, resolveConfig } from './config.js';

test('parses env files without overriding later sources', () => {
  assert.deepEqual(parseEnvFile('# comment\nGOOGLE_ADS_CUSTOMER_ID="123-456-7890"\nEMPTY=\n'), {
    GOOGLE_ADS_CUSTOMER_ID: '123-456-7890',
    EMPTY: '',
  });
});

test('resolves credentials from env, then the oauth file, then the client download', () => {
  const config = resolveConfig({
    env: { GOOGLE_ADS_CUSTOMER_ID: '111-222-3333' },
    oauth: { refreshToken: 'refresh' },
    client: { clientId: 'client', clientSecret: 'secret' },
  });
  assert.equal(config.clientId, 'client');
  assert.equal(config.refreshToken, 'refresh');
  assert.equal(config.customerId, '1112223333');
});

test('treats a service account as enough to call the API', () => {
  const config = resolveConfig({
    env: {},
    serviceAccount: {
      clientEmail: 'ads@fluencypal-campaigns.iam.gserviceaccount.com',
      privateKey: '-----BEGIN PRIVATE KEY-----\nabc\n-----END PRIVATE KEY-----\n',
      projectId: 'fluencypal-campaigns',
    },
  });
  assert.deepEqual(missingCredentialFields(config), []);
  assert.equal(config.cloudProject, 'fluencypal-campaigns');
});

test('reads a desktop client secret download', () => {
  const parsed = parseClientSecretJson({
    installed: { client_id: 'abc.apps.googleusercontent.com', client_secret: 'secret' },
  });
  assert.equal(parsed.clientId, 'abc.apps.googleusercontent.com');
  assert.equal(parsed.clientSecret, 'secret');
});
