import { Button, Stack, Typography } from "@mui/material";
import { TaskCard } from "./TaskCard";
import { useTasks } from "../Tasks/useTasks";
import { BookOpenText, GraduationCap, Mic } from "lucide-react";
import { useAiConversation } from "../Conversation/useAiConversation";
import { useWords } from "../Words/useWords";
import { useRules } from "../Rules/useRules";
import { DashboardCard } from "../uiKit/Card/DashboardCard";

export const TasksCard = () => {
  const words = useWords();
  const rules = useRules();
  const tasks = useTasks();
  const aiConversation = useAiConversation();
  return (
    <DashboardCard>
      <Stack>
        <Typography variant="h2" className="decor-title">
          Daily Tasks
        </Typography>
        <Typography
          variant="caption"
          sx={{
            opacity: 0.7,
          }}
        >
          Complete daily tasks to improve your language skills.
        </Typography>
      </Stack>
      <Stack
        sx={{
          flexDirection: "row",
          gap: "20px",
          "@media (max-width: 800px)": {
            flexDirection: "column",
            gap: "10px",
          },
        }}
      >
        <TaskCard
          isDone={!!tasks.todayStats?.lesson}
          title="Small conversation"
          subTitle="Start talking to learn something new."
          buttonIcon={<Mic size={"20px"} />}
          buttonText="Just a Talk"
          onStart={() => aiConversation.startConversation({ mode: "talk" })}
        />

        <TaskCard
          title="Rule of the day"
          subTitle="Get a personal grammar rule to learn."
          buttonIcon={<BookOpenText size={"20px"} />}
          buttonText="Get a rule"
          onStart={() => rules.getRules()}
          isDone={!!tasks.todayStats?.rule}
          lockedText={!words.totalWordsCount ? "Complete previous tasks first" : ""}
        />

        <TaskCard
          isDone={!!tasks.todayStats?.words}
          title="New words"
          subTitle="Practice new vocabulary with the AI."
          buttonIcon={<GraduationCap size={"20px"} />}
          buttonText="Get new words"
          lockedText={!words.totalWordsCount ? "Complete previous tasks first" : ""}
          onStart={() => words.getNewWordsToLearn()}
        />
      </Stack>
    </DashboardCard>
  );
};
