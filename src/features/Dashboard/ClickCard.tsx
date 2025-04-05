import { GradientCard } from "../uiKit/Card/GradientCard";
import { Stack, Tooltip, Typography } from "@mui/material";
import { Lock, BadgeCheck } from "lucide-react";
import { JSX } from "react";

interface ClickCardProps {
  isDone: boolean;
  lockedText?: string;
  title: string;
  subTitle: string;
  buttonIcon?: JSX.Element;

  onStart: () => void;
}

export const ClickCard: React.FC<ClickCardProps> = ({
  isDone,
  lockedText,
  title,
  subTitle,
  buttonIcon,
  onStart,
}) => {
  return (
    <Tooltip title={lockedText} placement="top" arrow>
      <Stack>
        <Stack
          component={"button"}
          disabled={!!lockedText}
          onClick={() => onStart()}
          sx={{
            backgroundColor: "transparent",
            padding: "0",
            border: "none",
            display: "flex",
            alignItems: "flex-start",
            textAlign: "left",
            cursor: lockedText ? "not-allowed" : "pointer",
            width: "100%",
            color: "#fff",
            height: "max-content",
            ":hover,:focus": {
              backgroundColor: "rgba(255, 255, 255, 0.1)",
              borderRadius: "16px",
            },
          }}
        >
          <GradientCard
            padding="22px"
            strokeWidth="2px"
            startColor={lockedText ? "rgba(255, 255, 255, 0.09)" : "rgba(255, 255, 255, 0.2)"}
            endColor={lockedText ? "rgba(255, 255, 255, 0.09)" : "rgba(255, 255, 255, 0.3)"}
            backgroundColor={
              isDone
                ? "rgba(10, 18, 30, 1)"
                : lockedText
                  ? "rgba(10, 18, 30, 0.2)"
                  : "rgba(10, 18, 30, 0.6)"
            }
          >
            {lockedText ? <Lock size={"30px"} color="#888" /> : buttonIcon || <></>}
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
            </Stack>
          </GradientCard>
        </Stack>
      </Stack>
    </Tooltip>
  );
};
