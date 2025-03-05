import { TalkingWaves } from "@/features/uiKit/Animations/TalkingWaves";
import { Stack } from "@mui/material";
import { Header } from "../../Header/Header";

import { Footer } from "../Footer";

import { CtaBlock } from "../ctaBlock";
import { RolePlayDemo } from "./RolePlayDemo";

export default function ScenariosPage() {
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
          <Stack
            sx={{
              paddingTop: "150px",
            }}
          />
          <RolePlayDemo />

          <CtaBlock />
        </Stack>
      </main>
      <Footer />
    </>
  );
}
