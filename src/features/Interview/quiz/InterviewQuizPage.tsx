"use client";

import { SupportedLanguage } from "@/features/Lang/lang";
import { Button, Stack, Typography } from "@mui/material";
import { QuizProgressBar } from "@/features/Goal/Quiz/components/QuizProgressBar";
import { InfoStep } from "@/features/Survey/InfoStep";
import { useLingui } from "@lingui/react";
import { useInterviewQuiz } from "./hooks/useInterviewQuiz/useInterviewQuiz";
import { RecordUserAudio } from "@/features/Goal/Quiz/RecordUserAudio";
import { MIN_CHARACTERS_FOR_TRANSCRIPT } from "./hooks/useInterviewQuiz/data";
import { IconTextList } from "@/features/Survey/IconTextList";
import { CardValidatorQuiz } from "@/features/PayWall/CardValidator";
import { LoadingShapes } from "@/features/uiKit/Loading/LoadingShapes";
import { Markdown } from "@/features/uiKit/Markdown/Markdown";
import { Clock, Trash } from "lucide-react";
import { useDeleteAccount } from "@/features/Auth/useDeleteAccount";
import { ScorePreviewCard } from "../Landing/components/ScorePreviewSection";
import { InterviewAuthWall } from "@/features/Auth/InterviewAuthWall";
import { QuizPageLoader } from "./QuizPageLoader";

export interface InterviewQuizPageProps {
  lang: SupportedLanguage;
}

