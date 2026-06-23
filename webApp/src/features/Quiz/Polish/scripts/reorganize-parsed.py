#!/usr/bin/env python3
"""Reorganize Polish/parsed: semantic paths, cleaned markdown (no forms/brudnopis)."""

from __future__ import annotations

import json
import re
import shutil
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
PARSED = ROOT / "parsed"
OLD_MD = PARSED / "markdown"

SESSION_MAP = {
    "2022.02.6-7_B1": ("2022-02-06", "6–7 lutego 2022"),
    "2022.03.26-27_B1": ("2022-03-26", "26–27 marca 2022"),
    "2022.06.25-26_B1": ("2022-06-25", "25–26 czerwca 2022"),
    "2022.11.5-6_B1": ("2022-11-05", "5–6 listopada 2022"),
    "2023_02_5_6_B1": ("2023-02-05", "5–6 lutego 2023"),
    "2023_04_15_16_B1": ("2023-04-15", "15–16 kwietnia 2023"),
    "2023_06_24_25_B1": ("2023-06-24", "24–25 czerwca 2023"),
    "2023_11_18_19_B1": ("2023-11-18", "18–19 listopada 2023"),
    "4-5.02.2024-B1": ("2024-02-04", "4–5 lutego 2024"),
    "20-21.04.2024-B1": ("2024-04-20", "20–21 kwietnia 2024"),
    "22-23.06.2024-B1": ("2024-06-22", "22–23 czerwca 2024"),
}

SAMPLE_MAP = {
    "B1_przykladowy_test_2020_03": ("2020-03-sample", "Przykładowy test — marzec 2020"),
    "5_B1_test": ("booklet-5", "Test przykładowy — zeszyt 5"),
    "B1_test": ("booklet-b1", "Test przykładowy — B1"),
}

SPEC_MAP = {
    "6_B1_RS": ("listening-comprehension", "Rozumienie ze słuchu"),
    "6_B1_RT": ("reading-comprehension", "Rozumienie tekstów pisanych"),
    "6_B1_PG": ("grammar", "Poprawność gramatyczna"),
    "6_B1_P": ("writing", "Pisanie"),
    "6_B1_M": ("speaking", "Mówienie"),
}

KEY_MAP = {
    "B1_klucz": ("answer-key", "Klucz odpowiedzi"),
    "B1_przykladowy_transkrypcje_i_klucz_2020_03": (
        "2020-03-transcripts-and-key",
        "Transkrypcje i klucz — marzec 2020",
    ),
    "5_B1_tr-klucz": ("booklet-5-transcripts-and-key", "Transkrypcje i klucz — zeszyt 5"),
}

MODULE_HEADERS = [
    ("ROZUMIENIE ZE SŁUCHU", "Rozumienie ze słuchu"),
    ("ROZUMIENIE TEKSTÓW PISANYCH", "Rozumienie tekstów pisanych"),
    ("POPRAWNOŚĆ GRAMATYCZNA", "Poprawność gramatyczna"),
    ("PISANIE", "Pisanie"),
    ("MÓWIENIE", "Mówienie"),
]


def fix_doubled_letters(text: str) -> str:
    """EEGGZZAAMMIINN → EGZAMIN (PDF extraction artifact)."""
    return re.sub(r"(.)\1+", r"\1", text)


def normalize_spaces(text: str) -> str:
    text = re.sub(r"[ \t]+", " ", text)
    text = re.sub(r" *\n *", "\n", text)
    text = re.sub(r"\n{3,}", "\n\n", text)
    text = re.sub(r"Z\s*e\s*s\s*t\s*a\s*w", "Zestaw", text, flags=re.IGNORECASE)
    return text.strip()


