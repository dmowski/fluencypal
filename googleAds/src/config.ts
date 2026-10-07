import { readFileSync } from 'node:fs';

import { paths } from './paths.js';
import { parseServiceAccountKey, type ServiceAccountKey } from './serviceAccount.js';
import { optionalCustomerId } from './validate.js';

export type AdsConfig = {
  clientId?: string;
  clientSecret?: string;
  refreshToken?: string;
  developerToken?: string;
  customerId?: string;
  loginCustomerId?: string;
  cloudProject?: string;
  serviceAccount?: ServiceAccountKey;
};

export type OAuthFile = {
  clientId?: string;
  clientSecret?: string;
  refreshToken?: string;
  obtainedAt?: string;
};

export function parseEnvFile(text: string): Record<string, string> {
  const result: Record<string, string> = {};
  for (const rawLine of text.split('\n')) {
    const line = rawLine.trim();
    if (!line || line.startsWith('#')) continue;
    const separator = line.indexOf('=');
    if (separator === -1) continue;
    const key = line.slice(0, separator).trim();
    let value = line.slice(separator + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    if (key) result[key] = value;
  }
  return result;
}

export function parseClientSecretJson(json: unknown): { clientId: string; clientSecret?: string } {
  const record = asRecord(json);
  const installed = asRecord(record?.installed) ?? asRecord(record?.web);
  const clientId = stringValue(installed?.client_id);
  if (!clientId) {
    throw new Error(
      'OAuth client JSON must be the file downloaded from Google Cloud, with an "installed" or "web" client_id.',
    );
  }
  return { clientId, clientSecret: stringValue(installed?.client_secret) };
}

export function resolveConfig(input: {
  env: Record<string, string | undefined>;
  oauth?: OAuthFile;
  client?: { clientId?: string; clientSecret?: string };
  serviceAccount?: ServiceAccountKey;
}): AdsConfig {
  const clientId = pick(
    input.env.GOOGLE_ADS_CLIENT_ID,
    input.oauth?.clientId,
    input.client?.clientId,
  );
  const clientSecret = pick(
    input.env.GOOGLE_ADS_CLIENT_SECRET,
    input.oauth?.clientSecret,
    input.client?.clientSecret,
  );
  const serviceAccount = input.serviceAccount;
  return {
    clientId,
    clientSecret,
    refreshToken: pick(input.env.GOOGLE_ADS_REFRESH_TOKEN, input.oauth?.refreshToken),
    developerToken: pick(input.env.GOOGLE_ADS_DEVELOPER_TOKEN),
    customerId: optionalCustomerId(pick(input.env.GOOGLE_ADS_CUSTOMER_ID)),
    loginCustomerId: optionalCustomerId(pick(input.env.GOOGLE_ADS_LOGIN_CUSTOMER_ID)),
    cloudProject: pick(
      input.env.GOOGLE_CLOUD_PROJECT,
      input.env.GOOGLE_ADS_CLOUD_PROJECT,
      serviceAccount?.projectId,
    ),
    serviceAccount,
  };
}

export function loadConfig(): AdsConfig {
  const fileEnv = readOptionalText(paths.envFile);
  const env = {
    ...parseEnvFile(fileEnv ?? ''),
    ...process.env,
  };
  const serviceAccountPath =
    pick(process.env.GOOGLE_ADS_SERVICE_ACCOUNT_FILE, env.GOOGLE_ADS_SERVICE_ACCOUNT_FILE) ??
    joinSecretsFile();
  return resolveConfig({
    env,
    oauth: readOptionalJson(paths.oauthFile) as OAuthFile | undefined,
    client: readOptionalClient(),
    serviceAccount: readServiceAccount(serviceAccountPath),
  });
}

function joinSecretsFile(): string {
  return paths.serviceAccountFile;
}

export function missingCredentialFields(config: AdsConfig): string[] {
  if (config.serviceAccount) return [];
  const missing: string[] = [];
  if (!config.clientId) missing.push('OAuth client id');
  if (!config.refreshToken) missing.push('refresh token (`pnpm ads auth`)');
  return missing;
}

function readServiceAccount(filePath: string | undefined): ServiceAccountKey | undefined {
  if (!filePath) return undefined;
  const json = readOptionalJson(filePath);
  if (!json) return undefined;
  return parseServiceAccountKey(json);
}

function readOptionalClient(): { clientId: string; clientSecret?: string } | undefined {
  const json = readOptionalJson(paths.clientSecretFile);
  if (!json) return undefined;
  return parseClientSecretJson(json);
}

function readOptionalText(filePath: string): string | undefined {
  try {
    return readFileSync(filePath, 'utf8');
  } catch (error) {
    if (isNotFound(error)) return undefined;
    throw error;
  }
}

function readOptionalJson(filePath: string): unknown {
  const text = readOptionalText(filePath);
  if (!text) return undefined;
  return JSON.parse(text) as unknown;
}

function pick(...values: Array<string | undefined>): string | undefined {
  return values.find((value) => value?.trim())?.trim();
}

function stringValue(value: unknown): string | undefined {
  return typeof value === 'string' && value.trim() ? value.trim() : undefined;
}

function asRecord(value: unknown): Record<string, unknown> | undefined {
  if (value && typeof value === 'object' && !Array.isArray(value)) {
    return value as Record<string, unknown>;
  }
  return undefined;
}

function isNotFound(error: unknown): boolean {
  return Boolean(error && typeof error === 'object' && 'code' in error && error.code === 'ENOENT');
}
