type AdsFailureError = {
  message?: string;
  errorCode?: Record<string, string>;
};

type AdsErrorBody = {
  error?: {
    message?: string;
    status?: string;
    details?: Array<{
      requestId?: string;
      errors?: AdsFailureError[];
    }>;
  };
};

export type ExplainedAdsError = {
  summary: string;
  requestId?: string;
  hint?: string;
  codes: string[];
};

export function explainAdsFailure(
  status: number,
  body: unknown,
  context: { cloudProject?: string; identity?: string } = {},
): ExplainedAdsError {
  if (!body || typeof body !== 'object') {
    const summary = typeof body === 'string' && body.trim() ? body.trim() : `HTTP ${status}`;
    return { summary, codes: [] };
  }

  const error = (body as AdsErrorBody).error;
  const details = error?.details ?? [];
  const requestId = details.find((detail) => detail.requestId)?.requestId;
  const failures = details.flatMap((detail) => detail.errors ?? []);
  const codes = failures.flatMap((failure) => flattenErrorCode(failure.errorCode));
  const messages = failures
    .map((failure) => failure.message)
    .filter((message): message is string => Boolean(message));
  const top = error?.message ?? error?.status ?? `HTTP ${status}`;
  const summary = messages.length > 0 ? messages.join('; ') : top;

  return {
    summary,
    requestId,
    codes,
    hint: hintForCodes(codes, context),
  };
}

function flattenErrorCode(errorCode: Record<string, string> | undefined): string[] {
  if (!errorCode) return [];
  return Object.entries(errorCode).map(([group, value]) => `${group}.${value}`);
}

function hintForCodes(
  codes: string[],
  context: { cloudProject?: string; identity?: string },
): string | undefined {
  const project = context.cloudProject ? ` Project: ${context.cloudProject}.` : '';
  const identity = context.identity ?? 'the signed-in account';
  if (
    codes.some(
      (code) =>
        code.endsWith('CLOUD_PROJECT_NOT_APPROVED_FOR_PRODUCTION') ||
        code.endsWith('DEVELOPER_TOKEN_NOT_APPROVED'),
    )
  ) {
    const overview = context.cloudProject
      ? `https://console.cloud.google.com/apis/api/googleads.googleapis.com/overview?project=${context.cloudProject}`
      : 'https://console.cloud.google.com/apis/library/googleads.googleapis.com';
    return `This Cloud project can call Google Ads test accounts only. Open the Google Ads API overview and apply for Explorer access.${project} ${overview}`;
  }
  if (codes.some((code) => code.endsWith('NOT_ADS_USER'))) {
    return `Google Ads does not list ${identity} on an ads account. In Google Ads, open Admin, Access and security, and add that email with Standard access. Admin is not available for service accounts. Then run \`pnpm ads accounts\`.`;
  }
  if (codes.some((code) => code.endsWith('USER_PERMISSION_DENIED'))) {
    return 'The Google account that granted OAuth does not have access to this customer id. Run `pnpm ads accounts` and confirm the id, or sign in with an account that can administer the ads account.';
  }
  if (codes.some((code) => code.endsWith('CUSTOMER_NOT_FOUND'))) {
    return 'That customer id was not found for these credentials. Run `pnpm ads accounts`.';
  }
  if (codes.some((code) => code.endsWith('ACTION_NOT_PERMITTED'))) {
    return `The Cloud project is not allowed to perform that action. Check Google Ads API access on the project that owns the OAuth client.${project}`;
  }
  return undefined;
}

export class GoogleAdsApiError extends Error {
  readonly status: number;
  readonly requestId: string | undefined;
  readonly hint: string | undefined;
  readonly codes: string[];
  readonly body: unknown;

  constructor(
    status: number,
    body: unknown,
    options: { cloudProject?: string; identity?: string; requestId?: string } = {},
  ) {
    const explained = explainAdsFailure(status, body, options);
    super(explained.summary);
    this.name = 'GoogleAdsApiError';
    this.status = status;
    this.requestId = explained.requestId ?? options.requestId;
    this.hint = explained.hint;
    this.codes = explained.codes;
    this.body = body;
  }
}
