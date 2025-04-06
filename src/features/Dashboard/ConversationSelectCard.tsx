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
    <GradientBgCard
      title={title}
      subTitle={subTitle}
      onClick={onClick}
      value=""
      startColor={startColor}
      endColor={endColor}
      bgColor={bgColor}
      actionButton={
        <Stack
          sx={{
            paddingTop: "70px",
            justifyContent: "space-between",
            width: "100%",
            alignItems: "flex-end",
            flexDirection: "row",
            "--icon-size": "40px",
            "@media (max-width: 850px)": {
              paddingTop: "20px",
              "--icon-size": "20px",
            },
          }}
        >
          {icon}
          <Stack
            sx={{
              flexDirection: "row",
              gap: "10px",
              alignItems: "center",
              padding: "10px 14px 0px 10px",
              borderRadius: "8px",
            }}
          >
            <Typography variant="body2">{actionLabel}</Typography>
          </Stack>
        </Stack>
      }
    />
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
          "@media (max-width: 850px)": {
            gridTemplateColumns: "1fr 1fr",
          },

          "@media (max-width: 600px)": {
            gridTemplateColumns: "1fr",
            gap: "10px",
          },
        }}
      >
        {showGoalCard && (
          <ConversationCard
            title={i18n._(`Goal`)}
            subTitle={i18n._(`Set the goal of your learning`)}
            onClick={() => aiConversation.startConversation({ mode: "beginner" })}
            startColor="#4F46E5"
            endColor="#A78BFA"
            bgColor="#60A5FA"
            icon={<Flag style={{ width: "var(--icon-size)", height: "var(--icon-size)" }} />}
            actionLabel={i18n._(`Start`)}
          />
        )}

        <ConversationCard
          title={i18n._(`Conversation`)}
          subTitle={i18n._(`Talk to the AI and it will respond to you`)}
          onClick={() => aiConversation.startConversation({ mode: "talk" })}
          startColor="#34D399"
          endColor="#3B82F6"
          bgColor="#A3E635"
          icon={<Mic style={{ width: "var(--icon-size)", height: "var(--icon-size)" }} />}
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
            <MapPinCheckInside style={{ width: "var(--icon-size)", height: "var(--icon-size)" }} />
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
          icon={<BookOpenText style={{ width: "var(--icon-size)", height: "var(--icon-size)" }} />}
          actionLabel={i18n._(`Get a rule`)}
        />

        <ConversationCard
          title={i18n._(`Words`)}
          subTitle={i18n._(`Practice new vocabulary with the AI`)}
          onClick={() => words.getNewWordsToLearn()}
          startColor="#00BFFF"
          endColor="#086787"
          bgColor="#5EEAD4"
          icon={<ListCheck style={{ width: "var(--icon-size)", height: "var(--icon-size)" }} />}
          actionLabel={i18n._(`Expand vocabulary`)}
        />
      </Stack>
    </DashboardCard>
  );
};
