import { Button, Stack, Typography } from "@mui/material";
import { Footer } from "./Footer";
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
import { WebCamButtons, WebcamSection } from "../Case/Landing/components/WebcamSection";
import { HowItWorks } from "./HowItWorks";
import { DynamicIcon } from "lucide-react/dynamic";
import { WelcomeScreen2 } from "./WelcomeScreen2";

interface FAQItem {
  question: string;
  answer: string;
}

interface LandingPageProps {
  lang: SupportedLanguage;
}
export default function LandingPage({ lang }: LandingPageProps) {
  const i18n = getI18nInstance(lang);

  const faqItems: FAQItem[] = [
    {
      question: i18n._(`What is FluencyPal?`),
      answer: i18n._(
        `FluencyPal is an AI-powered conversation practice app designed for intermediate and advanced learners. It helps you improve speaking fluency, pronunciation, and confidence through realistic conversations and instant feedback.`
      ),
    },

    {
      question: i18n._(`How does FluencyPal understand my learning goals?`),
      answer: i18n._(
        `When you start, FluencyPal asks a short series of questions about your goals, current language level, and areas you want to improve. You answer using your voice. Based on your responses, FluencyPal creates a personalized practice plan for you. For example, business English focuses on professional vocabulary and scenarios, travel English focuses on real-life situations, and interview preparation simulates interview questions with feedback.`
      ),
    },

    {
      question: i18n._(`What’s the price?`),
      answer: i18n._(
        `FluencyPal offers Free and monthly plans that give you full access to all features. There is no automatic recurring payment. Each month, you decide whether you want to continue and pay again manually. This way, you are never charged when you are not using the app.`
      ),
    },

    {
      question: i18n._(`What level of speaking should I have?`),
      answer: i18n._(
        `FluencyPal is best suited for learners who can hold basic conversations and want to improve fluency, accuracy, and confidence. It works well for pre-intermediate, intermediate, and advanced speakers and adapts to your level over time.`
      ),
    },

    {
      question: i18n._(`Is there a free trial?`),
      answer: i18n._(
        `No. FluencyPal offers a free plan with limited features and a monthly plan for full access. You can use the free plan indefinitely to practice speaking and explore basic features before deciding to upgrade.`
      ),
    },

    {
      question: i18n._(`Can I use FluencyPal for free?`),
      answer: i18n._(
        `Yes. FluencyPal offers free full access for users who rank in the top 5 of our speaking game. The game is free to play and includes reading text aloud, describing images, discussing topics, and answering questions. You can improve your speaking skills while playing.`
      ),
    },

    {
      question: i18n._(`Can FluencyPal create a personal practice plan for me?`),
      answer: i18n._(
        `Yes. FluencyPal generates a personalized practice plan based on your goals and proficiency level. Your daily sessions focus on relevant vocabulary, grammar, and real-life conversations. You can interact with the AI using voice or text.`
      ),
    },

    {
      question: i18n._(`What is the main focus of FluencyPal?`),
      answer: i18n._(
        `FluencyPal is focused on speaking practice. You can use voice mode and optionally enable webcam feedback with an AI avatar to make conversations feel more realistic and engaging, while receiving feedback on your speaking performance.`
      ),
    },

    {
      question: i18n._(`Can I practice languages other than English?`),
      answer:
        i18n._(
          `Yes. FluencyPal supports multiple languages and adapts conversations to your selected language and proficiency level. Available languages include:`
        ) + ` ${supportedLanguages.map((code) => fullEnglishLanguageName[code]).join(", ")}`,
    },

    {
      question: i18n._(`What learning modes are available?`),
      answer: i18n._(
        `FluencyPal offers several learning modes: Casual Conversation for uninterrupted speaking practice, Talk & Correct for instant grammar and pronunciation feedback, Role-Play Scenarios for real-life situations, as well as grammar practice, vocabulary building, and progress tracking.`
      ),
    },

    {
      question: i18n._(`How do daily tasks help me improve?`),
      answer: i18n._(
        `Daily speaking tasks introduce new vocabulary and sentence structures, help you build a learning habit, and reinforce your skills to improve fluency faster.`
      ),
    },

    {
      question: i18n._(`Where can I use FluencyPal?`),
      answer: i18n._(
        `FluencyPal is a browser-based app, so you only need an internet browser to use it. You can run FluencyPal on a mobile phone, tablet, or desktop without installing anything.`
      ),
    },

    {
      question: i18n._(`How is my data handled and is my privacy protected?`),
      answer: i18n._(
        `FluencyPal stores conversation transcripts in its database to improve your learning experience. You can permanently delete your personal data at any time from the app settings. Voice processing is handled using OpenAI services, and FluencyPal does not store your voice recordings. Webcam data is not stored either — it is processed in real time by the AI and then immediately discarded.`
      ),
    },

    {
      question: i18n._(`Is FluencyPal a replacement for a human teacher?`),
      answer: i18n._(
        `FluencyPal is designed to help you practice speaking and build confidence, not to replace a human teacher. It works best as a daily speaking companion that helps you practice more often, get instant feedback, and prepare for real conversations.`
      ),
    },

    {
      question: i18n._(`How can I track my progress?`),
      answer: i18n._(
        `FluencyPal tracks your activity and completed tasks over time. As you practice regularly, conversations become more complex and feedback adapts to your level, helping you notice improvements in fluency, confidence, and accuracy.`
      ),
    },

    {
      question: i18n._(`What do I need to use FluencyPal?`),
      answer: i18n._(
        `To use FluencyPal, you need a modern internet browser and a microphone. A webcam is optional and only used if you enable webcam feedback. No installation is required.`
      ),
    },

    {
      question: i18n._(`Is my data used to train AI models?`),
      answer: i18n._(
        `FluencyPal does not use your personal data or conversations to train AI models.`
      ),
    },
  ];
  const pageUrl = "https://www.fluencypal.com" + getUrlStart(lang);

  const seoFaqItems = faqItems.map((item) => ({
    "@type": "Question",
    name: item.question, // must be plain string
    acceptedAnswer: {
      "@type": "Answer",
      text: item.answer, // must be plain string
    },
  }));

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
    <>
      <HeaderStatic lang={lang} transparentOnTop />
      <Script
        type="application/ld+json"
        strategy="beforeInteractive"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      <main style={{ width: "100%", margin: 0 }}>
        <Stack sx={{ alignItems: "center" }}>
          <WelcomeScreen2
            label={i18n._(`Practice with AI`)}
            title={i18n._(`Speaking practice`)}
            subTitle1={i18n._(`Don’t let mistakes stop you.`)}
            subTitle2={i18n._(`Build fluency and confidence with daily speaking practice.`)}
            buttonTitle={i18n._(`Start`)}
            buttonHref={`${getUrlStart(lang)}quiz`}
            openMyPracticeLinkTitle={i18n._(`Start`)}
            cards={[
              {
                videoUrl: "/landing/preview/grammar2.webm",
                imageUrl: "/landing/preview/grammar2.webp",
                alt: i18n._("Grammar Correction Preview"),
              },
              {
                videoUrl: "/landing/preview/camera2.webm",
                imageUrl: "/landing/preview/camera2.webp",
                alt: i18n._("Webcam Feedback Preview"),
              },
              {
                imageUrl: "/landing/preview/roleplay.webp",
                alt: i18n._("Roleplay Preview"),
              },
            ]}
          />

          <Stack
            sx={{
              width: "100%",
            }}
          >
            <WebcamSection
              theme={"gray"}
              id="webcam-section"
              data={{
                type: "webcamDemo",
                title: i18n._("Practice Speaking with AI"),
                subTitle: i18n._(
                  "Get instant AI feedback on clarity, vocabulary, and flow — while you speak."
                ),
                content: i18n._(
                  "Practice real conversations and explain your thoughts out loud in a safe, pressure-free environment — without fear of mistakes."
                ),
                infoList: [
                  {
                    title: i18n._("Speak naturally, without overthinking"),
                    iconName: "mic",
                    iconColor: "#c2c2c2",
                  },
                  {
                    title: i18n._("Get clear, actionable AI feedback"),
                    iconName: "message-circle",
                    iconColor: "#c2c2c2",
                  },
                  {
                    title: i18n._("Build confidence through real practice"),
                    iconName: "chart-bar",
                    iconColor: "#c2c2c2",
                  },
                ],
                webCamPreview: {
                  videoUrl: "/interview/interviewWebPreview2.webm",
                  title: i18n._("Conversation Practice"),
                  participants: i18n._("AI conversation"),

                  beforeSectionTitle: i18n._("Warm-up"),
                  beforeSectionSubTitle: i18n._("Done"),

                  afterSectionTitle: i18n._("Free Conversation"),
                  afterSectionSubTitle: i18n._("Next"),
                },
                buttonTitle: i18n._("Start speaking practice"),
              }}
              buttonHref={`${getUrlStart(lang)}quiz`}
            />

            <HowItWorks
              label={i18n._(`Simple & Effective`)}
              title={i18n._(`How It Works`)}
              subTitle={i18n._(
                "Improving your English speaking skills doesn't have to be complicated. With FluencyPal, anyone can practice confidently and see real progress in minutes, regardless of their current level."
              )}
              cards={[
                {
                  imageUrl: "/quiz/step1.webp",
                  bgColor: "#e9e9e9ff",

                  title: i18n._("Smart Start"),
                  titleColor: "#fff",
                  titleBgColor: "#111",
                  subTitle: i18n._(
                    `Fill out a onboarding quiz to help FluencyPal understand your goals and preferences.`
                  ),
                  subTitleColor: "#515154ff",
                  footerButton: (
                    <>
                      <Stack
                        sx={{
                          position: "absolute",
                          bottom: "110px",
                          width: "100%",
                          alignItems: "center",
                          "@media (max-width: 600px)": {
                            bottom: 0,
                            height: "auto",
                            aspectRatio: "160 / 46",
                          },
                        }}
                      >
                        <Button
                          href={`${getUrlStart(lang)}quiz`}
                          variant="contained"
                          size="large"
                          color="info"
                          sx={{
                            padding: "10px 30px",
                            backgroundColor: "#29A9FF",
                            color: "#fff",
                            fontWeight: 600,
                            borderRadius: "2px",
                            fontSize: "16px",
                            boxShadow: "none",
                            minWidth: "240px",
                            "@media (max-width: 600px)": {
                              boxShadow: "4px 4px 30px rgba(0, 0, 0, 0.3)",
                              borderRadius: "1px",
                            },
                          }}
                          endIcon={<DynamicIcon name={"arrow-right"} />}
                        >
                          {i18n._(`Get My Plan`)}
                        </Button>
                      </Stack>
                    </>
                  ),
                },

                {
                  quizAnimation: "step2",
                  bgColor: "#02b1ff",

                  title: i18n._("Personal Plan"),
                  titleColor: "#111",
                  titleBgColor: "#fff",

                  subTitle: i18n._(
                    "Based on your onboarding, FluencyPal instantly generates a custom learning plan just for you."
                  ),
                  subTitleColor: "#fff",
                },

                {
                  videoUrl: "/call/boy_1/talk.webm",
                  bgColor: "rgb(169, 129, 255)",

                  title: i18n._("Practice"),
                  titleColor: "#111",
                  titleBgColor: "#fff",

                  subTitle: i18n._(
                    "Jump into your tailored learning path and build real skills through engaging practice with AI voice chat."
                  ),
                  subTitleColor: "#fff",
                  footerButton: <WebCamButtons />,
                },
              ]}
              buttonTitle={i18n._(`Start Practicing`)}
              buttonHref={`${getUrlStart(lang)}quiz`}
              theme={"dark-red"}
              id={"how-it-works"}
            />
          </Stack>

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
              ...faqItems.map((item) => {
                return {
                  question: item.question,
                  answer: <Typography>{item.answer}</Typography>,
                };
              }),
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
