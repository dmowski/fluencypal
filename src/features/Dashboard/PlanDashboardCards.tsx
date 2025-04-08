import { Box, IconButton, Stack, Typography } from "@mui/material";
import { DashboardCard } from "../uiKit/Card/DashboardCard";
import { CirclePlus, Flag, Trash } from "lucide-react";
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

  const goalCard = (
    <ConversationCard
      title={i18n._(`Goal`)}
      subTitle={i18n._(`Set the goal of your learning`)}
      onClick={() => startOnboarding()}
      startColor="#4F46E5"
      endColor="#A78BFA"
      bgColor="#60A5FA"
      icon={
        <Stack>
          <Stack
            style={{ width: "var(--icon-size)", height: "var(--icon-size)" }}
            className="avatar"
          >
            <img src="/avatar/map.webp" alt="AI Bot" />
          </Stack>
        </Stack>
      }
      actionLabel={i18n._(`Start | 5 min`)}
    />
  );

  const startGoalElement = async (element: PlanElement) => {};

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
    plan.deleteGoals();
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
            background: isGoalSet
              ? "linear-gradient(45deg,rgb(120, 13, 220) 0%,rgb(199, 13, 236) 100%)"
              : "linear-gradient(45deg,rgb(152, 156, 152) 0%,rgb(158, 142, 140) 100%)",
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
                ? i18n._(`Your Goal`) + ": " + plan.latestGoal?.title || "Goal"
                : i18n._(`Your Goal | Need to set`)}
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
                10%
              </Typography>
            )}
          </Stack>
          <Box>
            <IconButton onClick={createTestPlan} disabled={plan.isCraftingGoal}>
              <CirclePlus />
            </IconButton>
            {isGoalSet && (
              <IconButton onClick={deletePlans} disabled={plan.isCraftingGoal}>
                <Trash />
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
            gap: "10px",
          },
        }}
      >
        {isGoalSet && plan.latestGoal ? (
          <>
            {plan.latestGoal?.elements.map((planElement, index) => {
              const cardInfo = modeCardProps[planElement.mode];
              return (
                <PlanCard
                  key={planElement.id}
                  title={index + 1 + ". " + planElement.title}
                  subTitle={planElement.mode}
                  description={planElement.description}
                  onClick={() => startGoalElement(planElement)}
                  startColor={cardInfo.startColor}
                  progress={0}
                  endColor={cardInfo.endColor}
                  bgColor={cardInfo.bgColor}
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
          goalCard
        )}
      </Stack>
    </DashboardCard>
  );
};
