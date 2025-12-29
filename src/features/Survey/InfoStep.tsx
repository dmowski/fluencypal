"use client";
import { Checkbox, Stack, Typography } from "@mui/material";
import { useLingui } from "@lingui/react";
import { ReactNode } from "react";
import { ArrowRight } from "lucide-react";
import { ColorIconTextList, ColorIconTextListItem } from "./ColorIconTextList";
import { InterviewQuizButton } from "../Goal/Quiz/InterviewQuizButton";
import { QuizOption } from "../Case/types";
import { useAuth } from "../Auth/useAuth";

const replacePlaceholders = (text: string, placeholders: Record<string, string>) => {
  let replacedText = text;
  const keys = Object.keys(placeholders);
  keys.forEach((key) => {
    const value = placeholders[key];
    replacedText = replacedText.split(key).join(value);
  });
  return replacedText;
};

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
  options,
  selectedOptions,
  onSelectOptionsChange,
  multipleSelection,

  secondButtonEndIcon,
  secondButtonTitle,
  onSecondButtonClick,
  secondButtonStartIcon,
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
  options?: QuizOption[];
  selectedOptions?: QuizOption[];
  onSelectOptionsChange?: (selectedOptions: QuizOption[]) => void;
  multipleSelection?: boolean;

  secondButtonTitle?: string;
  onSecondButtonClick?: () => void;
  secondButtonEndIcon?: ReactNode;
  secondButtonStartIcon?: React.ReactNode;
}) => {
  const { i18n } = useLingui();
  const auth = useAuth();
  const userName = auth.userInfo?.displayName || "";

  const forUserNameValue = i18n._(`for {USER_NAME}`, { USER_NAME: userName });

  const titleWithTemplate = title
    ? replacePlaceholders(title, {
        "{FOR_USER_NAME}": userName ? forUserNameValue : "",
      })
    : title;

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
          {titleWithTemplate && (
            <Typography
              variant="h4"
              sx={{
                fontWeight: 660,
                lineHeight: "1.2",
              }}
            >
              {titleWithTemplate}
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

          {!!options?.length && onSelectOptionsChange && (
            <>
              <Stack
                sx={{
                  paddingTop: "30px",
                  gap: "10px",
                }}
              >
                {options.map((option) => {
                  const isSelected = selectedOptions?.some(
                    (selected) => selected.label === option.label
                  );
                  return (
                    <Stack
                      key={option.label}
                      component={"button"}
                      onClick={() => {
                        let newSelectedOptions: QuizOption[] = [];
                        if (multipleSelection) {
                          if (isSelected) {
                            newSelectedOptions =
                              selectedOptions?.filter(
                                (selected) => selected.label !== option.label
                              ) || [];
                          } else {
                            newSelectedOptions = [...(selectedOptions || []), option];
                          }
                        } else {
                          newSelectedOptions = isSelected ? [] : [option];
                        }
                        onSelectOptionsChange(newSelectedOptions);
                      }}
                      sx={{
                        cursor: "pointer",
                        color: "inherit",
                        padding: "5px 8px",
                        flexDirection: "row",
                        gap: "5px",
                        alignItems: "center",
                        textAlign: "left",
                        borderRadius: "8px",
                        border: isSelected
                          ? "2px solid rgb(96, 165, 250)"
                          : "2px solid rgba(96, 165, 250, 0.1)",
                        backgroundColor: isSelected ? "rgba(96, 165, 250, 0.1)" : "transparent",
                        "&:hover": {
                          backgroundColor: isSelected
                            ? "rgba(96, 165, 250, 0.15)"
                            : "rgba(255, 255, 255, 0.05)",
                        },
                      }}
                    >
                      <Checkbox
                        checked={isSelected}
                        sx={{
                          pointerEvents: "none",
                        }}
                      />
                      <Stack
                        sx={{
                          width: "100%",
                          flexDirection: "row",
                          justifyContent: "space-between",
                          alignItems: "center",
                          paddingRight: "10px",
                        }}
                      >
                        <Stack
                          sx={{
                            alignItems: "flex-start",
                          }}
                        >
                          <Typography variant="body1">{option.label}</Typography>
                          {option.subTitle && (
                            <Typography
                              variant="body2"
                              sx={{
                                opacity: 0.7,
                              }}
                            >
                              {option.subTitle}
                            </Typography>
                          )}
                        </Stack>
                        {option.iconImageUrl && (
                          <Stack
                            component={"img"}
                            src={option.iconImageUrl}
                            sx={{
                              width: "20px",
                              height: "20px",
                              objectFit: "cover",
                              backgroundColor: "rgba(255,0,0,0.05)",
                            }}
                          />
                        )}
                      </Stack>
                    </Stack>
                  );
                })}
              </Stack>
            </>
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
          type="button"
          secondButtonEndIcon={secondButtonEndIcon}
          secondButtonTitle={secondButtonTitle}
          onSecondButtonClick={onSecondButtonClick}
          secondButtonStartIcon={secondButtonStartIcon}
        />
      </Stack>
    </Stack>
  );
};
