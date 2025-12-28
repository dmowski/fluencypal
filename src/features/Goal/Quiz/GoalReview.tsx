"use client";
import { Stack, Typography } from "@mui/material";
import { useWindowSizes } from "../../Layout/useWindowSizes";
import { useLingui } from "@lingui/react";
import { ArrowRight } from "lucide-react";
import { useQuiz } from "./useQuiz";
import { PlanCard } from "@/features/Plan/PlanCard";
import { PlanElementMode } from "@/features/Plan/types";
import { cardColors, modeCardProps } from "@/features/Plan/data";
import { LoadingShapes } from "@/features/uiKit/Loading/LoadingShapes";
import { FooterButton } from "../../Survey/FooterButton";
import { useAuth } from "@/features/Auth/useAuth";

export const GoalReview = ({ onClick }: { onClick: () => void }) => {
  const { i18n } = useLingui();
  const sizes = useWindowSizes();
  const quiz = useQuiz();

  const modeLabels: Record<PlanElementMode, string> = {
    conversation: i18n._(`Conversation`),
    play: i18n._(`Role Play`),
    words: i18n._(`Words`),
    rule: i18n._(`Rule`),
  };

  const auth = useAuth();
  const username = auth.userInfo?.displayName;

  const isLoading = quiz.isGoalGenerating || quiz.survey?.goalData === null;

  return (
    <Stack
      sx={{
        gap: "0px",
      }}
    >
      <Stack
        sx={{
          width: "100%",
          alignItems: "center",
          //justifyContent: "center",
          gap: "10px",
          padding: "0 10px",
          minHeight: `calc(100dvh - ${sizes.topOffset} - ${sizes.bottomOffset} - 190px)`,
          //backgroundColor: "rgba(240, 0, 0, 0.1)",
        }}
      >
        <img
          src={"/avatar/map.webp"}
          style={{
            width: "190px",
            height: "190px",
          }}
        />
        <Stack
          sx={{
            alignItems: "center",
            width: "100%",
            gap: "30px",
          }}
        >
          <Stack>
            <Typography
              variant="caption"
              align="center"
              sx={{
                opacity: 0.7,
                textTransform: "uppercase",
              }}
            >
              {username ? i18n._(`Plan for`) + " " + username : i18n._(`Your plan for learning`)}
            </Typography>
            <Typography
              variant="h5"
              align="center"
              sx={{
                fontWeight: 660,
                lineHeight: "1.2",
              }}
              className={isLoading ? "loading-shimmer" : ""}
            >
              {isLoading ? i18n._("Loading..") : quiz.survey?.goalData?.title}
            </Typography>
          </Stack>
          <Stack
            sx={{
              width: "100%",
            }}
          >
            {isLoading ? (
              <LoadingShapes sizes={["100px", "100px", "100px", "100px", "100px", "100px"]} />
            ) : (
              <Stack
                sx={{
                  gap: "15px",
                }}
              >
                {quiz.survey?.goalData?.elements.map((planElement, index, sortedElements) => {
                  const cardInfo = modeCardProps[planElement.mode];
                  const colorIndex = index % cardColors.length;
                  const cardColor = cardColors[colorIndex];
                  const elementsWithSameMode =
                    sortedElements.filter((element) => element.mode === planElement.mode) || [];
                  const currentElementIndex = elementsWithSameMode.findIndex(
                    (element) => element.id === planElement.id
                  );

                  const imageVariants = cardInfo.imgUrl;
                  const imageIndex = currentElementIndex % imageVariants.length;
                  const imageUrl = imageVariants[imageIndex];
                  return (
                    <Stack key={index} sx={{}}>
                      <PlanCard
                        id={planElement.id}
                        key={planElement.id}
                        delayToShow={index * 80}
                        title={planElement.title}
                        subTitle={modeLabels[planElement.mode]}
                        description={planElement.description}
                        details={planElement.details}
                        isDone={false}
                        isActive={false}
                        isContinueLabel={false}
                        onClick={() => {}}
                        viewOnly
                        startColor={cardColor.startColor}
                        progressPercent={Math.min((planElement.startCount || 0) * 10, 100)}
                        endColor={cardColor.endColor}
                        bgColor={cardColor.bgColor}
                        isLast={index === sortedElements.length - 1}
                        icon={
                          <Stack>
                            <Stack className="avatar">
                              <img src={imageUrl} alt="" />
                            </Stack>
                          </Stack>
                        }
                        actionLabel={i18n._(`Start`)}
                      />
                    </Stack>
                  );
                })}
              </Stack>
            )}
          </Stack>
        </Stack>
      </Stack>

      <FooterButton
        disabled={isLoading}
        onClick={onClick}
        title={i18n._("Next")}
        endIcon={<ArrowRight />}
      />
    </Stack>
  );
};
