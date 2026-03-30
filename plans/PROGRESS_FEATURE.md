# Language Progress Assessment - Final Implementation Plan

Date: 2026-03-31
Owner: FluencyPal web
Status: Phase A complete, Phase B partially complete

## Current Status

Completed:

- Phase A foundation scaffold is implemented.
- Recharts is installed and in use.
- `ProgressStat` base types and mock datasets exist.
- Test UI includes a dedicated `progress` tab.
- Minimal chart component is implemented and visually tuned.

Partially completed:

- Phase B chart playground work has started.
- Metric switching is implemented.
- Example datasets for normal, volatile, and empty states are implemented.
- Chart visual direction is being tuned in the test page.

Not started yet:

- AI evaluator
- Zod validation
- Firestore persistence
- Aggregation hook
- Dashboard card
- Production session integration

## 1) Goal and Product Outcome

Build a session-level Language Progress Assessment feature that:

- evaluates user language performance from real transcript text,
- stores one normalized result per session (0-100),
- aggregates historical results into stable chart data,
- presents progress in a motivating and understandable way.

V1 focuses on four metrics:

- grammar
- vocabulary
- fluency
- confidence

## 2) Confirmed Decisions (clarifications resolved)

These are locked for V1:

- Source types in scope now: `conversation`, `role-play`
- Firestore document ID strategy: deterministic (`sourceType + sourceId + algorithmVersion`)
- Default confidence filter in chart: none (show all points)
- Smoothing window: rolling average over 5 sessions
- Initial algorithm version: `score_v1`

## 3) Codebase Analysis Summary

### Existing integration points

- AI text generation already exists through `useTextAi` and supports `generateJson<T>()` with retries and JSON repair fallback.
- Conversation history already persists session-like entities in Firestore under user-scoped collections (`users/{userId}/conversations/{conversationId}`).
- Dashboard has a modular card architecture where a new progress card can be inserted cleanly.
- Test UI already has a tabbed playground (`testUi`) suitable for iterative prompt and chart tuning.

### Conventions observed

- TypeScript strict and feature-oriented modules under `web/src/features`.
- Firestore access is centralized in `web/src/features/Firebase/firebaseDb.ts`.
- Firestore rules enforce user-scoped access under `users/{userId}/...`.
- MUI is the existing UI foundation for controls, containers, tabs, and states.

### Practical implication

The feature can be implemented with minimal architectural disruption by:

1. adding a dedicated `ProgressStat` feature module,
2. reusing `useTextAi` for assessment,
3. extending Firestore DB helpers and rules,
4. validating flow in `testUi` before production wiring.

## 4) Library Proposal

## Add

- `recharts`
  - Why: lightweight React charting, fast to iterate in a playground, supports line series, legends, responsive container, custom tooltip, and raw vs smoothed overlays.
  - Fit: ideal for the requested product tuning loop in `testUi`.

- `zod`
  - Why: strict runtime validation for AI JSON contracts and safer parser hardening.
  - Fit: clean schema inference into TypeScript types, easy optional strict mode toggle.

## Reuse existing

- `dayjs` (already present) for date bucketing/formatting in aggregation output.
- MUI components for metric switcher, state controls, and card shells.
- Existing `jsonrepair`-assisted path in `useTextAi` as fallback safety.

## Not needed in V1

- Additional state managers (Redux/Zustand): current feature scope can stay hook-local.
- Server-side aggregation infra: explicitly out of scope for current phase.

## 5) Data Model (V1)

## Raw assessment input (for evaluator)

- transcriptText: string
- language: SupportedLanguage
- sourceType: `conversation` | `role-play`
- sourceId: string

## Stored Firestore record

Path:

- `users/{userId}/progressStats/{docId}`

Deterministic `docId`:

- `${sourceType}_${sourceId}_${algorithmVersion}`

Shape:

- userId: string
- language: SupportedLanguage
- sourceType: `conversation` | `role-play`
- sourceId: string
- grammar: number (0-100)
- vocabulary: number (0-100)
- fluency: number (0-100)
- confidence: number (0-100)
- assessmentConfidence: number (0-100)
- textLength: number
- algorithmVersion: string (`score_v1` initially)
- createdAt: number (epoch ms)
- createdAtIso: string

## Chart-ready aggregated point

- key: string (session id or date key)
- timestamp: number
- createdAtIso: string
- metric values for selected dimension:
  - raw: number
  - smoothed: number
- optional context:
  - sourceType
  - assessmentConfidence

## 6) File Plan

Planned new files:

- `web/src/features/ProgressStat/types.ts` - done
- `web/src/features/ProgressStat/mockData.ts` - done
- `web/src/features/ProgressStat/ProgressChart.tsx` - done
- `web/src/features/ProgressStat/ProgressCard.tsx`
- `web/src/features/ProgressStat/useProgressEvaluation.ts`
- `web/src/features/ProgressStat/useProgressAggregation.ts`

Planned updates:

- `web/src/app/testUi/testComponents/TestPage.tsx` - done
- `web/src/app/testUi/testComponents/ProgressStatTest.tsx` - added, done
- `web/src/features/Firebase/firebaseDb.ts`
- `web/firestore.rules`
- `web/src/features/Dashboard/Dashboard.tsx` (insert card in controlled location)

Optional helper file if parser complexity grows:

- `web/src/features/ProgressStat/progressSchemas.ts`

## 7) Implementation Phases (execution-ready)

## Phase A - Foundation and playground scaffold

Status: done

1. Create `ProgressStat` module with strict types. - done
2. Add mock dataset with realistic variability across sessions. - done
3. Install `recharts`; build minimal `ProgressChart` component. - done
4. Add a `progress` tab to `TestPage` and render chart with mock data. - done

