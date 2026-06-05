# UI Translation Validation Guide

Use this file as the instruction set when asking AI to validate a specific locale.

**Example prompt:**

> "Check language `ru`, follow instructions in uiLanguages.md"

**Scope:** PO files in `landing/src/locales/<lang>.po` and `webApp/src/locales/<lang>.po`.

---

## Step 1 — Fix Formatting Artifacts

These are mechanical errors introduced by the AI translator. Fix them all before reviewing semantics.

### 1a. Leading-newline artifact

Pattern — `msgstr` is split across three lines with a bare `"\n"` on the second line:

```
msgstr ""
"\n"
"Actual translation\n"
```

Correct form:

```
msgstr "Actual translation"
```

Use this Python snippet to find all occurrences:

```python
import re
with open('path/to/<lang>.po') as f:
    content = f.read()
for m in re.finditer(r'msgstr ""\n"\\n"\n"([^"]+)\\n"', content):
    print(repr(m.group()))
```

### 1b. Plaintext code-block artifact

Pattern — the translator wrapped output in a markdown code block, leaving `"plaintext\n"` as the first continuation line:

```
msgstr ""
"plaintext\n"
"Actual translation\n"
```

Correct form:

```
msgstr "Actual translation"
```

Use this Python snippet to find all occurrences:

```python
for m in re.finditer(r'msgstr ""\n"plaintext\\n"\n"([^"]+)\\n"', content):
    print(repr(m.group()))
```

---

## Step 2 — Fix Untranslated or Foreign-Language Remnants

Search for strings that are clearly not in the target language.

### 2a. English words in non-English translations

Look for msgstr values that contain English words or phrases where only the target language is expected. Common culprits:

- `msgstr " vacancy description"` — field label left in English
- Inline English words inside otherwise translated sentences (e.g., `"caller 役を演じ"`)

### 2b. Wrong-language words

Check for words from other languages entirely — e.g., Russian Cyrillic in a Japanese string (`вакансии`), or Spanish in a French string. These are copy-paste errors from another locale.

### 2c. Brand name typos

Verify `FluencyPal` is spelled correctly everywhere. Known bad variant: `FraencyPal`.

---

## Step 3 — Fix Wrong Semantic Translations

These are translation choices that are grammatically valid but semantically wrong in context.

### 3a. Navigation "About" label

- **msgid:** `"About"` (used in `HeaderStatic`, nav menus)
- **Wrong:** a word meaning "approximately" or a preposition (e.g., Japanese `約`, Russian `около`)
- **Correct:** a word meaning "about us / info section" (e.g., Japanese `概要`, Russian `О нас`)

### 3b. Language-level label "Advanced"

- **msgid:** `"Advanced"` (used in `LanguageLevel` component — a skill tier selector)
- **Wrong:** a generic adjective meaning "sophisticated/complex" (e.g., Japanese `高度な`)
- **Correct:** a level name meaning "upper/advanced level" (e.g., Japanese `上級`, Russian `Продвинутый`)

### 3c. "Advanced Plan" product name

- **msgid:** `"Advanced Plan"`
- **Wrong:** words meaning "luxury" or "premium quality" (e.g., Japanese `高級プラン`)
- **Correct:** words conveying a higher-tier offering (e.g., Japanese `上級プラン`)

### 3d. "Advanced English Conversation" and "advanced English conversation"

- Same principle as 3b — must use the level-tier word, not the adjective meaning "complex".

### 3e. "Architecture & Design" (tech context)

- **msgid:** `"Architecture & Design"` (used in tech stack / interview categories)
- **Wrong:** a word for physical/civil architecture (e.g., Japanese `建築`)
- **Correct:** the loanword or software-architecture term (e.g., Japanese `アーキテクチャ`, Russian `Архитектура`)

### 3f. "Master English Fluency" heading

- **msgid:** `"Master English Fluency"`
- **Wrong:** literal word-for-word order that sounds unnatural (e.g., Japanese `マスター英語流暢さ`)
- **Correct:** natural phrasing with verb + object structure (e.g., Japanese `英語の流暢さをマスターする`)

### 3g. FAQ answers starting with "No."

- **msgids** like `"No. The price shown is the full price..."` and `"No. All sessions are on-demand..."`
- **Wrong:** a word meaning "a number" or "digit" (e.g., Japanese `番号。`)
- **Correct:** the negation word (e.g., Japanese `いいえ。`, Russian `Нет.`)

### 3h. "Speculative fiction" genre label

- **msgid:** `"speculative fiction"`
- **Wrong:** "mystery/detective fiction" (e.g., Japanese `推理フィクション`)
- **Correct:** "speculative/thought-experiment fiction" (e.g., Japanese `思弁的フィクション`)

---

## Step 4 — Review Long-Form Content for Naturalness

For long multi-line msgstr entries (blog articles, role-play descriptions, FAQ answers), check:

1. **Word order** — Is the sentence structure natural in the target language, or does it follow English word order?
2. **Register consistency** — Is the formality level consistent throughout? (Mixing formal and informal address forms is a common AI error.)
3. **Partial translation** — Are any sentences or section headers left untranslated (e.g., markdown headings like `#### How the Scenario Works` left in English mid-translation)?
4. **Awkward phrasing** — Phrases that are technically correct but read as machine-translated. Pay special attention to:
   - Blog post titles and summaries
   - Call-to-action buttons
   - Error messages and empty-state messages

---

## Step 5 — Validate and Compile

After applying fixes, run the language pipeline to confirm the file parses without errors:

```bash
# For landing/
cd landing && pnpm lang

# For webApp/
cd webApp && pnpm lang
```

Both commands run: `lingui extract && ai-translate && lingui compile`

A successful run shows all locales with `0` missing entries in the statistics table.

Then confirm changes with:

```bash
git diff landing/src/locales/<lang>.po webApp/src/locales/<lang>.po
```

Review the diff to ensure every `-` line is a genuine bug removal and every `+` line is a correct translation.
