import { Button, Stack, Typography } from "@mui/material";
import { useGame } from "../useGame";
import { Trans } from "@lingui/react/macro";
import { useLingui } from "@lingui/react";
import { Check, ChevronRight, X } from "lucide-react";

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
          padding: "30px 10px 90px 10px",
        },
      }}
    >
      {children}
    </Stack>
  );
};

export const SummaryRow = () => {
  const game = useGame();
  const nextUserId = game.nextPositionStat?.userId || "";
  const nextUserUsername = game.userNames?.[nextUserId] || "";
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
  onNext,
}: {
  isCorrect: boolean;
  setIsCorrect: (value: boolean | null) => void;
  onNext: () => void;
}) => {
  const { i18n } = useLingui();

  return (
    <Stack
      sx={{
        gap: "5px",
        width: "100%",
      }}
    >
      <Button
        variant="contained"
        size="large"
        color={isCorrect ? "success" : "error"}
        startIcon={isCorrect ? <Check /> : <X />}
        endIcon={<ChevronRight />}
        onClick={() => {
          setIsCorrect(null);
          onNext();
        }}
        sx={{
          width: "100%",
        }}
      >
        {i18n._("Next")}
      </Button>
      <SummaryRow />
    </Stack>
  );
};
