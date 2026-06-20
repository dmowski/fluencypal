import 'server-only';

import { getI18nInstance } from '@/appRouterI18n';
import { SupportedLanguage, supportedLanguages } from '@/features/Lang/lang';
import { siteUrl } from '@/features/SEO/appInfo';
import { APP_NAME } from '@/features/Landing/landingSettings';
import { initLingui } from '@/initLingui';
import { getRolePlayScenarios } from '@/features/RolePlay/rolePlayData';
import { getLangLearnPlanLabels } from '@/features/Lang/getLabels';
import { getAllInterviews } from '../Case/data/data';

type Page = 'quiz' | 'quiz2' | 'tg-app' | 'practice' | 'case' | 'alias' | 'iwant' | '' | 'book';

type AfterIdPage = 'quiz';

interface generateMetadataInfoProps {
  lang: string;
  currentPath: Page;
  scenarioId?: string;
  interviewId?: string;
  featureId?: string;
  blogId?: string;
  category?: string;
  rolePlayId?: string;
  afterIdPage?: AfterIdPage;
  languageToLearn?: SupportedLanguage;
}

export const generateMetadataInfo = ({
  lang,
  currentPath,
  scenarioId,
  blogId,
  category,
  rolePlayId,
  languageToLearn,
  interviewId,
  featureId,
  afterIdPage,
}: generateMetadataInfoProps) => {
  const supportedLang = supportedLanguages.find((l) => l === lang) || 'en';
  initLingui(supportedLang);
  let keywords: string[] = [];

  const i18n = getI18nInstance(supportedLang);
  let needIndex = true;

  let openGraphImageUrl = `${siteUrl}openGraph.webp`;
  let title = '';
  let description = '';

  if (currentPath === 'iwant') {
    title = i18n._(`I Want`) + ' | ' + APP_NAME;
    description = i18n._(`Discover the "I Want" feature in FluencyPal,`);
    keywords = [];
    needIndex = false;
  }

  if (currentPath === 'book') {
    title = i18n._(`Books`);
    description = i18n._(
      `Access and manage your personal library of books with FluencyPal's Reader feature. Upload your own books, track your reading progress, and enjoy a personalized reading experience that helps you improve your English skills.`,
    );
    keywords = [];
    needIndex = false;
  }

  if (currentPath === 'quiz') {
    const languageLearningMap = getLangLearnPlanLabels(supportedLang);
    const languageToLearnPlan = languageLearningMap[languageToLearn || 'en'];
    title = languageToLearnPlan + ' | ' + APP_NAME;
    description = i18n._(
      `Create a personalized language learning plan with FluencyPal. Set your fluency goals, focus on specific skills like speaking or listening, and track your progress to master English effectively.`,
    );
    keywords = [];
  }

  if (currentPath === 'case' && interviewId && afterIdPage === 'quiz') {
    const interviewList = getAllInterviews('en').interviews;
    const interview = interviewList.find((i) => i.coreData.id === interviewId);
    needIndex = !!interview;

    title = `${interview?.coreData.title || 'Interview Quiz'} - ` + i18n._(`| FluencyPal`);
    description = i18n._(
      `Test your interview skills with FluencyPal's AI-powered interview quiz. Practice answering common questions, receive instant feedback, and boost your confidence for real interviews.`,
    );
    keywords = [
      ...(interview?.coreData.keywords || []),
      i18n._(`Interview Quiz`),
      i18n._(`AI Interview Practice`),
      i18n._(`Mock Interview Questions`),
      i18n._(`Interview Preparation`),
      i18n._(`Job Interview Skills`),
      i18n._(`Career Advancement`),
    ];
  }

  if (currentPath === 'quiz2') {
    const languageLearningMap = getLangLearnPlanLabels(supportedLang);
    const languageToLearnPlan = languageLearningMap[languageToLearn || 'en'];
    title = languageToLearnPlan + ' | ' + APP_NAME;
    description = i18n._(
      `Create a personalized language learning plan with FluencyPal. Create your goal, focus on specific skills like speaking or listening.`,
    );
    keywords = [];
  }

  if (currentPath === 'tg-app') {
    const languageLearningMap = getLangLearnPlanLabels(supportedLang);
    const languageToLearnPlan = languageLearningMap[languageToLearn || 'en'];
    title = languageToLearnPlan + ' | ' + ' Telegram Mini App ' + APP_NAME;
    description = i18n._(
      `Create a personalized language learning plan with FluencyPal. Set your fluency goals, focus on specific skills like speaking or listening, and track your progress to master English effectively.`,
    );
    keywords = [];
  }

  if (currentPath === 'practice') {
    let titlePostfix = '';
    if (rolePlayId) {
      const rolePlayScenarios = getRolePlayScenarios(supportedLang);
      const scenario = rolePlayScenarios.rolePlayScenarios.find((s) => s.id === rolePlayId);
      const rolePlayTitle = scenario ? scenario.title : '';
      const parts = [i18n._(`Practice`), rolePlayTitle].filter(Boolean).join(': ');

      title = parts + ' | ' + APP_NAME;
    } else {
      title = i18n._(`Practice`) + titlePostfix + ' | ' + APP_NAME;
    }

    description = i18n._(
      `Practice conversational English with FluencyPal, your 24/7 AI tutor. Improve fluency, pronunciation, and confidence.`,
    );
    keywords = [
      i18n._(`AI language tutor pricing`),
      i18n._(`Online English`),
      i18n._(`Learn English`),
      i18n._(`AI Language Tutor`),
      i18n._(`English Practice`),
      APP_NAME,
      i18n._(`Language Learning`),
    ];
  }

  if (currentPath === 'alias') {
    title = i18n._(`Alias Game`) + ' | ' + APP_NAME;
    description = i18n._(`Practice vocabulary by creatively describing and guessing words`);
    keywords = [
      i18n._(`Alias Game`),
      i18n._(`Vocabulary Practice`),
      i18n._(`Word Guessing Game`),
      i18n._(`Language Learning Game`),
      i18n._(`English Vocabulary`),
      i18n._(`Creative Description`),
      i18n._(`alias game online`),
      i18n._(`alias in english online`),
      i18n._(`alias online english`),
    ];
  }

  if (currentPath === 'case' && !interviewId) {
    let categoryTitle = '';

    if (category) {
      const items = getAllInterviews(supportedLang);
      const categoryInfo = items.categoriesList.find((c) => c.categoryId === category);
      if (!categoryInfo) {
        needIndex = false;
      }
      categoryTitle = categoryInfo
        ? ' - ' + categoryInfo.categoryTitle
        : i18n._(`Unknown category`);
    }

    title =
      i18n._(`Prepare for the Interview`) +
      (categoryTitle ? ' - ' + categoryTitle : '') +
      ' | ' +
      APP_NAME;
    description = i18n._(
      `Prepare for your interviews with AI-powered tools that help you practice and improve your answers.`,
    );
    keywords = [
      i18n._(`Prepare for the Interview`),
      i18n._(`Interview Practice`),
      i18n._(`AI Interview Coach`),
      i18n._(`Job Interview Preparation`),
      i18n._(`Mock Interviews`),
      i18n._(`Interview Tips`),
      i18n._(`Career Advancement`),
    ];
  }
  if (currentPath === 'case' && interviewId) {
    const { interviews } = getAllInterviews(supportedLang);
    const item = interviews.find((b) => b.coreData.id === interviewId);
    needIndex = !!item;

    title = `${item?.coreData.title || 'Interview not found'} - ` + i18n._(`| FluencyPal`);
    description = item?.coreData.subTitle || '';
    keywords = item?.coreData.keywords || [];
    openGraphImageUrl = openGraphImageUrl;
  }

  if (currentPath === '') {
    title = i18n._(`FluencyPal – AI English Speaking Practice for Fluency & Confidence`);
    description = i18n._(
      `Practice conversational English with FluencyPal, your 24/7 AI tutor. Improve fluency, pronunciation, and confidence.`,
    );
    keywords = [
      i18n._(`ai English tutor`),
      i18n._(`English speaking practice app`),
      i18n._(`improve English fluency`),
      i18n._(`advanced English conversation`),
      i18n._(`English speaking coach`),
      i18n._(`conversational English practice`),
      i18n._(`language immersion app`),
      i18n._(`English speaking partner`),
    ];
  }

  const id = scenarioId || blogId || interviewId || featureId;

  const metadataUrls = getMetadataUrls({
    pagePath: currentPath,
    id,
    queries: {
      category,
      rolePlayId,
    },
    supportedLang,
    afterIdPage,
  });

  return {
    keywords,
    title,
    metadataBase: new URL(siteUrl),
    description,
    alternates: metadataUrls.alternates,
    icons: getMetadataIcons(),
    openGraph: getOpenGraph({
      title,
      description,
      ogUrl: metadataUrls.ogUrl,
      openGraphImageUrl,
      alt: `${APP_NAME} – ` + i18n._(`AI Speaking Practice`),
    }),
    twitter: getTwitterCard({
      title,
      description,
      openGraphImageUrl,
    }),
    other: {
      google: 'notranslate',
    },
    robots: {
      index: needIndex,
      follow: true,
    },
  };
};

