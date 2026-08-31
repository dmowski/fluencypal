# Custom Analytics

Applies to `webApp/src/features/Analytics/Custom/**`.
Landing embed: `landing/src/features/Analytics/Custom/`.
Intervention log: `INTERVENTIONS.md` (same folder).

## Purpose

Answer: where people drop from landing → quiz/sign-in → first **spoken** conversation → pay, and what to change — without repeating the same experiment.

Goals:

1. More people start an AI conversation
2. More subscriptions

## "What's going today?"

When the user asks what happened today (or similar):

1. `cd webApp && pnpm analytics:export`
2. Read `webApp/.analytics-export.json` (gitignored). Use `insights`, `funnel`, `funnelNew`, `dropOff`, `searchConsole`, then sample a few visitor timelines. Do not paste raw user agents or emails.
3. Read `INTERVENTIONS.md` so suggestions are not a loop.
4. Reply with this short report:

```
Today (YYYY-MM-DD)  [UTC]
- Visitors: N (new / returning; bots + internal excluded)
- Funnel: landing → app → quiz → practice → spoke → paywall → checkout  (use funnelNew for first-seen-today)
- Landing: avg time, scroll 25/50/75/100 vs insights.landingVisitorCount, first paths
- Time on pages: insights.durationByPath
- CTAs: landing quiz vs sign-in (quizCtaIds / signInCtaIds)
- Path to first speak: pathBeforeSpeak + conversationStartPaths
- Voice: funnel.speech vs funnel.conversation; insights.speechSurfaces (quiz / lesson / conversation)
- GEO/SEO: countries, languages, referrers, UTM, firstPaths, plus `searchConsole` (queries/pages; data lags 2–3 days)
- Where they stop: top last paths
- Spoke / paywallViews / checkoutStarts

Why they leave: …
What to do next (one change): …  [must be new vs INTERVENTIONS.md]
```

If the export is empty, say so; do not invent traffic.

## Events

| Event                | When                                      | Answers                                                               |
| -------------------- | ----------------------------------------- | --------------------------------------------------------------------- |
| `page_view`          | Route change                              | Path, UTM, referrer host                                              |
| `click`              | `a` / `button` / `[data-analytics]`       | `ctaId` + `ctaIntent` from **element id/href only** (never page URL)  |
| `scroll_depth`       | 25 / 50 / 75 / 100 on a page              | How deep they scroll                                                  |
| `page_leave`         | hide / pagehide                           | Visible time on page (`durationMs`), `maxScrollPct`                   |
| `identify`           | Signed-in uid (once per uid)              | Auth                                                                  |
| `conversation_start` | First **user** message in a conversation  | Real AI talk, not the greeting and not just /practice                 |
| `speech_start`       | First accepted voice on quiz / lesson / conversation | They used a mic. `speechSurface`: `quiz` \| `lesson` \| `conversation`. Once per surface per tab. `reachedSpeech` is any surface; `reachedConversation` stays AI talk only. |
| `paywall_view`       | Subscription modal opens                  | Saw paywall                                                           |
| `checkout_start`     | Stripe checkout created                   | Tried to pay                                                          |

Visitor summary also stores first-touch UTM/referrer/country, max scroll, landing duration, funnel flags including `clickedQuizCta` / `clickedSignInCta` / `reachedConversation` / `reachedSpeech`. CTA flags are set only from **landing** clicks.

Country comes from `x-vercel-ip-country` / `cf-ipcountry` on ingest (not stored IP).

Bots (UA + `navigator.webdriver`) are dropped and never written. A lone `page_view` with no click, scroll, leave, or identify is not persisted (and is excluded from reports if already stored).

CTA ids on landing: `hero-cta`, `returning-practice`, `header-sign-in`, `how-it-works-quiz`. Href still classifies `/quiz` vs `/practice` **on the clicked element**, not the current page.

Visitor identity is first-party: landing sets `fp_vid` on `.fluencypal.com` and appends `?fpv=` on app links so landing → app is one visitor (iframe storage is partitioned). The tracker prefers the parent visitor id.

