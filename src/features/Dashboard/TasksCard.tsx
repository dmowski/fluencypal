import { Stack, Typography } from "@mui/material";
import { ClickCard } from "./ClickCard";
import { useTasks } from "../Tasks/useTasks";
import { BookOpenText, CircleCheckBig, GraduationCap, Mic } from "lucide-react";
import { useWords } from "../Words/useWords";
import { useRules } from "../Rules/useRules";
import { DashboardCard } from "../uiKit/Card/DashboardCard";
import { useLingui } from "@lingui/react";

export const TasksCard = () => {
  const words = useWords();
  const rules = useRules();
  const tasks = useTasks();
  const { i18n } = useLingui();
  return (
    <DashboardCard>
      <Stack
        sx={{
          flexDirection: "row",
          alignItems: "center",
          gap: "15px",
          paddingBottom: "10px",
        }}
      >
        <Stack
          sx={{
            borderRadius: "50%",
            background: "linear-gradient(45deg,rgb(230, 69, 163) 0%,rgb(209, 109, 109) 100%)",
            height: "50px",
            width: "50px",

            display: "flex",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <CircleCheckBig size={"25px"} />
        </Stack>
        <Typography variant="h6">{i18n._(`Daily Tasks`)}</Typography>
      </Stack>

      <Stack
        sx={{
          gap: "20px",
          width: "100%",
          display: "grid",
          gridTemplateColumns: "1fr 1fr 1fr",
        }}
      >
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
