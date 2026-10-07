import { mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

import { paths } from './paths.js';
import { formatMicros } from './validate.js';

export type StateSnapshot = {
  fetchedAt: string;
  customerId: string;
  customer: unknown[];
  campaigns: unknown[];
  adGroups: unknown[];
  ads: unknown[];
  keywords: unknown[];
  metrics: unknown[];
  errors: Array<{ query: string; message: string }>;
};

export type TimelineItem = {
  at: string;
  source: 'google' | 'local';
  summary: string;
  actor?: string;
  operation?: string;
  resourceName?: string;
  ok?: boolean;
};

export function recordOf(value: unknown): Record<string, unknown> | undefined {
  if (value && typeof value === 'object' && !Array.isArray(value)) {
    return value as Record<string, unknown>;
  }
  return undefined;
}

export function nested(row: unknown, ...keys: string[]): unknown {
  let current: unknown = row;
  for (const key of keys) {
    current = recordOf(current)?.[key];
  }
  return current;
}

export function textOf(value: unknown): string {
  if (typeof value === 'string') return value;
  if (typeof value === 'number' || typeof value === 'boolean') return String(value);
  if (Array.isArray(value)) return value.map((item) => textOf(item)).join(', ');
  const paths = recordOf(value)?.paths;
  if (Array.isArray(paths)) return paths.map((item) => textOf(item)).join(', ');
  if (value == null) return '';
  return JSON.stringify(value);
}

export function summarizeState(snapshot: StateSnapshot): string {
  const customer = recordOf(snapshot.customer[0])?.customer;
  const name = textOf(nested(customer, 'descriptiveName')) || 'unnamed';
  const currency = textOf(nested(customer, 'currencyCode'));
  const timeZone = textOf(nested(customer, 'timeZone'));
  const manager = nested(customer, 'manager') === true ? ' manager' : '';
  const testAccount = nested(customer, 'testAccount') === true ? ' test' : '';
  const lines = [
    `Customer ${snapshot.customerId} ${name}${manager}${testAccount} (${currency || 'currency unknown'}, ${timeZone || 'timezone unknown'})`,
    countLine('Campaigns', snapshot.campaigns, 'campaign'),
    countLine('Ad groups', snapshot.adGroups, 'adGroup'),
    countLine('Ads', snapshot.ads, 'adGroupAd'),
    `Keywords: ${snapshot.keywords.length}`,
    `Last 30 days: ${summarizeMetrics(snapshot.metrics, currency)}`,
  ];

  for (const row of snapshot.campaigns) {
    const campaign = recordOf(row)?.campaign;
    const budget = recordOf(row)?.campaignBudget;
    const id = textOf(nested(campaign, 'id'));
    const campaignName = textOf(nested(campaign, 'name'));
    const status = textOf(nested(campaign, 'status'));
    const channel = textOf(nested(campaign, 'advertisingChannelType'));
    const amount = nested(budget, 'amountMicros');
    const budgetText =
      typeof amount === 'string' || typeof amount === 'number'
        ? ` budget ${formatMicros(amount)} ${currency}`.trimEnd()
        : '';
    lines.push(`  ${status.padEnd(8)} ${channel.padEnd(12)} ${id}  ${campaignName}${budgetText}`);
  }

  for (const row of snapshot.ads) {
    const adGroupAd = recordOf(row)?.adGroupAd;
    const ad = recordOf(adGroupAd)?.ad;
    const status = textOf(nested(adGroupAd, 'status'));
    const adId = textOf(nested(ad, 'id'));
    const adGroupId = textOf(nested(row, 'adGroup', 'id'));
    const type = textOf(nested(ad, 'type'));
    const campaignName = textOf(nested(row, 'campaign', 'name'));
    const headlines = headlinePreview(nested(ad, 'responsiveSearchAd', 'headlines'));
    lines.push(
      `  ad ${status.padEnd(8)} ${adGroupId}~${adId}  ${type}  ${campaignName}${headlines ? `  ${headlines}` : ''}`,
    );
  }

  if (snapshot.errors.length > 0) {
    lines.push('Partial snapshot:');
    for (const error of snapshot.errors) {
      lines.push(`  ${error.query}: ${error.message}`);
    }
  }

  return lines.join('\n');
}

export function googleChangeToTimeline(row: unknown): TimelineItem {
  const change = recordOf(row)?.changeEvent;
  const when = textOf(nested(change, 'changeDateTime'));
  const operation = textOf(nested(change, 'resourceChangeOperation'));
  const resourceType = textOf(nested(change, 'changeResourceType'));
  const resourceName = textOf(nested(change, 'changeResourceName'));
  const fields = textOf(nested(change, 'changedFields'));
  const campaignName = textOf(nested(row, 'campaign', 'name'));
  const summary = [operation, resourceType, campaignName, fields].filter(Boolean).join(' ');
  return {
    at: when,
    source: 'google',
    summary: summary || resourceName || 'change',
    actor: textOf(nested(change, 'userEmail')) || textOf(nested(change, 'clientType')),
    operation,
    resourceName,
  };
}

export function formatTimeline(items: TimelineItem[]): string {
  if (items.length === 0) return 'No changes in this window.';
  return items
    .map((item) => {
      const actor = item.actor ? `  ${item.actor}` : '';
      const ok = item.ok === false ? '  FAILED' : '';
      const resource = item.resourceName ? `  ${item.resourceName}` : '';
      return `${item.at}  ${item.source.padEnd(6)}  ${item.summary}${actor}${resource}${ok}`;
    })
    .join('\n');
}

export function writeSnapshot(name: string, data: unknown): { stamped: string; latest: string } {
  mkdirSync(paths.snapshotsDir, { recursive: true });
  const stamp = new Date().toISOString().replace(/[:.]/g, '-');
  const stamped = join(paths.snapshotsDir, `${name}-${stamp}.json`);
  const latest = join(paths.snapshotsDir, `${name}-latest.json`);
  const json = `${JSON.stringify(data, null, 2)}\n`;
  writeFileSync(stamped, json);
  writeFileSync(latest, json);
  return { stamped, latest };
}

function countLine(label: string, rows: unknown[], key: string): string {
  const counts = new Map<string, number>();
  for (const row of rows) {
    const status = textOf(nested(row, key, 'status')) || 'UNKNOWN';
    counts.set(status, (counts.get(status) ?? 0) + 1);
  }
  const parts = [...counts.entries()].map(([status, count]) => `${count} ${status.toLowerCase()}`);
  return `${label}: ${rows.length}${parts.length ? ` (${parts.join(', ')})` : ''}`;
}

function summarizeMetrics(rows: unknown[], currency: string): string {
  let impressions = 0n;
  let clicks = 0n;
  let cost = 0n;
  let conversions = 0;
  for (const row of rows) {
    const metrics = recordOf(row)?.metrics;
    impressions += big(nested(metrics, 'impressions'));
    clicks += big(nested(metrics, 'clicks'));
    cost += big(nested(metrics, 'costMicros'));
    conversions += Number(nested(metrics, 'conversions') ?? 0);
  }
  const money = `${formatMicros(cost.toString())}${currency ? ` ${currency}` : ''}`;
  return `${impressions.toString()} impressions, ${clicks.toString()} clicks, ${money}, ${conversions} conversions`;
}

function big(value: unknown): bigint {
  if (typeof value === 'number' && Number.isFinite(value)) return BigInt(Math.trunc(value));
  if (typeof value === 'string' && /^-?\d+$/.test(value)) return BigInt(value);
  return 0n;
}

function headlinePreview(value: unknown): string {
  if (!Array.isArray(value)) return '';
  const texts = value
    .map((item) => textOf(recordOf(item)?.text))
    .filter(Boolean)
    .slice(0, 3);
  return texts.join(' | ');
}
