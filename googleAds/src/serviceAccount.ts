import { createSign } from 'node:crypto';

import { ADS_SCOPE } from './validate.js';

export type ServiceAccountKey = {
  clientEmail: string;
  privateKey: string;
  projectId?: string;
};

const TOKEN_URL = 'https://oauth2.googleapis.com/token';

export function parseServiceAccountKey(json: unknown): ServiceAccountKey {
  const record = asRecord(json);
  const clientEmail = stringValue(record?.client_email);
  const privateKey = stringValue(record?.private_key);
  if (!clientEmail || !privateKey?.includes('PRIVATE KEY')) {
    throw new Error(
      'Service account JSON must include client_email and private_key. Expected the key file from gcloud iam service-accounts keys create.',
    );
  }
  return {
    clientEmail,
    privateKey,
    projectId: stringValue(record?.project_id),
  };
}

export function createServiceAccountAssertion(key: ServiceAccountKey, nowSeconds: number): string {
  const header = encodeJson({ alg: 'RS256', typ: 'JWT' });
  const payload = encodeJson({
    iss: key.clientEmail,
    scope: ADS_SCOPE,
    aud: TOKEN_URL,
    iat: nowSeconds,
    exp: nowSeconds + 3600,
  });
  const unsigned = `${header}.${payload}`;
  const signer = createSign('RSA-SHA256');
  signer.update(unsigned);
  signer.end();
  return `${unsigned}.${signer.sign(key.privateKey).toString('base64url')}`;
}

export async function fetchServiceAccountAccessToken(key: ServiceAccountKey): Promise<{
  accessToken: string;
  expiresIn: number;
}> {
  const assertion = createServiceAccountAssertion(key, Math.floor(Date.now() / 1000));
  const response = await fetch(TOKEN_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
      assertion,
    }),
    signal: AbortSignal.timeout(30_000),
  });
  const body = (await response.json()) as {
    access_token?: string;
    expires_in?: number;
    error?: string;
    error_description?: string;
  };
  if (!response.ok || !body.access_token) {
    const reason = body.error_description ?? body.error ?? `HTTP ${response.status}`;
    throw new Error(`Could not sign in with the Google Ads service account: ${reason}`);
  }
  return { accessToken: body.access_token, expiresIn: body.expires_in ?? 3600 };
}

function encodeJson(value: unknown): string {
  return Buffer.from(JSON.stringify(value)).toString('base64url');
}

function asRecord(value: unknown): Record<string, unknown> | undefined {
  if (value && typeof value === 'object' && !Array.isArray(value)) {
    return value as Record<string, unknown>;
  }
  return undefined;
}

function stringValue(value: unknown): string | undefined {
  return typeof value === 'string' && value.trim() ? value.trim() : undefined;
}
