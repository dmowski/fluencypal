# Google Ads

CLI for FluencyPal's own Google Ads account. Do not import this package from `webApp/` or `landing/`.

The landing tag `AW-16463260124` is conversion tracking. It is not the API customer id. Discover the customer id with `pnpm ads accounts`.

API access belongs to the Google Cloud project that owns the credentials. The project for this repo is `fluencypal-campaigns`, and the Google Ads API is enabled there. Developer tokens were sunset on 2026-09-09; this CLI sends one only when `GOOGLE_ADS_DEVELOPER_TOKEN` is set, and Google ignores it.

Sign-in uses the service account `ads-cli@fluencypal-campaigns.iam.gserviceaccount.com` (key at `.secrets/service-account.json`), or a user refresh token from `pnpm ads auth`. The service account must be added in Google Ads under Admin, Access and security, with Standard access. Google Ads does not allow the Admin role for service accounts. Production accounts also need Explorer access on `fluencypal-campaigns`.

## Commands

From `googleAds/`:

- `pnpm ads doctor` — show which credentials exist, then list accessible customers
- `pnpm ads setup` — print the one-time Cloud Console steps
- `pnpm ads auth` — browser OAuth; writes `.secrets/oauth.json`
- `pnpm ads accounts` — accounts this Google user can access
- `pnpm ads state` — campaigns, ad groups, ads, keywords, and last-30-day metrics
- `pnpm ads history` — Google `change_event` (30 days) plus `history/operations.jsonl`
- `pnpm ads note --text "..."` — append a decision to the local journal
- `pnpm ads create-ad` — responsive search ad in an existing ad group
- `pnpm ads create-search` — search campaign, budget, ad group, keywords, and ad
- `pnpm ads pause` / `stop` / `enable` / `remove`

`state` and `history` write JSON under `snapshots/`. That directory is gitignored. The journal at `history/operations.jsonl` is the shared record of changes made from this repo; commit it when it changes. Never commit `.env` or `.secrets/`.

## Safety

- New campaigns and ads default to paused.
- A mutation prints its request and does not call Google until `--confirm`.
- `--validate` asks Google to check the request without applying it.
- Pass `--confirm` only when the user asked to apply that change.
- `remove` is permanent for serving. Prefer `pause` when the user says stop.
- Do not print refresh tokens, client secrets, or access tokens.

## When credentials are missing

Run `pnpm ads doctor` and follow its links. Production accounts need Explorer (or higher) access on the Cloud project. After `pnpm ads auth`, run `pnpm ads accounts`, then set `GOOGLE_ADS_CUSTOMER_ID` in `.env`. Set `GOOGLE_ADS_LOGIN_CUSTOMER_ID` when the OAuth user acts through a manager account.
