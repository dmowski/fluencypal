import { fullLanguagesList } from '@/libs/language/languages';
import { useEffect, useMemo, useState } from 'react';

export const useLanguageGroup = ({
  defaultGroupTitle,
  systemLanguagesTitle,
}: {
  defaultGroupTitle: string;
  systemLanguagesTitle: string;
}) => {
  const [userLanguages, setUserLanguages] = useState<string[]>([]);

  useEffect(() => {
    setTimeout(() => {
      const isWindow = typeof window !== 'undefined';
      if (!isWindow) {
        return;
      }

      const userLang = [...navigator.languages].map((lang) => lang.toLowerCase());
      setUserLanguages(userLang);
    }, 20);
  }, []);

  const languageGroups = useMemo(() => {
    const isWindow = typeof window !== 'undefined';
    if (!isWindow) {
      return [];
    }

    const filteredAndSorted = fullLanguagesList
      .map((lang) => {
        const isSystemLanguage = userLanguages.includes(lang.languageCode);
        return {
          ...lang,
          groupTitle: isSystemLanguage ? systemLanguagesTitle : defaultGroupTitle,
          isSystemLanguage,
        };
      })
      .sort((a, b) => {
        // system languages first
        if (a.groupTitle === systemLanguagesTitle && b.groupTitle !== systemLanguagesTitle) {
          return -1;
        }
        if (a.groupTitle !== systemLanguagesTitle && b.groupTitle === systemLanguagesTitle) {
          return 1;
        }

        return a.englishName.localeCompare(b.englishName);
      });

    return filteredAndSorted;
  }, [userLanguages]);

  return { languageGroups };
};
