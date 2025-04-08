import { Button, Stack, Typography } from "@mui/material";
import { DashboardCard } from "../uiKit/Card/DashboardCard";
import { Flag, GraduationCap, MapPinned } from "lucide-react";
import { useAiConversation } from "../Conversation/useAiConversation";
import { useLingui } from "@lingui/react";
import { useWords } from "../Words/useWords";
import { useRules } from "../Rules/useRules";
import { useSettings } from "../Settings/useSettings";
import { LanguageSwitcher } from "../Lang/LanguageSwitcher";
import { useState } from "react";
import { useAiUserInfo } from "../Ai/useAiUserInfo";
import { CustomModal } from "../uiKit/Modal/CustomModal";
import { ConversationCard } from "./ConversationCard";
import { useAuth } from "../Auth/useAuth";
import { usePlan } from "../Plan/usePlan";
import { GoalPlan, PlanElement } from "../Plan/types";

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

  const goalCard = (
    <ConversationCard
      title={i18n._(`Set Goal`)}
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
          }}
        >
          <Typography variant="h6">
            {isGoalSet ? plan.latestGoal?.title || "Goal" : i18n._(`Your Goal | Need to set`)}
          </Typography>
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
            {plan.latestGoal?.elements.map((planElement) => {
              <ConversationCard
                key={planElement.id}
                title={planElement.title}
                subTitle={planElement.subTitle}
                onClick={() => startGoalElement(planElement)}
                startColor="#34D399"
                endColor="#3B82F6"
                bgColor="#A3E635"
                icon={
                  <Stack>
                    <Stack
                      style={{ width: "var(--icon-size)", height: "var(--icon-size)" }}
                      className="avatar"
                    >
                      <img src="/avatar/girl.webp" alt="AI Bot" />
                    </Stack>
                  </Stack>
                }
                actionLabel={i18n._(`Start`)}
              />;
            })}
          </>
        ) : (
          goalCard
        )}
      </Stack>
    </DashboardCard>
  );
};
