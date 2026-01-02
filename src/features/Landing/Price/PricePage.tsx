import { Stack, Typography } from "@mui/material";

import { maxContentWidth, subTitleFontStyle } from "../landingSettings";
import { CtaBlock } from "../ctaBlock";
import { Footer } from "../Footer";
import { FirstEnterButton } from "../FirstEnterButton";
import { PriceCard } from "./PriceCard";
import Script from "next/script";
import {
  BookType,
  ChartNoAxesCombined,
  GraduationCap,
  Lightbulb,
  Sparkles,
  Speech,
  UsersRound,
  Blocks,
  Gem,
  Swords,
  Languages,
  BookText,
} from "lucide-react";
import { SupportedLanguage } from "@/features/Lang/lang";
import { getI18nInstance } from "@/appRouterI18n";
import { getUrlStart } from "@/features/Lang/getUrlStart";
import { CurrencyToDisplay, PriceDisplay } from "./PriceDisplay";
import { HeaderStatic } from "@/features/Header/HeaderStatic";
import { PRICE_PER_MONTH_USD } from "@/common/subscription";
import { GeneralFaqBlock } from "../FAQ/GeneralFaqBlock";

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
        `Yes. FluencyPal offers a free 1-day trial with full access to all features. No credit card is required to start the trial.`
      ),
    },

    {
      question: i18n._(`Do I need to enter a credit card to start?`),
      answer: i18n._(`No. You can start the free trial without entering any payment details.`),
    },

    {
      question: i18n._(`Is the payment recurring?`),
      answer: i18n._(
        `No. FluencyPal does not use automatic recurring payments. You decide each month whether you want to continue and pay again manually.`
      ),
    },

    {
      question: i18n._(`What do I get with the paid plan?`),
      answer: i18n._(
        `The paid plan gives you full access to all FluencyPal features, including unlimited speaking practice, all learning modes, personalized practice plans, and progress tracking.`
      ),
    },

    {
      question: i18n._(`Can I stop using FluencyPal anytime?`),
      answer: i18n._(
        `Yes. Since there is no automatic renewal, you can simply stop using the app at any time without being charged again.`
      ),
    },

    {
      question: i18n._(`Can I use FluencyPal for free?`),
      answer: i18n._(
        `Yes. You can earn free full access by ranking in the top 5 of the FluencyPal speaking game. The game is free to play.`
      ),
    },

    {
      question: i18n._(`Are there any hidden fees?`),
      answer: i18n._(
        `No. The price shown is the full price. There are no hidden fees or surprise charges.`
      ),
    },
  ];

  const seoFaqItems = faqItems.map((item) => ({
    "@type": "Question",
    name: item.question, // must be plain string
    acceptedAnswer: {
      "@type": "Answer",
      text: item.answer, // must be plain string
    },
  }));

  const pageUrl = "https://www.fluencypal.com" + getUrlStart(lang) + "pricing";

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    name: i18n._(`FluencyPal – Your AI English Speaking Partner`),
    url: pageUrl,
    inLanguage: lang,
    mainEntity: seoFaqItems,
    publisher: {
      "@type": "Organization",
      name: "FluencyPal",
      url: "https://www.fluencypal.com",
      logo: {
        "@type": "ImageObject",
        url: "https://www.fluencypal.com/logo.png",
      },
    },
  };

  return (
    <Stack sx={{}}>
      <HeaderStatic lang={lang} />

      <Script
        type="application/ld+json"
        strategy="beforeInteractive"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />

      <div
        style={{
          width: "100%",
          margin: 0,
        }}
      >
        <Stack
          component={"main"}
          sx={{
            alignItems: "center",
            width: "100%",
            backgroundColor: `rgba(255, 255, 255, 0.99)`,
            paddingTop: "100px",
            color: "#000",
          }}
        >
          <Stack
            sx={{
              alignItems: "center",
              gap: "30px",
              padding: "70px 0 70px 0",
            }}
          >
            <Stack
              sx={{
                alignItems: "center",
                gap: "10px",
              }}
            >
              <Typography
                align="center"
                variant="h2"
                component={"h1"}
                sx={{
                  fontWeight: 700,
                  "@media (max-width: 1300px)": {
                    fontSize: "4rem",
                  },
                  "@media (max-width: 900px)": {
                    fontSize: "3rem",
                  },
                  "@media (max-width: 700px)": {
                    fontSize: "2rem",
                  },
                }}
              >
                {i18n._("Price")}
              </Typography>
              <Typography
                align="center"
                variant="body1"
                sx={{
                  maxWidth: "940px",
                  ...subTitleFontStyle,
                }}
              >
                {i18n._(`From mistakes and hesitation to confident conversations`)}
              </Typography>
            </Stack>

            <FirstEnterButton
              getStartedTitle={i18n._(`Get Started`)}
              practiceLink={`${getUrlStart(lang)}quiz`}
              openMyPracticeLinkTitle={i18n._(`Open`)}
            />
          </Stack>

          <Stack
            sx={{
              maxWidth: maxContentWidth,
              width: "100%",
              padding: "0px 20px 100px 20px",
              gap: "40px",
              alignItems: "center",
              boxSizing: "border-box",
            }}
          >
            <Stack
              sx={{
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "center",
                gap: "30px",
                height: "100%",
                display: "grid",
                width: "100%",
                boxSizing: "border-box",
                gridTemplateColumns: "1fr 1fr 1fr",
                "@media (max-width: 1000px)": {
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: "40px",
                },
              }}
            >
              <PriceCard
                title={i18n._("Free")}
                subTitle={i18n._("For learners getting started")}
                price={
                  <Stack
                    sx={{
                      flexDirection: "row",
                      alignItems: "center",
                      gap: "8px",
                    }}
                  >
                    <Typography
                      variant="h2"
                      component={"span"}
                      sx={{
                        fontWeight: 600,
                        fontSize: "3rem",
                      }}
                    >
                      0
                    </Typography>

                    <Stack sx={{}}>
                      <Typography
                        variant="caption"
                        sx={{
                          textTransform: "uppercase",
                        }}
                      >
                        <CurrencyToDisplay />
                      </Typography>
                      <Typography variant="caption">/ {i18n._("month")}</Typography>
                    </Stack>
                  </Stack>
                }
                priceSubDescription={i18n._("Get started with basic features")}
                listTitle={i18n._("Everything in Free, plus:")}
                isLightButton
                listItems={[
                  {
                    title: i18n._("1 day full access trial"),
                    tooltip: i18n._("Get unlimited access to AI-powered language practice"),
                    icon: Gem,
                  },
                  {
                    title: i18n._("Game-based practice"),
                    tooltip: i18n._("Get unlimited access to AI-powered language practice"),
                    icon: Swords,
                  },
                  {
                    title: i18n._("Debates and discussions"),
                    tooltip: i18n._(
                      "Engage in real-life conversations like job interviews or ordering food"
                    ),
                    icon: UsersRound,
                  },
                  {
                    title: i18n._("Vocabulary challenges"),
                    tooltip: i18n._("Improve fluency with interactive chat sessions"),
                    icon: Languages,
                  },
                  {
                    title: i18n._("Reading practice"),
                    tooltip: i18n._("Improve fluency with interactive chat sessions"),
                    icon: BookText,
                  },
                ]}
                buttonTitle={i18n._("Start")}
                buttonLink={`${getUrlStart(lang)}quiz`}
              />

              <PriceCard
                title={i18n._("Full Access")}
                subTitle={i18n._("For learners who want flexibility")}
                price={
                  <Stack
                    sx={{
                      flexDirection: "row",
                      alignItems: "center",
                      gap: "8px",
                    }}
                  >
                    <Typography
                      variant="h2"
                      component={"span"}
                      sx={{
                        fontWeight: 600,
                        fontSize: "3rem",
                      }}
                    >
                      <PriceDisplay amountInUsd={PRICE_PER_MONTH_USD} />
                    </Typography>

                    <Stack sx={{}}>
                      <Typography
                        variant="caption"
                        sx={{
                          textTransform: "uppercase",
                        }}
                      >
                        <CurrencyToDisplay />
                      </Typography>
                      <Typography variant="caption">/ {i18n._("month")}</Typography>
                    </Stack>
                  </Stack>
                }
                priceSubDescription={i18n._("Learn at full speed with full access")}
                listTitle={i18n._("Everything in Free, plus:")}
                isLightButton
                listItems={[
                  {
                    title: i18n._("Full AI tutor access"),
                    tooltip: i18n._("Get unlimited access to AI-powered language practice"),
                    icon: Sparkles,
                  },
                  {
                    title: i18n._("Role-play scenarios"),
                    tooltip: i18n._(
                      "Engage in real-life conversations like job interviews or ordering food"
                    ),
                    icon: UsersRound,
                  },
                  {
                    title: i18n._("Conversation practice"),
                    tooltip: i18n._("Improve fluency with interactive chat sessions"),
                    icon: Speech,
                  },
                  {
                    title: i18n._("Progress tracking"),
                    tooltip: i18n._("See your improvements and track your learning journey"),
                    icon: ChartNoAxesCombined,
                  },
                  {
                    title: i18n._("New Words"),
                    tooltip: i18n._("Get new words and phrases in context"),
                    icon: BookType,
                  },
                  {
                    title: i18n._("New Grammar Rules"),
                    tooltip: i18n._("By practicing, you will get personal grammar rules from AI"),
                    icon: GraduationCap,
                  },
                  {
                    title: i18n._("Advanced Personalization"),
                    tooltip: i18n._(
                      "With time, AI will adapt to your learning style and it will be more personalized"
                    ),
                    icon: Lightbulb,
                  },
                ]}
                buttonTitle={i18n._("Start")}
                buttonLink={`${getUrlStart(lang)}quiz`}
              />
              <PriceCard
                title={i18n._("Advanced")}
                subTitle={i18n._("Frequent users who need more value")}
                price={
                  <Stack
                    sx={{
                      justifyContent: "flex-end",
                      height: "57px",
                    }}
                  >
                    <Typography
                      variant="h6"
                      component={"span"}
                      sx={{
                        fontWeight: 700,
                        opacity: 0.8,
                        fontSize: "1.6rem",
                        lineHeight: "1.15",
                      }}
                    >
                      {i18n._("Contact for pricing")}
                    </Typography>
                  </Stack>
                }
                priceSubDescription={i18n._("Frequent users who need more value")}
                listTitle={i18n._("What I can do for you:")}
                listItems={[
                  {
                    title: i18n._("Custom features"),
                    tooltip: i18n._("Tailor AI interactions to fit your needs"),
                    icon: Blocks,
                  },
                  {
                    title: i18n._("Discounted AI Usage"),
                    tooltip: i18n._("Get cheaper AI hours for bulk use"),
                    icon: Gem,
                  },
                ]}
                buttonTitle={i18n._("Contact me", undefined, {
                  comment: "Button title for contact me for advance pricing",
                })}
                isLightButton
                buttonLink={`${getUrlStart(lang)}contacts`}
              />
            </Stack>
          </Stack>

          <Stack
            sx={{
              width: "100%",
              alignItems: "center",
              backgroundColor: `#0a121e`,
              color: "#fff",
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
          actionButtonLink={`${getUrlStart(lang)}quiz`}
        />
      </div>
      <Footer lang={lang} />
    </Stack>
  );
};
