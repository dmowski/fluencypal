# Google Ads

Command-line access to FluencyPal's Google Ads account: current state, change history, and creating or pausing ads.

This is separate from the landing-page conversion tag (`AW-16463260124` in `landing/`). That tag records visits. This folder talks to the Google Ads API.

## Install

```bash
cd googleAds
pnpm install
pnpm test
pnpm typecheck
```

## One-time connection

Google ties API access to the Cloud project that owns the credentials. Developer tokens are no longer required.

This repo uses Cloud project `fluencypal-campaigns`. The Google Ads API is enabled there.

1. Apply for Explorer access: https://console.cloud.google.com/apis/api/googleads.googleapis.com/overview?project=fluencypal-campaigns
2. In Google Ads, open Admin, Access and security, and add `ads-cli@fluencypal-campaigns.iam.gserviceaccount.com` with Standard access. Admin is not available for service accounts.
3. `pnpm ads accounts`
4. Copy `.env.example` to `.env` and set `GOOGLE_ADS_CUSTOMER_ID`. If calls go through a manager account, also set `GOOGLE_ADS_LOGIN_CUSTOMER_ID`.

The service account key lives at `.secrets/service-account.json`. To use your own Google login instead, create a Desktop OAuth client, save it as `.secrets/client_secret.json`, remove the service account file, and run `pnpm ads auth`.

`.env` and `.secrets/` stay on this machine.

## Everyday commands

```bash
pnpm ads doctor
pnpm ads state
pnpm ads history
pnpm ads note --text "Paused the brand campaign while we rewrite headlines."
```

`state` prints campaigns and ads, and writes `snapshots/state-latest.json`. `history` merges Google's 30-day change log with `history/operations.jsonl`, which is the record of changes made from this CLI.

Create a paused responsive search ad in an existing ad group:

```bash
pnpm ads create-ad \
  --ad-group 123 \
  --final-url https://www.fluencypal.com \
  --headline "Speak English with AI" \
  --headline "Daily speaking practice" \
  --headline "FluencyPal" \
  --description "Real conversations with instant feedback." \
  --description "Built for intermediate and advanced learners."
```

That prints the request and does not send it. Add `--validate` to ask Google to check it, or `--confirm` to create it. New ads and campaigns stay paused unless you pass `--status enabled`.

Pause something that is already running:

```bash
pnpm ads pause --resource campaign --id 456 --confirm
pnpm ads pause --resource ad --ad-group 123 --id 789 --confirm
```

`enable` turns it back on. `remove` stops it permanently; prefer `pause`.
