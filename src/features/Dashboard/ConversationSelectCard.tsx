import { Stack, Typography } from "@mui/material";
import { DashboardCard } from "../uiKit/Card/DashboardCard";
import { GraduationCap } from "lucide-react";
import { useAiConversation } from "../Conversation/useAiConversation";
import { useLingui } from "@lingui/react";
import { useWords } from "../Words/useWords";
import { useRules } from "../Rules/useRules";
import { useState } from "react";
import { CustomModal } from "../uiKit/Modal/CustomModal";
import { Lock } from "lucide-react";
import { ConversationCard } from "./ConversationCard";
import { usePlan } from "../Plan/usePlan";
import { GoalQuestions } from "../Goal/GoalQuestions";
import { SupportedLanguage } from "@/features/Lang/lang";
import { useSettings } from "../Settings/useSettings";

export const ConversationSelectCard = ({ lang }: { lang: SupportedLanguage }) => {
  const aiConversation = useAiConversation();
  const words = useWords();
  const rules = useRules();
  const { i18n } = useLingui();
  const settings = useSettings();
  const plan = usePlan();
  const isGoalSet = !!plan.latestGoal?.elements?.length;

  const [isShowOnboardingConfirmation, setIsShowOnboardingConfirmation] = useState(false);

  if (!isGoalSet) {
    return <></>;
  }

  return (
    <DashboardCard>
      {isShowOnboardingConfirmation && (
        <CustomModal onClose={() => setIsShowOnboardingConfirmation(false)} isOpen={true}>
          <Stack
            sx={{
              padding: "20px",
              backgroundColor: "rgba(255, 255, 255, 0.9)",
              borderRadius: "10px",
              color: "#000",
              boxSizing: "border-box",
              maxWidth: "100dvw",
            }}
          >
            <GoalQuestions
              lang={lang}
              showTerms={false}
              titleComponent="h5"
              defaultLang={settings.languageCode || "en"}
            />
          </Stack>
        </CustomModal>
      )}

      <Stack
        sx={{
          flexDirection: "column",
          alignItems: "center",
          gap: "20px",
          flexWrap: "wrap",
          width: "100%",
          paddingTop: "40px",
        }}
      >
        <Stack
          sx={{
            borderRadius: "50%",
            background: isGoalSet
              ? "linear-gradient(45deg,rgb(25, 78, 142) 0%,rgb(109, 209, 151) 100%)"
              : "linear-gradient(45deg,rgb(152, 156, 152) 0%,rgb(158, 142, 140) 100%)",
            height: "60px",
            width: "60px",

            display: "flex",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          {isGoalSet ? <GraduationCap size={"27px"} /> : <Lock size={"27px"} />}
        </Stack>
        <Stack
          sx={{
            flexDirection: "row",
            gap: "5px",
            alignItems: "center",
          }}
        >
          <Typography variant="h6">{i18n._(`Practice`)}</Typography>
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
        <ConversationCard
          title={i18n._(`Conversation`)}
          subTitle={i18n._(`Talk to the AI and it will respond to you`)}
          onClick={() => aiConversation.startConversation({ mode: "talk" })}
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
                <img src="/avatar/girl.webp" alt="AI Bot" />
              </Stack>
            </Stack>
          }
          actionLabel={i18n._(`Start Talking`)}
        />

        <ConversationCard
          title={i18n._(`Beginner`)}
          subTitle={i18n._(`AI will lead you through the conversation`)}
          onClick={() => aiConversation.startConversation({ mode: "beginner" })}
          startColor="#FF6B6B"
          endColor="#FFD93D"
          bgColor="#5EEAD4"
          disabledLabel={i18n._(`Set the goal to start`)}
          icon={
            <Stack>
              <Stack
                style={{ width: "var(--icon-size)", height: "var(--icon-size)" }}
                className="avatar"
              >
                <img src="/avatar/owl1.webp" alt="AI Bot" />
              </Stack>
            </Stack>
          }
          actionLabel={i18n._(`Guide me`)}
        />

        <ConversationCard
          title={i18n._(`Rules`)}
          subTitle={i18n._(`Get a personal grammar rule to learn`)}
          onClick={() => rules.getRules()}
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
                <img src="/avatar/book.webp" alt="AI Bot" />
              </Stack>
            </Stack>
          }
          actionLabel={i18n._(`Get a rule`)}
        />

        <ConversationCard
          title={i18n._(`Words`)}
          subTitle={i18n._(`Practice new vocabulary with the AI`)}
          onClick={() => words.getNewWordsToLearn()}
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
                <img src="/avatar/words.webp" alt="AI Bot" />
              </Stack>
            </Stack>
          }
          actionLabel={i18n._(`Expand vocabulary`)}
        />
      </Stack>
    </DashboardCard>
  );
};