def strip_form_noise(text: str) -> str:
    lines = []
    for line in text.splitlines():
        stripped = line.strip()
        if re.fullmatch(r"_+ / .*p\.", stripped):
            continue
        if re.fullmatch(r"_{1,3} / \d+ p\..*", stripped):
            continue
        if re.fullmatch(r"_{3,}.*", stripped) and len(stripped) > 40:
            continue
        if "IMIĘ I NAZWISKO" in stripped and "___" in stripped:
            continue
        if stripped.startswith("ZESTAW NR:") and "..." in stripped:
            continue
        if re.fullmatch(r"RECENZJA:", stripped):
            continue
        if re.fullmatch(r"\.{10,}", stripped):
            continue
        lines.append(line)
    return "\n".join(lines)


def is_junk_page(text: str) -> bool:
    t = text.strip()
    if not t:
        return True
    if "BRUDNOPIS" in t:
        return True
    if "KARTA OCENY WYPOWIEDZI" in t:
        return True
    if re.search(r"WYNIK:\s*POZYTYWNY\s*/\s*NEGATYWNY", t) and "PUNKTACJA" in t:
        return True
    if re.fullmatch(
        r"POZIOM B1\s*\n[\wąćęłńóśźż\s]+\s*\n\d+\s*",
        t,
        flags=re.IGNORECASE,
    ):
        return True
    meaningful = re.sub(r"[_\.\s\n©Państwowa KomisjaPOZIOM B1\d]+", "", t, flags=re.IGNORECASE)
    if len(meaningful) < 30 and ("IMIĘ I NAZWISKO" in t or "ZESTAW NR" in t):
        return True
    return False


def split_pages(raw: str) -> list[str]:
    parts = re.split(r"\n## Page \d+\n\n", raw)
    if parts[0].startswith("# "):
        parts[0] = re.sub(r"^# .+\n\n", "", parts[0])
    return [p for p in parts if p.strip()]


def clean_page(text: str) -> str:
    text = fix_doubled_letters(text)
    text = strip_form_noise(text)
    text = re.sub(r"^POZIOM B1\s*\n[\wąćęłńóśźż ]+\s*\n\d+\s*\n", "", text, flags=re.MULTILINE)
    text = re.sub(r"© Państwowa Komisja[^\n]*\n", "", text)
    return normalize_spaces(text)


def group_exam_modules(pages: list[str]) -> str:
    kept = [clean_page(p) for p in pages if not is_junk_page(p)]
    body = "\n\n".join(kept)

    matches: list[tuple[int, str, str]] = []
    for marker, title in MODULE_HEADERS:
        for match in re.finditer(re.escape(marker), body):
            matches.append((match.start(), title, marker))
    matches.sort(key=lambda item: item[0])

    if not matches:
        return body

    sections: list[tuple[str, str]] = []
    for index, (start, title, marker) in enumerate(matches):
        end = matches[index + 1][0] if index + 1 < len(matches) else len(body)
        content = body[start + len(marker) : end].strip()
        if not content:
            continue
        if sections and sections[-1][0] == title:
            sections[-1] = (title, f"{sections[-1][1]}\n\n{content}")
        else:
            sections.append((title, content))

    return "\n\n".join(f"## {title}\n\n{content}" for title, content in sections)


def clean_transcript(pages: list[str]) -> str:
    kept = [clean_page(p) for p in pages if not is_junk_page(p)]
    body = "\n\n".join(kept)
    body = re.sub(
        r"POZIOM B1\s*\nTRANSKRYPCJE I KLUCZ DO ZADAŃ\s*\n[\wąćęłńóśźż ]+\s*\n\d+\s*",
        "",
        body,
        flags=re.IGNORECASE,
    )
    return normalize_spaces(body)


def clean_generic(pages: list[str]) -> str:
    kept = [clean_page(p) for p in pages if not is_junk_page(p)]
    return normalize_spaces("\n\n".join(kept))


def read_old_md(path: Path) -> str:
    return path.read_text(encoding="utf-8")


def write_md(path: Path, title: str, body: str, note: str | None = None) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    lines = [f"# {title}", ""]
    if note:
        lines.extend([f"> {note}", ""])
    lines.append(body)
    lines.append("")
    path.write_text("\n".join(lines), encoding="utf-8")


