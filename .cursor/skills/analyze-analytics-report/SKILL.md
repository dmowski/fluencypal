---
name: analyze-analytics-report
description: >-
  Runs the FluencyPal custom-analytics daily report — export from LAST_REPORT.md
  through now, read funnel/insights, pull unresolved Sentry issues for the same
  window, check INTERVENTIONS.md, and write the short "what's going today"
  report. Use when the user asks what happened today, what's going today, for
  today's/daily analytics or funnel report, to analyze the report, or similar.
  Do not wait for them to attach webApp/src/features/Analytics/Custom/AGENTS.md.
---

# Analyze analytics report

Read and follow `webApp/src/features/Analytics/Custom/AGENTS.md` immediately. That file is the source of truth for window math, export commands, report template, event meanings, and Sentry. Do not invent a shorter process.

## Do this every time

1. Read `webApp/src/features/Analytics/Custom/AGENTS.md` (full file).
2. Read `webApp/src/features/Analytics/Custom/LAST_REPORT.md` and `webApp/src/features/Analytics/Custom/INTERVENTIONS.md`.
3. Export the window in `webApp/` with `pnpm analytics:export` as the guide specifies (`--from` last `Analyzed through` timestamp, or a skipped-day gap).
4. Read `webApp/.analytics-export.json`. Do not paste raw user agents or emails.
5. Pull Sentry **before** “why they leave” / “what to do next” (errors can look like funnel drop):
   - Org `pikapix`, project `4508885116452864`, region `https://us.sentry.io`
   - [Unresolved issues](https://pikapix.sentry.io/issues/?project=4508885116452864&query=is%3Aunresolved&referrer=issue-list&statsPeriod=14d)
   - MCP: `search_issues` + `search_events` (authenticate Sentry MCP if tools fail)
   - Period `24h` / `7d` / `14d` matching the export window; prefer activity in this window, not a stale 14-day backlog
   - Unresolved by freq, new `firstSeen` in the window, plus error event count
   - Summarize shortId / title / events / users / last seen / funnel mapping. No PII or raw payloads.
   - If a user-facing error explains the drop, that is the one next change — not a copy/CTA experiment.
6. Reply in the short report template from the guide (include the Sentry bullet).
7. Update `LAST_REPORT.md` `Analyzed through` to the export `toIso`. Do not commit unless asked.

Empty export → say so. Do not invent traffic. One new change vs `INTERVENTIONS.md`.
