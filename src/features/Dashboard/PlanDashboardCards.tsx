import { Box, Button, IconButton, Stack, Typography } from "@mui/material";
import { DashboardCard } from "../uiKit/Card/DashboardCard";
import { Flag, Sparkle, Trash } from "lucide-react";
import { useAiConversation } from "../Conversation/useAiConversation";
import { useLingui } from "@lingui/react";
import { useWords } from "../Words/useWords";
import { useRules } from "../Rules/useRules";
import { useAiUserInfo } from "../Ai/useAiUserInfo";
import { usePlan } from "../Plan/usePlan";
import { GoalPlan, PlanElement, PlanElementMode } from "../Plan/types";
import { PlanCard } from "../Plan/PlanCard";

import { cardColors, modeCardProps } from "../Plan/data";
import { GoalQuestions } from "../Goal/GoalQuestions";
import { SupportedLanguage } from "@/features/Lang/lang";
import { useLangClientLabels } from "../Lang/getLabelsClient";
import { useSettings } from "../Settings/useSettings";
import { useMemo, useState } from "react";
import { CustomModal } from "../uiKit/Modal/CustomModal";

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
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
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

  let activeIndex: null | number = null;

  sortedElements.forEach((element, index) => {
    if (element.startCount == 0 && activeIndex === null) {
      activeIndex = index;
    }
  });
  const [isShowMoreModal, setIsShowMoreModal] = useState(false);

  const doneLessonsCount = sortedElements.reduce((acc, element) => {
    if (element.startCount > 0) {
      return acc + 1;
    }
    return acc;
  }, 0);

  const [isLearningPlanUpdating, setIsLearningPlanUpdating] = useState(false);

  const generateMoreLessons = async () => {
    if (!plan.latestGoal) {
      return;
    }

    try {
      setIsLearningPlanUpdating(true);

      const goalPlanElements = plan.latestGoal?.elements || [];
      const goalPlanElementsString = goalPlanElements
        .map((element) => {
          return `${element.mode} - ${element.title}: ${element.description}`;
        })
        .join(", ");

      const newGoal = await plan.generateGoal({
        userInfo: userInfo.userInfo?.records || [],
        conversationMessages: [
          {
            isBot: true,
            id: "1",
            text: "What you learned already?",
          },
          {
            isBot: false,
            id: "2",
            text:
              "I learned following lessons and I want something new, but related to my goal. My learned lessons are: " +
              goalPlanElementsString,
          },
        ],
        languageCode: lang,
        goalQuiz: plan.latestGoal?.goalQuiz || undefined,
      });

      // filter new elements to copy only new elements
      const newElements = newGoal.elements.filter((newElement) => {
        return !goalPlanElements.some((oldElement) => oldElement.title === newElement.title);
      });

      const updatedPlan: GoalPlan = { ...plan.latestGoal };
      updatedPlan.elements = [...goalPlanElements, ...newElements];
      await plan.addGoalPlan(updatedPlan);

      setIsLearningPlanUpdating(false);
      setIsShowMoreModal(false);
    } catch (error) {
      alert(i18n._(`Something went wrong while generating more lessons. Please try again later.`));
      setIsLearningPlanUpdating(false);

      throw error;
    }
  };

  const minimumLessonsCountToExpand = 3;
  const isAbleToExpand = doneLessonsCount >= minimumLessonsCountToExpand;

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
            const isDone = planElement.startCount > 0;
            const isActive = index === activeIndex;

            return (
              <PlanCard
                key={planElement.id}
                delayToShow={index * 80}
                title={planElement.title}
                subTitle={modeLabels[planElement.mode]}
                description={planElement.description}
                details={planElement.details}
                isDone={isDone}
                isActive={isActive}
                isContinueLabel={isActive && index > 0}
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
          <Stack
            sx={{
              alignItems: "center",
              maxWidth: "700px",
              paddingTop: "10px",
            }}
          >
            <Button
              startIcon={<Sparkle size={"14px"} />}
              variant="outlined"
              onClick={() => setIsShowMoreModal(true)}
            >
              More uniq lessons
            </Button>
          </Stack>
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

      {isShowMoreModal && (
        <CustomModal
          isOpen={true}
          onClose={() => setIsShowMoreModal(false)}
          padding="40px 20px"
          width="min(500px, 100vw)"
        >
          <Stack
            sx={{
              gap: "10px",
              alignItems: "center",
              width: "100%",
            }}
          >
            <Stack>
              <Typography
                align="center"
                variant="caption"
                sx={{
                  color: `rgba(255, 255, 255, 0.5)`,
                }}
              >
                {i18n._(`More unique lessons`)}
              </Typography>

              <Typography variant="h4" align="center" component="h2" className="decor-text">
                {plan.latestGoal?.title || i18n._(`Goal`)}
              </Typography>
              <Typography sx={{ paddingTop: "20px" }} align="center" variant="caption">
                {plan.latestGoal?.goalQuiz?.description ||
                  i18n._(`We will help you to learn the language you need`)}
              </Typography>
            </Stack>

            <Stack
              sx={{
                gap: "2px",
              }}
            >
              <Button
                sx={{
                  width: "100%",
                  marginTop: "20px",
                  padding: "10px 20px",
                }}
                onClick={() => {
                  deletePlans();
                  setIsShowMoreModal(false);
                }}
                variant="text"
                color="error"
                size="large"
                disabled={isLearningPlanUpdating}
              >
                {i18n._(`Delete current goal`)}
              </Button>

              <Button
                sx={{
                  width: "100%",
                  marginTop: "10px",
                  padding: "10px 20px",
                }}
                onClick={generateMoreLessons}
                disabled={!isAbleToExpand || isLearningPlanUpdating}
                variant="contained"
                color="info"
                size="large"
              >
                {isLearningPlanUpdating
                  ? i18n._(`Generating...`)
                  : i18n._(`Generate more unique lessons`)}
              </Button>
              {!isAbleToExpand && (
                <Typography
                  align="center"
                  variant="caption"
                  sx={{
                    opacity: 0.7,
                  }}
                >
                  {i18n._(
                    `In order to generate more lessons, you need to complete at least 3 lessons`
                  )}
                </Typography>
              )}
            </Stack>
          </Stack>
        </CustomModal>
      )}
    </DashboardCard>
  );
};
