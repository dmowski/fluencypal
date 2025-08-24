import { Stack, Typography } from "@mui/material";
import { SupportedLanguage } from "../Lang/lang";
import { Swords } from "lucide-react";
import { getUrlStart } from "../Lang/getUrlStart";
import { useGame } from "./useGame";

import { useLingui } from "@lingui/react";
import { Trans } from "@lingui/react/macro";
import { useRouter } from "next/navigation";
import { useState } from "react";

interface GameBadgeProps {
  lang: SupportedLanguage;
}

export const GameBadge = ({ lang }: GameBadgeProps) => {
  const { i18n } = useLingui();
  const [isLoading, setIsLoading] = useState(false);
  const game = useGame();
  const position = game.myPosition;
  const points = game.myPoints;
  const showMyPosition = points && points > 1;
  const playersCount = game.stats.length;
  const urlToNavigate = `${getUrlStart(lang)}practice?gamePage=true`;

  const router = useRouter();

  const onClick = (e: React.MouseEvent) => {
    setIsLoading(true);
    e.preventDefault();
    router.push(urlToNavigate);
    setTimeout(() => {
      setIsLoading(false);
    }, 3000);
  };
  return (
    <Stack
      component={"a"}
      href={urlToNavigate}
      onClick={onClick}
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
        opacity: isLoading ? 0.6 : 1,
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
        {!showMyPosition && (
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
        )}
        {game.pointsToNextPosition && (
          <Typography
            sx={{
              opacity: 0.9,
              fontSize: "0.9rem",
              "@media (max-width:600px)": {
                fontSize: "0.7rem",
              },
              b: {
                color: "#ff00b7ff",
              },
            }}
          >
            <Trans>
              Answer <b>{game.pointsToNextPosition} questions</b> to get a new position
            </Trans>
          </Typography>
        )}

        {position === 1 && (
          <Typography
            sx={{
              fontSize: "0.9rem",
              "@media (max-width:600px)": {
                fontSize: "0.7rem",
              },
            }}
          >
            <Trans>
              You are <b>the Leader</b> of {playersCount} players.
            </Trans>
          </Typography>
        )}
      </Stack>

      {showMyPosition ? (
        <Stack
          sx={{
            alignItems: "center",
            borderLeft: "1px solid rgba(255, 255, 255, 0.06)",
            padding: "0 0 0 20px",
            "@media (max-width:600px)": {
              padding: "0 0 0 15px",
            },
          }}
        >
          <Typography
            variant="h3"
            sx={{
              fontSize: "3.1rem",
              fontWeight: 600,
              "@media (max-width:600px)": {
                fontSize: "2.5rem",
              },
            }}
          >
            {position}
          </Typography>
          <Typography
            variant="caption"
            sx={{
              opacity: 0.7,
            }}
          >
            <Trans>Position</Trans>
          </Typography>
        </Stack>
      ) : (
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
      )}
    </Stack>
  );
};
