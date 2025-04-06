import { Stack, Typography } from "@mui/material";
import { DashboardCard } from "../uiKit/Card/DashboardCard";
import { BookOpenText, Flag, GraduationCap, ListCheck, MapPinCheckInside, Mic } from "lucide-react";
import { useAiConversation } from "../Conversation/useAiConversation";
import { useLingui } from "@lingui/react";
import { GradientBgCard } from "../uiKit/Card/GradientBgCard";
import { useWords } from "../Words/useWords";
import { useRules } from "../Rules/useRules";
import { useSettings } from "../Settings/useSettings";
import { LanguageSwitcher } from "../Lang/LanguageSwitcher";
import { ReactNode } from "react";

interface ConversationCardProps {
  title: string;
  subTitle: string;
  onClick: () => void;
  startColor: string;
  endColor: string;
  bgColor: string;
  icon: ReactNode;
  actionLabel: string;
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
        border: "1px solid rgba(255, 255, 255, 0.04)",
        position: "relative",
        overflow: "hidden",
        transition: "transform 0.3s ease",
        cursor: "pointer",
        color: "#fff",

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
          transform: "scale(1.02)",
          ".avatar": {
            transform: "scale(1.08) rotate(1deg)",
          },
        },
      }}
    >
      <Typography
        align="left"
        variant="caption"
        sx={{
          fontWeight: 300,
          opacity: 0.9,
          textTransform: "uppercase",
        }}
      >
        {subTitle}
      </Typography>

      <Typography
        align="left"
        sx={{
          fontWeight: 800,
          opacity: 0.9,
          textTransform: "uppercase",
          fontSize: "1.8rem",
          position: "relative",
          zIndex: 1,
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
          gap: "10px",
          alignItems: "center",
          padding: "70px 14px 0px 0px",
          borderRadius: "8px",
        }}
      >
        <Typography variant="body2">{actionLabel}</Typography>
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
          opacity: 0.9,
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
          opacity: 0.9,
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
          opacity: 0.1,
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

  const showGoalCard = true;
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
          actionLabel={i18n._(`Start`)}
        />

        <ConversationCard
          title={i18n._(`Conversation`)}
          subTitle={i18n._(`Talk to the AI and it will respond to you`)}
          onClick={() => aiConversation.startConversation({ mode: "talk" })}
          startColor="#34D399"
          endColor="#3B82F6"
          bgColor="#A3E635"
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
          onClick={() => aiConversation.startConversation({ mode: "beginner" })}
          startColor="#FF6B6B"
          endColor="#FFD93D"
          bgColor="#5EEAD4"
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
          onClick={() => rules.getRules()}
          startColor="#9d43a3"
          endColor="#086787"
          bgColor="#990000"
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
          onClick={() => words.getNewWordsToLearn()}
          startColor="#00BFFF"
          endColor="#086787"
          bgColor="#5EEAD4"
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