Deliverable: visual chart running in test UI with no AI dependency.

## Phase B - Playground controls and UI states

Status: in progress

1. Add metric switcher (grammar/vocabulary/fluency/confidence). - done
2. Add raw vs smoothed toggle. - not started
3. Add examples for: normal, empty, sparse, loading, processing, locked. - partially done
4. Keep this page intentionally flexible for PM/design tuning. - in progress

Deliverable: complete visual playground for behavior and UX tuning.

## Phase C - AI evaluator contract

1. Implement `useProgressEvaluation` using `useTextAi`.
2. Build strict prompt with hard JSON-only response requirements.
3. Return structure with 4 metrics + `assessmentConfidence`.
4. Add evaluator controls to test UI (textarea, language, source fields, run button, debug panel).

Deliverable: paste transcript -> run AI -> inspect raw and parsed output in test UI.

## Phase D - Parser hardening and validation

1. Add `zod` schema(s) for AI output contract.
2. Implement optional strict mode:
   - strict off: best-effort parse + normalization
   - strict on: schema-required parse, fail fast
3. Expose raw model output + parse errors in test UI for debugging.
4. Normalize/clamp metrics to [0, 100] before output.

Deliverable: resilient parser with debuggable strict validation path.

## Phase E - Firestore integration (raw session stats only)

1. Extend `firebaseDb.ts` with typed collection/doc helpers for progress stats.
2. Implement create/upsert and language-filtered read query helpers.
3. Use deterministic doc ID to avoid duplicate writes for same source/version.
4. Update Firestore rules for `users/{userId}/progressStats/{statId}` with owner-only read/write.

Deliverable: persisted raw per-session stats for conversation and role-play.

## Phase F - Aggregation utility

1. Implement `useProgressAggregation`:
   - sort by time asc,
   - optional confidence filtering (default disabled),
   - rolling average smoothing window = 5,
   - support per-metric projection.
2. Feed both mock and stored records through same aggregator.
3. Render resulting chart data in test UI.

Deliverable: stable chart series from raw session records.

## Phase G - End-to-end manual verification loop

1. Test page flow:
   - paste transcript,
   - evaluate,
   - inspect JSON,
   - convert to storage payload,
   - aggregate,
   - re-render chart.
2. Add stress presets:
   - very short input,
   - mixed-language transcript,
   - repetitive vocabulary,
   - broken grammar,
   - highly fluent sample.

Deliverable: full manual QA loop without production coupling risk.

## Phase H - Product card and dashboard insertion

1. Build `ProgressCard` with:
   - title,
   - short explanatory copy,
   - metric switcher,
   - chart area,
   - empty/loading/locked variants.
2. Insert card into dashboard in a sensible order.
3. Keep data source swappable (mock vs firestore) behind simple props/hook.

Deliverable: production-facing UI shell integrated in dashboard.

## Phase I - Production writer integration

1. Hook evaluation trigger to session completion points for:
   - conversation sessions,
   - role-play sessions.
2. Ensure exactly one evaluation per completed session source.
3. Apply safe failure strategy:
   - no hard UX blocker on failure,
   - log failures,
   - skip invalid outputs.

Deliverable: automatic generation and storage of session assessments.

## 8) Prompt and Scoring Contract (V1)

Prompt requirements:

- Evaluate only target learning language.
- Ignore unrelated language fragments.
- Penalize confidence in score quality for short/inadequate text.
- Keep scoring practical and comparable between sessions.
- Output JSON only, no markdown wrappers.

Response contract:

- grammar: number 0-100
- vocabulary: number 0-100
- fluency: number 0-100
- confidence: number 0-100
- assessmentConfidence: number 0-100

Parser behavior:

- clamp all numeric outputs to [0, 100]
- reject NaN/non-number in strict mode
- include diagnostics for malformed outputs in test UI

## 9) Firestore Rules Changes (high-level)

Under user scope:

- Add:
  - `match /progressStats/{statId} { allow read, write: if isUser(userId); }`

This mirrors existing owner-only subcollection patterns and keeps data isolated per user.

## 10) Testing Strategy

Minimal required checks per implementation batch:

- `cd web && pnpm lint`

For logic-heavy hooks/components:

- add/extend unit tests in feature-local test files where existing patterns permit,
- run `cd web && pnpm test:unit` for affected areas.

Manual verification checklist (test UI):

- empty/sparse/normal/locked/loading/processing states,
- metric switch correctness,
- raw vs smoothed toggle correctness,
- strict parser error visibility,
- deterministic overwrite behavior for same source/version,
- language filtering correctness.

## 11) Risks and Mitigations

Risk: score instability across short transcripts.

- Mitigation: explicit prompt constraints + assessmentConfidence + optional filter.

Risk: malformed AI JSON.

- Mitigation: zod strict mode, diagnostics panel, retry via existing AI helpers.

Risk: mixed incompatible scoring logic over time.

- Mitigation: required `algorithmVersion` in every stored record.

Risk: duplicate records/cost spikes.

- Mitigation: deterministic doc ID and once-per-session trigger semantics.

## 12) Out of Scope for V1

- Server-side aggregation pipelines
- Advanced cross-language comparative analytics
- Historical backfill of old sessions
- Complex coaching explanations per point

## 13) Suggested execution order for immediate next work session

1. Install libraries (`recharts`, `zod`) and scaffold `ProgressStat` types/mock/chart.
2. Add progress playground tab in `testUi` with state variants and controls.
3. Implement evaluator + strict parser and debug panes.
4. Add Firestore model + rules + aggregation hook.
5. Add dashboard `ProgressCard` and gate production writer integration behind safe checks.
