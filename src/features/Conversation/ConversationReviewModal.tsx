import { IconButton, Stack, Typography } from "@mui/material";
import { CustomModal } from "../uiKit/Modal/CustomModal";
import { useLingui } from "@lingui/react";
import { PositionChanged } from "../Game/PositionChanged";
import { ConversationResult } from "../Plan/types";
import { useState } from "react";
import { InfoStep } from "../Survey/InfoStep";
import { useTranslate } from "../Translation/useTranslate";
import { Languages } from "lucide-react";
import { Markdown } from "../uiKit/Markdown/Markdown";

type Step =
  | "game"
  | "shortSummaryOfLesson"
  | "whatToFocusOnNextTime"
  | "whatUserCanImprove"
  | "whatUserDidWell"
  | "finish";

export const ConversationReviewModal = ({
  setIsShowAnalyzeConversationModal,
  conversationAnalysisResult,

  setIsConversationContinueAfterAnalyze,
  pointsEarned,

  openNextLesson,
}: {
  setIsShowAnalyzeConversationModal: (value: boolean) => void;
  conversationAnalysisResult: ConversationResult | null;

  setIsConversationContinueAfterAnalyze: (value: boolean) => void;
  pointsEarned: number;

  openNextLesson: () => void;
  openCommunityPage: () => void;
}) => {
  const { i18n } = useLingui();

  const translator = useTranslate();

  const onDone = () => {
    setIsShowAnalyzeConversationModal(false);
    setIsConversationContinueAfterAnalyze(true);
    openNextLesson();
  };

  const steps: Step[] = [
    "game",
    "shortSummaryOfLesson",
    "whatToFocusOnNextTime",
    "whatUserCanImprove",
    "whatUserDidWell",
    "finish",
  ];
  const [step, setStep] = useState<Step>(steps[0]);

  const onNext = () => {
    const currentStepIndex = steps.indexOf(step);
    const isLastStep = currentStepIndex === steps.length - 1;
    if (isLastStep) {
      onDone();
      return;
    }

    if (currentStepIndex < steps.length - 1) {
      setStep(steps[currentStepIndex + 1]);
    }
  };

  return (
    <CustomModal isOpen={true} onClose={() => setIsShowAnalyzeConversationModal(false)}>
      {translator.translateModal}

      <Stack
        sx={{
          maxWidth: "700px",
          width: "100%",
        }}
      >
        {step == "game" && (
          <InfoStep
            title={i18n._("Leaderboard")}
            subTitle={i18n._(
              `Points earned: {pointsEarned}. Keep practicing to improve your score!`,
              {
                pointsEarned,
              }
            )}
            subComponent={<PositionChanged />}
            onClick={onNext}
          />
        )}

        {step == "shortSummaryOfLesson" && (
          <InfoStep
            title={i18n._("Summary")}
            isStepLoading={!conversationAnalysisResult}
            subComponent={
              <TranslatableComponent
                message={conversationAnalysisResult?.shortSummaryOfLesson || i18n._("Loading...")}
                isLoading={!conversationAnalysisResult}
              />
            }
            disabled={!conversationAnalysisResult}
            onClick={onNext}
          />
        )}

        {step == "whatToFocusOnNextTime" && (
          <InfoStep
            isStepLoading={!conversationAnalysisResult}
            title={i18n._("What to focus on next time")}
            subComponent={
              <TranslatableComponent
                message={conversationAnalysisResult?.whatToFocusOnNextTime || i18n._("Loading...")}
                isLoading={!conversationAnalysisResult}
              />
            }
            disabled={!conversationAnalysisResult}
            onClick={onNext}
          />
        )}

        {step == "whatUserCanImprove" && (
          <InfoStep
            isStepLoading={!conversationAnalysisResult}
            title={i18n._("What you can improve")}
            subComponent={
              <TranslatableComponent
                message={conversationAnalysisResult?.whatUserCanImprove || i18n._("Loading...")}
                isLoading={!conversationAnalysisResult}
              />
            }
            disabled={!conversationAnalysisResult}
            onClick={onNext}
          />
        )}

        {step == "whatUserDidWell" && (
          <InfoStep
            title={i18n._("What you did well")}
            isStepLoading={!conversationAnalysisResult}
            subComponent={
              <TranslatableComponent
                message={conversationAnalysisResult?.whatUserDidWell || i18n._("Loading...")}
                isLoading={!conversationAnalysisResult}
              />
            }
            disabled={!conversationAnalysisResult}
            onClick={onNext}
          />
        )}

        {step == "finish" && (
          <InfoStep
            isStepLoading={!conversationAnalysisResult}
            title={i18n._("Next Step")}
            subComponent={
              <TranslatableComponent
                message={i18n._("Continue practicing to improve your skills.")}
                isLoading={!conversationAnalysisResult}
                skipTranslation
              />
            }
            disabled={!conversationAnalysisResult}
            onClick={onNext}
            actionButtonTitle={i18n._("Next Lesson")}
          />
        )}
      </Stack>
    </CustomModal>
  );
};

const TranslatableComponent = ({
  message,
  isLoading,
  skipTranslation,
}: {
  message: string;
  isLoading?: boolean;
  skipTranslation?: boolean;
}) => {
  const translator = useTranslate();

  const [translatedText, setTranslatedText] = useState("");
  const [isTranslating, setIsTranslating] = useState(false);

  const toggleTranslation = async () => {
    if (isLoading) return;
    setIsTranslating(true);
    if (translatedText) {
      setTranslatedText("");
    } else {
      const result = await translator.translateText({ text: message || "" });
      setTranslatedText("\n" + result.trim());
    }
    setIsTranslating(false);
  };

  const text = translatedText || "\n" + (message || "").trim();

  return (
    <Stack
      sx={{
        gap: "0px",
        alignItems: "flex-start",
      }}
      className={`${isLoading ? "loading-shimmer" : ""}`}
    >
      {translator.translateModal}
      <Markdown
        onWordClick={
          translator.isTranslateAvailable && !translatedText && !skipTranslation
            ? (word, element) => {
                translator.translateWithModal(word, element);
              }
            : undefined
        }
        variant="conversation"
      >
        {text}
      </Markdown>

      {translator.isTranslateAvailable && text && !skipTranslation && (
        <IconButton
          onClick={toggleTranslation}
          disabled={isTranslating}
          sx={{
            opacity: isLoading ? 0.5 : 1,
          }}
        >
          <Languages size={"16px"} color={isTranslating ? "#4cd1fdff" : "#eee"} />
        </IconButton>
      )}
    </Stack>
  );
};
