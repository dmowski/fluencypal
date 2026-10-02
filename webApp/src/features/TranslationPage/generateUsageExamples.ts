import { TextAiContextType } from '@/features/Ai/types';
import { SupportedLanguage, supportedLanguages } from '@/features/Lang/lang';
import { fullLanguagesMap } from '@/libs/language/languages';
import { NativeLangCode } from '@/libs/language/type';
import { selectUsageExamples } from './selectUsageExamples';

const EXAMPLES_AI_MODEL = 'gpt-4o-mini' as const;
const EXAMPLE_CONTEXTS = ['daily life', 'a conversation', 'work or study', 'free time'] as const;

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
  const settled = await Promise.allSettled(
    EXAMPLE_CONTEXTS.map((context) =>
      textAi.generate({
        systemMessage: `Reply with one example sentence in ${languageName} and nothing else.`,
        userMessage: `Write one sentence about ${context} that includes this text: ${text}`,
        model: EXAMPLES_AI_MODEL,
        cache: false,
        ...(languageCode ? { languageCode } : {}),
      }),
    ),
  );
  const rawSentences = settled.flatMap((result) =>
    result.status === 'fulfilled' ? [result.value] : [],
  );
  const examples = selectUsageExamples(rawSentences, text);
  if (examples.length === 0) {
    throw new Error('No usable example sentences');
  }
  return examples;
};
