"use client";

import { useAiConversation } from "@/features/Conversation/useAiConversation";

import { Button, Stack, Typography } from "@mui/material";
import { useSettings } from "../Settings/useSettings";

import { TalkingWaves } from "../uiKit/Animations/TalkingWaves";
import { InfoBlockedSection } from "./InfoBlockedSection";
import { useWords } from "../Words/useWords";
import { WordsToLearn } from "./WordsToLearn";
import { SelectLanguage } from "./SelectLanguage";
import { useRules } from "../Rules/useRules";
import { RulesToLearn } from "./RulesToLearn";
import { TasksCard } from "./TasksCard";
import { ConversationSelectCard } from "./ConversationSelectCard";
import { ProgressBoard } from "./Progress/ProgressBoard";
import { HomeworkCard } from "./HomeworkCard";
import { RolePlayBoard } from "../RolePlay/RolePlayBoard";
import { useLingui } from "@lingui/react";
import { RolePlayScenariosInfo } from "../RolePlay/rolePlayData";
import { UsageStatsCards } from "../Usage/UsageStatsCards";
import { DashboardCard } from "../uiKit/Card/DashboardCard";

interface DashboardProps {
  rolePlayInfo: RolePlayScenariosInfo;
}
export function Dashboard({ rolePlayInfo }: DashboardProps) {
  const settings = useSettings();
  const aiConversation = useAiConversation();
  const words = useWords();
  const rules = useRules();
  const { i18n } = useLingui();

  if (aiConversation.isInitializing) {
    return <InfoBlockedSection title={i18n._(`Loading...`)} />;
  }

  if (words.isGeneratingWords) {
    return <InfoBlockedSection title={i18n._(`Crafting new words...`)} />;
  }

  if (rules.isGeneratingRule) {
    return <InfoBlockedSection title={i18n._(`Crafting new rule...`)} />;
  }

  if (words.wordsToLearn.length > 0) {
    return <WordsToLearn />;
  }

  if (rules.rule) {
    return <RulesToLearn />;
  }

  if (aiConversation.errorInitiating) {
    return (
      <InfoBlockedSection title="">
        <Typography color="error">{aiConversation.errorInitiating}</Typography>
        <Button variant="contained" onClick={() => window.location.reload()}>
          {i18n._(`Reload`)}
        </Button>
      </InfoBlockedSection>
    );
  }

  if (!settings.languageCode) {
    return <SelectLanguage />;
  }

  return (
    <Stack
      sx={{
        alignItems: "center",
        justifyContent: "center",
        paddingBottom: "70px",
      }}
    >
      <Stack
        sx={{
          width: "100%",
          maxWidth: "1400px",
          padding: "10px",
          paddingTop: "100px",
          boxSizing: "border-box",
          gap: "70px",
          "@media (max-width: 850px)": {
            paddingLeft: "0",
            paddingRight: "0",
          },
        }}
      >
        <ConversationSelectCard />

        <DashboardCard>
          <UsageStatsCards />
        </DashboardCard>

        <RolePlayBoard rolePlayInfo={rolePlayInfo} />

        <Stack
          sx={{
            gap: "40px",
            display: "grid",
            gridTemplateColumns: "1fr",
            boxSizing: "border-box",
          }}
        >
          <TasksCard />
        </Stack>

        <Stack
          sx={{
            gap: "20px",
            display: "grid",
            gridTemplateColumns: "1fr",
            boxSizing: "border-box",
          }}
        >
          <ProgressBoard />
        </Stack>
      </Stack>

      <Stack
        sx={{
          position: "absolute",
          bottom: "0",
          right: "0",
          padding: "20px",
          zIndex: -9999,
          opacity: 0.3,
        }}
      >
        <TalkingWaves />
      </Stack>

      <Stack
        sx={{
          position: "absolute",
          top: "0px",
          right: "0",
          backgroundColor: "blue",
          height: "300px",
          width: "300px",
          borderRadius: "50%",
          filter: "blur(200px)",
          zIndex: 0,
          opacity: 0.9,
        }}
      ></Stack>

      <Stack
        sx={{
          position: "absolute",
          top: "300px",
          right: "0",
          backgroundColor: "red",
          height: "300px",
          width: "300px",
          borderRadius: "50%",
          filter: "blur(200px)",
          zIndex: 0,
          opacity: 0.4,
        }}
      ></Stack>

      <Stack
        sx={{
          position: "absolute",
          top: "0px",
          left: "300px",
          backgroundColor: "cyan",
          height: "200px",
          width: "300px",
          borderRadius: "50%",
          filter: "blur(200px)",
          zIndex: 0,
          opacity: 0.61,
          "@media (max-width: 600px)": {
            left: "0px",
          },
        }}
      ></Stack>

      <Stack
        sx={{
          position: "absolute",
          top: "900px",
          left: "0",
          backgroundColor: "#5533ff",
          height: "300px",
          width: "300px",
          borderRadius: "50%",
          filter: "blur(300px)",
          zIndex: 0,
          opacity: 0.4,
        }}
      ></Stack>
    </Stack>
  );
}
