import { Button, IconButton, Stack, Typography } from "@mui/material";
import { DashboardCard } from "../uiKit/Card/DashboardCard";
import { Flag, LandPlot, Sparkle, Trash } from "lucide-react";
import { useAiConversation } from "../Conversation/useAiConversation";
import { useLingui } from "@lingui/react";
import { useWords } from "../Words/useWords";
import { useRules } from "../Rules/useRules";
import { useAiUserInfo } from "../Ai/useAiUserInfo";
import { usePlan } from "../Plan/usePlan";
import { GoalPlan, PlanElement, PlanElementMode } from "../Plan/types";
import { PlanCard } from "../Plan/PlanCard";

import { cardColors, modeCardProps } from "../Plan/data";
import { SupportedLanguage } from "@/features/Lang/lang";
import { useMemo, useState } from "react";
import { CustomModal } from "../uiKit/Modal/CustomModal";
import { ConversationCard } from "./ConversationCard";
import { useChatHistory } from "../ConversationHistory/useChatHistory";
import { getUrlStart } from "../Lang/getUrlStart";
import { useUrlParam } from "../Url/useUrlParam";

type StartModes = "words" | "rules" | "conversation";

export const PlanDashboardCards = ({ lang }: { lang: SupportedLanguage }) => {
  const aiConversation = useAiConversation();
  const words = useWords();
  const rules = useRules();
  const { i18n } = useLingui();
  const userInfo = useAiUserInfo();
  const plan = usePlan();
  const history = useChatHistory();
  const conversationsCount = history.conversations.length;

  const isReadyToFirstStart =
    !history.loading &&
    conversationsCount === 0 &&
    !aiConversation.isStarted &&
    !aiConversation.isInitializing &&
    !!plan.latestGoal;

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
    console.log("Starting goal element:", element);
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
  const [isShowMoreModal, setIsShowMoreModal] = useUrlParam("showMoreModal");

  const doneLessonsCount = sortedElements.reduce((acc, element) => {
    if (element.startCount > 0) {
      return acc + 1;
    }
    return acc;
  }, 0);

  const [isLearningPlanUpdating, setIsLearningPlanUpdating] = useState(false);
  const [selectedStartMode, setSelectedStartMode] = useState<StartModes | null>(null);

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
  const selectedElement =
    sortedElements.find((element) => element.mode === selectedStartMode) || sortedElements[0];

  if (isReadyToFirstStart) {
    const modes: StartModes[] = ["words", "rules", "conversation"];

    const level = plan.latestGoal?.goalQuiz?.level || "XXX";
    const recommendedModesMap: Record<string, StartModes> = {
      A1: "words",
      A2: "rules",
      B1: "rules",
      B2: "conversation",
      c1: "conversation",
    };

    const recommendedMode: StartModes = recommendedModesMap[level] || "conversation";
    const sortedModes = modes.sort((a, b) => {
      if (a === recommendedMode) return -1; // Recommended mode first
      if (b === recommendedMode) return 1; // Recommended mode first
      return 0; // Keep original order for others
    });
    const cardInfo = modeCardProps[selectedElement.mode];
    const imageVariants = cardInfo.imgUrl;
    const imageIndex = 1 % imageVariants.length;
    const imageUrl = imageVariants[imageIndex];
    return (
      <Stack
        sx={{
          alignItems: "center",
          justifyContent: "center",
          paddingTop: "20px",
          paddingBottom: "40px",
          zIndex: 999,
          gap: "40px",
        }}
      >
        <Typography align="center" variant="h6">
          {i18n._(`Now let’s determine your starting point!`)}
        </Typography>

        <Stack
          sx={{
            width: "100%",
            boxSizing: "border-box",
            gap: "20px",
            maxWidth: "500px",
            padding: "10px",
            paddingBottom: "40px",
          }}
        >
          {sortedModes.map((mode) => {
            const isRecommended = mode === recommendedMode;
            return (
              <Stack key={mode} sx={{}}>
                {mode === "conversation" && (
                  <ConversationCard
                    title={i18n._(`Conversation`)}
                    subTitle={i18n._(`Start your journey with a conversation!`)}
                    onClick={() => setSelectedStartMode(mode)}
                    startColor="#34D399"
                    endColor="#3B82F6"
                    bgColor="#A3E635"
                    disabledLabel={i18n._(`Set the goal to start`)}
                    icon={
                      <Stack>
                        <Stack
                          style={{ width: "var(--icon-size)", height: "var(--icon-size)" }}
                          className="avatar"
                        >
                          <img
                            src="/avatar/girl.webp"
                            alt="AI Bot"
                            style={{
                              height: "110px",
                              width: "110px",
                            }}
                          />
                        </Stack>
                      </Stack>
                    }
                    actionLabel={isRecommended ? i18n._(`Recommended`) : ""}
                  />
                )}

                {mode === "rules" && (
                  <ConversationCard
                    title={i18n._(`Rules`)}
                    subTitle={i18n._(`Learn the rules of the language!`)}
                    onClick={() => setSelectedStartMode(mode)}
                    startColor="#9d43a3"
                    endColor="#086787"
                    bgColor="#990000"
                    disabledLabel={i18n._(`Set the goal to start`)}
                    icon={
                      <Stack>
                        <Stack
                          style={{ width: "var(--icon-size)", height: "var(--icon-size)" }}
                          className="avatar"
                        >
                          <img
                            src="/avatar/book.webp"
                            alt="AI Bot"
                            style={{
                              height: "110px",
                              width: "110px",
                            }}
                          />
                        </Stack>
                      </Stack>
                    }
                    actionLabel={isRecommended ? i18n._(`Recommended`) : ""}
                  />
                )}

                {mode === "words" && (
                  <ConversationCard
                    title={i18n._(`Words`)}
                    subTitle={i18n._(`Learn new words and expand your vocabulary!`)}
                    onClick={() => setSelectedStartMode(mode)}
                    startColor="#00BFFF"
                    endColor="#086787"
                    bgColor="#5EEAD4"
                    disabledLabel={i18n._(`Set the goal to start`)}
                    icon={
                      <Stack>
                        <Stack
                          style={{ width: "var(--icon-size)", height: "var(--icon-size)" }}
                          className="avatar"
                        >
                          <img
                            src="/avatar/words.webp"
                            alt="AI Bot"
                            style={{
                              height: "110px",
                              width: "110px",
                            }}
                          />
                        </Stack>
                      </Stack>
                    }
                    actionLabel={isRecommended ? i18n._(`Recommended`) : ""}
                  />
                )}
              </Stack>
            );
          })}
        </Stack>

        {selectedStartMode && (
          <CustomModal onClose={() => setSelectedStartMode(null)} isOpen={true}>
            <Stack
              sx={{
                height: "100dvh",
                gap: "20px",
                alignItems: "center",
                justifyContent: "center",
                width: "100%",
              }}
            >
              <Typography className="decor-text" variant="h6" align="center">
                {i18n._(`There's something interesting for you...`)}
              </Typography>

              <Stack
                sx={{
                  border: "1px solid rgba(255, 255, 255, 0.5)",
                  backgroundColor: "rgba(255, 255, 255, 0.05)",
                  padding: "20px 20px",
                  borderRadius: "10px",
                  gap: "10px",
                  alignItems: "center",
                  minWidth: "360px",
                }}
              >
                <img src={imageUrl} alt="" style={{ width: "80px", height: "80px" }} />
                <Typography align="center" sx={{}} variant="h6">
                  {selectedElement.title}
                </Typography>
                <Typography align="center" sx={{}} variant="caption">
                  {selectedElement.description}
                </Typography>
              </Stack>
              <Button variant="contained" onClick={() => startGoalElement(selectedElement)}>
                {i18n._(`Let's start`)}
              </Button>
            </Stack>
          </CustomModal>
        )}
      </Stack>
    );
  }

  return (
    <DashboardCard>
      <Stack
        sx={{
          display: "grid",
          alignItems: "center",
          gridTemplateColumns: "1fr",
          gap: "5px",
          paddingTop: "40px",
        }}
      >
        <Stack
          sx={{
            flexDirection: "column",
            alignItems: "center",
            gap: "20px",
            flexWrap: "wrap",
          }}
        >
          <Stack
            sx={{
              borderRadius: "50%",
              background: "linear-gradient(45deg,rgb(120, 13, 220) 0%,rgb(199, 13, 236) 100%)",
              height: "60px",
              width: "60px",

              display: "flex",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <Flag size={"27px"} />
          </Stack>
          <Typography variant="h6">
            {isGoalSet
              ? plan.latestGoal?.title || i18n._(`Goal`)
              : i18n._(`Start your way to fluency`)}
          </Typography>
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
            {goalDescription && (
              <Typography
                align="center"
                sx={{
                  opacity: 0.8,
                }}
                variant="caption"
              >
                {goalDescription}{" "}
                <IconButton onClick={deletePlans}>
                  <Trash size={"14px"} />
                </IconButton>
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
                id={planElement.id}
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
              {i18n._(`More uniq lessons`)}
            </Button>
          </Stack>
        </Stack>
      ) : (
        <Stack sx={{}}>
          <Button
            startIcon={<LandPlot />}
            href={`${getUrlStart(lang)}quiz`}
            sx={{
              padding: "20px",
            }}
            variant="contained"
          >
            Create a plan
          </Button>
        </Stack>
      )}

      {isShowMoreModal && (
        <CustomModal isOpen={true} onClose={() => setIsShowMoreModal(false)}>
          <Stack
            sx={{
              gap: "10px",
              alignItems: "center",
              width: "100%",
              maxWidth: "600px",
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