def main() -> None:
    source_dir = ROOT / "source"
    if source_dir.exists():
        shutil.rmtree(source_dir)

    new_exams = PARSED / "exams"
    new_samples = PARSED / "sample-tests"
    new_specs = PARSED / "module-specs"
    new_keys = PARSED / "keys"

    for d in (new_exams, new_samples, new_specs, new_keys):
        if d.exists():
            shutil.rmtree(d)

    parsed_sessions: list[dict] = []

    old_sessions = OLD_MD / "sessions"
    if not old_sessions.exists():
        print("No parsed/markdown/sessions to migrate. Run build-parsed.py to fetch from certyfikatpolski.pl.")
        return

    for old_folder in sorted(old_sessions.iterdir()):
        if not old_folder.is_dir():
            continue
        old_id = old_folder.name
        if old_id not in SESSION_MAP:
            print(f"Skip unknown session: {old_id}")
            continue
        slug, label = SESSION_MAP[old_id]
        dest = new_exams / slug

        for md_file in sorted(old_folder.glob("*.md")):
            name = md_file.name.lower()
            raw = read_old_md(md_file)
            pages = split_pages(raw)

            if "transkrypcja" in name or "transkrypcja_nagran" in name:
                out_name = "listening-transcript.md"
                title = f"Transkrypcje — {label}"
                body = clean_transcript(pages)
                note = "Transkrypcje nagrań do modułu słuchania. Usunięto nagłówki stron i puste formularze."
            elif "arkusz" in name:
                out_name = "exam-paper.md"
                title = f"Arkusz egzaminacyjny — {label}"
                body = group_exam_modules(pages)
                note = "Tekst wyekstrahowany z arkusza B1. Usunięto strony robocze, brudnopisy i karty oceny."
            else:
                continue

            write_md(dest / out_name, title, body, note)

        parsed_sessions.append(
            {
                "sessionId": slug,
                "label": label,
                "examPaper": f"exams/{slug}/exam-paper.md",
                "listeningTranscript": f"exams/{slug}/listening-transcript.md",
            }
        )

    old_samples = OLD_MD / "sample-tests"
    if old_samples.exists():
        for md_file in sorted(old_samples.glob("*.md")):
            stem = md_file.stem
            if stem not in SAMPLE_MAP:
                continue
            slug, label = SAMPLE_MAP[stem]
            pages = split_pages(read_old_md(md_file))
            body = group_exam_modules(pages)
            write_md(
                new_samples / slug / "exam-paper.md",
                f"Test przykładowy — {label}",
                body,
                "Tekst wyekstrahowany z przykładowego testu B1.",
            )

    old_specs = OLD_MD / "specs"
    spec_meta = []
    if old_specs.exists():
        for md_file in sorted(old_specs.glob("*.md")):
            stem = md_file.stem
            if stem not in SPEC_MAP:
                continue
            slug, label = SPEC_MAP[stem]
            pages = split_pages(read_old_md(md_file))
            body = clean_generic(pages)
            out_path = new_specs / f"{slug}.md"
            write_md(out_path, f"Specyfikacja modułu — {label}", body, "Oficjalna specyfikacja modułu B1.")
            spec_meta.append(
                {
                    "file": f"{slug}.md",
                    "moduleCode": stem.replace("6_B1_", ""),
                    "moduleName": label,
                }
            )

    old_keys = OLD_MD / "keys"
    if old_keys.exists():
        for md_file in sorted(old_keys.glob("*.md")):
            stem = md_file.stem
            if stem not in KEY_MAP:
                continue
            slug, label = KEY_MAP[stem]
            pages = split_pages(read_old_md(md_file))
            body = clean_generic(pages)
            write_md(new_keys / f"{slug}.md", label, body, "Klucz odpowiedzi / transkrypcje.")

    # Regenerate writing index from cleaned exam papers
    writing_sessions = []
    for session in parsed_sessions:
        paper = PARSED / session["examPaper"]
        if not paper.exists():
            continue
        text = paper.read_text(encoding="utf-8")
        idx = text.upper().find("PISANIE")
        if idx < 0:
            continue
        section = text[idx : idx + 5000]
        sets = re.findall(
            r"Zestaw\s*(?:NR\s*)?([IVX\d]+)\s*(.*?)(?=Zestaw|$)",
            section,
            re.DOTALL | re.IGNORECASE,
        )
        writing_sets = []
        for set_num, content in sets:
            tasks = []
            for letter in ["a", "b"]:
                m = re.search(
                    rf"{letter}\.\s*(.*?)(?=\n\s*[ab]\.\s|\n\s*\d+\s*słów|\Z)",
                    content,
                    re.DOTALL,
                )
                if m:
                    task_text = re.sub(r"\s+", " ", m.group(1).strip())
                    wc = re.search(rf"{letter}\..*?(\d+)\s*słów", content, re.DOTALL)
                    tasks.append(
                        {
                            "letter": letter,
                            "prompt": task_text[:600],
                            "wordCount": int(wc.group(1)) if wc else None,
                        }
                    )
            if tasks:
                writing_sets.append({"setNumber": set_num, "tasks": tasks})
        if writing_sets:
            writing_sessions.append(
                {
                    "sessionId": session["sessionId"],
                    "label": session["label"],
                    "sourceFile": session["examPaper"],
                    "writingSets": writing_sets,
                }
            )

    ts_dir = PARSED / "typescript"
    ts_dir.mkdir(parents=True, exist_ok=True)

    sessions_ts = (
        "// Reference index of writing sections from cleaned exam papers.\n\n"
        "export interface ParsedWritingTask {\n"
        "  letter: 'a' | 'b';\n"
        "  prompt: string;\n"
        "  wordCount: number | null;\n}\n\n"
        "export interface ParsedWritingSet {\n"
        "  setNumber: string;\n"
        "  tasks: ParsedWritingTask[];\n}\n\n"
        "export interface ParsedExamSession {\n"
        "  sessionId: string;\n"
        "  label: string;\n"
        "  sourceFile: string;\n"
        "  writingSets: ParsedWritingSet[];\n}\n\n"
        f"export const PARSED_EXAM_SESSIONS: ParsedExamSession[] = {json.dumps(writing_sessions, ensure_ascii=False, indent=2)} as const;\n"
    )
    (ts_dir / "parsedExamSessions.ts").write_text(sessions_ts, encoding="utf-8")

    specs_ts = (
        "// Module specification metadata.\n\n"
        "export interface ModuleSpecMeta {\n"
        "  file: string;\n"
        "  moduleCode: string;\n"
        "  moduleName: string;\n}\n\n"
        f"export const MODULE_SPECS: ModuleSpecMeta[] = {json.dumps(spec_meta, ensure_ascii=False, indent=2)} as const;\n"
    )
    (ts_dir / "moduleSpecs.ts").write_text(specs_ts, encoding="utf-8")

    index_ts = (
        "export { MODULE_SPECS } from './moduleSpecs';\n"
        "export type { ModuleSpecMeta } from './moduleSpecs';\n"
        "export { PARSED_EXAM_SESSIONS } from './parsedExamSessions';\n"
        "export type {\n"
        "  ParsedExamSession,\n"
        "  ParsedWritingSet,\n"
        "  ParsedWritingTask,\n"
        "} from './parsedExamSessions';\n"
    )
    (ts_dir / "index.ts").write_text(index_ts, encoding="utf-8")

    if OLD_MD.exists():
        shutil.rmtree(OLD_MD)

    print(f"Removed source/, reorganized parsed/")
    print(f"  exams: {len(parsed_sessions)} sessions")
    print(f"  writing index: {len(writing_sessions)} sessions with writing sets")


if __name__ == "__main__":
    main()
