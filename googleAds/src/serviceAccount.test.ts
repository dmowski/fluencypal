import assert from 'node:assert/strict';
import { createVerify, generateKeyPairSync } from 'node:crypto';
import test from 'node:test';

import { createServiceAccountAssertion, parseServiceAccountKey } from './serviceAccount.js';
import { ADS_SCOPE } from './validate.js';

test('builds a signed service-account assertion for the Google Ads scope', () => {
  const { privateKey, publicKey } = generateKeyPairSync('rsa', { modulusLength: 2048 });
  const pem = privateKey.export({ type: 'pkcs8', format: 'pem' }).toString();
  const key = parseServiceAccountKey({
    client_email: 'ads@fluencypal-campaigns.iam.gserviceaccount.com',
    private_key: pem,
    project_id: 'fluencypal-campaigns',
  });
  const assertion = createServiceAccountAssertion(key, 1_700_000_000);
  const [header, payload, signature] = assertion.split('.');
  assert.ok(header && payload && signature);
  const verifier = createVerify('RSA-SHA256');
  verifier.update(`${header}.${payload}`);
  verifier.end();
  assert.equal(verifier.verify(publicKey, Buffer.from(signature, 'base64url')), true);
  const claims = JSON.parse(Buffer.from(payload, 'base64url').toString()) as {
    scope: string;
    iss: string;
    exp: number;
  };
  assert.equal(claims.scope, ADS_SCOPE);
  assert.equal(claims.iss, key.clientEmail);
  assert.equal(claims.exp, 1_700_000_000 + 3600);
});
