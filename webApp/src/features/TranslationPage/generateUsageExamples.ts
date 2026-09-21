import { TextAiContextType } from '@/features/Ai/types';
import { SupportedLanguage, supportedLanguages } from '@/features/Lang/lang';
import { fullLanguagesMap } from '@/libs/language/languages';
import { NativeLangCode } from '@/libs/language/type';
import { usageExamplesSchema } from './schemas';

const EXAMPLES_AI_MODEL = 'gpt-4o-mini' as const;

const toSupportedLanguage = (language: NativeLangCode): SupportedLanguage | undefined => {
  return supportedLanguages.find((supported) => supported === language);
};

export const generateUsageExamples = async ({
  textAi,
  text,
  language,
}: {
  textAi: TextAiContextType;
  text: string;
  language: NativeLangCode;
}): Promise<string[]> => {
  const languageName = fullLanguagesMap[language]?.englishName || language;
  const languageCode = toSupportedLanguage(language);

  const { parsed } = await textAi.generateStrictJson({
    systemMessage: `You write short, natural example sentences that use a given word or phrase. All examples must be in ${languageName}. Do not number the sentences.`,
    userMessage: `Create exactly 5 example sentences that use this text naturally:\n\n${text}`,
    model: EXAMPLES_AI_MODEL,
    cache: true,
    ...(languageCode ? { languageCode } : {}),
    attempts: 2,
    schema: usageExamplesSchema,
  });

  return parsed.examples;
};