Stored paths keep `currentStep`, `rolePlayId`, `interactiveLesson`, `dailyQuestions` and drop UTM, inbox ids, and `fpv`.

Export (`pnpm analytics:export`) is a **UTC day**. Funnel and CTAs are computed from that day's events (not lifetime visitor flags). Use `funnelNew` for first-seen-today visitors. Landing scroll/duration ignore in-app pages. Localhost and `/testUi` are dropped. `searchConsole` is a 7-day window ending 3 days ago (GSC lag). If `available` is false, add the service account email as a Search Console user on the fluencypal.com property and enable the Search Console API.

Optional: `GSC_SITE_URL` in `webApp/.env` (`sc-domain:fluencypal.com` or `https://www.fluencypal.com/`).

## Architecture

Parent → iframe `/analytics/tracker` → `POST /api/analytics/ingest` → Admin SDK → `customAnalyticsVisitors` + `customAnalyticsEvents`. Client Firestore: deny all.

## Local commands

```bash
cd webApp && pnpm firestore:indexes
cd webApp && pnpm analytics:export
cd webApp && pnpm analytics:export -- --day 2026-08-28
```

Admin UI: `/staats/journey`

## How to read for product questions

**Start a conversation:** compare `clickedQuizCta` / `clickedSignInCta` vs `reachedQuiz` vs `reachedPractice` vs `reachedConversation`. If they open practice but do not speak, the blocker is in-app (auth, mic, empty canvas), not the landing CTA. If they bounce with low scroll and short `landingDurationMs`, the hero/CTA is the problem.

**Why they exit:** last path + last event + time on that page. Landing leave at <25% scroll = did not see How it works. App leave on quiz = onboarding friction. Practice without `conversation_start` = they never pressed talk.

**Keep them using the app:** people who spoke once but have no day-2 `page_view` — that is a return problem (tasks, reminder), not acquisition. Do not “fix” the landing hero for that.

**Subscriptions:** `paywall_view` without `checkout_start` = price/copy. `checkout_start` without payment in Stripe = checkout drop. No paywall after speaking = they never hit the limiter; do not push paywall earlier unless data shows they would still speak.

## SEO / GEO

From export `insights.countries`, `referrers`, `utmSources`, plus first path:

- Empty referrer + no UTM = direct, PWA, or privacy-stripped search. Do not treat as “SEO is zero”.
- Pair `searchConsole.queries` / `searchConsole.pages` with firstPaths and referrers. GSC is delayed; do not treat a missing today-row as zero SEO.
- Search/social referrer hosts with high bounce and low scroll → title/snippet vs page mismatch; check that language landing (`/es`, `/pt`) matches the query language.
- Country vs visitor `language` / firstPath lang: if `BR` lands on `/` English, add clearer language switch or geo landing.
- `gclid` / `utm_source=google` vs organic referrers: paid vs organic mix.
- Landing paths other than `/` (blog, scenarios, pricing): which acquire speakers (`reachedConversation` and `pathBeforeSpeak`).
- `insights.languages` vs `insights.countries`: browser language ≠ country; treat as GEO hint, not identity.

Do not change meta tags from a single day’s sample. Pair with Search Console if suggesting SEO copy.

## Avoid looping

Before suggesting a UI/copy change:

1. Check `INTERVENTIONS.md` for the same hypothesis.
2. If already shipped and not measured, report data only.
3. If you ship a change, append a row: date, hypothesis, change, metric, `shipped`.
4. After a day of traffic, set `measured` and `keep` or `reverted`.

One change at a time.

## Security

Deny-all Firestore. Ingest: origin allowlist + bot skip + schema clip + rate limit. Journey API: admin email. Agent reads via local `pnpm analytics:export` only.

## Validation

```bash
cd webApp && pnpm lint
cd webApp && pnpm test:unit -- src/features/Analytics/Custom
cd landing && pnpm lint
```
