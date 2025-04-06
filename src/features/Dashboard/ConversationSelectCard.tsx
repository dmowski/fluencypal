import { Button, Stack, Typography } from "@mui/material";
import { DashboardCard } from "../uiKit/Card/DashboardCard";
import {
  BookOpenText,
  Flag,
  GraduationCap,
  ListCheck,
  MapPinCheckInside,
  Lock,
  MapPinned,
} from "lucide-react";
import { useAiConversation } from "../Conversation/useAiConversation";
import { useLingui } from "@lingui/react";
import { GradientBgCard } from "../uiKit/Card/GradientBgCard";
import { useWords } from "../Words/useWords";
import { useRules } from "../Rules/useRules";
import { useSettings } from "../Settings/useSettings";
import { LanguageSwitcher } from "../Lang/LanguageSwitcher";
import { ReactNode, useState } from "react";
import { useAiUserInfo } from "../Ai/useAiUserInfo";
import { CustomModal } from "../uiKit/Modal/CustomModal";

interface ConversationCardProps {
  title: string;
  subTitle: string;
  onClick: () => void;
  startColor: string;
  endColor: string;
  bgColor: string;
  icon: ReactNode;
  actionLabel: string;
  disabled?: boolean;
  disabledLabel?: string;
}

export const ConversationCard = ({
  title,
  subTitle,
  onClick,
  startColor,
  endColor,
  bgColor,
  icon,
  actionLabel,
  disabled,
  disabledLabel,
}: ConversationCardProps) => {
  return (
    <Stack
      onClick={onClick}
      component={"button"}
      sx={{
        backgroundColor: "transparent",
        padding: "20px 20px 20px 20px",
        borderRadius: "16px",
        gap: "0px",
        alignItems: "flex-start",
        justifyContent: "center",
        border: disabled
          ? "1px solid rgba(255, 255, 255, 0.2)"
          : "1px solid rgba(255, 255, 255, 0.0)",
        position: "relative",
        overflow: "hidden",
        transition: "transform 0.3s ease",
        cursor: "pointer",

        // allow text selection
        userSelect: "text",

        color: "#fff",
        opacity: disabled ? 0.8 : 1,

        ".mini-card": {
          position: "absolute",
          bottom: "0px",
          right: "20px",
          width: "200px",
          height: "140px",
          boxSizing: "border-box",
          transition: "all 0.3s ease",
          boxShadow: "0px 0px 26px rgba(0, 0, 0, 0.3)",
          backgroundColor: "#1E1E1E",
          padding: "20px",
          borderRadius: "16px 16px 0 0",
          "@media (max-width: 750px)": {
            width: "250px",
          },
          "@media (max-width: 450px)": {
            width: "150px",
          },
        },

        ":hover": {
          transform: !disabled ? "scale(1.02)" : "none",
          ".avatar": {
            transform: !disabled ? "scale(1.08) rotate(1deg)" : "none",
          },
        },
      }}
    >
      <Typography
        align="left"
        variant="caption"
        sx={{
          fontWeight: 300,
          opacity: disabled ? 0.7 : 0.9,
          textTransform: "uppercase",
        }}
      >
        {subTitle}
      </Typography>

      <Typography
        align="left"
        sx={{
          fontWeight: 800,
          textTransform: "uppercase",
          fontSize: "1.8rem",
          position: "relative",
          zIndex: 1,
          opacity: disabled ? 0.5 : 0.9,
          "@media (max-width: 450px)": {
            fontSize: "1.4rem",
          },
        }}
      >
        {title}
      </Typography>

      <Stack
        sx={{
          flexDirection: "row",
          gap: "8px",
          alignItems: "center",
          padding: "70px 14px 0px 0px",
          borderRadius: "8px",
          opacity: disabled ? 0.7 : 1,
        }}
      >
        {disabled ? (
          <>
            <Lock size={"18px"} />
            <Typography variant="body2">{disabledLabel}</Typography>
          </>
        ) : (
          <Typography variant="body2">{actionLabel}</Typography>
        )}
      </Stack>

      <Stack
        sx={{
          paddingTop: "0px",
          width: "max-content",
          position: "absolute",
          bottom: "0px",
          right: "0px",
          zIndex: 0,

          ".avatar": {
            transition: "all 0.4s ease",
            opacity: disabled ? 0.9 : 1,
            img: {
              width: "150px",
              height: "150px",
            },
          },
        }}
      >
        {icon}
      </Stack>

      <Stack
        sx={{
          backgroundColor: startColor,
          width: "320px",
          height: "120px",
          borderRadius: "40px",
          filter: "blur(50px)",

          position: "absolute",
          top: "-40px",
          left: "-20px",
          zIndex: -1,
          opacity: disabled ? 0.06 : 0.9,
        }}
      ></Stack>

      <Stack
        sx={{
          backgroundColor: endColor,
          width: "320px",
          height: "120px",
          borderRadius: "40px",
          filter: "blur(80px)",

          position: "absolute",
          bottom: "-40px",
          right: "-20px",
          zIndex: -1,
          opacity: disabled ? 0.06 : 0.9,
        }}
      ></Stack>

      <Stack
        sx={{
          backgroundColor: bgColor,
          width: "100%",
          height: "100%",

          position: "absolute",
          bottom: "0px",
          left: "0px",
          zIndex: -2,
          opacity: disabled ? 0.06 : 0.1,
        }}
      ></Stack>
    </Stack>
  );
};

export const ConversationSelectCard = () => {
  const aiConversation = useAiConversation();
  const words = useWords();
  const rules = useRules();
  const { i18n } = useLingui();
  const settings = useSettings();
  const userInfo = useAiUserInfo();

  const [isShowOnboardingConfirmation, setIsShowOnboardingConfirmation] = useState(true);

  const isPassOnboarding = !!userInfo.userInfo?.records?.length;
  const goalCard = (
    <ConversationCard
      title={i18n._(`Goal`)}
      subTitle={i18n._(`Set the goal of your learning`)}
      onClick={() => aiConversation.startConversation({ mode: "goal" })}
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
            <LanguageSwitcher size="small" />
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
