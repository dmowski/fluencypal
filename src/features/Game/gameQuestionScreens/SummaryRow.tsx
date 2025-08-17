import { Stack, Typography } from "@mui/material";
import { useGame } from "../useGame";
import { Trans } from "@lingui/react/macro";

export const SummaryRow = () => {
  const game = useGame();
  const nextUserUsername = game.nextPositionStat?.username || "N/A";
  const pointsToNextPosition = game.pointsToNextPosition;
  return (
    <Stack
      sx={{
        flexDirection: "row",
        justifyContent: "space-between",
        width: "100%",
      }}
    >
      <Typography variant="body2">
        <Trans>
          My Position: <b>{game.myPosition}</b>
        </Trans>
      </Typography>
      <Typography variant="body2" align="right">
        {game.pointsToNextPosition !== null && (
          <Trans>
            Next position ({nextUserUsername}): <b>{pointsToNextPosition}</b>
          </Trans>
        )}
      </Typography>
    </Stack>
  );
};
