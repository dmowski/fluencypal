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
      <main
        style={{
          width: "100%",
          margin: 0,
        }}
      >
        <TalkingWaves />
        <Stack
          sx={{
            alignItems: "center",
          }}
        >
          <WelcomeScreen
            title="Online English with AI Teacher"
            subTitle="Experience next-level language practice with Bruno, your friendly AI tutor who’s ready
            to chat 24/7. Whether you’re a beginner or advanced learner, Bruno adapts to your pace,
            corrects mistakes, and keeps you motivated."
          />
          <IntroVideoDemo
            title="Speak, Learn, and Grow with Ease"
            subTitle="Dark Lang’s AI tutor offers realistic conversation practice in English, Spanish, French,
            and more. Enjoy casual chats, instant corrections, and track your progress with a
            teacher who never tires."
          />
          <ProductDemo label="Product Demo" title="Watch Dark Lang in Action" />

          <ProposalCards
            infoCards={[
              {
                category: "Speaking",
                title: "Boost Your Fluency in Record Time",
                description:
                  "Practice live conversations with Bruno. Whether you speak or type, the AI responds naturally, highlights mistakes, and helps you progress quickly.",
                img: "/talk.jpeg",
                href: "/practice",
                actionButtonTitle: "Try Speaking Mode",
              },
              {
                category: "Grammar",
                title: "Master the Rules",
                description:
                  "Bruno provides real-time feedback and explains grammar points on the spot. Get daily tasks to learn new rules and apply them immediately.",
                img: "/rules.jpeg",
                href: "/practice",
                actionButtonTitle: "Improve Your Grammar",
              },
              {
                category: "Vocabulary",
                title: "Expand Your Word Bank Every Day",
                description:
                  "Get daily new words based on your current level. Practice using them in sentences so they truly stick.",
                img: "/words.jpeg",
                href: "/practice",
                actionButtonTitle: "Learn New Words",
              },
              {
                category: "Progress Tracking",
                title: "See Your Growth",
                description:
                  "Watch your confidence grow. The colorful calendar shows your daily progress at a glance.",
                img: "/progress.jpeg",
                href: "/practice",
                actionButtonTitle: "View Your Dashboard",
              },
            ]}
          />
          <RolePlayDemo
            title="Role-Play Scenarios: Real-Life Conversation Practice"
            subTitle="Enhance your speaking skills with immersive, hands-on scenarios for everyday situations."
            actionButtonTitle="Explore all scenarios"
            footerLabel="Don’t see what you’re looking for?"
            footerLinkTitle="Build your own scenario"
            importantRolesTitleAfterFooter="Become a Fluent Speaker"
          />
          <GeneralFaqBlock
            items={[
              {
                question: "What is Dark Lang?",
                answer: (
                  <Typography>
                    Dark Lang is an AI-powered platform where you can practice natural conversations
                    in multiple languages—like English, Spanish, or French—with a patient and
                    knowledgeable virtual tutor named Bruno.
                  </Typography>
                ),
              },
              {
                question: "How does usage-based pricing work?",
                answer: (
                  <Typography>
                    You start with a free balance. Each conversation (text or voice) uses tokens,
                    which deduct from your balance in real time. You can top up credits whenever you
                    need more.
                  </Typography>
                ),
              },
              {
                question: "Is there a free trial?",
                answer: (
                  <Typography>
                    Yes! We offer a small free balance so you can explore the platform and see if
                    it’s right for you before purchasing more credits.
                  </Typography>
                ),
              },
              {
                question: "Can I practice languages other than English?",
                answer: (
                  <Stack
                    sx={{
                      gap: "20px",
                    }}
                  >
                    <Typography>
                      Absolutely. Bruno supports multiple languages, adapting to your choice and
                      level.
                    </Typography>
                    <Stack
                      sx={{
                        gap: "0px",
                      }}
                    >
                      <Typography
                        sx={{
                          fontSize: "1rem",
                          fontWeight: 600,
                          paddingBottom: "5px",
                        }}
                      >
                        Available languages:
                      </Typography>
                      <Typography variant="body2" component={"p"}>
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
                        <strong>Casual Conversation:</strong> Practice fluency without constant
                        corrections.
                      </li>
                      <li>
                        <strong>Talk & Correct:</strong> Receive detailed grammar and vocabulary
                        corrections.
                      </li>
                      <li>
                        <strong>Beginner:</strong> Slower, simpler conversations with extra
                        guidance.
                      </li>
                    </ul>
                  </Typography>
                ),
              },
              {
                question: "How do daily tasks help me improve?",
                answer: (
                  <Typography>
                    Daily tasks provide new vocabulary and grammar rules, which are reinforced
                    during your next conversation. This consistent practice accelerates your
                    language growth.
                  </Typography>
                ),
              },
            ]}
          />
          <CtaBlock />
        </Stack>
      </main>
      <Footer />
    </>
  );
}
