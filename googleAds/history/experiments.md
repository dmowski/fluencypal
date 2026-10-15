# Ad experiments

Why a test ran, what changed, and what happened. Creative packs live in `ads/`. Mutations applied from this CLI are in `operations.jsonl`.

## 2026-10-15 — Demo Demand Gen, $6 continuation

Account `5944204464`, currency PLN, timezone Europe/Warsaw.

**Baseline.** Campaign `24317574432`, Fluency - International professionals (demand gen), 14–15 Oct:

| | Impressions | Clicks | Cost | Conversions |
| --- | ---: | ---: | ---: | ---: |
| 14 Oct | 1,986 | 42 | 100.52 | 0 |
| 15 Oct | 2,113 | 41 | 81.41 | 0 |
| Total | 4,099 | 83 | 181.93 | 0 |

The only conversion Google counted on 13 Oct was **Submit lead form** (Stripe checkout start): 1 conversion from 39 clicks. The ad promised no account and no card. After the 3-minute call, the page sent people to the practice quiz. Location was Poland, presence only, English.

**Change.** New campaign `24365782522`, Fluency - International professionals (demand gen) 2, published 15 Oct. Creative pack: `ads/demo/`.

- Final URL `https://app.fluencypal.com/demo`
- Budget 100 PLN/day, maximize conversions, goal Submit lead form
- Poland, English, location option Presence
- Headlines and descriptions from `ads/demo/copy.json`
- Images from `ads/demo/images/`
- No generated video
- Live call to action is Learn more
- Previous demo campaign `24317574432` paused
- FluencyCall Demand Gen `24318551414` paused (`operations.jsonl`, 15 Oct 19:59 UTC)

The demo page **Continue for $6** button opens `/practice`, where a signed-out person can sign in with email. It does not open a Google popup.

**Result.** Not measured yet. The next read is Submit lead form conversions on campaign `24365782522`.
