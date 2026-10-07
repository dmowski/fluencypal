import type { AdsConfig } from './config.js';
import { GoogleAdsApiError } from './errors.js';
import { fetchServiceAccountAccessToken } from './serviceAccount.js';
import { ADS_API_VERSION, normalizeCustomerId } from './validate.js';

type TokenResponse = {
  access_token?: string;
  expires_in?: number;
  error?: string;
  error_description?: string;
};

type SearchResponse = {
  results?: unknown[];
  nextPageToken?: string;
};

export type SearchOptions = {
  loginCustomerId?: string;
};

export function buildHeaders(input: {
  accessToken: string;
  developerToken?: string;
  loginCustomerId?: string;
  json?: boolean;
}): Record<string, string> {
  const headers: Record<string, string> = {
    Authorization: `Bearer ${input.accessToken}`,
  };
  if (input.json) headers['Content-Type'] = 'application/json';
  if (input.developerToken) headers['developer-token'] = input.developerToken;
  if (input.loginCustomerId) headers['login-customer-id'] = input.loginCustomerId;
  return headers;
}

export class GoogleAdsClient {
  private accessToken: string | undefined;
  private accessTokenExpiresAt = 0;

  constructor(private readonly config: AdsConfig) {}

  async listAccessibleCustomers(): Promise<string[]> {
    const response = await this.request('GET', 'customers:listAccessibleCustomers');
    const names = asRecord(response.body)?.resourceNames;
    if (!Array.isArray(names)) return [];
    return names.filter((name): name is string => typeof name === 'string');
  }

  async searchAll(customerId: string, query: string, options: SearchOptions = {}): Promise<unknown[]> {
    const rows: unknown[] = [];
    let pageToken: string | undefined;
    do {
      const page = await this.searchPage(customerId, query, pageToken, options);
      rows.push(...(page.results ?? []));
      pageToken = page.nextPageToken;
    } while (pageToken);
    return rows;
  }

  async mutate(
    customerId: string,
    service: string,
    body: unknown,
    options: SearchOptions = {},
  ): Promise<{ body: unknown; requestId?: string }> {
    return this.requestJson(
      'POST',
      `customers/${normalizeCustomerId(customerId)}/${service}`,
      body,
      options.loginCustomerId,
    );
  }

  private async searchPage(
    customerId: string,
    query: string,
    pageToken: string | undefined,
    options: SearchOptions,
  ): Promise<SearchResponse> {
    const payload: Record<string, unknown> = { query };
    if (pageToken) payload.pageToken = pageToken;
    const response = await this.requestJson(
      'POST',
      `customers/${normalizeCustomerId(customerId)}/googleAds:search`,
      payload,
      options.loginCustomerId,
    );
    return (response.body ?? {}) as SearchResponse;
  }

  private async requestJson(
    method: 'POST',
    path: string,
    body: unknown,
    loginCustomerId?: string,
  ): Promise<{ body: unknown; requestId?: string }> {
    return this.request(method, path, body, loginCustomerId);
  }

  private async request(
    method: 'GET' | 'POST',
    path: string,
    body?: unknown,
    loginCustomerId?: string,
  ): Promise<{ body: unknown; requestId?: string }> {
    const accessToken = await this.getAccessToken();
    const loginId = loginCustomerId ?? this.config.loginCustomerId;
    const response = await fetch(`https://googleads.googleapis.com/${ADS_API_VERSION}/${path}`, {
      method,
      headers: buildHeaders({
        accessToken,
        developerToken: this.config.developerToken,
        loginCustomerId: loginId,
        json: body !== undefined,
      }),
      body: body === undefined ? undefined : JSON.stringify(body),
      signal: AbortSignal.timeout(60_000),
    });
    const parsed = await readBody(response);
    const requestId = response.headers.get('request-id') ?? undefined;
    if (!response.ok) {
      throw new GoogleAdsApiError(response.status, parsed, {
        cloudProject: this.config.cloudProject,
        identity: this.config.serviceAccount?.clientEmail,
        requestId,
      });
    }
    return { body: parsed, requestId };
  }

  private async getAccessToken(): Promise<string> {
    if (this.accessToken && Date.now() < this.accessTokenExpiresAt) return this.accessToken;
    if (this.config.serviceAccount) {
      const token = await fetchServiceAccountAccessToken(this.config.serviceAccount);
      this.accessToken = token.accessToken;
      this.accessTokenExpiresAt = Date.now() + Math.max(token.expiresIn - 60, 30) * 1000;
      return token.accessToken;
    }
    if (!this.config.clientId || !this.config.refreshToken) {
      throw new Error('Missing OAuth client id or refresh token. Run `pnpm ads doctor`.');
    }

    const params = new URLSearchParams({
      client_id: this.config.clientId,
      refresh_token: this.config.refreshToken,
      grant_type: 'refresh_token',
    });
    if (this.config.clientSecret) params.set('client_secret', this.config.clientSecret);

    const response = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: params,
      signal: AbortSignal.timeout(30_000),
    });
    const token = (await readBody(response)) as TokenResponse;
    if (!response.ok || !token.access_token) {
      const reason = token.error_description ?? token.error ?? `HTTP ${response.status}`;
      throw new Error(
        reason === 'invalid_grant' || token.error === 'invalid_grant'
          ? 'The Google Ads refresh token is no longer valid. Run `pnpm ads auth` again.'
          : `Could not refresh the Google Ads access token: ${reason}`,
      );
    }
    this.accessToken = token.access_token;
    const expiresIn = token.expires_in ?? 3600;
    this.accessTokenExpiresAt = Date.now() + Math.max(expiresIn - 60, 30) * 1000;
    return token.access_token;
  }
}

async function readBody(response: Response): Promise<unknown> {
  const text = await response.text();
  if (!text) return undefined;
  try {
    return JSON.parse(text) as unknown;
  } catch {
    return text;
  }
}

function asRecord(value: unknown): Record<string, unknown> | undefined {
  if (value && typeof value === 'object' && !Array.isArray(value)) {
    return value as Record<string, unknown>;
  }
  return undefined;
}

