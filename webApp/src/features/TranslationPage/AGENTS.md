# Translation Page

Applies to `webApp/src/features/TranslationPage/**`.

Multi-column translator: type or paste into one language, see the others fill in, optionally hear browser speech, and generate usage examples.

## Purpose

A simple practice surface for moving the same phrase across several languages at once. Columns are the languages the user set up (default Russian, Polish, English). Editing one column translates into the rest. Paste works even when no textarea is focused.

## Architecture

```
TranslationPage/
  TranslationPage.tsx              — route-facing page: translate, paste, examples
  TranslationSettingsBar.tsx       — voice-over toggles + add language
  TranslationColumn.tsx            — one language: picker, textarea, play, examples
  useTranslationPageSettings.ts    — localStorage settings (after mount)
  useTranslationSpeech.ts          — Web Speech Synthesis queue
  settingsStorage.ts               — parse / persist / normalize settings
  resolvePasteTarget.ts            — focus > hover > first column; document-paste gate
  speechVoices.ts                  — BCP-47 + best matching browser voice
  buildAutoSpeechQueue.ts          — source then other columns after paste
  generateUsageExamples.ts         — useTextAi.generateStrictJson → 5 sentences
  schemas.ts                       — zod schema for examples
  isNativeLangCode.ts
  types.ts
  constants.ts
```

Thin Next.js routes:

- `webApp/src/app/translate/page.tsx` — `/translate` (html/body + `PracticeProvider`)
- `webApp/src/app/[lang]/translate/page.tsx` — `/{lang}/translate`

Do not import app-route code into TranslationPage internals. Call `getTranslation` from `@/features/Translation/translationHelpers` (cached `/api/translate` client). Speech stays on `speechSynthesis` — do not use OpenAI TTS here.

## Entry

- URL: `/translate` (noindex)
- Localized: `/{lang}/translate`
- Wrapped in `PracticeProvider` (Auth, Settings, TextAi)

## Settings (localStorage)

Key: `translation-page-settings-v1`

```
{
  languages: NativeLangCode[],   // 2–6, unique; default ['ru','pl','en']
  voiceOverEnabled: boolean,     // master switch; default true
  autoPronounceSource: boolean,  // speak source after paste; default true
  autoPronounceResult: boolean   // speak other columns after paste; default true
}
```

Read settings in `useEffect` after mount (start from `DEFAULT_TRANSLATION_PAGE_SETTINGS`) so SSR and the first client render match. Column text is session-only — do not persist translations.

## Flow

1. One textarea per language, laid out as columns (stack on narrow viewports).
2. Typing in a column debounces `TRANSLATION_DEBOUNCE_MS` (400), then `getTranslation` to every other column. A generation counter drops stale responses.
3. Paste into a column (or document paste when the target is not an input) translates immediately. After paste, if voice over is on, play `buildAutoSpeechQueue` (source, then other columns in order).
4. Document paste target: focused column, else hovered column, else first column. Do not steal paste from `input` / `textarea` / `select` / `contenteditable`.
5. **Give examples** needs `auth.isAuthorized`. Then `generateUsageExamples` (`gpt-4o-mini`, 5 sentences in that column’s language). Failures stay in that column; do not throw through to the page.
6. Per-column play uses the matching browser voice for that language (Google / remote / Enhanced preferred, same scoring idea as News). Chrome: `cancel()` then `resume()` before `speak()`, as in Reader.

## Conventions

- Keep paste targeting and speech-queue building as pure helpers with unit tests.
- Do not auto-speak on typing — only after paste, plus the manual play button.
- 2–6 language columns; changing a column language keeps its current text.
- `useEffect` only for localStorage hydration, `voiceschanged`, document paste, and speech cleanup.
- Translation cache lives in `translationHelpers` (`translate_*` keys). E2E clears those plus the settings key so mocks are not skipped.

## Validation

```bash
cd webApp && pnpm lint
cd webApp && pnpm test:unit -- src/features/TranslationPage
cd webApp && pnpm exec playwright test e2e/translate/translate.spec.ts
```

After new `i18n._()` strings: `cd webApp && pnpm lang`.

## Keeping This File Current

When a change in `webApp/src/features/TranslationPage/**`, `webApp/src/app/translate/**`, `webApp/src/app/[lang]/translate/**`, or `webApp/e2e/translate/**` contradicts this file, update it in the same change. Check the settings shape, paste target order, and validation commands.
