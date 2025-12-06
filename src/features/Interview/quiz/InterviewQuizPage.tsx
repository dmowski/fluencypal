"use client";

import { SupportedLanguage } from "@/features/Lang/lang";
import { InterviewCoreData, InterviewQuiz } from "../types";
import { getUrlStart } from "@/features/Lang/getUrlStart";
import { PracticeProvider } from "@/app/practiceProvider";
import { WebViewWall } from "@/features/Auth/WebViewWall";
import { Stack } from "@mui/material";
import { QuizProgressBar } from "@/features/Goal/Quiz/components/QuizProgressBar";
import { useRouter } from "next/navigation";
import { InfoStep } from "@/features/Survey/InfoStep";
import { AboutYourselfList } from "@/features/Goal/Quiz/AboutYourselfList";
import { useLingui } from "@lingui/react";

export interface InterviewQuizPageProps {
  interviewCoreData: InterviewCoreData;
  interviewQuiz: InterviewQuiz;
  lang: SupportedLanguage;
  id: string;
}

export const InterviewQuizPage = ({ interviewCoreData, lang, id }: InterviewQuizPageProps) => {
  const pageUrl = getUrlStart(lang) + `interview/${id}`;
  const { i18n } = useLingui();
  const router = useRouter();
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
        navigateToMainPage={function (): void {
          router.push(pageUrl);
        }}
        isCanGoToMainPage={true}
        isFirstStep={true}
        prevStep={function (): void {
          throw new Error("Function not implemented.");
        }}
        progress={0}
      />
      <Stack
        sx={{
          maxWidth: "600px",
          padding: "0 10px",
          width: "100%",
        }}
      >
        <InfoStep
          message={i18n._(`We are ready`)}
          subMessage={i18n._(`Let's talk. Tell me  about yourself`)}
          imageUrl="/avatar/owl1.png"
          onClick={() => {}}
          subComponent={
            <Stack
              sx={{
                paddingTop: "20px",
              }}
            >
              <AboutYourselfList />
            </Stack>
          }
        />
      </Stack>
    </Stack>
  );
};
