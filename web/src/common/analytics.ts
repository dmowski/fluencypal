export interface UserSource {
  urlPath: string;
  referrer: string;

  utmSource: string | null;
  utmMedium: string | null;
  utmCampaign: string | null;
  utmTerm: string | null;
  utmContent: string | null;

  gclid: string | null;
  gbraid: string | null;
  wbraid: string | null;
}
