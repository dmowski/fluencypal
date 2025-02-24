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
          Complete daily tasks to improve your English
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
        <TaskCard isDone={!!tasks.todayStats?.lesson}>
          <Stack>
            <Typography>Small conversation</Typography>
            <Typography
              variant="caption"
              sx={{
                opacity: 0.7,
              }}
            >
              Start talk to learn something new
            </Typography>
          </Stack>
          <Stack
            gap={"10px"}
            sx={{
              flexDirection: "row",
              flexWrap: "wrap",
            }}
          >
            <Button
              startIcon={<Mic size={"20px"} />}
              onClick={() => aiConversation.startConversation({ mode: "talk" })}
              variant="outlined"
            >
              Just a Talk
            </Button>
          </Stack>
        </TaskCard>

        <TaskCard isDone={!!tasks.todayStats?.rule}>
          <Stack>
            <Typography>Rule of the day</Typography>
            <Typography
              variant="caption"
              sx={{
                opacity: 0.7,
              }}
            >
              Get a personal rule to learn
            </Typography>
          </Stack>
          <Button
            startIcon={<BookOpenText size={"20px"} />}
            variant="outlined"
            onClick={() => rules.getRules()}
          >
            Get a rule
          </Button>
        </TaskCard>

        <TaskCard isDone={!!tasks.todayStats?.words}>
          <Stack>
            <Typography>New words</Typography>
            <Typography
              variant="caption"
              sx={{
                opacity: 0.7,
              }}
            >
              Practice new words with the AI
            </Typography>
          </Stack>
          <Button
            variant="outlined"
            startIcon={<GraduationCap size={"20px"} />}
            onClick={() => {
              words.getNewWordsToLearn();
            }}
          >
            Get new words
          </Button>
        </TaskCard>
      </Stack>
    </DashboardCard>
  );
};
