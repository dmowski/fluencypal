export type TrafficSource = {
  utmSource: string;
  utmMedium: string;
  utmCampaign: string;
  gclid: string;
  referrerHost: string;
};

const param = (url: URL, name: string): string => url.searchParams.get(name)?.trim() || '';

export const parseTraffic = (href: string, referrer: string): TrafficSource => {
  let utmSource = '';
  let utmMedium = '';
  let utmCampaign = '';
  let gclid = '';
  try {
    const url = new URL(href);
    utmSource = param(url, 'utm_source');
    utmMedium = param(url, 'utm_medium');
    utmCampaign = param(url, 'utm_campaign');
    gclid = param(url, 'gclid');
  } catch {
    // ignore invalid href
  }

  let referrerHost = '';
  try {
    if (referrer) referrerHost = new URL(referrer).host;
  } catch {
    referrerHost = '';
  }

  return { utmSource, utmMedium, utmCampaign, gclid, referrerHost };
};
