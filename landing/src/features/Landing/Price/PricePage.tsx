import { Stack, Typography } from '@mui/material';

import { maxContentWidth, subTitleFontStyle } from '../landingSettings';
import { CtaBlock } from '../ctaBlock';
import { Footer } from '../Footer';
import { FirstEnterButton } from '../FirstEnterButton';
import Script from 'next/script';
import { SupportedLanguage } from '@/features/Lang/lang';
import { getI18nInstance } from '@/appRouterI18n';
import { getAppUrlStart, getUrlStart } from '@/features/Lang/getUrlStart';
import { HeaderStatic } from '@/features/Header/HeaderStatic';
import { ADVANCED_PRICE_PER_HOUR_USD, PRICE_PER_MONTH_USD } from '@/features/Price/price';
import { paidAccessPriceUsd } from '@/features/Price/paidAccessPlans';
import { PaidAccessPriceSection } from './PaidAccessPriceSection';
import { GeneralFaqBlock } from '../FAQ/GeneralFaqBlock';

interface PricePageProps {
  lang: SupportedLanguage;
}

interface FAQItem {
  question: string;
  answer: string;
}

export const PricePage = ({ lang }: PricePageProps) => {
  const i18n = getI18nInstance(lang);

  const faqItems: FAQItem[] = [
    {
      question: i18n._(`Is there a free trial?`),
      answer: i18n._(
        `No. FluencyPal offers a free plan with limited speaking messages and paid access for a week, a month, or a year. You can try speaking before you upgrade.`,
      ),
    },

    {
      question: i18n._(`Do I need to enter a credit card to start?`),
      answer: i18n._(
        `No. You can start speaking on the free plan without entering payment details.`,
      ),
    },

    {
      question: i18n._(`Is the payment recurring?`),
      answer: i18n._(
        `No. FluencyPal does not use automatic recurring payments. You choose a week, a month, or a year, and you pay again only if you want to continue.`,
      ),
    },

    {
      question: i18n._(`What do I get with the paid plan?`),
      answer: i18n._(
        `Practice ({practicePrice} a month) includes unlimited Just Talk, a personal plan, exams, role-play, and daily lessons. Group conversations are free. Conversation ({conversationPrice} a month) adds {conversationHours} of advanced conversation. Conversation 10 ({conversation10Price} a month) adds {conversation10Hours} of advanced conversation. Week and year options are on this page.`,
        {
          practicePrice: `$${PRICE_PER_MONTH_USD}`,
          conversationPrice: `$${paidAccessPriceUsd('conversation', 'month')}`,
          conversationHours: i18n._('1 hour'),
          conversation10Price: `$${paidAccessPriceUsd('conversation-10', 'month')}`,
          conversation10Hours: i18n._('{count} hours', { count: 10 }),
        },
      ),
    },

    {
      question: i18n._(`Can I stop using FluencyPal anytime?`),
      answer: i18n._(
        `Yes. Since there is no automatic renewal, you can simply stop using the app at any time without being charged again. And you can ask for a refund at any time.`,
      ),
    },

    {
      question: i18n._(`Can I use FluencyPal for free?`),
      answer: i18n._(
        `Yes, with limits. You can start speaking on the free plan. Unlimited practice requires paid access.`,
      ),
    },

    {
      question: i18n._(`Are there any hidden fees?`),
      answer: i18n._(
        `No. The price shown is the full price. There are no hidden fees or surprise charges.`,
      ),
    },
    {
      question: i18n._(`Can I do a refund after purchase?`),
      answer: i18n._(
        `Yes. If you’re not satisfied with the service, on "Profile/Payment history" page you can request a refund and we will discuss the details and return the amount paid.`,
      ),
    },
    {
      question: i18n._(`Do you offer custom pricing?`),
      answer: i18n._(
        `Yes. Custom advanced AI talking is available at {price} per hour for learners who want a more capable realtime conversation model.`,
        { price: `$${ADVANCED_PRICE_PER_HOUR_USD}` },
      ),
    },
  ];

  const seoFaqItems = faqItems.map((item) => ({
    '@type': 'Question',
    name: item.question, // must be plain string
    acceptedAnswer: {
      '@type': 'Answer',
      text: item.answer, // must be plain string
    },
  }));

  const pageUrl = 'https://www.fluencypal.com' + getUrlStart(lang) + 'pricing';

  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    name: i18n._(`FluencyPal – Your AI English Speaking Partner`),
    url: pageUrl,
    inLanguage: lang,
    mainEntity: seoFaqItems,
    publisher: {
      '@type': 'Organization',
      name: 'FluencyPal',
      url: 'https://www.fluencypal.com',
      logo: {
        '@type': 'ImageObject',
        url: 'https://www.fluencypal.com/logo.png',
      },
    },
  };

  return (
    <Stack>
      <HeaderStatic lang={lang} />

      <Script
        type="application/ld+json"
        strategy="beforeInteractive"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />

      <div
        style={{
          width: '100%',
          margin: 0,
        }}
      >
        <Stack
          component={'main'}
          sx={{
            alignItems: 'center',
            width: '100%',
            backgroundColor: `rgba(255, 255, 255, 0.99)`,
            paddingTop: '100px',
            color: '#000',
          }}
        >
          <Stack
            sx={{
              alignItems: 'center',
              gap: '30px',
              padding: '70px 0 70px 0',
            }}
          >
            <Stack
              sx={{
                alignItems: 'center',
                gap: '10px',
              }}
            >
              <Typography
                align="center"
                variant="h2"
                component={'h1'}
                sx={{
                  fontWeight: 700,
                  '@media (max-width: 1300px)': {
                    fontSize: '4rem',
                  },
                  '@media (max-width: 900px)': {
                    fontSize: '3rem',
                  },
                  '@media (max-width: 700px)': {
                    fontSize: '2rem',
                  },
                }}
              >
                {i18n._('Price')}
              </Typography>
              <Typography
                align="center"
                variant="body1"
                sx={{
                  maxWidth: '940px',
                  ...subTitleFontStyle,
                }}
              >
                {i18n._(`From mistakes and hesitation to confident conversations`)}
              </Typography>
            </Stack>

            <FirstEnterButton
              getStartedTitle={i18n._(`Get Started`)}
              practiceLink={`${getAppUrlStart(lang)}practice`}
              openMyPracticeLinkTitle={i18n._(`Open`)}
            />
          </Stack>

          <Stack
            sx={{
              maxWidth: maxContentWidth,
              width: '100%',
              padding: '0px 20px 100px 20px',
              gap: '40px',
              alignItems: 'center',
              boxSizing: 'border-box',
            }}
          >
            <PaidAccessPriceSection quizLink={`${getAppUrlStart(lang)}practice`} />
          </Stack>

          <Stack
            sx={{
              width: '100%',
              alignItems: 'center',
              backgroundColor: `#0a121e`,
              color: '#fff',
            }}
          >
            <GeneralFaqBlock
              title={i18n._(`FAQ`)}
              items={[
                ...faqItems.map((item) => {
                  return {
                    question: item.question,
                    answer: <Typography>{item.answer}</Typography>,
                  };
                }),
              ]}
            />
          </Stack>
        </Stack>

        <CtaBlock
          title={i18n._(`Start Your Journey to Fluent Conversations Now`)}
          actionButtonTitle={i18n._(`Get Started`)}
          actionButtonLink={`${getAppUrlStart(lang)}practice`}
        />
      </div>
      <Footer lang={lang} />
    </Stack>
  );
};
