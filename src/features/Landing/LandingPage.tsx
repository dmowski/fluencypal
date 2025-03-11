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
import { fullEnglishLanguageName, supportedLanguages } from "@/common/lang";

export default function LandingPage() {
  return (
    <>
      <Header mode="landing" />
      <main style={{ width: "100%", margin: 0 }}>
        <TalkingWaves />
        <Stack sx={{ alignItems: "center" }}>
          <WelcomeScreen
            title="FluencyPal – Your AI English Speaking Partner"
            subTitle="Boost your fluency with FluencyPal, the friendly AI English tutor that's ready to chat 24/7. Designed for intermediate and advanced learners, FluencyPal adapts to your speaking level, provides instant corrections, and helps you speak confidently."
          />
          <IntroVideoDemo
            title="Speak Fluent English with Confidence"
            subTitle="FluencyPal offers realistic conversational practice in English, Spanish, French, and more. Engage in immersive role-play scenarios, get instant feedback, and improve your speaking skills anytime, anywhere."
          />
          <ProductDemo label="Product Demo" title="See FluencyPal in Action" />

          <ProposalCards
            infoCards={[
              {
                category: "Speaking",
                title: "Achieve Speaking Fluency Fast",
                description:
                  "Practice realistic conversations tailored to your skill level. FluencyPal responds naturally, highlights areas for improvement, and builds your confidence.",
                img: "/talk.jpeg",
                href: "/practice",
                actionButtonTitle: "Start Speaking Practice",
              },
              {
                category: "Grammar",
                title: "Instant Grammar Corrections",
                description:
                  "Get immediate feedback and explanations on your grammar mistakes as you practice. Enhance your speaking accuracy naturally.",
                img: "/rules.jpeg",
                href: "/practice",
                actionButtonTitle: "Enhance Your Grammar",
              },
              {
                category: "Vocabulary",
                title: "Grow Your Vocabulary Daily",
                description:
                  "Receive personalized vocabulary tailored to your conversational needs. Use new words immediately to reinforce learning.",
                img: "/words.jpeg",
                href: "/practice",
                actionButtonTitle: "Expand Your Vocabulary",
              },
              {
                category: "Progress Tracking",
                title: "Track Your Fluency Progress",
                description:
                  "Visualize your daily progress with intuitive tracking. Stay motivated by clearly seeing your improvements.",
                img: "/progress.png",
                href: "/practice",
                actionButtonTitle: "Check Your Progress",
              },
            ]}
          />
          <RolePlayDemo
            title="Real-Life Role-Play for Advanced English Practice"
            subTitle="Practice speaking fluently in real-world scenarios like job interviews, business meetings, and everyday conversations."
            actionButtonTitle="Explore Role-Play Scenarios"
            footerLabel="Looking for something specific?"
            footerLinkTitle="Create Your Own Scenario"
            importantRolesTitleAfterFooter="Master English Fluency"
          />
          <GeneralFaqBlock
            items={[
              {
                question: "What is FluencyPal?",
                answer: (
                  <Typography>
                    FluencyPal is an AI-powered English conversation practice app designed for
                    intermediate and advanced learners. It provides realistic conversational
                    practice in multiple languages, with immediate feedback on speaking and
                    pronunciation.
                  </Typography>
                ),
              },
              {
                question: "How does usage-based pricing work?",
                answer: (
                  <Typography>
                    You receive a free initial balance to explore FluencyPal. Each conversation
                    consumes tokens from your balance in real-time, and you can easily top-up
                    credits whenever needed.
                  </Typography>
                ),
              },
              {
                question: "Is there a free trial?",
                answer: (
                  <Typography>
                    Yes, FluencyPal offers a complimentary balance to let you try conversational
                    practice and see how the platform works before topping up.
                  </Typography>
                ),
              },
              {
                question: "Can I practice languages other than English?",
                answer: (
                  <Stack sx={{ gap: "20px" }}>
                    <Typography>
                      Absolutely! FluencyPal supports various languages and adjusts conversations
                      based on your chosen language and proficiency level.
                    </Typography>
                    <Stack sx={{ gap: "0px" }}>
                      <Typography sx={{ fontSize: "1rem", fontWeight: 600, paddingBottom: "5px" }}>
                        Available languages:
                      </Typography>
                      <Typography variant="body2" component="p">
                        {supportedLanguages.map((code) => fullEnglishLanguageName[code]).join(", ")}
                      </Typography>
                    </Stack>
                  </Stack>
                ),
              },
              {
                question: "What learning modes are available?",
                answer: (
                  <Typography component="div">
                    <ul style={{ margin: 0, paddingLeft: "1.5rem" }}>
                      <li>
                        <strong>Casual Conversation:</strong> Practice speaking fluently without
                        interruptions.
                      </li>
                      <li>
                        <strong>Talk & Correct:</strong> Receive detailed feedback on grammar and
                        pronunciation instantly.
                      </li>
                      <li>
                        <strong>Beginner Mode:</strong> Slower conversations with guided support.
                      </li>
                    </ul>
                  </Typography>
                ),
              },
              {
                question: "How do daily tasks help me improve?",
                answer: (
                  <Typography>
                    Daily conversational tasks introduce new vocabulary and language structures,
                    reinforcing your skills and accelerating fluency improvements.
                  </Typography>
                ),
              },
            ]}
          />
          <CtaBlock
            title="Ready to Become Fluent in English?"
            actionButtonTitle="Start Your Free Trial"
          />
        </Stack>
      </main>
      <Footer />
    </>
  );
}
