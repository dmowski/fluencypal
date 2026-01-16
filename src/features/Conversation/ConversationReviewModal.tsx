import { Stack } from "@mui/material";
import { CustomModal } from "../uiKit/Modal/CustomModal";
import { useLingui } from "@lingui/react";
import { PositionChanged } from "../Game/PositionChanged";
import { ConversationResult } from "../Plan/types";
import { useState } from "react";
import { InfoStep } from "../Survey/InfoStep";

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

  console.log("step", step);

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
            subTitle={conversationAnalysisResult?.shortSummaryOfLesson || i18n._("Loading...")}
            disabled={!conversationAnalysisResult}
            onClick={onNext}
          />
        )}

        {step == "whatToFocusOnNextTime" && (
          <InfoStep
            isStepLoading={!conversationAnalysisResult}
            title={i18n._("What to focus on next time")}
            subTitle={conversationAnalysisResult?.whatToFocusOnNextTime || i18n._("Loading...")}
            disabled={!conversationAnalysisResult}
            onClick={onNext}
          />
        )}

        {step == "whatUserCanImprove" && (
          <InfoStep
            isStepLoading={!conversationAnalysisResult}
            title={i18n._("What you can improve")}
            subTitle={conversationAnalysisResult?.whatUserCanImprove || i18n._("Loading...")}
            disabled={!conversationAnalysisResult}
            onClick={onNext}
          />
        )}

        {step == "whatUserDidWell" && (
          <InfoStep
            title={i18n._("What you did well")}
            isStepLoading={!conversationAnalysisResult}
            subTitle={conversationAnalysisResult?.whatUserDidWell || i18n._("Loading...")}
            disabled={!conversationAnalysisResult}
            onClick={onNext}
          />
        )}

        {step == "finish" && (
          <InfoStep
            isStepLoading={!conversationAnalysisResult}
            title={i18n._("Next Step")}
            subTitle={i18n._("Continue practicing to improve your skills.")}
            disabled={!conversationAnalysisResult}
            onClick={onNext}
            actionButtonTitle={i18n._("Next Lesson")}
          />
        )}
      </Stack>
    </CustomModal>
  );
};
