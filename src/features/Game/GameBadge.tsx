import { Stack, Typography } from "@mui/material";
import { SupportedLanguage } from "../Lang/lang";
import { Swords } from "lucide-react";
import { getUrlStart } from "../Lang/getUrlStart";
import { useGame } from "./useGame";

import { useLingui } from "@lingui/react";

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
        borderRadius: "8px",

        background: "rgba(210, 13, 220, 0.2)",
        flexDirection: "row",
        gap: "20px",
        alignItems: "center",
        boxSizing: "border-box",
        display: "grid",
        gridTemplateColumns: "1fr max-content",
        "@media (max-width:600px)": {
          padding: "15px 15px",
        },
      }}
    >
      <Stack>
        <Typography
          sx={{
            fontWeight: 600,
            fontSize: "1.2rem",
            color: `rgb(253, 238, 255)`,
            "@media (max-width:600px)": {
              fontSize: "1rem",
            },
          }}
        >
          {i18n._("Play and Learn")}
        </Typography>
        <Typography
          sx={{
            opacity: 0.9,
            fontSize: "0.9rem",
            "@media (max-width:600px)": {
              fontSize: "0.7rem",
            },
          }}
        >
          {i18n._("Rank in the top 5 to get the app for free")}
        </Typography>

        <Typography
          sx={{
            opacity: 0.9,
            fontSize: "0.9rem",
            "@media (max-width:600px)": {
              fontSize: "0.7rem",
            },
          }}
        >
          {i18n._("Your position")}: {position ? position : "-"}
        </Typography>
      </Stack>

      <Stack
        sx={{
          borderRadius: "50%",
          background: "none",
          "--icon-color": "#fff",
          height: "45px",
          width: "45px",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <Swords size={"20px"} color="var(--icon-color)" />
      </Stack>
    </Stack>
  );
};