export const InterviewQuizPage = ({ lang }: InterviewQuizPageProps) => {
  const quiz = useInterviewQuiz();
  const stepType = quiz.currentStep?.type;
  const { i18n } = useLingui();
  const deleteAccount = useDeleteAccount({ startPage: quiz.mainPageUrl });

  const survey = quiz.survey;
  const width = "600px";

  const jsonScoreFeedback =
    survey?.results[quiz.currentStep?.id || ""]?.jsonScoreFeedback || undefined;
  const markdownFeedback =
    survey?.results[quiz.currentStep?.id || ""]?.markdownFeedback || undefined;

  const isAnalyzingInputs = !!quiz.currentStep && !!quiz.isAnalyzingInputs[quiz.currentStep.id];

  if (quiz.isNavigateToMainPage) {
    return <QuizPageLoader />;
  }

  return (
    <Stack
      component={"main"}
      sx={{
        width: "100%",
        paddingTop: `10px`,
        paddingBottom: `10px`,
        alignItems: "center",
      }}
    >
      <QuizProgressBar
        navigateToMainPage={quiz.navigateToMainPage}
        isCanGoToMainPage={quiz.isCanGoToMainPage}
        isFirstStep={quiz.isFirstStep}
        prevStep={quiz.prevStep}
        progress={quiz.progress}
        width={width}
      />
      <Stack
        sx={{
          maxWidth: width,
          padding: "0 10px",
          width: "100%",
        }}
      >
        {stepType === "info" && quiz.currentStep && (
          <InfoStep
            title={quiz.currentStep.title}
            subTitle={quiz.currentStep.subTitle || ""}
            imageUrl={quiz.currentStep.imageUrl}
            imageAspectRatio={quiz.currentStep.imageAspectRatio}
            actionButtonTitle={quiz.currentStep.buttonTitle || i18n._("Next")}
            width={width}
            listItems={quiz.currentStep.listItems}
            onClick={() => quiz.nextStep()}
          />
        )}

        {stepType === "options" && quiz.currentStep && (
          <InterviewAuthWall width={width}>
            <InfoStep
              title={quiz.currentStep.title}
              subTitle={quiz.currentStep.subTitle || ""}
              actionButtonTitle={quiz.currentStep.buttonTitle || i18n._("Next")}
              width={width}
              disabled={quiz.survey?.answers[quiz.currentStep.id] ? false : true}
              onClick={() => quiz.nextStep()}
              options={quiz.currentStep.options}
              multipleSelection={quiz.currentStep.multipleSelection}
              selectedOptions={quiz.getSelectedOptionsForStep(quiz.currentStep.id)}
              onSelectOptionsChange={(selectedOptions) =>
                quiz.updateSelectedOptionsForStep(quiz.currentStep?.id || "", selectedOptions)
              }
            />
          </InterviewAuthWall>
        )}

        {stepType === "record-audio" && quiz.currentStep && (
          <InterviewAuthWall width={width}>
            <RecordUserAudio
              title={quiz.currentStep.title || ""}
              subTitle={quiz.currentStep.subTitle}
              listItems={quiz.currentStep.listItems}
              transcript={survey?.answers[quiz.currentStep.id]?.answer || ""}
              minWords={MIN_CHARACTERS_FOR_TRANSCRIPT}
              lang={lang}
              nextStep={quiz.nextStep}
              updateTranscript={async (combinedTranscript) => {
                await quiz.updateAnswerTranscription(
                  quiz.currentStep?.id || "",
                  combinedTranscript
                );
              }}
            />
          </InterviewAuthWall>
        )}

        {stepType === "analyze-inputs" && quiz.currentStep && (
          <InterviewAuthWall width={width}>
            <InfoStep
              title={quiz.currentStep.title}
              subTitle={quiz.currentStep.subTitle}
              subComponent={
                <Stack
                  sx={{
                    paddingTop: "10px",
                    width: "100%",
                  }}
                >
                  {!isAnalyzingInputs && (
                    <Stack>
                      {markdownFeedback && <Markdown>{markdownFeedback || ""}</Markdown>}
                      {jsonScoreFeedback && <ScorePreviewCard scorePreview={jsonScoreFeedback} />}
                    </Stack>
                  )}

                  {isAnalyzingInputs && (
                    <Stack
                      sx={{
                        gap: "10px",
                      }}
                    >
                      <Typography
                        variant="body2"
                        sx={{
                          opacity: 0.8,
                        }}
                      >
                        {i18n._("Analyzing your inputs...")}
                      </Typography>
                      <LoadingShapes sizes={["20px", "100px", "20px", "100px"]} />
                    </Stack>
                  )}

                  {quiz.isAnalyzingInputsError[quiz.currentStep.id] && (
                    <Typography color="error">
                      {quiz.isAnalyzingInputsError[quiz.currentStep.id]}
                    </Typography>
                  )}
                </Stack>
              }
              actionButtonTitle={quiz.currentStep.buttonTitle}
              disabled={quiz.isAnalyzingInputs[quiz.currentStep.id]}
              onClick={quiz.nextStep}
            />
          </InterviewAuthWall>
        )}

        {stepType === "paywall" && quiz.currentStep && (
          <InterviewAuthWall width={width}>
            <CardValidatorQuiz lang={lang} onNextStep={quiz.nextStep} />
          </InterviewAuthWall>
        )}

        {stepType === "waitlist-done" && quiz.currentStep && (
          <InfoStep
            imageUrl={quiz.currentStep.imageUrl}
            title={quiz.currentStep.title}
            subComponent={
              <Stack
                sx={{
                  paddingTop: "10px",
                  alignItems: "flex-start",
                  gap: "10px",
                }}
              >
                <Typography
                  variant="body1"
                  sx={{
                    //fontWeight: 660,
                    paddingBottom: "0px",
                    // keep new line breaks
                    whiteSpace: "pre-line",
                  }}
                >
                  {quiz.currentStep.subTitle}
                </Typography>
                <Button
                  variant="text"
                  color="error"
                  disabled={deleteAccount.isDeletingAccount}
                  sx={{
                    color: "#ef5350",
                  }}
                  startIcon={<Trash size={"17px"} />}
                  onClick={() => deleteAccount.onDeleteAccount()}
                >
                  {deleteAccount.isDeletingAccount
                    ? i18n._("Removing your data...")
                    : i18n._("Remove my data (delete account)")}
                </Button>
                <IconTextList listItems={quiz.currentStep.listItems || []} />
              </Stack>
            }
            disabled
            actionButtonEndIcon={<Clock size={"17px"} />}
            actionButtonTitle={i18n._("You are on the waitlist")}
            onClick={() => quiz.nextStep()}
          />
        )}
      </Stack>
    </Stack>
  );
};
