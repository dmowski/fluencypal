import { JWT } from 'google-auth-library';

const GSC_SCOPE = 'https://www.googleapis.com/auth/webmasters.readonly';
const SITES_URL = 'https://searchconsole.googleapis.com/webmasters/v3/sites';

const isoDateUtc = (date) => date.toISOString().slice(0, 10);

const gscWindow = () => {
  const end = new Date();
  end.setUTCDate(end.getUTCDate() - 3);
  const start = new Date(end);
  start.setUTCDate(start.getUTCDate() - 6);
  return { startDate: isoDateUtc(start), endDate: isoDateUtc(end) };
};

const mapRows = (payload, dimensions) => {
  const rows = Array.isArray(payload?.rows) ? payload.rows : [];
  return rows.map((row) => {
    const keys = row.keys || [];
    const item = {
      clicks: row.clicks || 0,
      impressions: row.impressions || 0,
      ctr: row.ctr || 0,
      position: row.position || 0,
    };
    dimensions.forEach((dimension, index) => {
      item[dimension] = keys[index] || '';
    });
    return item;
  });
};

const pickSiteUrl = (entries, preferred) => {
  const urls = entries.map((entry) => entry.siteUrl).filter(Boolean);
  if (preferred && urls.includes(preferred)) return preferred;
  const domain = urls.find((url) => url === 'sc-domain:fluencypal.com');
  if (domain) return domain;
  const www = urls.find((url) => url === 'https://www.fluencypal.com/');
  if (www) return www;
  return urls.find((url) => String(url).includes('fluencypal.com')) || urls[0] || '';
};

const querySearchAnalytics = async (token, siteUrl, startDate, endDate, dimensions) => {
  const encoded = encodeURIComponent(siteUrl);
  const response = await fetch(
    `https://searchconsole.googleapis.com/webmasters/v3/sites/${encoded}/searchAnalytics/query`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        startDate,
        endDate,
        dimensions,
        rowLimit: 25,
        type: 'web',
      }),
    },
  );
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    const message = payload.error?.message || `Search Console query failed (${response.status})`;
    throw new Error(message);
  }
  return mapRows(payload, dimensions);
};

export const fetchSearchConsoleInsights = async (serviceAccount) => {
  const { startDate, endDate } = gscWindow();
  const grantTo = serviceAccount.client_email;
  const preferred = process.env.GSC_SITE_URL || '';

  try {
    const jwt = new JWT({
      email: serviceAccount.client_email,
      key: serviceAccount.private_key,
      scopes: [GSC_SCOPE],
    });
    const tokens = await jwt.authorize();
    const token = tokens.access_token;
    if (!token) throw new Error('No Search Console access token');

    const sitesResponse = await fetch(SITES_URL, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const sitesPayload = await sitesResponse.json().catch(() => ({}));
    if (!sitesResponse.ok) {
      const message = sitesPayload.error?.message || `List sites failed (${sitesResponse.status})`;
      throw new Error(message);
    }

    const siteUrl = pickSiteUrl(sitesPayload.siteEntry || [], preferred);
    if (!siteUrl) {
      return {
        available: false,
        startDate,
        endDate,
        grantTo,
        error:
          'No Search Console property visible. Add this service account as a user on the fluencypal.com property.',
      };
    }

    const [queries, pages, countries] = await Promise.all([
      querySearchAnalytics(token, siteUrl, startDate, endDate, ['query']),
      querySearchAnalytics(token, siteUrl, startDate, endDate, ['page']),
      querySearchAnalytics(token, siteUrl, startDate, endDate, ['country']),
    ]);

    return {
      available: true,
      siteUrl,
      startDate,
      endDate,
      lagNote: 'Search Console data lags about 2–3 days; this window ends 3 days ago.',
      queries,
      pages,
      countries,
    };
  } catch (error) {
    return {
      available: false,
      startDate,
      endDate,
      grantTo,
      error: error instanceof Error ? error.message : 'Search Console export failed',
    };
  }
};
