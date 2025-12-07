"use client";

import { Stack } from "@mui/material";
import { fullLanguageName, SupportedLanguage } from "@/features/Lang/lang";
import { useLingui } from "@lingui/react";
import { MIN_WORDS_FOR_ANSWER, QuizProvider, useQuiz } from "./useQuiz";
import { useLanguageGroup } from "../useLanguageGroup";
import { Trans } from "@lingui/react/macro";
import { WebViewWall } from "@/features/Auth/WebViewWall";
import { AuthWall } from "@/features/Auth/AuthWall";
import { ProgressBar } from "./ProgressBar";
import { LanguageToLearnSelector } from "./LanguageToLearnSelector";
import { InfoStep } from "../../Survey/InfoStep";
import { NativeLanguageSelector } from "./NativeLanguageSelector";
import { PageLanguageSelector } from "./PageLanguageSelector";
import { AboutYourselfList } from "./AboutYourselfList";
import { RecordUserAudio } from "./RecordUserAudio";
import { RecordAboutFollowUp } from "./RecordAboutFollowUp";
import { GoalReview } from "./GoalReview";

const QuizQuestions = () => {
  const {
    currentStep,
    isFirstLoading,
    survey,
    nativeLanguage,
    updateSurvey,
    languageToLearn,
    isFollowUpGenerating,
    isGoalQuestionGenerating,
    isStepLoading,
    nextStep,
  } = useQuiz();
  const { i18n } = useLingui();

  const { languageGroups } = useLanguageGroup({
    defaultGroupTitle: i18n._(`Other languages`),
    systemLanguagesTitle: i18n._(`System languages`),
  });

  const learningLanguageName = fullLanguageName[languageToLearn].toLocaleLowerCase();
  const nativeLanguageName =
    languageGroups.find((g) => g.languageCode === nativeLanguage)?.nativeName || "";

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
      <ProgressBar />

      {!isFirstLoading && (
        <Stack
          sx={{
            maxWidth: "600px",
            padding: "0 10px",
            width: "100%",
          }}
        >
          {currentStep === "learnLanguage" && <LanguageToLearnSelector />}

          {currentStep === "before_nativeLanguage" && (
            <InfoStep
              imageUrl="/avatar/book.webp"
              message={i18n._(`What language do you speak`)}
              subMessage={i18n._(`So I can translate words for you`)}
              actionButtonTitle={i18n._(`Set My Language`)}
              onClick={nextStep}
              disabled={isStepLoading}
              isStepLoading={isStepLoading}
            />
          )}

          {currentStep === "nativeLanguage" && <NativeLanguageSelector />}

          {currentStep === "before_pageLanguage" && (
            <InfoStep
              message={i18n._(`Choose Site Language`)}
              subMessage={i18n._(`This is text you see on buttons and menus`)}
              imageUrl="/illustrations/ui-schema.png"
              onClick={nextStep}
              disabled={isStepLoading}
              isStepLoading={isStepLoading}
            />
          )}

          {currentStep === "pageLanguage" && <PageLanguageSelector />}

          {currentStep === "before_recordAbout" && (
            <AuthWall>
              <InfoStep
                message={i18n._(`We are ready`)}
                subMessage={i18n._(`Let's talk. Tell me  about yourself`)}
                imageUrl="/avatar/owl1.png"
                subComponent={
                  <Stack
                    sx={{
                      paddingTop: "20px",
                    }}
                  >
                    <AboutYourselfList />
                  </Stack>
                }
                onClick={nextStep}
                disabled={isStepLoading}
                isStepLoading={isStepLoading}
              />
            </AuthWall>
          )}

          {currentStep === "recordAbout" && (
            <AuthWall>
              <RecordUserAudio
                title={i18n._("Tell me about yourself")}
                subTitle={
                  languageToLearn === nativeLanguage ? (
                    <Trans>
                      Record 2-3 minutes story using <b>{learningLanguageName}</b>
                    </Trans>
                  ) : (
                    <Trans>
                      Record 2-3 minutes story using <b>{learningLanguageName}</b> or{" "}
                      <b>{nativeLanguageName}</b>
                    </Trans>
                  )
                }
                subTitleComponent={<AboutYourselfList />}
                transcript={survey?.aboutUserTranscription || ""}
                minWords={MIN_WORDS_FOR_ANSWER}
                updateTranscript={async (combinedTranscript) => {
                  if (!survey) {
                    return;
                  }

                  await updateSurvey(
                    {
                      ...survey,
                      aboutUserTranscription: combinedTranscript,
                    },
                    "recordAbout UI"
                  );
                }}
              />
            </AuthWall>
          )}

          {currentStep === "before_recordAboutFollowUp" && (
            <AuthWall>
              <InfoStep
                message={i18n._(`Wow, that was awesome!`)}
                subMessage={i18n._(`Let's continue, I have a question for you!`)}
                imageUrl="/avatar/owl1.png"
                subComponent={
                  <Stack
                    sx={{
                      paddingTop: "20px",
                    }}
                  ></Stack>
                }
                onClick={nextStep}
                disabled={isStepLoading}
                isStepLoading={isStepLoading}
              />
            </AuthWall>
          )}

          {currentStep === "recordAboutFollowUp" && (
            <AuthWall>
              <RecordAboutFollowUp
                question={survey?.aboutUserFollowUpQuestion || null}
                transcript={survey?.aboutUserFollowUpTranscription || ""}
                loading={isFollowUpGenerating}
                updateTranscript={async (combinedTranscript) => {
                  if (!survey) {
                    return;
                  }

                  await updateSurvey(
                    {
                      ...survey,
                      aboutUserFollowUpTranscription: combinedTranscript,
                    },
                    "recordAboutFollowUp UI"
                  );
                }}
              />
            </AuthWall>
          )}

          {currentStep === "before_recordAboutFollowUp2" && (
            <AuthWall>
              <InfoStep
                message={i18n._(`Before the training plan...`)}
                subMessage={i18n._(`Let's talk about your goals a bit more`)}
                imageUrl="/avatar/owl1.png"
                subComponent={
                  <Stack
                    sx={{
                      paddingTop: "20px",
                    }}
                  ></Stack>
                }
                onClick={nextStep}
                disabled={isStepLoading}
                isStepLoading={isStepLoading}
              />
            </AuthWall>
          )}

          {currentStep === "recordAboutFollowUp2" && (
            <AuthWall>
              <RecordAboutFollowUp
                question={survey?.goalFollowUpQuestion || null}
                transcript={survey?.goalUserTranscription || ""}
                loading={isGoalQuestionGenerating}
                updateTranscript={async (combinedTranscript) => {
                  if (!survey) {
                    return;
                  }

                  await updateSurvey(
                    {
                      ...survey,
                      goalUserTranscription: combinedTranscript,
                    },
                    "recordAboutFollowUp2 UI"
                  );
                }}
              />
            </AuthWall>
          )}

          {currentStep === "before_goalReview" && (
            <AuthWall>
              <InfoStep
                message={i18n._(`Now, we ready to create your learning plan`)}
                subMessage={i18n._(`It might take up to a minute`)}
                imageUrl="/avatar/owl1.png"
                subComponent={
                  <Stack
                    sx={{
                      paddingTop: "20px",
                    }}
                  ></Stack>
                }
                onClick={nextStep}
                disabled={isStepLoading}
                isStepLoading={isStepLoading}
              />
            </AuthWall>
          )}

          {currentStep === "goalReview" && (
            <AuthWall>
              <GoalReview />
            </AuthWall>
          )}
        </Stack>
      )}
    </Stack>
  );
};

interface QuizPageProps {
  lang: SupportedLanguage;
  defaultLangToLearn: SupportedLanguage;
}
export const QuizPage2 = ({ lang, defaultLangToLearn }: QuizPageProps) => {
  return (
    <QuizProvider pageLang={lang} defaultLangToLearn={defaultLangToLearn}>
      <WebViewWall>
        <QuizQuestions />
      </WebViewWall>
    </QuizProvider>
  );
};
