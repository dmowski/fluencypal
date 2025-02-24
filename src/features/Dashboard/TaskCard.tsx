import { GradientCard } from "../uiKit/Card/GradientCard";
import { Button, Stack, Tooltip, Typography } from "@mui/material";
import { Lock, BadgeCheck } from "lucide-react";
import LockIcon from "@mui/icons-material/Lock";
import { JSX } from "react";

interface TaskCardProps {
  isDone: boolean;
  lockedText?: string;
  title: string;
  subTitle: string;
  buttonIcon: JSX.Element;
  buttonText: string;
  onStart: () => void;
}

export const TaskCard: React.FC<TaskCardProps> = ({
  isDone,
  lockedText,
  title,
  subTitle,
  buttonIcon,
  buttonText,
  onStart,
}) => {
  return (
    <GradientCard
      padding="22px"
      strokeWidth="2px"
      startColor={isDone ? "#fa8500" : "rgba(255, 255, 255, 0.09)"}
      endColor={isDone ? "#05acff" : "rgba(255, 255, 255, 0.09)"}
      backgroundColor={isDone ? "rgba(10, 18, 30, 1)" : "rgba(10, 18, 30, 0.2)"}
    >
      <Stack
        sx={{
          gap: "16px",
          alignItems: "flex-start",
        }}
      >
        <Stack
          sx={{
            position: "absolute",
            top: "16px",
            right: "16px",
          }}
        >
          {isDone ? <BadgeCheck strokeWidth={"2px"} color="#558fdb" size={"24px"} /> : null}
        </Stack>
        <Stack>
          <Typography
            sx={{
              opacity: lockedText ? 0.6 : 1,
            }}
          >
            {title}
          </Typography>
          <Typography
            variant="caption"
            sx={{
              opacity: lockedText ? 0.3 : 0.7,
            }}
          >
            {subTitle}
          </Typography>
        </Stack>
        <Stack>
          <Button
            disabled={!!lockedText}
            startIcon={lockedText ? <LockIcon /> : buttonIcon}
            variant="outlined"
            onClick={() => onStart()}
          >
            {buttonText}
          </Button>
          {lockedText ? (
            <Typography
              variant="caption"
              sx={{
                padding: "1px",
                opacity: 0.3,
              }}
            >
              {lockedText}
            </Typography>
          ) : null}
        </Stack>
      </Stack>
    </GradientCard>
  );
};
