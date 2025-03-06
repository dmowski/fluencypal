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
          <WelcomeScreen />
          <IntroVideoDemo />
          <ProductDemo />

          <ProposalCards />
          <RolePlayDemo />
          <GeneralFaqBlock />
          <CtaBlock />
        </Stack>
      </main>
      <Footer />
    </>
  );
}
