import { createHash, randomBytes } from 'node:crypto';
import { mkdirSync, writeFileSync } from 'node:fs';
import { createServer } from 'node:http';
import { spawn } from 'node:child_process';

import type { AdsConfig } from './config.js';
import { paths } from './paths.js';
import { ADS_SCOPE } from './validate.js';

type TokenResponse = {
  refresh_token?: string;
  access_token?: string;
  error?: string;
  error_description?: string;
};

export async function runOAuthConsent(config: AdsConfig): Promise<void> {
  if (!config.clientId) {
    throw new Error(
      'Missing OAuth client id. Put the Cloud Console download at googleAds/.secrets/client_secret.json or set GOOGLE_ADS_CLIENT_ID.',
    );
  }

  const verifier = randomBytes(32).toString('base64url');
  const challenge = createHash('sha256').update(verifier).digest('base64url');
  const state = randomBytes(16).toString('hex');
  const { code, redirectUri } = await waitForAuthorizationCode({
    clientId: config.clientId,
    state,
    challenge,
  });

  const params = new URLSearchParams({
    code,
    client_id: config.clientId,
    redirect_uri: redirectUri,
    grant_type: 'authorization_code',
    code_verifier: verifier,
  });
  if (config.clientSecret) params.set('client_secret', config.clientSecret);

  const response = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: params,
    signal: AbortSignal.timeout(30_000),
  });
  const token = (await response.json()) as TokenResponse;
  if (!response.ok || !token.refresh_token) {
    const reason = token.error_description ?? token.error ?? `HTTP ${response.status}`;
    throw new Error(
      `Google did not return a refresh token (${reason}). Remove FluencyPal Ads access at https://myaccount.google.com/permissions and run \`pnpm ads auth\` again.`,
    );
  }

  mkdirSync(paths.secretsDir, { recursive: true, mode: 0o700 });
  writeFileSync(
    paths.oauthFile,
    `${JSON.stringify(
      {
        clientId: config.clientId,
        clientSecret: config.clientSecret,
        refreshToken: token.refresh_token,
        obtainedAt: new Date().toISOString(),
      },
      null,
      2,
    )}\n`,
    { mode: 0o600 },
  );
  console.log(`Saved a refresh token to ${paths.oauthFile}`);
}

function waitForAuthorizationCode(input: {
  clientId: string;
  state: string;
  challenge: string;
}): Promise<{ code: string; redirectUri: string }> {
  return new Promise((resolve, reject) => {
    let redirectUri = '';
    let settled = false;
    let failTimer: ReturnType<typeof setTimeout> | undefined;
    const finish = (error?: Error, code?: string) => {
      if (settled) return;
      settled = true;
      if (failTimer) clearTimeout(failTimer);
      server.close();
      if (error) {
        reject(error);
        return;
      }
      if (!code || !redirectUri) {
        reject(new Error('OAuth finished without an authorization code.'));
        return;
      }
      resolve({ code, redirectUri });
    };

    const server = createServer((request, response) => {
      const url = new URL(request.url ?? '/', 'http://127.0.0.1');
      if (!url.searchParams.has('code') && !url.searchParams.has('error')) {
        response.statusCode = 204;
        response.end();
        return;
      }
      const error = url.searchParams.get('error');
      const code = url.searchParams.get('code');
      const returnedState = url.searchParams.get('state');
      response.setHeader('Content-Type', 'text/plain; charset=utf-8');
      if (error || !code || returnedState !== input.state) {
        response.end('Google Ads authorization failed. You can close this tab.');
        finish(new Error(error ? `OAuth error: ${error}` : 'OAuth state did not match.'));
        return;
      }
      response.end('Google Ads access granted. You can close this tab and return to Cursor.');
      finish(undefined, code);
    });

    failTimer = setTimeout(() => {
      finish(new Error('Timed out waiting for Google Ads authorization after 3 minutes.'));
    }, 180_000);

    server.on('error', (error) => finish(error));
    server.listen(0, '127.0.0.1', () => {
      const address = server.address();
      const port = address && typeof address === 'object' ? address.port : 0;
      redirectUri = `http://127.0.0.1:${port}`;
      const authUrl = new URL('https://accounts.google.com/o/oauth2/v2/auth');
      authUrl.searchParams.set('client_id', input.clientId);
      authUrl.searchParams.set('redirect_uri', redirectUri);
      authUrl.searchParams.set('response_type', 'code');
      authUrl.searchParams.set('scope', ADS_SCOPE);
      authUrl.searchParams.set('access_type', 'offline');
      authUrl.searchParams.set('prompt', 'consent');
      authUrl.searchParams.set('state', input.state);
      authUrl.searchParams.set('code_challenge', input.challenge);
      authUrl.searchParams.set('code_challenge_method', 'S256');
      console.log(`Open this URL if the browser does not:\n${authUrl.toString()}`);
      openBrowser(authUrl.toString());
    });
  });
}

function openBrowser(url: string): void {
  const command = process.platform === 'darwin' ? 'open' : process.platform === 'win32' ? 'cmd' : 'xdg-open';
  const args = process.platform === 'win32' ? ['/c', 'start', '', url] : [url];
  const child = spawn(command, args, { stdio: 'ignore', detached: true });
  child.on('error', () => {
    console.error('Could not open a browser automatically.');
  });
  child.unref();
}