export function getMetadataUrls({
  pagePath,
  id,
  queries,
  supportedLang,
  afterIdPage,
}: {
  // examples: contacts, pricing, practice
  pagePath: string;

  // like blogId, scenarioId
  id: string | undefined;

  afterIdPage?: AfterIdPage;

  // example: { category: "business" }
  queries: Record<string, string | undefined>;

  supportedLang: SupportedLanguage;
}) {
  const pathWithId = pagePath + (id ? '/' + id : '') + (afterIdPage ? '/' + afterIdPage : '');

  const queryList = Object.entries(queries).map(([key, value]) =>
    value ? `${key}=` + encodeURIComponent(value) : '',
  );
  const query = queryList.filter(Boolean).join('&');

  const pathWithQueries = pathWithId + (query ? '?' + query : '');
  const alternates = generateAlternatesTags({
    path: pathWithQueries,
    lang: supportedLang,
  });
  const ogUrl = alternates.languages[supportedLang || 'en'];

  return {
    ogUrl,
    alternates,
    pathWithQueries,
  };
}

export function getTwitterCard({
  title,
  description,
  openGraphImageUrl,
}: {
  title: string;
  description: string;
  openGraphImageUrl?: string;
}) {
  const image = openGraphImageUrl || `${siteUrl}openGraph.webp`;
  return {
    card: 'summary_large_image',
    title: title,
    description: description,
    images: [image],
    creator: '@dmowskii',
  };
}

