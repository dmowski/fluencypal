import { Stack, Typography } from "@mui/material";
import { ClickCard } from "./ClickCard";
import { useTasks } from "../Tasks/useTasks";
import { BookOpenText, GraduationCap, Mic } from "lucide-react";
import { useAiConversation } from "../Conversation/useAiConversation";
import { useWords } from "../Words/useWords";
import { useRules } from "../Rules/useRules";
import { DashboardCard } from "../uiKit/Card/DashboardCard";
import { useLingui } from "@lingui/react";

export const TasksCard = () => {
  const words = useWords();
  const rules = useRules();
  const tasks = useTasks();
  const aiConversation = useAiConversation();
  const { i18n } = useLingui();
  return (
    <DashboardCard>
      <Stack>
        <Typography variant="h2" className="decor-title">
          {i18n._(`Daily Tasks`)}
        </Typography>
        <Typography
          variant="caption"
          sx={{
            opacity: 0.7,
          }}
        >
          {i18n._(`Complete daily tasks to improve your language skills`)}
        </Typography>
      </Stack>
      <Stack
        sx={{
          flexDirection: "row",
          gap: "15px",
          width: "100%",
          "@media (max-width: 800px)": {
            flexDirection: "column",
            gap: "10px",
          },
        }}
      >
        <ClickCard
          isDone={!!tasks.todayStats?.lesson}
          title={i18n._(`Small conversation`)}
          subTitle={i18n._(`Start talking to learn something new`)}
          buttonIcon={<Mic size={"30px"} />}
          onStart={() => aiConversation.startConversation({ mode: "talk" })}
        />

        <ClickCard
          title={i18n._(`Rule of the day`)}
          subTitle={i18n._(`Get a personal grammar rule to learn`)}
          buttonIcon={<BookOpenText size={"30px"} />}
          onStart={() => rules.getRules()}
          isDone={!!tasks.todayStats?.rule}
          lockedText={!words.totalWordsCount ? i18n._(`Complete previous tasks first`) : ""}
        />

        <ClickCard
          isDone={!!tasks.todayStats?.words}
          title={i18n._(`New words`)}
          subTitle={i18n._(`Practice new vocabulary with the AI`)}
          buttonIcon={<GraduationCap size={"30px"} />}
          lockedText={!words.totalWordsCount ? i18n._(`Complete previous tasks first`) : ""}
          onStart={() => words.getNewWordsToLearn()}
        />
      </Stack>
    </DashboardCard>
  );
};
