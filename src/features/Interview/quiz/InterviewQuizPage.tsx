"use client";

import { SupportedLanguage } from "@/features/Lang/lang";
import { InterviewCoreData, InterviewQuiz } from "../types";
import { Button, Stack, Typography } from "@mui/material";
import { QuizProgressBar } from "@/features/Goal/Quiz/components/QuizProgressBar";
import { InfoStep } from "@/features/Survey/InfoStep";
import { useLingui } from "@lingui/react";
import { useInterviewQuiz } from "./hooks/useInterviewQuiz/useInterviewQuiz";
import { AuthWall } from "@/features/Auth/AuthWall";
import { RecordUserAudio } from "@/features/Goal/Quiz/RecordUserAudio";
import { MIN_CHARACTERS_FOR_TRANSCRIPT } from "./hooks/useInterviewQuiz/data";
import { IconTextList } from "@/features/Survey/IconTextList";
import { CardValidatorQuiz } from "@/features/PayWall/CardValidator";
import { LoadingShapes } from "@/features/uiKit/Loading/LoadingShapes";
import { Markdown } from "@/features/uiKit/Markdown/Markdown";
import { Clock, Trash } from "lucide-react";
import { useDeleteAccount } from "@/features/Auth/useDeleteAccount";
import { InterviewInfoStep } from "@/features/Survey/InterviewInfoStep";
import { ScorePreviewCard } from "../Landing/components/ScorePreviewSection";

export interface InterviewQuizPageProps {
  interviewCoreData: InterviewCoreData;
  interviewQuiz: InterviewQuiz;
  lang: SupportedLanguage;
  id: string;
}

export const InterviewQuizPage = ({ interviewCoreData, lang, id }: InterviewQuizPageProps) => {
  const quiz = useInterviewQuiz();
  const stepType = quiz.currentStep?.type;
  const { i18n } = useLingui();
  const deleteAccount = useDeleteAccount({ startPage: quiz.mainPageUrl });

  const survey = quiz.survey;
  const width = "600px";

  const jsonScoreFeedback =
    survey?.results[quiz.currentStep?.id || ""]?.jsonScoreFeedback || undefined;

  const isAnalyzingInputs = !!quiz.currentStep && !!quiz.isAnalyzingInputs[quiz.currentStep.id];

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
          <InterviewInfoStep
            message={quiz.currentStep.title}
            subMessage={quiz.currentStep.subTitle || ""}
            imageUrl={quiz.currentStep.imageUrl}
            actionButtonTitle={quiz.currentStep.buttonTitle || i18n._("Next")}
            width={width}
            subComponent={
              <Stack
                sx={{
                  alignItems: "center",
                  paddingTop: "30px",
                }}
              >
                <IconTextList listItems={quiz.currentStep.listItems || []} />
              </Stack>
            }
            onClick={() => quiz.nextStep()}
          />
        )}

        {stepType === "record-audio" && quiz.currentStep && (
          <AuthWall>
            <RecordUserAudio
              title={""}
              subTitle={""}
              subTitleComponent={
                <Stack
                  sx={{
                    gap: "0px",
                    paddingBottom: "40px",
                  }}
                >
                  <Typography
                    sx={{
                      opacity: 0.8,
                    }}
                    variant="body2"
                  >
                    {quiz.currentStep.title}
                  </Typography>
                  <Typography
                    variant="h5"
                    sx={{
                      fontWeight: 660,
                      paddingBottom: "20px",
                    }}
                  >
                    {quiz.currentStep.subTitle}
                  </Typography>

                  <IconTextList listItems={quiz.currentStep.listItems || []} />
                </Stack>
              }
              transcript={survey?.answers[quiz.currentStep.id]?.answerTranscription || ""}
              minWords={MIN_CHARACTERS_FOR_TRANSCRIPT}
              lang={lang}
              nextStep={quiz.nextStep}
              updateTranscript={async (combinedTranscript) => {
                await quiz.updateAnswerTranscription(
                  quiz.currentStep?.id || "",
                  combinedTranscript
                );
              }}
              width={width}
            />
          </AuthWall>
        )}

        {stepType === "analyze-inputs" && quiz.currentStep && (
          <AuthWall>
            <InfoStep
              subComponent={
                <Stack
                  sx={{
                    paddingTop: "30px",
                    paddingBottom: "40px",
                    width: "100%",
                  }}
                >
                  <Typography
                    sx={{
                      opacity: 0.8,
                    }}
                    variant="body2"
                  >
                    {quiz.currentStep.title}
                  </Typography>
                  <Typography
                    variant="h5"
                    sx={{
                      fontWeight: 660,
                      paddingBottom: "20px",
                    }}
                  >
                    {quiz.currentStep.subTitle}
                  </Typography>

                  {quiz.survey?.results[quiz.currentStep.id]?.markdownFeedback &&
                  !isAnalyzingInputs ? (
                    <Stack>
                      <Markdown>
                        {quiz.survey?.results[quiz.currentStep.id]?.markdownFeedback || ""}
                      </Markdown>
                    </Stack>
                  ) : null}

                  {jsonScoreFeedback && !isAnalyzingInputs && (
                    <Stack>
                      <ScorePreviewCard scorePreview={jsonScoreFeedback} />
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
              onClick={() => quiz.nextStep()}
            />
          </AuthWall>
        )}

        {stepType === "paywall" && quiz.currentStep && (
          <AuthWall>
            <CardValidatorQuiz lang={lang} onNextStep={quiz.nextStep} />
          </AuthWall>
        )}

        {stepType === "waitlist-done" && quiz.currentStep && (
          <InfoStep
            imageUrl={quiz.currentStep.imageUrl}
            subComponent={
              <Stack
                sx={{
                  paddingTop: "30px",
                  alignItems: "flex-start",
                  gap: "10px",
                }}
              >
                <Typography
                  sx={{
                    opacity: 0.8,
                  }}
                  variant="body2"
                >
                  {quiz.currentStep.title}
                </Typography>
                <Typography
                  variant="body1"
                  sx={{
                    //fontWeight: 660,
                    paddingBottom: "20px",
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
                  endIcon={<Trash size={"17px"} />}
                  onClick={() => deleteAccount.onDeleteAccount()}
                >
                  {deleteAccount.isDeletingAccount
                    ? i18n._("Removing your data from the waitlist...")
                    : i18n._("Remove my data from the waitlist")}
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
