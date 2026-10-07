export const ADS_API_VERSION = 'v25';
export const ADS_SCOPE = 'https://www.googleapis.com/auth/adwords';

export type AdStatus = 'PAUSED' | 'ENABLED';
export type KeywordMatchType = 'EXACT' | 'PHRASE' | 'BROAD';
export type MutableResource = 'campaign' | 'ad_group' | 'ad';

export function codePointLength(value: string): number {
  return Array.from(value).length;
}

export function normalizeCustomerId(value: string): string {
  const digits = value.trim().replace(/-/g, '');
  if (!/^\d{1,10}$/.test(digits)) {
    throw new Error(
      `Google Ads customer ids are 1–10 digits, hyphens optional. Received "${value}". The AW- conversion tag on the landing site is not a customer id.`,
    );
  }
  return digits;
}

export function optionalCustomerId(value: string | undefined): string | undefined {
  if (!value?.trim()) return undefined;
  return normalizeCustomerId(value);
}

export function adStatus(value: string): AdStatus {
  const normalized = value.trim().toLowerCase();
  if (normalized === 'paused' || normalized === 'pause' || normalized === 'stop') return 'PAUSED';
  if (normalized === 'enabled' || normalized === 'enable' || normalized === 'active') {
    return 'ENABLED';
  }
  throw new Error('Status must be "paused" or "enabled".');
}

export function currencyToMicros(amount: string): string {
  const trimmed = amount.trim();
  if (!/^\d+(\.\d{1,6})?$/.test(trimmed)) {
    throw new Error(`Daily budget must be a positive amount like 20 or 12.50. Received "${amount}".`);
  }
  const [whole, fraction = ''] = trimmed.split('.');
  const micros = BigInt(whole) * 1_000_000n + BigInt(fraction.padEnd(6, '0'));
  if (micros <= 0n) {
    throw new Error('Daily budget must be greater than 0.');
  }
  return micros.toString();
}

export function formatMicros(micros: string | number): string {
  const raw = typeof micros === 'number' ? BigInt(Math.trunc(micros)) : BigInt(micros);
  const negative = raw < 0n;
  const abs = negative ? -raw : raw;
  const cents = (abs + 5_000n) / 10_000n;
  const whole = cents / 100n;
  const fraction = (cents % 100n).toString().padStart(2, '0');
  return `${negative ? '-' : ''}${whole.toString()}.${fraction}`;
}

export function parseKeyword(value: string): { text: string; matchType: KeywordMatchType } {
  const trimmed = value.trim();
  const match = /^(EXACT|PHRASE|BROAD)\s*:\s*(.+)$/i.exec(trimmed);
  if (!match?.[1] || !match[2]?.trim()) {
    if (!trimmed) throw new Error('Keyword text is empty.');
    return { text: trimmed, matchType: 'PHRASE' };
  }
  return {
    text: match[2].trim(),
    matchType: match[1].toUpperCase() as KeywordMatchType,
  };
}

export type ResponsiveSearchAdInput = {
  headlines: string[];
  descriptions: string[];
  finalUrl: string;
};

export function validateResponsiveSearchAd(input: ResponsiveSearchAdInput): {
  headlines: string[];
  descriptions: string[];
  finalUrl: string;
} {
  const headlines = input.headlines.map((item) => item.trim()).filter(Boolean);
  const descriptions = input.descriptions.map((item) => item.trim()).filter(Boolean);
  const errors: string[] = [];

  if (headlines.length < 3 || headlines.length > 15) {
    errors.push(`Responsive search ads need 3 to 15 headlines. Received ${headlines.length}.`);
  }
  if (descriptions.length < 2 || descriptions.length > 4) {
    errors.push(
      `Responsive search ads need 2 to 4 descriptions. Received ${descriptions.length}.`,
    );
  }

  const seenHeadlines = new Set<string>();
  for (const headline of headlines) {
    if (codePointLength(headline) > 30) {
      errors.push(`Headline exceeds 30 characters (${codePointLength(headline)}): ${headline}`);
    }
    const key = headline.toLocaleLowerCase();
    if (seenHeadlines.has(key)) errors.push(`Duplicate headline: ${headline}`);
    seenHeadlines.add(key);
  }

  const seenDescriptions = new Set<string>();
  for (const description of descriptions) {
    if (codePointLength(description) > 90) {
      errors.push(
        `Description exceeds 90 characters (${codePointLength(description)}): ${description}`,
      );
    }
    const key = description.toLocaleLowerCase();
    if (seenDescriptions.has(key)) errors.push(`Duplicate description: ${description}`);
    seenDescriptions.add(key);
  }

  let finalUrl = '';
  try {
    const url = new URL(input.finalUrl.trim());
    if (url.protocol !== 'http:' && url.protocol !== 'https:') {
      errors.push('Final URL must use http or https.');
    } else {
      finalUrl = url.toString();
    }
  } catch {
    errors.push(`Final URL must be an absolute http(s) URL. Received "${input.finalUrl}".`);
  }

  if (errors.length > 0) {
    throw new Error(errors.join('\n'));
  }

  return { headlines, descriptions, finalUrl };
}

export function campaignResourceName(customerId: string, campaignId: string): string {
  return `customers/${normalizeCustomerId(customerId)}/campaigns/${requireDigits(campaignId, 'Campaign id')}`;
}

export function adGroupResourceName(customerId: string, adGroupId: string): string {
  return `customers/${normalizeCustomerId(customerId)}/adGroups/${requireDigits(adGroupId, 'Ad group id')}`;
}

export function adResourceName(customerId: string, adGroupId: string, adId: string): string {
  return `customers/${normalizeCustomerId(customerId)}/adGroupAds/${requireDigits(adGroupId, 'Ad group id')}~${requireDigits(adId, 'Ad id')}`;
}

function requireDigits(value: string, label: string): string {
  const digits = value.trim();
  if (!/^\d+$/.test(digits)) {
    throw new Error(`${label} must be digits. Received "${value}".`);
  }
  return digits;
}

export function detectResource(resourceName: string): MutableResource {
  if (/^customers\/\d{1,10}\/campaigns\/\d+$/.test(resourceName)) return 'campaign';
  if (/^customers\/\d{1,10}\/adGroups\/\d+$/.test(resourceName)) return 'ad_group';
  if (/^customers\/\d{1,10}\/adGroupAds\/\d+~\d+$/.test(resourceName)) return 'ad';
  throw new Error(
    `Resource name must look like customers/123/campaigns/456, customers/123/adGroups/456, or customers/123/adGroupAds/456~789. Received "${resourceName}".`,
  );
}

export function parseResourceKind(value: string): MutableResource {
  const normalized = value.trim().toLowerCase().replace(/-/g, '_');
  if (normalized === 'campaign') return 'campaign';
  if (normalized === 'ad_group' || normalized === 'adgroup') return 'ad_group';
  if (normalized === 'ad') return 'ad';
  throw new Error('Resource must be campaign, ad-group, or ad.');
}

export function mutateService(resource: MutableResource): string {
  if (resource === 'campaign') return 'campaigns:mutate';
  if (resource === 'ad_group') return 'adGroups:mutate';
  return 'adGroupAds:mutate';
}
