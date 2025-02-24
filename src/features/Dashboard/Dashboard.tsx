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
import { ProgressCard } from "./ProgressCard";
import { HomeworkCard } from "./HomeworkCard";

export function Dashboard() {
  const settings = useSettings();
  const aiConversation = useAiConversation();
  const words = useWords();
  const rules = useRules();

  if (aiConversation.isInitializing) {
    return <InfoBlockedSection title="Loading..." />;
  }

  if (words.isGeneratingWords) {
    return <InfoBlockedSection title="Crafting new words..." />;
  }

  if (rules.isGeneratingRule) {
    return <InfoBlockedSection title="Crafting new rule..." />;
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
          Reload
        </Button>
      </InfoBlockedSection>
    );
  }

  if (!settings.language) {
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
          gap: "40px",
        }}
      >
        <ConversationSelectCard />

        <Stack
          sx={{
            gap: "40px",
            display: "grid",
            gridTemplateColumns: "2fr 1fr",
            boxSizing: "border-box",
            "@media (max-width: 900px)": {
              gridTemplateColumns: "1fr",
            },
          }}
        >
          <TasksCard />
          <HomeworkCard />
        </Stack>

        <Stack
          sx={{
            gap: "20px",
            display: "grid",
            gridTemplateColumns: "1fr",
            boxSizing: "border-box",
          }}
        >
          <ProgressCard />
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
    </Stack>
  );
}
