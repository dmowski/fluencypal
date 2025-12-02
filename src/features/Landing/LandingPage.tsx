import { Stack, Typography } from "@mui/material";
import { Footer } from "./Footer";
import { WelcomeScreen } from "./WelcomeScreen";
import { GeneralFaqBlock } from "./FAQ/GeneralFaqBlock";
import { CtaBlock } from "./ctaBlock";
import { ProposalCards } from "./ProposalCards";
import { RolePlayDemo } from "./RolePlay/RolePlayDemo";
import {
  fullEnglishLanguageName,
  SupportedLanguage,
  supportedLanguages,
  supportedLanguagesToLearn,
} from "@/features/Lang/lang";
import { getI18nInstance } from "@/appRouterI18n";
import { getUrlStart } from "../Lang/getUrlStart";
import Script from "next/script";
import { HeaderStatic } from "../Header/HeaderStatic";
import { PlanLandingBlock } from "./PlanLandingBlock";

interface LandingPageProps {
  lang: SupportedLanguage;
}
export default function LandingPage({ lang }: LandingPageProps) {
  const i18n = getI18nInstance(lang);

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: i18n._(`FluencyPal – Your AI English Speaking Partner`),
    url: "https://fluencypal.com/",
    description: i18n._(
      `Boost your fluency with FluencyPal, the friendly AI English tutor that's ready to chat 24/7. Designed for intermediate and advanced learners, FluencyPal adapts to your speaking level, provides instant corrections, and helps you speak confidently.`
    ),
    inLanguage: lang,
    publisher: {
      "@type": "Organization",
      name: "FluencyPal",
      url: "https://fluencypal.com",
      logo: {
        "@type": "ImageObject",
        url: "https://fluencypal.com/logo.png",
      },
    },
    mainEntity: [
      {
        "@type": "FAQPage",
        mainEntity: [
          {
            "@type": "Question",
            name: i18n._(`What is FluencyPal?`),
            acceptedAnswer: {
              "@type": "Answer",
              text: i18n._(
                `FluencyPal is an AI-powered English conversation practice app designed for intermediate and advanced learners. It provides realistic conversational practice in multiple languages, with immediate feedback on speaking and pronunciation.`
              ),
            },
          },

          {
            "@type": "Question",
            name: i18n._(`Can I practice languages other than English?`),
            acceptedAnswer: {
              "@type": "Answer",
              text:
                i18n._(
                  `Absolutely! FluencyPal supports various languages and adjusts conversations based on your chosen language and proficiency level. Available languages include:`
                ) +
                " " +
                `${supportedLanguages.map((code) => fullEnglishLanguageName[code]).join(", ")}.`,
            },
          },
          {
            "@type": "Question",
            name: i18n._(`What learning modes are available?`),
            acceptedAnswer: {
              "@type": "Answer",
              text: i18n._(
                `FluencyPal provides three modes: Casual Conversation for uninterrupted speaking practice, Talk & Correct for instant grammar and pronunciation feedback, and Beginner Mode for slower, guided conversations.`
              ),
            },
          },
          {
            "@type": "Question",
            name: i18n._(`How do daily tasks help me improve?`),
            acceptedAnswer: {
              "@type": "Answer",
              text: i18n._(
                `Daily conversational tasks introduce new vocabulary and language structures, reinforcing your skills and accelerating fluency improvements.`
              ),
            },
          },
        ],
      },
    ],
  };
  return (
    <>
      <HeaderStatic lang={lang} transparentOnTop />
      <Script
        type="application/ld+json"
        strategy="beforeInteractive"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      <main style={{ width: "100%", margin: 0 }}>
        <Stack sx={{ alignItems: "center" }}>
          <WelcomeScreen
            getStartedTitle={i18n._(`Get Started`)}
            pricingLink={`${getUrlStart(lang)}pricing`}
            practiceLink={`${getUrlStart(lang)}quiz`}
            openMyPracticeLinkTitle={i18n._(`Open`)}
            lang={lang}
          />
          <PlanLandingBlock lang={lang} />

          <ProposalCards
            title={i18n._(`Four Ways FluencyPal Boosts Your Speaking Skills`)}
            subTitle={i18n._(
              `Target the specific skills you need—speaking, grammar, vocabulary, and progress tracking—to achieve online English fluency faster.`
            )}
            infoCards={[
              {
                category: i18n._(`Speaking`),
                title: i18n._(`Achieve Speaking Fluency Fast`),
                description: i18n._(
                  `Practice realistic conversations tailored to your skill level. FluencyPal responds naturally, highlights areas for improvement, and builds your confidence.`
                ),
                img: "/landing/talk.webp",
                href: `${getUrlStart(lang)}quiz`,
                actionButtonTitle: i18n._(`Start Speaking Practice`),
              },
              {
                category: i18n._(`Grammar`),
                title: i18n._(`Instant Grammar Corrections`),
                description: i18n._(
                  `Get immediate feedback and explanations on your grammar mistakes as you practice. Enhance your speaking accuracy naturally.`
                ),
                img: "/landing/rules.webp",
                href: `${getUrlStart(lang)}quiz`,
                actionButtonTitle: i18n._(`Enhance Your Grammar`),
              },
              {
                category: i18n._(`Vocabulary`),
                title: i18n._(`Grow Your Vocabulary Daily`),
                description: i18n._(
                  `Receive personalized vocabulary tailored to your conversational needs. Use new words immediately to reinforce learning.`
                ),
                img: "/landing/words.webp",
                href: `${getUrlStart(lang)}quiz`,
                actionButtonTitle: i18n._(`Expand Your Vocabulary`),
              },
              {
                category: i18n._(`Progress Tracking`),
                title: i18n._(`Track Your Fluency Progress`),
                description: i18n._(
                  `Visualize your daily progress with intuitive tracking. Stay motivated by clearly seeing your improvements.`
                ),
                img: "/landing/progress.webp",
                href: `${getUrlStart(lang)}quiz`,
                actionButtonTitle: i18n._(`Check Your Progress`),
              },
            ]}
          />
          <RolePlayDemo
            title={i18n._(`Real-Life Role-Play for Advanced English Practice`)}
            subTitle={i18n._(
              `Practice speaking fluently in real-world scenarios like job interviews, business meetings, and everyday conversations.`
            )}
            actionButtonTitle={i18n._(`Explore Role-Play Scenarios`)}
            footerLabel={i18n._(`Looking for something specific?`)}
            footerLinkTitle={i18n._(`Create Your Own Scenario`)}
            importantRolesTitleAfterFooter={i18n._(`Master English Fluency`)}
            lang={lang}
          />
          <GeneralFaqBlock
            title={i18n._(`FAQ`)}
            items={[
              {
                question: i18n._(`What is FluencyPal?`),
                answer: (
                  <Typography>
                    {i18n._(
                      `FluencyPal is an AI-powered English conversation practice app designed for intermediate and advanced learners. It provides realistic conversational practice in multiple languages, with immediate feedback on speaking and pronunciation.`
                    )}
                  </Typography>
                ),
              },
              {
                question: i18n._(`Can I practice languages other than English?`),
                answer: (
                  <Stack sx={{ gap: "20px" }}>
                    <Typography>
                      {i18n._(
                        `Absolutely! FluencyPal supports various languages and adjusts conversations based on your chosen language and proficiency level.`
                      )}
                    </Typography>
                    <Stack sx={{ gap: "0px" }}>
                      <Typography sx={{ fontSize: "1rem", fontWeight: 600, paddingBottom: "5px" }}>
                        {i18n._(`Available languages:`)}
                      </Typography>
                      <Typography variant="body2" component="p">
                        {supportedLanguagesToLearn
                          .map((code) => fullEnglishLanguageName[code])
                          .join(", ")}
                      </Typography>
                    </Stack>
                  </Stack>
                ),
              },
              {
                question: i18n._(`What learning modes are available?`),
                answer: (
                  <Typography component="div">
                    <ul style={{ margin: 0, paddingLeft: "1.5rem" }}>
                      <li>
                        <strong>{i18n._(`Casual Conversation:`)}</strong>{" "}
                        {i18n._(`Practice speaking fluently without interruptions.`)}
                      </li>
                      <li>
                        <strong>{i18n._(`Talk & Correct:`)}</strong>{" "}
                        {i18n._(
                          `Receive detailed feedback on grammar and pronunciation instantly.`
                        )}
                      </li>
                      <li>
                        <strong>{i18n._(`Beginner Mode:`)}</strong>{" "}
                        {i18n._(`Slower conversations with guided support.`)}
                      </li>
                    </ul>
                  </Typography>
                ),
              },
              {
                question: i18n._(`How do daily tasks help me improve?`),
                answer: (
                  <Typography>
                    {i18n._(
                      `Daily conversational tasks introduce new vocabulary and language structures, reinforcing your skills and accelerating fluency improvements.`
                    )}
                  </Typography>
                ),
              },
            ]}
          />
          <CtaBlock
            title={i18n._(`Learn anywhere, anytime`)}
            actionButtonTitle={i18n._(`Start Learning Now`)}
            actionButtonLink={`${getUrlStart(lang)}quiz`}
          />
        </Stack>
      </main>
      <Footer lang={lang} />
    </>
  );
}
