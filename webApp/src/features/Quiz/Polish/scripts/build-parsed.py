#!/usr/bin/env python3
"""
Download official B1 PDFs to a temp dir, parse into cleaned markdown under parsed/,
then discard PDFs (no source/ folder in repo).
"""

from __future__ import annotations

import json
import re
import shutil
import tempfile
import urllib.request
from pathlib import Path

import importlib.util

_spec = importlib.util.spec_from_file_location(
    "reorganize_parsed",
    Path(__file__).resolve().parent / "reorganize-parsed.py",
)
_rp = importlib.util.module_from_spec(_spec)
_spec.loader.exec_module(_rp)

clean_generic = _rp.clean_generic
clean_page = _rp.clean_page
clean_transcript = _rp.clean_transcript
group_exam_modules = _rp.group_exam_modules
is_junk_page = _rp.is_junk_page
write_md = _rp.write_md
KEY_MAP = _rp.KEY_MAP
SAMPLE_MAP = _rp.SAMPLE_MAP
SESSION_MAP = _rp.SESSION_MAP
SPEC_MAP = _rp.SPEC_MAP

ROOT = Path(__file__).resolve().parents[1]
PARSED = ROOT / "parsed"

BASE_URL = "https://certyfikatpolski.pl/wp-content/uploads"

SCRAPE_PAGES = [
    "https://certyfikatpolski.pl/o-egzaminie/testy-egzaminacyjne-z-poprzednich-lat/",
    "https://certyfikatpolski.pl/o-egzaminie/przykladowe-testy-zbiory-zadan/",
    "https://certyfikatpolski.pl/o-egzaminie/zbiory-zadan/",
]

WANTED_PATTERNS = [
    r"2022\.\d{2}\.\d{1,2}-\d{1,2}_B1_Arkusz_egzaminacyjny\.pdf",
    r"2022\.\d{2}\.\d{1,2}-\d{1,2}_B1_Transkrypcja_nagran\.pdf",
    r"2023_\d{2}_\d{1,2}_\d{1,2}_B1_arkusz_egzaminacyjny\.pdf",
    r"2023_\d{2}_\d{1,2}_\d{1,2}_B1_transkrypcja\.pdf",
    r"4-5\.02\.2024-B1_arkusz_egzaminacyjny\.pdf",
    r"4-5\.02\.2024-B1_transkrypcja\.pdf",
    r"20-21\.04\.2024-B1_arkusz_egzaminacyjny\.pdf",
    r"20-21\.04\.2024-B1_transkrypcja\.pdf",
    r"22-23\.06\.2024-B1_arkusz_egzaminacyjny\.pdf",
    r"22-23\.06\.2024-B1_transkrypcja\.pdf",
    r"B1_przykladowy_test_2020_03\.pdf",
    r"B1_przykladowy_transkrypcje_i_klucz_2020_03\.pdf",
    r"5_B1_test\.pdf",
    r"5_B1_tr-klucz\.pdf",
    r"B1_test\.pdf",
    r"B1_klucz\.pdf",
    r"6_B1_RS\.pdf",
    r"6_B1_RT\.pdf",
    r"6_B1_PG\.pdf",
    r"6_B1_P\.pdf",
    r"6_B1_M\.pdf",
]


def scrape_pdf_urls() -> dict[str, str]:
    import urllib.request as urllib_request

    found: dict[str, str] = {}
    for page in SCRAPE_PAGES:
        req = urllib_request.Request(page, headers={"User-Agent": "dark-eng-build/1.0"})
        html = urllib_request.urlopen(req, timeout=30).read().decode("utf-8", errors="replace")
        for url in re.findall(r'https?://[^"\']+\.pdf', html):
            name = url.rsplit("/", 1)[-1]
            if any(re.fullmatch(pat, name) for pat in WANTED_PATTERNS):
                found[name] = url
    return found

OLD_SESSION_FILE_PREFIX = {
    "2022-02-06": "2022.02.6-7_B1",
    "2022-03-26": "2022.03.26-27_B1",
    "2022-06-25": "2022.06.25-26_B1",
    "2022-11-05": "2022.11.5-6_B1",
    "2023-02-05": "2023_02_5_6_B1",
    "2023-04-15": "2023_04_15_16_B1",
    "2023-06-24": "2023_06_24_25_B1",
    "2023-11-18": "2023_11_18_19_B1",
    "2024-02-04": "4-5.02.2024-B1",
    "2024-04-20": "20-21.04.2024-B1",
    "2024-06-22": "22-23.06.2024-B1",
}


def download(url: str, dest: Path) -> bool:
    try:
        req = urllib.request.Request(url, headers={"User-Agent": "dark-eng-build/1.0"})
        with urllib.request.urlopen(req, timeout=60) as resp:
            dest.write_bytes(resp.read())
        return dest.stat().st_size > 1000
    except Exception as exc:
        print(f"  FAIL {url}: {exc}")
        return False


def pdf_to_pages(path: Path) -> list[str]:
    from pypdf import PdfReader

    reader = PdfReader(str(path))
    raw_pages = [page.extract_text() or "" for page in reader.pages]
    return [p for p in (clean_page(x) for x in raw_pages) if not is_junk_page(p)]


def extract_writing_sets(text: str) -> list[dict]:
    idx = text.upper().find("PISANIE")
    if idx < 0:
        return []
    section = text[idx : idx + 5000]
    sets = re.findall(
        r"Zestaw\s*(?:NR\s*)?([IVX\d]+)\s*(.*?)(?=Zestaw|$)",
        section,
        re.DOTALL | re.IGNORECASE,
    )
    result = []
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
            result.append({"setNumber": set_num, "tasks": tasks})
    return result


