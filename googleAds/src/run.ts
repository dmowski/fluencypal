import { parseArgs } from 'node:util';

import { runOAuthConsent } from './auth.js';
import { GoogleAdsClient } from './client.js';
import {
  loadConfig,
  missingCredentialFields,
  type AdsConfig,
} from './config.js';
import { GoogleAdsApiError } from './errors.js';
import { appendJournal, clipDetail, readJournal } from './journal.js';
import { paths } from './paths.js';
import {
  buildRemoveMutation,
  buildResponsiveSearchAdMutation,
  buildSearchCampaignMutation,
  buildStatusMutation,
  resolveApplyMode,
  type ApplyMode,
} from './plans.js';
import {
  adsQuery,
  adGroupsQuery,
  campaignsQuery,
  changeEventQuery,
  CLIENTS_QUERY,
  CUSTOMER_QUERY,
  keywordsQuery,
  METRICS_QUERY,
} from './queries.js';
import {
  formatTimeline,
  googleChangeToTimeline,
  nested,
  recordOf,
  summarizeState,
  textOf,
  writeSnapshot,
  type StateSnapshot,
  type TimelineItem,
} from './report.js';
import {
  adGroupResourceName,
  adResourceName,
  adStatus,
  campaignResourceName,
  detectResource,
  mutateService,
  optionalCustomerId,
  parseKeyword,
  parseResourceKind,
  type AdStatus,
  type MutableResource,
} from './validate.js';

export function setupInstructions(project: string | undefined): string {
  const query = project ? `?project=${encodeURIComponent(project)}` : '';
  return [
    'One-time Google Ads API setup:',
    '1. Use a Google Cloud project for FluencyPal ads. Access follows that project, not a developer token.',
    `2. Enable the Google Ads API: https://console.cloud.google.com/apis/library/googleads.googleapis.com${query}`,
    '3. On the Google Ads API overview, apply for Explorer access so production accounts can be queried.',
    `   https://console.cloud.google.com/apis/api/googleads.googleapis.com/overview${query}`,
    '4. Grant this CLI access, either:',
    '   - Service account: put its key at googleAds/.secrets/service-account.json and add that email in Google Ads under Admin > Access and security with Standard access. Admin is not available for service accounts.',
    '   - Or user OAuth: create a Desktop client, save the download as googleAds/.secrets/client_secret.json, then run `pnpm ads auth`.',
    `   https://console.cloud.google.com/auth/clients${query}`,
    '5. pnpm ads accounts',
    '6. Copy the customer id into googleAds/.env as GOOGLE_ADS_CUSTOMER_ID.',
    '   If calls go through a manager account, also set GOOGLE_ADS_LOGIN_CUSTOMER_ID.',
    '',
    'The landing conversion tag AW-16463260124 is not the customer id.',
  ].join('\n');
}

export async function runSetup(): Promise<void> {
  console.log(setupInstructions(loadConfig().cloudProject));
}

export async function runDoctor(argv: string[]): Promise<void> {
  const { values } = parseArgs({
    args: argv,
    options: { offline: { type: 'boolean', default: false } },
    strict: true,
  });
  const config = loadConfig();
  console.log(`Cloud project: ${config.cloudProject ?? '(not set)'}`);
  console.log(
    `Service account: ${config.serviceAccount ? config.serviceAccount.clientEmail : 'not configured'}`,
  );
  console.log(`OAuth client: ${config.clientId ? 'present' : 'missing'}`);
  console.log(`Client secret: ${config.clientSecret ? 'present' : 'missing'}`);
  console.log(`Refresh token: ${config.refreshToken ? 'present' : 'missing'}`);
  console.log(`Customer id: ${config.customerId ?? '(not set)'}`);
  console.log(`Login customer id: ${config.loginCustomerId ?? '(not set)'}`);
  console.log(`Developer token: ${config.developerToken ? 'present, sent optionally' : 'omitted'}`);

  const missing = missingCredentialFields(config);
  if (missing.length > 0) {
    console.log('');
    console.log(setupInstructions(config.cloudProject));
    throw new Error(`Missing ${missing.join(', ')}.`);
  }
  if (values.offline) return;

  const client = new GoogleAdsClient(config);
  const names = await client.listAccessibleCustomers();
  console.log(`Accessible customers: ${names.length > 0 ? names.join(', ') : 'none'}`);
  if (config.customerId) {
    const rows = await client.searchAll(config.customerId, CUSTOMER_QUERY, {
      loginCustomerId: config.loginCustomerId ?? config.customerId,
    });
    const name = textOf(nested(recordOf(rows[0])?.customer, 'descriptiveName'));
    console.log(`Default customer ${config.customerId}${name ? `: ${name}` : ''}`);
  }
}

