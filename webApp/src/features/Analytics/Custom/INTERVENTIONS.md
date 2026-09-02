# Analytics interventions

Log every product change made because of custom analytics. This stops repeating the same experiment.

| Date       | Hypothesis                                                                                               | Change                                                                                                                                | Metric to watch                                                                    | Status  | Result |
| ---------- | -------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------- | ------- | ------ |
| 2026-08-28 | Baseline instrumentation                                                                                 | Scroll, time-on-landing, CTA intent, conversation_start, paywall, bot filter, GEO/UTM                                                 | Funnel + landing duration + CTA clicks                                             | shipped | —      |
| 2026-08-29 | Crawler page_views look like Chrome and poison practice→speak                                            | Do not persist first `page_view` until click/scroll/leave/identify; hide lone page_view visitors from reports                         | Share of practice visitors with eventCount=1                                       | shipped | —      |
| 2026-08-31 | Landing→app visits split; CTA counts were every in-app click; duration/scroll/funnel mixed lifetime data | First-party visitor id + `fpv` handoff; CTA from element only; visible-time leaves; UTC day-scoped export                             | Share of landing visitors who also `reachedApp` on the same id; landing CTA counts | shipped | —      |
| 2026-08-31 | Quiz recordAbout and lessons used voice but looked like “never spoke”; SEO queries unknown               | `speech_start` (quiz/lesson/conversation) + Search Console export on `analytics:export`                                               | Quiz visitors with `speech_start` vs last path recordAbout; GSC `available`        | shipped | —      |
| 2026-09-01 | Scenario Play CTA dies on the 3-step auth wall                                                           | Skip features/agreement when `rolePlayId` is set; first screen is Google with “Sign in to play Alias” / “Sign in to start {scenario}” | Share of `practice?rolePlayId=*` visitors who `identify`                           | shipped | 2026-09-02: 2/8 new roleplay visitors identified; both spoke. Remaining drop is 0–10s on Google, not extra screens. |
| 2026-09-02 | Google sign-in before any audio still kills scenario traffic; they need to hear the scene first          | Autoplay AI opening line (audio + transcript) on `practice?rolePlayId=*` Google screen; sign-in still required to reply              | Identify rate among new `practice?rolePlayId=*` visitors                           | shipped | —      |

Status: `proposed` → `shipped` → `measured` → `keep` / `reverted`.

Rules:

- Do not propose a change that is already `shipped` or `proposed` for the same hypothesis unless the measured result is in.
- After shipping, wait at least one full day of traffic before judging.
- One primary metric per change.
