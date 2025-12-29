import { Button, Stack, Typography } from "@mui/material";
import { useGame } from "../useGame";
import { Trans } from "@lingui/react/macro";
import { useLingui } from "@lingui/react";
import { ChevronLast, ChevronRight, X } from "lucide-react";
import { useAuth } from "@/features/Auth/useAuth";
import { GameStatRow } from "../GameStatRow";

export const GameContainer = ({ children }: { children: React.ReactNode }) => {
  return (
    <Stack
      sx={{
        gap: "25px",
        width: "100%",
        height: "100%",
        maxWidth: "600px",
        padding: "0px 10px",
        "@media (max-width: 600px)": {
          padding: "40px 10px 90px 10px",
        },
      }}
    >
      {children}
    </Stack>
  );
};

export const SkipButton = ({ disabled }: { disabled: boolean }) => {
  const game = useGame();
  const { i18n } = useLingui();
  return (
    <Button
      endIcon={<ChevronLast />}
      size="large"
      variant="text"
      disabled={disabled}
      onClick={game.nextQuestion}
    >
      {i18n._("Skip")}
    </Button>
  );
};

export const MyStatsRows = () => {
  const game = useGame();
  const auth = useAuth();
  const myUserId = auth.uid || "";
  const nextUserId = game.nextPositionStat?.userId || "";

  const statsToShow = game.stats.filter(
    (stat) => stat.userId === myUserId || stat.userId === nextUserId
  );

  const getRealPosition = (userId: string) => {
    const index = game.stats.findIndex((stat) => stat.userId === userId);
    return index >= 0 ? index : 0;
  };

  return (
    <Stack
      sx={{
        gap: "10px",
        width: "100%",
      }}
    >
      {statsToShow.map((stat) => (
        <GameStatRow key={stat.userId} stat={stat} index={getRealPosition(stat.userId)} />
      ))}
    </Stack>
  );
};

export const SummaryRow = () => {
  const game = useGame();
  const nextUserId = game.nextPositionStat?.userId || "";
  const nextUserUsername = game.userNames?.[nextUserId] || "";
  const pointsToNextPosition = game.pointsToNextPosition;
  const { i18n } = useLingui();
  return (
    <Stack
      sx={{
        flexDirection: "row",
        justifyContent: "space-between",
        width: "100%",
      }}
    >
      <Stack
        sx={{
          alignItems: "center",
        }}
      >
        <Typography variant="h4">{game.myPosition}</Typography>
        <Typography
          variant="body2"
          sx={{
            textTransform: "uppercase",
          }}
        >
          {i18n._("My position")}
        </Typography>
      </Stack>

      <Typography variant="body2" align="right">
        {game.pointsToNextPosition !== null && nextUserUsername && (
          <Trans>
            Next position ({nextUserUsername}): <b>{pointsToNextPosition}</b>
          </Trans>
        )}
      </Typography>
    </Stack>
  );
};

export const FinishButton = ({
  isCorrect,
  setIsCorrect,
}: {
  isCorrect: boolean;
  setIsCorrect: (value: boolean | null) => void;
}) => {
  const { i18n } = useLingui();
  const game = useGame();

  return (
    <Stack
      sx={{
        gap: "15px",
        width: "100%",
      }}
    >
      <Button
        variant="contained"
        size="large"
        color={isCorrect ? "info" : "error"}
        startIcon={isCorrect ? undefined : <X />}
        endIcon={<ChevronRight />}
        onClick={() => {
          setIsCorrect(null);
          game.nextQuestion();
        }}
        sx={{
          width: "100%",
        }}
      >
        {i18n._("Next")}
      </Button>
      <MyStatsRows />
    </Stack>
  );
};
