"use client";
import { Stack, Typography } from "@mui/material";
import { useLingui } from "@lingui/react";
import { ReactNode } from "react";
import { ArrowRight } from "lucide-react";
import { ColorIconTextList, ColorIconTextListItem } from "./ColorIconTextList";
import { InterviewQuizButton } from "../Goal/Quiz/InterviewQuizButton";

export const InfoStep = ({
  title,
  subTitle,
  subComponent,
  imageUrl,
  imageAspectRatio,
  actionButtonTitle,
  onClick,
  actionButtonStartIcon,
  actionButtonEndIcon,
  disabled,
  isStepLoading,
  listItems,
}: {
  title?: string;
  subTitle?: string;
  subComponent?: ReactNode;
  imageAspectRatio?: string;
  imageUrl?: string;
  actionButtonTitle?: string;
  onClick: () => void;
  actionButtonStartIcon?: ReactNode;
  actionButtonEndIcon?: ReactNode;
  disabled?: boolean;
  isStepLoading?: boolean;
  width?: string;
  listItems?: ColorIconTextListItem[];
}) => {
  const { i18n } = useLingui();
  return (
    <Stack
      sx={{
        gap: "30px",
        paddingBottom: "20px",
      }}
    >
      <Stack
        sx={{
          width: "100%",
          gap: "10px",
          padding: "0 10px",
        }}
      >
        <Stack
          sx={{
            width: "100%",
            gap: "5px",
            paddingTop: "40px",
          }}
        >
          {title && (
            <Typography
              variant="h4"
              sx={{
                fontWeight: 660,
                lineHeight: "1.2",
              }}
            >
              {title}
            </Typography>
          )}
          {subTitle && (
            <Typography
              variant="body1"
              sx={{
                opacity: 0.9,
                paddingTop: "10px",
              }}
            >
              {subTitle}
            </Typography>
          )}

          {subComponent}

          {!!listItems?.length && (
            <Stack
              sx={{
                paddingTop: "30px",
              }}
            >
              <ColorIconTextList listItems={listItems} iconSize="26px" gap="23px" />
            </Stack>
          )}
          {imageUrl && (
            <Stack
              sx={{
                paddingTop: "10px",
              }}
            >
              <Stack
                component={"img"}
                src={imageUrl}
                sx={{
                  width: "90%",
                  aspectRatio: imageAspectRatio || "16/9",
                  borderRadius: "8px",
                  objectFit: "cover",
                  backgroundColor: "rgba(255,255,255,0.05)",
                  "@media (max-width: 600px)": {
                    width: "100%",
                  },
                }}
              />
            </Stack>
          )}
        </Stack>

        <InterviewQuizButton
          onClick={() => {
            !isStepLoading && onClick();
          }}
          color={"primary"}
          title={actionButtonTitle || i18n._("Next")}
          disabled={disabled}
          startIcon={actionButtonStartIcon}
          endIcon={actionButtonEndIcon || <ArrowRight />}
        />
      </Stack>
    </Stack>
  );
};
