import { Box, IconButton, Stack, Typography } from "@mui/material";
import { DashboardCard } from "../uiKit/Card/DashboardCard";
import { ArrowLeft, Flag, Trash } from "lucide-react";
import { useAiConversation } from "../Conversation/useAiConversation";
import { useLingui } from "@lingui/react";
import { useWords } from "../Words/useWords";
import { useRules } from "../Rules/useRules";
import { useSettings } from "../Settings/useSettings";
import { useAiUserInfo } from "../Ai/useAiUserInfo";
import { useAuth } from "../Auth/useAuth";
import { usePlan } from "../Plan/usePlan";
import { PlanElement, PlanElementMode } from "../Plan/types";
import { PlanCard } from "../Plan/PlanCard";

import { GoalCard } from "./GoalCard";
import { cardColors, modeCardProps } from "../Plan/data";

export const PlanDashboardCards = () => {
  const aiConversation = useAiConversation();
  const words = useWords();
  const rules = useRules();
  const auth = useAuth();
  const { i18n } = useLingui();
  const settings = useSettings();
  const userInfo = useAiUserInfo();
  const plan = usePlan();

  const startOnboarding = () => {
    aiConversation.startConversation({ mode: "goal" });
  };

  const startGoalElement = async (element: PlanElement) => {
    if (!plan.latestGoal) {
      return;
    }

    const goalInfo = {
      goalElement: element,
      goalPlan: plan.latestGoal,
    };

    if (element.mode === "words") {
      words.getNewWordsToLearn(goalInfo);
      return;
    }

    if (element.mode === "rule") {
      rules.getRules(goalInfo);
      return;
    }

    aiConversation.startConversation({
      mode: element.mode === "play" ? "goal-role-play" : "goal-talk",
      goal: goalInfo,
    });
  };

  const isGoalSet = !!plan.latestGoal?.elements?.length;

  const deletePlans = async () => {
    const confirmResult = confirm(
      i18n._(`Are you sure you want to delete your goal? This action cannot be undone.`)
    );
    if (!confirmResult) {
      return;
    }

    plan.deleteGoals();
  };

  const planElementProgresses = plan.latestGoal?.elements.map((element) => {
    const progressPercent = Math.min((element.startCount || 0) * 10, 100);
    return progressPercent;
  });

  const averageProgress =
    (planElementProgresses?.reduce((acc, progress) => acc + progress, 0) || 0) /
    (planElementProgresses?.length || 1);

  const modeLabels: Record<PlanElementMode, string> = {
    conversation: i18n._(`Conversation`),
    play: i18n._(`Role Play`),
    words: i18n._(`Words`),
    rule: i18n._(`Rule`),
  };
  return (
    <DashboardCard>
      <Stack
        sx={{
          display: "grid",
          alignItems: "center",
          gridTemplateColumns: "max-content 1fr",
          gap: "15px",
          paddingBottom: "10px",
        }}
      >
        <Stack
          sx={{
            borderRadius: "50%",
            background: "linear-gradient(45deg,rgb(120, 13, 220) 0%,rgb(199, 13, 236) 100%)",
            height: "50px",
            width: "50px",

            display: "flex",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <Flag size={"25px"} />
        </Stack>
        <Stack
          sx={{
            flexDirection: "row",
            gap: "5px",
            alignItems: "center",
            justifyContent: "space-between",
            width: "100%",
          }}
        >
          <Stack
            sx={{
              flexDirection: "row",
              gap: "10px",
              alignItems: "center",
            }}
          >
            <Typography variant="h6">
              {isGoalSet
                ? plan.latestGoal?.title || i18n._(`Goal`)
                : i18n._(`Start your way to fluency`)}
            </Typography>
            {isGoalSet && (
              <Typography
                variant="body2"
                sx={{
                  padding: "3px 10px",
                  borderRadius: "20px",
                  color: isGoalSet ? "#fff" : "#000",
                  backgroundColor: isGoalSet ? "#4F46E5" : "#ccc",
                }}
              >
                {Math.round(averageProgress)}%
              </Typography>
            )}
          </Stack>
          <Box>
            {isGoalSet && userInfo.userInfo?.records.length && (
              <IconButton onClick={deletePlans} disabled={plan.isCraftingGoal}>
                <Trash size={"18px"} />
              </IconButton>
            )}
          </Box>
        </Stack>
      </Stack>
      <Stack
        sx={{
          gap: "20px",
          width: "100%",
          display: "grid",
          gridTemplateColumns: "1fr 1fr 1fr",
          "@media (max-width: 1100px)": {
            gridTemplateColumns: "1fr 1fr",
          },

          "@media (max-width: 750px)": {
            gridTemplateColumns: "1fr",
            gap: "20px",
          },
        }}
      >
        {isGoalSet && plan.latestGoal ? (
          <>
            {plan.latestGoal?.elements.map((planElement, index) => {
              const cardInfo = modeCardProps[planElement.mode];
              const colorIndex = index % cardColors.length;
              const cardColor = cardColors[colorIndex];
              const elementsWithSameMode =
                plan.latestGoal?.elements.filter((element) => element.mode === planElement.mode) ||
                [];
              const currentElementIndex = elementsWithSameMode.findIndex(
                (element) => element.id === planElement.id
              );

              const imageVariants = cardInfo.imgUrl;
              const imageIndex = currentElementIndex % imageVariants.length;
              const imageUrl = imageVariants[imageIndex];

              return (
                <PlanCard
                  key={planElement.id}
                  delayToShow={index * 80}
                  title={index + 1 + ". " + planElement.title}
                  subTitle={modeLabels[planElement.mode]}
                  description={planElement.description}
                  onClick={() => startGoalElement(planElement)}
                  startColor={cardColor.startColor}
                  progressPercent={Math.min((planElement.startCount || 0) * 10, 100)}
                  endColor={cardColor.endColor}
                  bgColor={cardColor.bgColor}
                  icon={
                    <Stack>
                      <Stack className="avatar">
                        <img src={imageUrl} alt="" />
                      </Stack>
                    </Stack>
                  }
                  actionLabel={i18n._(`Start`)}
                />
              );
            })}
          </>
        ) : (
          <>
            <GoalCard startOnboarding={startOnboarding} />
            <Stack
              sx={{
                alignItems: "center",
                justifyContent: "flex-start",
                boxSizing: "border-box",
                width: "100%",
                height: "100%",
                flexDirection: "row",
                gap: "15px",
                "@media (max-width: 750px)": {
                  display: "none",
                },
              }}
            >
              <ArrowLeft />
              <Typography
                className="decor-text"
                sx={{
                  fontSize: "22px",
                  paddingTop: "5px",
                }}
              >
                {i18n._(`Set your goal and start learning!`)}
              </Typography>
            </Stack>
          </>
        )}
      </Stack>
    </DashboardCard>
  );
};
