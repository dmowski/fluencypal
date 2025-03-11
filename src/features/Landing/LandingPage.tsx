import { TalkingWaves } from "@/features/uiKit/Animations/TalkingWaves";
import { Stack } from "@mui/material";
import { Header } from "../Header/Header";
import { Footer } from "./Footer";
import { WelcomeScreen } from "./WelcomeScreen";
import { IntroVideoDemo } from "./IntroVideoDemo";
import { GeneralFaqBlock } from "./FAQ/GeneralFaqBlock";
import { CtaBlock } from "./ctaBlock";
import { ProposalCards } from "./ProposalCards";
import { ProductDemo } from "./ProductDemo";
import { RolePlayDemo } from "./RolePlay/RolePlayDemo";

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
          <RolePlayDemo />
          <GeneralFaqBlock />
          <CtaBlock />
        </Stack>
      </main>
      <Footer />
    </>
  );
}
