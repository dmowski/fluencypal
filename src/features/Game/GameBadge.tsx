import { Stack, Typography } from "@mui/material";
import { SupportedLanguage } from "../Lang/lang";
import { Swords } from "lucide-react";
import { getUrlStart } from "../Lang/getUrlStart";
import { useGame } from "./useGame";

import { Trans, useLingui } from "@lingui/react/macro";

interface GameBadgeProps {
  lang: SupportedLanguage;
}

export const GameBadge = ({ lang }: GameBadgeProps) => {
  const { i18n } = useLingui();
  const game = useGame();
  const position = game.myPosition;

  return (
    <Stack
      component={"a"}
      href={`${getUrlStart(lang)}practice?gamePage=true`}
      sx={{
        padding: "20px 20px",
        color: "#fff",
        textDecoration: "none",
        maxWidth: "700px",
        borderRadius: "10px",
        background:
          "linear-gradient(45deg,rgba(210, 13, 220, 0.2) 0%,rgba(250, 199, 213, 0.2) 100%)",
        flexDirection: "row",
        gap: "20px",
        alignItems: "center",
        boxSizing: "border-box",
        display: "grid",
        gridTemplateColumns: "1fr max-content",
      }}
    >
      <Stack>
        <Typography
          sx={{
            fontWeight: 600,
            fontSize: "1.6rem",
            color: `rgb(253, 238, 255)`,
          }}
        >
          <Trans>Play and Learn</Trans>
        </Typography>
        <Typography
          sx={{
            opacity: 0.9,
          }}
        >
          {i18n._("Rank in the top 5 to get the app for free")}
        </Typography>

        <Typography
          sx={{
            opacity: 0.9,
          }}
        >
          {i18n._("Your position")}: {position ? position : "-"}
        </Typography>
      </Stack>

      <Stack
        sx={{
          borderRadius: "50%",
          background: "linear-gradient(45deg,rgba(244, 8, 248, 0.3) 0%, rgb(255, 0, 166) 100%)",
          height: "45px",
          width: "45px",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <Swords size={"20px"} color="#fff" />
      </Stack>
    </Stack>
  );
};
