import { TalkingWaves } from "@/features/uiKit/Animations/TalkingWaves";
import { Stack, Typography } from "@mui/material";
import { Header } from "../Header/Header";
import { Footer } from "./Footer";
import { WelcomeScreen } from "./WelcomeScreen";
import { IntroVideoDemo } from "./IntroVideoDemo";
import { GeneralFaqBlock } from "./FAQ/GeneralFaqBlock";
import { CtaBlock } from "./ctaBlock";
import { ProposalCards } from "./ProposalCards";
import { ProductDemo } from "./ProductDemo";
import { RolePlayDemo } from "./RolePlay/RolePlayDemo";
import { fullEnglishLanguageName, SupportedLanguage, supportedLanguages } from "@/common/lang";
import { getI18nInstance } from "@/appRouterI18n";

interface LandingPageProps {
  lang: SupportedLanguage;
}
export default function LandingPage({ lang }: LandingPageProps) {
  const i18n = getI18nInstance(lang);
  return (
    <>
      <Header mode="landing" lang={lang} />
      <main style={{ width: "100%", margin: 0 }}>
        <TalkingWaves />
        <Stack sx={{ alignItems: "center" }}>
          <WelcomeScreen
            title={i18n._(`FluencyPal – Your AI English Speaking Partner`)}
            subTitle={i18n._(
              `Boost your fluency with FluencyPal, the friendly AI English tutor that's ready to chat 24/7. Designed for intermediate and advanced learners, FluencyPal adapts to your speaking level, provides instant corrections, and helps you speak confidently.`
            )}
            openDashboardTitle={i18n._(`Open Dashboard`)}
            getStartedTitle={i18n._(`Get Started Free`)}
            viewPricingTitle={i18n._(`View Pricing`)}
            noCreditCardNeededTitle={i18n._(`No Credit Card Needed`)}
            pricingLink={`/${lang}/pricing`}
            practiceLink={`/${lang}/practice`}
          />
          <IntroVideoDemo
            title={i18n._(`Speak Fluent English with Confidence`)}
            subTitle={i18n._(
              `FluencyPal offers realistic conversational practice in English, Spanish, French, and more. Engage in immersive role-play scenarios, get instant feedback, and improve your speaking skills anytime, anywhere.`
            )}
            actionButtonTitle={i18n._(`Get started free`)}
            actionButtonLink={`/${lang}/practice`}
            blocks={[
              {
                src: "/begin.mp4",
                buttonTitle: i18n._(`Beginner`),
                description: i18n._(
                  `Practice slow, guided conversations with simpler vocabulary. Perfect for building a solid foundation in any language.`
                ),
              },
              {
                src: "/correct.mp4",
                buttonTitle: i18n._(`Instant Corrections`),
                description: i18n._(
                  `Speak freely while the AI teacher highlights mistakes in real time—ideal for fast improvement and building confidence.`
                ),
              },
              {
                src: "/advance.mp4",
                buttonTitle: i18n._(`Advanced`),
                description: i18n._(
                  `Enjoy fast-paced, natural conversations to refine fluency and sound like a native speaker. Perfect for challenging your skills.`
                ),
              },
            ]}
          />
          <ProductDemo label={i18n._(`Product Demo`)} title={i18n._(`See FluencyPal in Action`)} />

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
                img: "/talk.jpeg",
                href: `/${lang}/practice`,
                actionButtonTitle: i18n._(`Start Speaking Practice`),
              },
              {
                category: i18n._(`Grammar`),
                title: i18n._(`Instant Grammar Corrections`),
                description: i18n._(
                  `Get immediate feedback and explanations on your grammar mistakes as you practice. Enhance your speaking accuracy naturally.`
                ),
                img: "/rules.jpeg",
                href: `/${lang}/practice`,
                actionButtonTitle: i18n._(`Enhance Your Grammar`),
              },
              {
                category: i18n._(`Vocabulary`),
                title: i18n._(`Grow Your Vocabulary Daily`),
                description: i18n._(
                  `Receive personalized vocabulary tailored to your conversational needs. Use new words immediately to reinforce learning.`
                ),
                img: "/words.jpeg",
                href: `/${lang}/practice`,
                actionButtonTitle: i18n._(`Expand Your Vocabulary`),
              },
              {
                category: i18n._(`Progress Tracking`),
                title: i18n._(`Track Your Fluency Progress`),
                description: i18n._(
                  `Visualize your daily progress with intuitive tracking. Stay motivated by clearly seeing your improvements.`
                ),
                img: "/progress.png",
                href: `/${lang}/practice`,
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
                question: i18n._(`How does usage-based pricing work?`),
                answer: (
                  <Typography>
                    {i18n._(
                      `You receive a free initial balance to explore FluencyPal. Each conversation consumes tokens from your balance in real-time, and you can easily top-up credits whenever needed.`
                    )}
                  </Typography>
                ),
              },
              {
                question: i18n._(`Is there a free trial?`),
                answer: (
                  <Typography>
                    {i18n._(
                      `Yes, FluencyPal offers a complimentary balance to let you try conversational practice and see how the platform works before topping up.`
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
                        {supportedLanguages.map((code) => fullEnglishLanguageName[code]).join(", ")}
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
            title={i18n._(`Ready to Become Fluent in English?`)}
            actionButtonTitle={i18n._(`Start Your Free Trial`)}
            actionButtonLink={`/${lang}/practice`}
          />
        </Stack>
      </main>
      <Footer lang={lang} />
    </>
  );
}
