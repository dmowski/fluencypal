import { Button, Stack, Typography } from "@mui/material";
import { useLingui } from "@lingui/react";
import { useMemo, useState } from "react";
import { dailyQuestions } from "./dailyQuestions";
import dayjs from "dayjs";
import { ChevronRight, MessageCircle, X } from "lucide-react";
import { ColorIconTextList } from "@/features/Survey/ColorIconTextList";
import { ChartSection } from "@/features/Chat/ChatSection";
import { ChatProvider, useChat } from "@/features/Chat/useChat";
import { DailyQuestion } from "./types";

export const DailyQuestionBadge = () => {
  const todayIsoDate = dayjs().format("YYYY-MM-DD");
  const todaysQuestion = dailyQuestions[todayIsoDate];
  const questionId = todaysQuestion?.id;

  if (!todaysQuestion) return null;
  return (
    <ChatProvider space={"daily-question-" + questionId}>
      <DailyQuestionBadgeComponent todaysQuestion={todaysQuestion} />
    </ChatProvider>
  );
};

export const DailyQuestionBadgeComponent = ({
  todaysQuestion,
}: {
  todaysQuestion: DailyQuestion;
}) => {
  const { i18n } = useLingui();
  const todayIsoDate = dayjs().format("YYYY-MM-DD");

  const now = useMemo(() => new Date(), []);
  const timeLeft = dayjs(todayIsoDate).endOf("day").diff(now);
  const hoursLeft = Math.max(0, Math.floor(timeLeft / (1000 * 60 * 60)));

  const [isOpen, setIsOpen] = useState(false);

  const onToggleView = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsOpen(!isOpen);
  };

  const chat = useChat();
  const commentsCount = chat.messages.length;

  return (
    <Stack
      onClick={isOpen ? undefined : onToggleView}
      key={todayIsoDate}
      sx={{
        padding: "21px 20px 24px 20px",
        color: "#fff",
        textDecoration: "none",
        maxWidth: "700px",
        borderRadius: "15px",
        width: "100%",
        height: "auto",
        cursor: isOpen ? "initial" : "pointer",

        background: isOpen ? "rgba(115, 25, 35, 0.2)" : "rgba(115, 25, 35, 0.31)",
        boxShadow: isOpen
          ? "0px 0px 0px 1px rgba(255, 255, 255, 0.2)"
          : "0px 0px 0px 1px rgba(255, 255, 255, 0.031)",
        flexDirection: "row",
        transition: "all 0.3s ease",
        gap: "20px",
        alignItems: "center",
        boxSizing: "border-box",
        display: "grid",
        minHeight: "120px",
        gridTemplateColumns: "1fr",
        "@media (max-width:600px)": {
          padding: "30px 10px 30px 10px",
          boxShadow: "none",
          borderRadius: "0px",
        },
      }}
    >
      <Stack
        sx={{
          width: "100%",
        }}
      >
        <Stack
          sx={{
            width: "100%",
            justifyContent: "space-between",
            flexDirection: "row",
            alignItems: "center",
            color: "#feb985ff",
          }}
        >
          <Stack
            sx={{
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "center",
              gap: "6px",
            }}
          >
            <img
              src="/icons/flame-icon.svg"
              style={{ width: 20, height: 20, position: "relative", top: "-2px", left: "-1px" }}
            />
            <Typography
              variant="body2"
              sx={{
                textTransform: "uppercase",
                fontWeight: 500,
              }}
            >
              {i18n._("Daily Question")}
            </Typography>
          </Stack>
          <Typography
            variant="body2"
            sx={{
              color: "#faae98",
            }}
          >
            {hoursLeft}h left
          </Typography>
        </Stack>

        <Typography
          sx={{
            paddingTop: "10px",
            fontSize: "1.7rem",
            fontWeight: 560,
            lineHeight: 1.2,
            "@media (max-width:600px)": {
              fontSize: "1.5rem",
            },
          }}
        >
          {todaysQuestion.title}
        </Typography>

        <Typography
          sx={{
            paddingTop: "5px",
            fontSize: "0.9rem",
            fontWeight: 350,
            lineHeight: 1.2,
            color: "#fff",
            opacity: 0.96,
          }}
        >
          {todaysQuestion.description}
        </Typography>

        {isOpen && (
          <Stack>
            <Stack
              sx={{
                gap: "0px",
                paddingTop: "20px",
              }}
            >
              <ColorIconTextList
                listItems={todaysQuestion.hints.map((hint) => ({
                  title: hint,
                  iconName: "lightbulb",
                }))}
                iconSize={"20px"}
                gap="10px"
              />
            </Stack>
          </Stack>
        )}

        {isOpen && (
          <Stack
            sx={{
              gap: "10px",
              padding: "40px 0 20px 0",
            }}
          >
            <Stack>
              <Typography variant="h6">{i18n._(`Answers:`)}</Typography>
              <Typography
                variant="body2"
                sx={{
                  opacity: 0.7,
                }}
              >
                {i18n._(`You can discuss the daily question here.`)}
              </Typography>
            </Stack>

            <ChartSection placeholder={i18n._("What do you think?")} />
          </Stack>
        )}

        <Stack
          sx={{
            paddingTop: "25px",
            width: "max-content",
            flexDirection: "row",
            gap: "20px",
          }}
        >
          <Button
            onClick={onToggleView}
            variant="outlined"
            endIcon={isOpen ? <X size={"18px"} /> : <ChevronRight size={"18px"} />}
            sx={{
              color: "#fff",
              borderColor: "#fff",
            }}
          >
            {isOpen ? i18n._("Close") : i18n._("Show more")}
          </Button>

          <Stack
            sx={{
              flexDirection: "row",
              alignItems: "center",
              gap: "8px",
            }}
            onClick={() => {}}
          >
            <MessageCircle size="16px" color="rgba(255, 255, 255, 0.6)" />
            <Typography variant="caption" sx={{ color: "rgba(255, 255, 255, 0.6)" }}>
              {commentsCount || 0}
            </Typography>
          </Stack>
        </Stack>
      </Stack>
    </Stack>
  );
};
