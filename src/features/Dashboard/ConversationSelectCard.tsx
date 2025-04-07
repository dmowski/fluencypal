import { Button, Stack, Typography } from "@mui/material";
import { DashboardCard } from "../uiKit/Card/DashboardCard";
import { GraduationCap, MapPinned } from "lucide-react";
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
import { auth } from "firebase-admin";
import { useAuth } from "../Auth/useAuth";

export const ConversationSelectCard = () => {
  const aiConversation = useAiConversation();
  const words = useWords();
  const rules = useRules();
  const auth = useAuth();
  const { i18n } = useLingui();
  const settings = useSettings();
  const userInfo = useAiUserInfo();

  const [isShowOnboardingConfirmation, setIsShowOnboardingConfirmation] = useState(false);

  const startOnboarding = () => {
    aiConversation.startConversation({ mode: "goal" });
    setIsShowOnboardingConfirmation(false);
  };

  const isPassOnboarding = !!userInfo.userInfo?.records?.length;
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
            <img src="/avatar/map.png" alt="AI Bot" />
          </Stack>
        </Stack>
      }
      actionLabel={i18n._(`Start | 5 min`)}
    />
  );

  return (
    <DashboardCard>
      {isShowOnboardingConfirmation && (
        <CustomModal
          width="min(600px, 100dvw)"
          onClose={() => {
            setIsShowOnboardingConfirmation(false);
          }}
          isOpen={true}
        >
          <Stack
            sx={{
              width: "100%",
              gap: "40px",
            }}
          >
            <Stack>
              <Typography variant="h4" className="decor-text">
                {i18n._("Before we start...")}
              </Typography>
              <Typography variant="caption">{i18n._("Could you please set your goal?")}</Typography>
            </Stack>

            <Stack
              gap={"40px"}
              sx={{
                alignItems: "flex-start",
              }}
            >
              <Stack
                sx={{
                  width: "100%",
                }}
              >
                {goalCard}
              </Stack>

              <Stack
                gap={"10px"}
                sx={{
                  alignItems: "flex-start",
                }}
              >
                <Typography
                  sx={{
                    padding: "0 2px",
                  }}
                >
                  {i18n._(
                    "We need to know a little bit about you, so that our AI can help you learn better."
                  )}
                </Typography>

                <Typography
                  sx={{
                    padding: "0 2px",
                  }}
                >
                  {i18n._(
                    "Even during onboarding, you will get practice and our AI will help you correct grammar."
                  )}
                </Typography>
              </Stack>
              <Button
                onClick={() => startOnboarding()}
                startIcon={<MapPinned size={"18px"} />}
                color="info"
                size="large"
                variant="contained"
              >
                {i18n._("Get Started")}
              </Button>
            </Stack>
          </Stack>
        </CustomModal>
      )}

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
            background: "linear-gradient(45deg,rgb(25, 78, 142) 0%,rgb(109, 209, 151) 100%)",
            height: "50px",
            width: "50px",

            display: "flex",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <GraduationCap size={"25px"} />
        </Stack>
        <Stack
          sx={{
            flexDirection: "row",
            gap: "5px",
            alignItems: "center",
          }}
        >
          <Typography variant="h6">{i18n._(`Practice`)}</Typography>
          <Stack
            sx={{
              flexDirection: "row",
              gap: "5px",
              alignItems: "center",
            }}
          >
            <Typography variant="h6">| {settings.fullLanguageName}</Typography>
            <LanguageSwitcher
              size="small"
              isAuth={auth.isAuthorized}
              setLanguageToLearn={settings.setLanguage}
            />
          </Stack>
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
        {goalCard}

        <ConversationCard
          title={i18n._(`Conversation`)}
          subTitle={i18n._(`Talk to the AI and it will respond to you`)}
          onClick={() =>
            isPassOnboarding
              ? aiConversation.startConversation({ mode: "talk" })
              : setIsShowOnboardingConfirmation(true)
          }
          startColor="#34D399"
          endColor="#3B82F6"
          bgColor="#A3E635"
          disabled={!isPassOnboarding}
          disabledLabel={i18n._(`Set the goal to start`)}
          icon={
            <Stack>
              <Stack
                style={{ width: "var(--icon-size)", height: "var(--icon-size)" }}
                className="avatar"
              >
                <img src="/avatar/girl.png" alt="AI Bot" />
              </Stack>
            </Stack>
          }
          actionLabel={i18n._(`Start Talking`)}
        />

        <ConversationCard
          title={i18n._(`Beginner`)}
          subTitle={i18n._(`AI will lead you through the conversation`)}
          onClick={() =>
            isPassOnboarding
              ? aiConversation.startConversation({ mode: "beginner" })
              : setIsShowOnboardingConfirmation(true)
          }
          startColor="#FF6B6B"
          endColor="#FFD93D"
          bgColor="#5EEAD4"
          disabled={!isPassOnboarding}
          disabledLabel={i18n._(`Set the goal to start`)}
          icon={
            <Stack>
              <Stack
                style={{ width: "var(--icon-size)", height: "var(--icon-size)" }}
                className="avatar"
              >
                <img src="/avatar/owl1.png" alt="AI Bot" />
              </Stack>
            </Stack>
          }
          actionLabel={i18n._(`Guide me`)}
        />

        <ConversationCard
          title={i18n._(`Rules`)}
          subTitle={i18n._(`Get a personal grammar rule to learn`)}
          onClick={() =>
            isPassOnboarding ? rules.getRules() : setIsShowOnboardingConfirmation(true)
          }
          startColor="#9d43a3"
          endColor="#086787"
          bgColor="#990000"
          disabled={!isPassOnboarding}
          disabledLabel={i18n._(`Set the goal to start`)}
          icon={
            <Stack>
              <Stack
                style={{ width: "var(--icon-size)", height: "var(--icon-size)" }}
                className="avatar"
              >
                <img src="/avatar/book.png" alt="AI Bot" />
              </Stack>
            </Stack>
          }
          actionLabel={i18n._(`Get a rule`)}
        />

        <ConversationCard
          title={i18n._(`Words`)}
          subTitle={i18n._(`Practice new vocabulary with the AI`)}
          onClick={() =>
            isPassOnboarding ? words.getNewWordsToLearn() : setIsShowOnboardingConfirmation(true)
          }
          startColor="#00BFFF"
          endColor="#086787"
          bgColor="#5EEAD4"
          disabled={!isPassOnboarding}
          disabledLabel={i18n._(`Set the goal to start`)}
          icon={
            <Stack>
              <Stack
                style={{ width: "var(--icon-size)", height: "var(--icon-size)" }}
                className="avatar"
              >
                <img src="/avatar/words.png" alt="AI Bot" />
              </Stack>
            </Stack>
          }
          actionLabel={i18n._(`Expand vocabulary`)}
        />
      </Stack>
    </DashboardCard>
  );
};
