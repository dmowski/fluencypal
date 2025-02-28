import { TalkingWaves } from "@/features/uiKit/Animations/TalkingWaves";
import { Stack, Typography } from "@mui/material";
import { Header } from "../Header/Header";
import Galaxy from "../uiKit/Animations/Galaxy";
import { StarContainer } from "../Layout/StarContainer";
import { FirsCards } from "./FirsCards";
import { Footer } from "./Footer";
import { Price } from "./Price";
import { SupportedLanguages } from "./SupportedLanguages";
import { FirstEnterButton } from "./FirstEnterButton";
import { WelcomeScreen } from "./WelcomeScreen";
import { IntroVideoDemo } from "./IntroVideoDemo";
import { Faq } from "./faq";
import { CtaBlock } from "./ctaBlock";
import { ProposalCards } from "./ProposalCards";
import { ProductDemo } from "./ProductDemo";

export default function LandingPage() {
  return (
    <>
      <Header />
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
          <Faq />
          <CtaBlock />
        </Stack>
      </main>
      <Footer />
    </>
  );
}