export async function runAuth(): Promise<void> {
  await runOAuthConsent(loadConfig());
}

export async function runAccounts(): Promise<void> {
  const config = loadConfig();
  assertCredentials(config);
  const client = new GoogleAdsClient(config);
  const names = await client.listAccessibleCustomers();
  const accounts = [];
  for (const resourceName of names) {
    const id = resourceName.split('/')[1];
    if (!id) continue;
    try {
      const customerRows = await client.searchAll(id, CUSTOMER_QUERY, { loginCustomerId: id });
      const customer = recordOf(recordOf(customerRows[0])?.customer);
      const isManager = customer?.manager === true;
      const clients = isManager
        ? await client.searchAll(id, CLIENTS_QUERY, { loginCustomerId: id })
        : [];
      accounts.push({ id, customer: customerRows[0], clients });
      const label = textOf(nested(customer, 'descriptiveName')) || 'unnamed';
      const kind = isManager ? 'manager' : 'client';
      console.log(`${id}  ${kind}  ${label}`);
      for (const clientRow of clients) {
        const child = recordOf(clientRow)?.customerClient;
        const level = textOf(nested(child, 'level'));
        if (level === '0') continue;
        console.log(
          `  ${textOf(nested(child, 'id'))}  ${textOf(nested(child, 'status'))}  ${textOf(nested(child, 'descriptiveName'))}`,
        );
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      accounts.push({ id, error: message });
      console.log(`${id}  unavailable  ${message}`);
    }
  }
  if (accounts.length === 0) {
    console.log('No Google Ads customers are visible to this Google account.');
  }
  const written = writeSnapshot('accounts', { fetchedAt: new Date().toISOString(), accounts });
  console.log(`Wrote ${written.latest}`);
}

export async function runState(argv: string[]): Promise<void> {
  const { values } = parseArgs({
    args: argv,
    options: {
      customer: { type: 'string' },
      'login-customer': { type: 'string' },
      'include-removed': { type: 'boolean', default: false },
    },
    strict: true,
  });
  const config = loadConfig();
  assertCredentials(config);
  const customerId = requireCustomer(config, values.customer);
  const loginCustomerId = optionalCustomerId(values['login-customer']) ?? config.loginCustomerId;
  const includeRemoved = values['include-removed'];
  const client = new GoogleAdsClient(config);
  const snapshot: StateSnapshot = {
    fetchedAt: new Date().toISOString(),
    customerId,
    customer: [],
    campaigns: [],
    adGroups: [],
    ads: [],
    keywords: [],
    metrics: [],
    errors: [],
  };

  const queries: Array<[keyof Omit<StateSnapshot, 'fetchedAt' | 'customerId' | 'errors'>, string]> = [
    ['customer', CUSTOMER_QUERY],
    ['campaigns', campaignsQuery(includeRemoved)],
    ['adGroups', adGroupsQuery(includeRemoved)],
    ['ads', adsQuery(includeRemoved)],
    ['keywords', keywordsQuery(includeRemoved)],
    ['metrics', METRICS_QUERY],
  ];

  for (const [key, query] of queries) {
    try {
      snapshot[key] = await client.searchAll(customerId, query, { loginCustomerId });
    } catch (error) {
      snapshot.errors.push({ query: key, message: error instanceof Error ? error.message : String(error) });
    }
  }

  console.log(summarizeState(snapshot));
  const written = writeSnapshot('state', snapshot);
  console.log(`Wrote ${written.latest}`);
  if (snapshot.errors.length > 0) process.exitCode = 1;
}

export async function runHistory(argv: string[]): Promise<void> {
  const { values } = parseArgs({
    args: argv,
    options: {
      customer: { type: 'string' },
      'login-customer': { type: 'string' },
      days: { type: 'string', default: '30' },
    },
    strict: true,
  });
  const days = historyDays(values.days);
  const local = readJournal(paths.journalFile).map(
    (entry): TimelineItem => ({
      at: entry.at,
      source: 'local',
      summary: entry.summary,
      actor: entry.command,
      operation: entry.command,
      resourceName: entry.resourceName,
      ok: entry.ok,
    }),
  );

  const config = loadConfig();
  const googleItems: TimelineItem[] = [];
  let googleError: string | undefined;
  if (missingCredentialFields(config).length === 0) {
    try {
      const customerId = requireCustomer(config, values.customer);
      const client = new GoogleAdsClient(config);
      const rows = await client.searchAll(customerId, changeEventQuery(days), {
        loginCustomerId: optionalCustomerId(values['login-customer']) ?? config.loginCustomerId,
      });
      googleItems.push(...rows.map((row) => googleChangeToTimeline(row)));
    } catch (error) {
      googleError = error instanceof Error ? error.message : String(error);
    }
  } else {
    googleError = `Google change history skipped. Missing ${missingCredentialFields(config).join(', ')}.`;
  }

  const items = [...googleItems, ...local].sort((left, right) =>
    right.at.replace(' ', 'T').localeCompare(left.at.replace(' ', 'T')),
  );
  console.log(formatTimeline(items));
  if (googleError) console.error(`\n${googleError}`);
  const written = writeSnapshot('history', {
    fetchedAt: new Date().toISOString(),
    days,
    googleError,
    items,
  });
  console.log(`\nWrote ${written.latest}`);
  console.log(
    'Google keeps change_event for 30 days. history/operations.jsonl keeps changes made from this CLI.',
  );
}

export async function runNote(argv: string[]): Promise<void> {
  const { values } = parseArgs({
    args: argv,
    options: { text: { type: 'string' } },
    strict: true,
  });
  const text = values.text?.trim();
  if (!text) throw new Error('Pass --text "what we decided".');
  appendJournal(paths.journalFile, {
    at: new Date().toISOString(),
    source: 'local',
    command: 'note',
    ok: true,
    summary: text,
  });
  console.log(`Noted in ${paths.journalFile}`);
}

export async function runStatusChange(
  command: 'pause' | 'enable' | 'remove',
  argv: string[],
): Promise<void> {
  const { values } = parseArgs({
    args: argv,
    options: {
      customer: { type: 'string' },
      'login-customer': { type: 'string' },
      resource: { type: 'string' },
      id: { type: 'string' },
      'ad-group': { type: 'string' },
      'resource-name': { type: 'string' },
      confirm: { type: 'boolean', default: false },
      validate: { type: 'boolean', default: false },
    },
    strict: true,
  });
  const config = loadConfig();
  const customerId = requireCustomer(config, values.customer);
  const target = resolveTarget({
    customerId,
    resourceName: values['resource-name'],
    resource: values.resource,
    id: values.id,
    adGroup: values['ad-group'],
  });
  const mode = resolveApplyMode(values);
  const status: AdStatus = command === 'enable' ? 'ENABLED' : 'PAUSED';
  const payload =
    command === 'remove'
      ? buildRemoveMutation({ resourceName: target.resourceName, validateOnly: mode === 'validate' })
      : buildStatusMutation({
          resourceName: target.resourceName,
          status,
          validateOnly: mode === 'validate',
        });
  const verb =
    command === 'remove' ? 'Remove' : command === 'enable' ? 'Enable' : 'Pause';
  await commitMutation({
    config,
    mode,
    command,
    customerId,
    loginCustomerId: optionalCustomerId(values['login-customer']) ?? config.loginCustomerId,
    resourceName: target.resourceName,
    summary: `${verb} ${target.resource} ${target.resourceName}`,
    service: mutateService(target.resource),
    payload,
  });
}

export async function runCreateAd(argv: string[]): Promise<void> {
  const { values } = parseArgs({
    args: argv,
    options: {
      customer: { type: 'string' },
      'login-customer': { type: 'string' },
      'ad-group': { type: 'string' },
      'final-url': { type: 'string' },
      headline: { type: 'string', multiple: true },
      description: { type: 'string', multiple: true },
      status: { type: 'string', default: 'paused' },
      confirm: { type: 'boolean', default: false },
      validate: { type: 'boolean', default: false },
    },
    strict: true,
  });
  if (!values['ad-group'] || !values['final-url']) {
    throw new Error('create-ad needs --ad-group and --final-url, plus at least 3 --headline and 2 --description flags.');
  }
  const config = loadConfig();
  const customerId = requireCustomer(config, values.customer);
  const status = adStatus(values.status);
  const mode = resolveApplyMode(values);
  const payload = buildResponsiveSearchAdMutation({
    customerId,
    adGroupId: values['ad-group'],
    finalUrl: values['final-url'],
    headlines: many(values.headline),
    descriptions: many(values.description),
    status,
    validateOnly: mode === 'validate',
  });
  const serving =
    status === 'ENABLED' ? ' The ad will be ENABLED and can serve if its campaign is enabled.' : '';
  await commitMutation({
    config,
    mode,
    command: 'create-ad',
    customerId,
    loginCustomerId: optionalCustomerId(values['login-customer']) ?? config.loginCustomerId,
    resourceName: adGroupResourceName(customerId, values['ad-group']),
    summary: `Create ${status} responsive search ad in ${adGroupResourceName(customerId, values['ad-group'])}.${serving}`,
    service: 'adGroupAds:mutate',
    payload,
  });
}

export async function runCreateSearch(argv: string[]): Promise<void> {
  const { values } = parseArgs({
    args: argv,
    options: {
      customer: { type: 'string' },
      'login-customer': { type: 'string' },
      name: { type: 'string' },
      'daily-budget': { type: 'string' },
      'final-url': { type: 'string' },
      headline: { type: 'string', multiple: true },
      description: { type: 'string', multiple: true },
      keyword: { type: 'string', multiple: true },
      status: { type: 'string', default: 'paused' },
      confirm: { type: 'boolean', default: false },
      validate: { type: 'boolean', default: false },
    },
    strict: true,
  });
  if (!values.name || !values['daily-budget'] || !values['final-url']) {
    throw new Error('create-search needs --name, --daily-budget, and --final-url.');
  }
  const config = loadConfig();
  const customerId = requireCustomer(config, values.customer);
  const status = adStatus(values.status);
  const mode = resolveApplyMode(values);
  const payload = buildSearchCampaignMutation({
    customerId,
    name: values.name,
    dailyBudget: values['daily-budget'],
    finalUrl: values['final-url'],
    headlines: many(values.headline),
    descriptions: many(values.description),
    keywords: many(values.keyword).map((keyword) => parseKeyword(keyword)),
    status,
    validateOnly: mode === 'validate',
  });
  const serving =
    status === 'ENABLED'
      ? ' This campaign will be ENABLED and can spend the daily budget.'
      : ' Campaign and ad stay paused, so this does not spend.';
  await commitMutation({
    config,
    mode,
    command: 'create-search',
    customerId,
    loginCustomerId: optionalCustomerId(values['login-customer']) ?? config.loginCustomerId,
    summary: `Create ${status} search campaign "${values.name.trim()}" with daily budget ${values['daily-budget']}.${serving}`,
    service: 'googleAds:mutate',
    payload,
  });
}

async function commitMutation(input: {
  config: AdsConfig;
  mode: ApplyMode;
  command: string;
  customerId: string;
  loginCustomerId?: string;
  resourceName?: string;
  summary: string;
  service: string;
  payload: unknown;
}): Promise<void> {
  console.log(input.summary);
  console.log(JSON.stringify(input.payload, null, 2));
  if (input.mode === 'dry-run') {
    console.log('Not applied. Re-run with --confirm to apply, or --validate to ask Google to check it.');
    return;
  }
  assertCredentials(input.config);
  const client = new GoogleAdsClient(input.config);
  try {
    const result = await client.mutate(input.customerId, input.service, input.payload, {
      loginCustomerId: input.loginCustomerId,
    });
    if (input.mode === 'apply') {
      appendJournal(paths.journalFile, {
        at: new Date().toISOString(),
        source: 'local',
        command: input.command,
        ok: true,
        summary: input.summary,
        customerId: input.customerId,
        resourceName: input.resourceName,
        requestId: result.requestId,
        detail: clipDetail(result.body),
      });
      console.log(`Applied.${result.requestId ? ` request-id: ${result.requestId}` : ''}`);
      console.log(`Recorded in ${paths.journalFile}`);
      return;
    }
    console.log(
      `Google accepted the request as valid. Nothing was changed.${result.requestId ? ` request-id: ${result.requestId}` : ''}`,
    );
  } catch (error) {
    appendJournal(paths.journalFile, {
      at: new Date().toISOString(),
      source: 'local',
      command: input.command,
      ok: false,
      summary: input.summary,
      customerId: input.customerId,
      resourceName: input.resourceName,
      requestId: error instanceof GoogleAdsApiError ? error.requestId : undefined,
      detail: clipDetail({
        message: error instanceof Error ? error.message : String(error),
        hint: error instanceof GoogleAdsApiError ? error.hint : undefined,
      }),
    });
    throw error;
  }
}

function resolveTarget(input: {
  customerId: string;
  resourceName?: string;
  resource?: string;
  id?: string;
  adGroup?: string;
}): { resource: MutableResource; resourceName: string } {
  if (input.resourceName) {
    const resource = detectResource(input.resourceName);
    return { resource, resourceName: input.resourceName };
  }
  if (!input.resource || !input.id) {
    throw new Error('Pass --resource-name, or --resource and --id.');
  }
  const resource = parseResourceKind(input.resource);
  if (resource === 'campaign') {
    return { resource, resourceName: campaignResourceName(input.customerId, input.id) };
  }
  if (resource === 'ad_group') {
    return { resource, resourceName: adGroupResourceName(input.customerId, input.id) };
  }
  const [groupFromId, adFromId] = input.id.split('~');
  const adGroupId = input.adGroup ?? groupFromId;
  const adId = input.adGroup ? input.id : adFromId;
  if (!adGroupId || !adId || input.id.split('~').length > 2) {
    throw new Error('An ad needs --ad-group and --id, or --id in the form adGroupId~adId.');
  }
  return { resource, resourceName: adResourceName(input.customerId, adGroupId, adId) };
}

function requireCustomer(config: AdsConfig, override: string | undefined): string {
  const customerId = optionalCustomerId(override) ?? config.customerId;
  if (!customerId) {
    throw new Error('Pass --customer or set GOOGLE_ADS_CUSTOMER_ID. Discover ids with `pnpm ads accounts`.');
  }
  return customerId;
}

function assertCredentials(config: AdsConfig): void {
  const missing = missingCredentialFields(config);
  if (missing.length > 0) {
    throw new Error(`Missing ${missing.join(', ')}. Run \`pnpm ads doctor\`.`);
  }
}

function historyDays(value: string | undefined): 7 | 14 | 30 {
  if (value === '7' || value === '14' || value === '30') return Number(value) as 7 | 14 | 30;
  throw new Error('--days must be 7, 14, or 30. Google keeps change_event for 30 days.');
}

function many(value: string | string[] | boolean | undefined): string[] {
  if (typeof value === 'string') return [value];
  if (Array.isArray(value)) return value;
  return [];
}
