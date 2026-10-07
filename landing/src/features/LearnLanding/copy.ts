import { fullEnglishLanguageName } from '@/features/Lang/lang';
import { learnLanguageNames } from './names';
import { learnPhrases } from './phrases';
import { LearnPageLocale, LearnTarget } from './targets';

export interface LearnLandingCopy {
  ui: LearnPageLocale;
  target: LearnTarget;
  /** Language name in the grammatical form used by the headline. */
  name: string;
  /** English name, for structured data. */
  englishName: string;
  shareTitle: string;
  headline: string;
  imageLine2: string;
  description: string;
  heroTitle2: string;
  heroSubtitle: string;
  label: string;
  webcamTitle: string;
  webcamSubtitle: string;
  webcamContent: string;
  howSubtitle: string;
  rolePlayTitle: string;
  rolePlaySubtitle: string;
  ctaTitle: string;
}

export const getLearnLandingCopy = (ui: LearnPageLocale, target: LearnTarget): LearnLandingCopy => {
  const phrases = learnPhrases[ui];
  const name = learnLanguageNames[ui][target];

  return {
    ui,
    target,
    name,
    englishName: fullEnglishLanguageName[target],
    shareTitle: phrases.shareTitle(name),
    headline: phrases.headline(name),
    imageLine2: phrases.imageLine2,
    description: phrases.description(name),
    heroTitle2: phrases.heroTitle2,
    heroSubtitle: phrases.heroSubtitle,
    label: phrases.label,
    webcamTitle: phrases.webcamTitle,
    webcamSubtitle: phrases.webcamSubtitle,
    webcamContent: phrases.webcamContent,
    howSubtitle: phrases.howSubtitle,
    rolePlayTitle: phrases.rolePlayTitle,
    rolePlaySubtitle: phrases.rolePlaySubtitle,
    ctaTitle: phrases.ctaTitle,
  };
};
