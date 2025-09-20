import { Button, Stack, Typography } from "@mui/material";
import { SupportedLanguage } from "../../Lang/lang";
import { FireExtinguisher, Flame, Swords } from "lucide-react";
import { useGame } from "../useGame";

import { useLingui } from "@lingui/react";
import { Trans } from "@lingui/react/macro";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { useAppNavigation } from "../../Navigation/useAppNavigation";
import { dailyQuestions } from "./dailyQuestions";
import LocalFireDepartmentTwoToneIcon from "@mui/icons-material/LocalFireDepartmentTwoTone";
import dayjs from "dayjs";

export const DailyQuestionBadge = () => {
  const { i18n } = useLingui();
  const [isLoading, setIsLoading] = useState(false);
  const appNavigation = useAppNavigation();
  const urlToNavigate = appNavigation.pageUrl("game");
  const todayIsoDate = dayjs().format("YYYY-MM-DD");
  const todaysQuestion = dailyQuestions[todayIsoDate];
  const router = useRouter();
  const now = useMemo(() => new Date(), []);
  const timeLeft = dayjs(todayIsoDate).endOf("day").diff(now);
  const hoursLeft = Math.max(0, Math.floor(timeLeft / (1000 * 60 * 60)));
  const peopleAnswered = 3;

  const onClick = (e: React.MouseEvent) => {
    setIsLoading(true);
    e.preventDefault();
  };

  if (!todaysQuestion) {
    return null;
  }
  return (
    <Stack
      component={"a"}
      href={urlToNavigate}
      onClick={onClick}
      sx={{
        padding: "21px 20px 24px 20px",
        color: "#fff",
        textDecoration: "none",
        maxWidth: "700px",
        borderRadius: "8px",
        width: "100%",

        background: "linear-gradient(170deg, #731923ff 10%, #a12e36 100%)",
        flexDirection: "row",
        gap: "20px",
        alignItems: "center",
        boxSizing: "border-box",
        display: "grid",
        minHeight: "120px",
        gridTemplateColumns: "1fr",

        opacity: isLoading ? 0.6 : 1,
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
              {i18n._("Today’s Question")}
            </Typography>
          </Stack>
          <Typography
            variant="body2"
            sx={{
              color: "#faae98",
            }}
          >
            <Trans>{hoursLeft}h left</Trans>
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
          <Trans>{peopleAnswered} people answered already — see what they said & share yours</Trans>
        </Typography>

        <Stack
          sx={{
            paddingTop: "15px",
            width: "max-content",
          }}
        >
          <Button
            LinkComponent={"span"}
            href={urlToNavigate}
            variant="outlined"
            sx={{
              color: "#fff",
              borderColor: "#fff",
            }}
          >
            {i18n._("Answer Now")}
          </Button>
        </Stack>
      </Stack>
    </Stack>
  );
};
