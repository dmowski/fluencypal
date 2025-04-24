import { Box, IconButton, Stack, Typography } from "@mui/material";
import { DashboardCard } from "../uiKit/Card/DashboardCard";
import { Flag, Trash } from "lucide-react";
import { useAiConversation } from "../Conversation/useAiConversation";
import { useLingui } from "@lingui/react";
import { useWords } from "../Words/useWords";
import { useRules } from "../Rules/useRules";
import { useAiUserInfo } from "../Ai/useAiUserInfo";
import { usePlan } from "../Plan/usePlan";
import { PlanElement, PlanElementMode } from "../Plan/types";
import { PlanCard } from "../Plan/PlanCard";

import { cardColors, modeCardProps } from "../Plan/data";
import { GoalQuestions } from "../Goal/GoalQuestions";
import { SupportedLanguage } from "@/features/Lang/lang";
import { useLangClientLabels } from "../Lang/getLabelsClient";
import { useSettings } from "../Settings/useSettings";
import { useMemo } from "react";

export const PlanDashboardCards = ({ lang }: { lang: SupportedLanguage }) => {
  const aiConversation = useAiConversation();
  const words = useWords();
  const rules = useRules();
  const { i18n } = useLingui();
  const settings = useSettings();
  const userInfo = useAiUserInfo();
  const plan = usePlan();
  const langLabels = useLangClientLabels();

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

  const goalDescription = plan.latestGoal?.goalQuiz?.description || "";

  const sortedElements = useMemo(() => {
    const elements = plan.latestGoal?.elements || [];
    const conversationElement = elements.find((el) => el.mode === "conversation");
    if (!conversationElement) {
      return elements;
    }

    const otherElements = elements.filter((el) => el !== conversationElement);
    return [conversationElement, ...otherElements];
  }, [plan.latestGoal?.elements]);

  return (
    <DashboardCard>
      <Stack
        sx={{
          display: "grid",
          alignItems: "center",
          gridTemplateColumns: "1fr",
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
              flexDirection: "column",
              alignItems: "flex-start",
            }}
          >
            <Typography variant="h6">
              {isGoalSet
                ? plan.latestGoal?.title || i18n._(`Goal`)
                : i18n._(`Start your way to fluency`)}
            </Typography>
            {goalDescription && (
              <Typography
                sx={{
                  opacity: 0.8,
                  maxWidth: "650px",
                }}
                variant="caption"
              >
                {goalDescription}
              </Typography>
            )}
          </Stack>
        </Stack>
      </Stack>
      {isGoalSet && plan.latestGoal ? (
        <Stack
          sx={{
            gap: "20px",
            width: "100%",
            display: "grid",
            gridTemplateColumns: "1fr",
          }}
        >
          <>
            {sortedElements.map((planElement, index, all) => {
              const cardInfo = modeCardProps[planElement.mode];
              const colorIndex = index % cardColors.length;
              const cardColor = cardColors[colorIndex];
              const elementsWithSameMode =
                sortedElements.filter((element) => element.mode === planElement.mode) || [];
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
                  title={planElement.title}
                  subTitle={modeLabels[planElement.mode]}
                  description={planElement.description}
                  details={planElement.details}
                  isDone={planElement.startCount > 0}
                  isActive={index == 0}
                  onClick={() => startGoalElement(planElement)}
                  startColor={cardColor.startColor}
                  progressPercent={Math.min((planElement.startCount || 0) * 10, 100)}
                  endColor={cardColor.endColor}
                  bgColor={cardColor.bgColor}
                  isLast={index === all.length - 1}
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
        </Stack>
      ) : (
        <Stack
          sx={{
            padding: "20px",
            backgroundColor: "rgba(255, 255, 255, 0.9)",
            borderRadius: "10px",
            color: "#000",
          }}
        >
          <GoalQuestions
            lang={lang}
            defaultLang={settings.languageCode || "en"}
            showTerms={false}
            titleComponent="h5"
            langLearnPlanLabels={langLabels.labelLearningPlan}
          />
        </Stack>
      )}
    </DashboardCard>
  );
};
