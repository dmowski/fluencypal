# Analytics interventions

Log every product change made because of custom analytics. This stops repeating the same experiment.

| Date       | Hypothesis               | Change                                                                                | Metric to watch                        | Status  | Result |
| ---------- | ------------------------ | ------------------------------------------------------------------------------------- | -------------------------------------- | ------- | ------ |
| 2026-08-28 | Baseline instrumentation | Scroll, time-on-landing, CTA intent, conversation_start, paywall, bot filter, GEO/UTM | Funnel + landing duration + CTA clicks | shipped | —      |
| 2026-08-29 | Crawler page_views look like Chrome and poison practice→speak | Do not persist first `page_view` until click/scroll/leave/identify; hide lone page_view visitors from reports | Share of practice visitors with eventCount=1 | shipped | —      |

Status: `proposed` → `shipped` → `measured` → `keep` / `reverted`.

Rules:

- Do not propose a change that is already `shipped` or `proposed` for the same hypothesis unless the measured result is in.
- After shipping, wait at least one full day of traffic before judging.
- One primary metric per change.
