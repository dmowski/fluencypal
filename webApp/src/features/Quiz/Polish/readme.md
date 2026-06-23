# Polish B1 exam materials

Reference content from the **Państwowa Komisja ds. Poświadczania Znajomości Języka Polskiego jako Obcego**. Used for authoring only — app exam content in `writing/variants.ts` is original, not copied from these files.

Official PDFs are **not stored in the repo**. Parsed markdown is regenerated from [certyfikatpolski.pl](https://certyfikatpolski.pl) when needed:

```bash
cd webApp/src/features/Quiz/Polish/scripts && python3 build-parsed.py
```

## Folder layout

```
Polish/
  readme.md
  scripts/
    build-parsed.py       — download PDFs (temp) → cleaned markdown under parsed/
    reorganize-parsed.py  — shared cleanup helpers (used by build-parsed)
  parsed/
    exams/                — official exam sessions by date (ISO slug)
      2022-02-06/
        exam-paper.md
        listening-transcript.md
    sample-tests/         — published sample booklets
      2020-03-sample/
        exam-paper.md
    module-specs/           — B1 module specifications (writing, grammar, …)
      writing.md
      listening-comprehension.md
      …
    keys/                   — answer keys and transcript+key booklets
      answer-key.md
      …
    typescript/             — structured indexes for tooling (not used in UI)
  writing/                  — original app content (30 exam variants)
    variants.ts
    types.ts
    images.ts
```

Runtime exam code: `../exam/polishB1Writing/`.

## Parsed exams (`parsed/exams/`)

Each folder is named by the **first exam day** (`YYYY-MM-DD`). Files:

| File | Contents |
| --- | --- |
| `exam-paper.md` | Listening, reading, grammar, writing modules (cleaned — no brudnopis, blank forms, or grading cards) |
| `listening-transcript.md` | Audio transcripts for the listening module |

| Folder | Exam date |
| --- | --- |
| `2022-02-06` | 6–7 Feb 2022 |
| `2022-03-26` | 26–27 Mar 2022 |
| `2022-06-25` | 25–26 Jun 2022 |
| `2022-11-05` | 5–6 Nov 2022 |
| `2023-02-05` | 5–6 Feb 2023 |
| `2023-04-15` | 15–16 Apr 2023 |
| `2023-06-24` | 24–25 Jun 2023 |
| `2023-11-18` | 18–19 Nov 2023 |
| `2024-02-04` | 4–5 Feb 2024 |
| `2024-04-20` | 20–21 Apr 2024 |
| `2024-06-22` | 22–23 Jun 2024 |

## Sample tests (`parsed/sample-tests/`)

| Folder | Description |
| --- | --- |
| `2020-03-sample` | Sample B1 test (March 2020) |
| `booklet-5` | Sample booklet 5 |
| `booklet-b1` | Sample B1 booklet |

## Module specs (`parsed/module-specs/`)

| File | Module |
| --- | --- |
| `listening-comprehension.md` | Rozumienie ze słuchu |
| `reading-comprehension.md` | Rozumienie tekstów pisanych |
| `grammar.md` | Poprawność gramatyczna |
| `writing.md` | Pisanie (genres, rubrics, word counts) |
| `speaking.md` | Mówienie |

## Keys (`parsed/keys/`)

| File | Description |
| --- | --- |
| `answer-key.md` | General B1 answer key |
| `2020-03-transcripts-and-key.md` | Transcripts + key (2020 sample) |
| `booklet-5-transcripts-and-key.md` | Transcripts + key (booklet 5) |

## TypeScript indexes (`parsed/typescript/`)

| File | Role |
| --- | --- |
| `parsedExamSessions.ts` | Writing-task index per exam session |
| `moduleSpecs.ts` | Module spec metadata |
| `index.ts` | Re-exports |

## App writing exam (`writing/`)

- Dashboard: **Polish B1 — Pisanie**
- 30 variants (`v01`–`v30`), 2 tasks each
- Firestore ids: `exam_pl_b1-writing_v01` … `v30`

## Copyright

Parsed text © Państwowa Komisja ds. Poświadczania Znajomości Języka Polskiego jako Obcego. For internal authoring reference only.