def main() -> None:
    tmp = Path(tempfile.mkdtemp(prefix="polish-b1-"))
    print(f"Temp download dir: {tmp}")

    try:
        files: dict[str, Path] = {}
        pdf_urls = scrape_pdf_urls()
        print(f"Found {len(pdf_urls)} PDF URLs on certyfikatpolski.pl")

        for name, url in sorted(pdf_urls.items()):
            dest = tmp / name
            print(f"Downloading {name}...")
            if download(url, dest):
                files[name] = dest

        exams_dir = PARSED / "exams"
        samples_dir = PARSED / "sample-tests"
        specs_dir = PARSED / "module-specs"
        keys_dir = PARSED / "keys"
        for d in (exams_dir, samples_dir, specs_dir, keys_dir):
            if d.exists():
                shutil.rmtree(d)

        parsed_sessions: list[dict] = []

        for old_id, (slug, label) in SESSION_MAP.items():
            dest = exams_dir / slug
            prefix = old_id

            arkusz_names = [
                f"{prefix}_Arkusz_egzaminacyjny.pdf",
                f"{prefix}_arkusz_egzaminacyjny.pdf",
            ]
            trans_names = [
                f"{prefix}_Transkrypcja_nagran.pdf",
                f"{prefix}_transkrypcja.pdf",
            ]

            arkusz = next((files[n] for n in arkusz_names if n in files), None)
            trans = next((files[n] for n in trans_names if n in files), None)

            if arkusz:
                pages = pdf_to_pages(arkusz)
                body = group_exam_modules(pages)
                write_md(
                    dest / "exam-paper.md",
                    f"Arkusz egzaminacyjny — {label}",
                    body,
                    "Tekst wyekstrahowany z arkusza B1. Usunięto strony robocze, brudnopisy i karty oceny.",
                )

            if trans:
                pages = pdf_to_pages(trans)
                body = clean_transcript(pages)
                write_md(
                    dest / "listening-transcript.md",
                    f"Transkrypcje — {label}",
                    body,
                    "Transkrypcje nagrań do modułu słuchania.",
                )

            if arkusz or trans:
                parsed_sessions.append(
                    {
                        "sessionId": slug,
                        "label": label,
                        "examPaper": f"exams/{slug}/exam-paper.md",
                        "listeningTranscript": f"exams/{slug}/listening-transcript.md",
                    }
                )

        for old_stem, (slug, label) in SAMPLE_MAP.items():
            pdf = files.get(f"{old_stem}.pdf")
            if not pdf:
                continue
            pages = pdf_to_pages(pdf)
            body = group_exam_modules(pages)
            write_md(
                samples_dir / slug / "exam-paper.md",
                f"Test przykładowy — {label}",
                body,
                "Tekst wyekstrahowany z przykładowego testu B1.",
            )

        spec_meta = []
        for old_stem, (slug, label) in SPEC_MAP.items():
            pdf = files.get(f"{old_stem}.pdf")
            if not pdf:
                continue
            pages = pdf_to_pages(pdf)
            body = clean_generic(pages)
            write_md(
                specs_dir / f"{slug}.md",
                f"Specyfikacja modułu — {label}",
                body,
                "Oficjalna specyfikacja modułu B1.",
            )
            spec_meta.append(
                {
                    "file": f"{slug}.md",
                    "moduleCode": old_stem.replace("6_B1_", ""),
                    "moduleName": label,
                }
            )

        for old_stem, (slug, label) in KEY_MAP.items():
            pdf = files.get(f"{old_stem}.pdf")
            if not pdf:
                continue
            pages = pdf_to_pages(pdf)
            body = clean_generic(pages)
            write_md(keys_dir / f"{slug}.md", label, body, "Klucz odpowiedzi / transkrypcje.")

        writing_sessions = []
        for session in parsed_sessions:
            paper = PARSED / session["examPaper"]
            if not paper.exists():
                continue
            sets = extract_writing_sets(paper.read_text(encoding="utf-8"))
            if sets:
                writing_sessions.append(
                    {
                        "sessionId": session["sessionId"],
                        "label": session["label"],
                        "sourceFile": session["examPaper"],
                        "writingSets": sets,
                    }
                )

        ts_dir = PARSED / "typescript"
        ts_dir.mkdir(parents=True, exist_ok=True)
        (ts_dir / "parsedExamSessions.ts").write_text(
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
            f"export const PARSED_EXAM_SESSIONS: ParsedExamSession[] = {json.dumps(writing_sessions, ensure_ascii=False, indent=2)} as const;\n",
            encoding="utf-8",
        )
        (ts_dir / "moduleSpecs.ts").write_text(
            "// Module specification metadata.\n\n"
            "export interface ModuleSpecMeta {\n"
            "  file: string;\n"
            "  moduleCode: string;\n"
            "  moduleName: string;\n}\n\n"
            f"export const MODULE_SPECS: ModuleSpecMeta[] = {json.dumps(spec_meta, ensure_ascii=False, indent=2)} as const;\n",
            encoding="utf-8",
        )

        print(f"\nDone: {len(parsed_sessions)} exam sessions, {len(writing_sessions)} with writing, {len(spec_meta)} specs")
        print(f"Downloaded {len(files)}/{len(pdf_urls)} files")
    finally:
        shutil.rmtree(tmp, ignore_errors=True)


if __name__ == "__main__":
    main()
