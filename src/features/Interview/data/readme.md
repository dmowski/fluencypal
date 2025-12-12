# Interview Data Structure

This folder contains modular data builders for role-specific interview landing pages. Each landing page is composed from small, typed section generators that accept `lang: SupportedLanguage` and return a strongly-typed section.

## Folder Layout

- `frontend/` — Section generators and data for the Senior Frontend Developer page
  - `seniorFrontendDeveloperData.ts` — Assembles the final `InterviewData`
  - Section generators (each returns a typed section):
    - `firstScreenSection.ts`
    - `infoCardsSection.ts`
    - `scorePreviewSection.ts`
    - `stepInfoSection.ts`
    - `reviewSection.ts`
    - `exampleQuestionsSection.ts`
    - `techStackSection.ts`
    - `whoIsThisForSection.ts`
    - `demoSnippetSection.ts`
    - `priceSection.ts`
    - `faqSection.ts`
  - Shared helpers:
    - `quizData.ts` — returns quiz data for the role (see pattern below)
    - `techData.ts` — returns tech labels and icons by language
- `data.tsx` — Role data registry and consumer utilities used across Interview features

## Types

Types for all sections and `InterviewData` are defined in `src/features/Interview/types.ts`. Section generators should import the minimal types they need from there.

## i18n

All generators receive `lang: SupportedLanguage` and call `getI18nInstance(lang)` to produce localized strings via `i18n._(key)`. Keep strings within generators to make each section self-contained and easy to translate.

## Creating a New Landing (e.g., Backend Developers)

1. Create a new role folder:

   - `src/features/Interview/data/backend/`

2. Add section generators (mirror the frontend structure):

   - Create files like `firstScreenSection.ts`, `infoCardsSection.ts`, `priceSection.ts`, etc.
   - Each file should export `getXSection(lang: SupportedLanguage)` and return the appropriate typed section.

3. Add role-specific helpers:

- `quizData.ts` for backend quiz questions — follow the same shape as the frontend `quizData.ts` (localized `title`, optional `description`, and `questions` with `id`, `type`, `question`, `options`, and `correctAnswerIndex`). Use `import { InterviewQuiz } from "../../types"` and return `InterviewQuiz`.
- `techData.ts` for backend tech labels
- `coreData.ts` for basic role metadata (`id`, `jobTitle`, `title`, `keywords`, `category`)

4. Assemble the page data:
   - Create `backendDeveloperData.ts` that imports the generators and returns:

```ts
import { InterviewData } from "../../types";
import { SupportedLanguage } from "@/features/Lang/lang";
import { getI18nInstance } from "@/appRouterI18n";
import { getFirstScreenSection } from "./firstScreenSection";
// ... import other section generators
import { getBackendDeveloperQuizData } from "./quizData";
import { getBackendDeveloperCoreData } from "./coreData";

export const getBackendDeveloperData = (lang: SupportedLanguage): InterviewData => {
  return {
    coreData: getBackendDeveloperCoreData(lang),
    sections: [
      getFirstScreenSection(lang),
      // ... other sections in desired order
    ],
    quiz: getBackendDeveloperQuizData(lang),
  };
};
```

5. Register the role in `src/features/Interview/data.tsx`:
   - Add an export/import for `getBackendDeveloperData`
   - Expose a factory or mapping so consumers can request role data by role id

## `src/features/Interview/data.tsx`

This file acts as the central registry and access point for role data across the Interview feature. Typical responsibilities:

- Import role builders (e.g., `getSeniorFrontendDeveloperData`, `getBackendDeveloperData`)
- Export a function like `getInterviewDataByRole(roleId, lang)` that resolves the correct data builder
- Provide any shared utilities or React hooks that fetch/prepare the data for pages/components

When adding a new role, make sure you:

- Export its data builder from `data.tsx`
- Include it in any role-id to builder maps
- Update routes/pages to use the new role id where appropriate

## Conventions

- Use one generator per section for clarity.
- Keep strings localized via `i18n._`.
- Return strictly typed data (`PriceSection`, `FaqSection`, etc.).
- Keep imports minimal; prefer importing only from `../../types`, `@/appRouterI18n`, and role-local helpers.
- Maintain consistent section ordering across roles where it makes sense.

## Testing & Validation

- Run type checks to ensure generators conform to types.
- Add/adjust unit tests if a role has custom logic.

Example commands:

````zsh
pnpm typecheck
pnpm test

### QuizData / InterviewQuiz Pattern

Frontend example: `src/features/Interview/data/frontend/quizData.ts`

Backend example: `src/features/Interview/data/backend/quizData.ts`

Both export a function with the signature `getXyzQuizData(lang: SupportedLanguage): InterviewQuiz` and return localized steps:

```ts
export const getCsharpBackendDeveloperQuizData = (lang: SupportedLanguage): InterviewQuiz => {
  const i18n = getI18nInstance(lang);
  return {
    steps: [
      {
        type: "info",
        id: "intro",
        title: i18n._("C# Backend Interview Readiness Test"),
        subTitle: i18n._("Assess readiness across APIs, databases, concurrency, and design."),
        buttonTitle: i18n._("Start"),
      },
      {
        type: "record-audio",
        id: "q-intro-yourself",
        title: i18n._("Introduce yourself"),
        subTitle: i18n._("Describe your backend experience in .NET."),
        buttonTitle: i18n._("Record answer"),
      },
      {
        type: "analyze-inputs",
        id: "ai-analysis-1",
        title: i18n._("Preliminary analysis"),
        subTitle: i18n._("See strengths and gaps."),
        buttonTitle: i18n._("Continue"),
        aiSystemPrompt: "Analyze backend interview answers in markdown.",
        aiResponseFormat: "markdown",
      },
      {
        type: "paywall",
        id: "upgrade",
        title: i18n._("Unlock full analysis"),
        subTitle: i18n._("Get detailed feedback and practice."),
        buttonTitle: i18n._("Continue"),
      },
      {
        type: "waitlist-done",
        id: "done",
        title: i18n._("You're set!"),
        subTitle: i18n._("Next steps are ready."),
        buttonTitle: i18n._("Finish"),
      },
    ],
  };
};
````

## Linting

Use linting to validate code style and basic correctness:

```zsh
pnpm lint
```

```

```