export function getOpenGraph({
  title,
  description,
  ogUrl,
  openGraphImageUrl,
  alt,
}: {
  title: string;
  description: string;
  ogUrl: string;
  openGraphImageUrl?: string;
  alt: string;
}) {
  const image = openGraphImageUrl || `${siteUrl}openGraph.webp`;
  return {
    title: title,
    description: description,
    url: ogUrl,
    images: [
      {
        url: image,
        width: 1200,
        height: 630,
        alt: alt,
      },
    ],
    type: 'website',
  };
}

export function getMetadataIcons() {
  return {
    icon: [
      { url: '/favicon-48x48.png', sizes: '48x48', type: 'image/png' },
      { url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
      { url: '/favicon-26x26.png', sizes: '26x26', type: 'image/png' },
      { url: '/favicon-192x192.png', sizes: '192x192', type: 'image/png' },
      { url: '/favicon.svg', type: 'image/svg+xml' },
    ],
    apple: [{ url: '/logo192.png' }],
  };
}

export const generateAlternatesTags = ({
  path,
  lang,
}: {
  // Example of currentPath: contacts, blog/123, blog?category=tech
  //  WITHOUT LANGUAGE PREFIX
  path: string;
  lang: SupportedLanguage;
}) => {
  const hreflangLinks = supportedLanguages.reduce(
    (acc, lang) => {
      acc[lang] = `${siteUrl}${lang === 'en' ? '' : lang + (path ? '/' : '')}${path}`;

      return acc;
    },
    {} as Record<SupportedLanguage, string>,
  );

  return {
    canonical: hreflangLinks[lang],
    languages: {
      ...hreflangLinks,
      'x-default': hreflangLinks['en'], // Use the English version of the current page
    },
  };
};
