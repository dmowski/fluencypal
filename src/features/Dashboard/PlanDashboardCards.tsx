import { Box, Button, IconButton, Stack, Typography } from "@mui/material";
import { DashboardCard } from "../uiKit/Card/DashboardCard";
import { ArrowLeft, BadgeCheck, CirclePlus, Flag, Loader, Trash } from "lucide-react";
import { useAiConversation } from "../Conversation/useAiConversation";
import { useLingui } from "@lingui/react";
import { useWords } from "../Words/useWords";
import { useRules } from "../Rules/useRules";
import { useSettings } from "../Settings/useSettings";
import { useAiUserInfo } from "../Ai/useAiUserInfo";
import { ConversationCard } from "./ConversationCard";
import { useAuth } from "../Auth/useAuth";
import { usePlan } from "../Plan/usePlan";
import { PlanElement, PlanElementMode } from "../Plan/types";
import { useChatHistory } from "../ConversationHistory/useChatHistory";
import { PlanCard } from "../Plan/PlanCard";
import { useState } from "react";
import { CustomModal } from "../uiKit/Modal/CustomModal";
import { GoalCard } from "./GoalCard";

const modeCardProps: Record<
  PlanElementMode,
  { startColor: string; endColor: string; bgColor: string; imgUrl: string }
> = {
  conversation: {
    startColor: "#03a665",
    endColor: "#3B82F6",
    bgColor: "#A3E635",
    imgUrl: "/avatar/girl.webp",
  },
  play: {
    startColor: "#4F46E5",
    endColor: "#086787",
    bgColor: "#990000",
    imgUrl: "/avatar/talk3.webp",
  },
  words: {
    startColor: "#0276c4",
    endColor: "#086787",
    bgColor: "#5EEAD4",
    imgUrl: "/avatar/words.webp",
  },
  rule: {
    startColor: "#9d43a3",
    endColor: "#086787",
    bgColor: "#990000",
    imgUrl: "/avatar/book.webp",
  },
};

interface CardColor {
  startColor: string;
  endColor: string;
  bgColor: string;
}

const cardColors: CardColor[] = [
  {
    startColor: "#3CA6A6",
    endColor: "#4D9DE0",
    bgColor: "#419BBF",
  },
  {
    startColor: "#1e3c72",
    endColor: "#2a5298",
    bgColor: "#234b85",
  },
  {
    startColor: "#42275a",
    endColor: "#734b6d",
    bgColor: "#5e3f61",
  },
  {
    startColor: "#FF9A8B",
    endColor: "#203a43",
    bgColor: "#1a2f37",
  },
  {
    startColor: "#134e5e",
    endColor: "#71b280",
    bgColor: "#3d7868",
  },
  {
    startColor: "#485563",
    endColor: "#29323c",
    bgColor: "#3a434c",
  },
  {
    startColor: "#360033",
    endColor: "#0b8793",
    bgColor: "#276175",
  },
  {
    startColor: "#23074d",
    endColor: "#cc5333",
    bgColor: "#752f3e",
  },
  {
    startColor: "#232526",
    endColor: "#414345",
    bgColor: "#343637",
  },
  {
    startColor: "#283c86",
    endColor: "#45a247",
    bgColor: "#3a7b5e",
  },
];

export const PlanDashboardCards = () => {
  const aiConversation = useAiConversation();
  const words = useWords();
  const rules = useRules();
  const auth = useAuth();
  const { i18n } = useLingui();
  const settings = useSettings();
  const userInfo = useAiUserInfo();
  const plan = usePlan();
  const chatHistory = useChatHistory();

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

  const createTestPlan = async () => {
    const goalConversation = chatHistory.conversations
      .filter((conversation) => conversation.mode == "goal")
      .sort((a, b) => b.messages.length - a.messages.length)[0];

    const userInfoRecords = userInfo.userInfo?.records;

    if (!goalConversation || !userInfoRecords) {
      console.log({ userInfoRecords, goalConversation });
    } else {
      const generatedGoal = await plan.generateGoal({
        userInfo: userInfoRecords,
        conversationMessage: goalConversation.messages,
      });
      plan.addGoalPlan(generatedGoal);
    }
  };
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
              return (
                <PlanCard
                  key={planElement.id}
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
                        <img src={cardInfo.imgUrl} alt="" />
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
