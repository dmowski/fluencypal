import { TalkingWaves } from "@/features/uiKit/Animations/TalkingWaves";
import { Stack } from "@mui/material";
import { Header } from "../../Header/Header";

import { Footer } from "../Footer";

import { CtaBlock } from "../ctaBlock";
import { ListRolePlayIntro } from "./ListRolePlayIntro";
import { ListRolePlay } from "./ListRolePlay";

interface ScenariosPageProps {
  selectedCategory?: string;
}

export const ScenariosPage = ({ selectedCategory }: ScenariosPageProps) => {
  return (
    <>
      <Header />
      <div
        style={{
          width: "100%",
          margin: 0,
        }}
      >
        <TalkingWaves />

        <Stack
          sx={{
            alignItems: "center",
            width: "100%",
          }}
          component={"main"}
        >
          <ListRolePlayIntro />
          <ListRolePlay selectedCategory={selectedCategory} />
        </Stack>
        <CtaBlock />
      </div>
      <Footer />
    </>
  );
};
