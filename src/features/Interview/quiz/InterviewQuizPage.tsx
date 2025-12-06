"use client";

import { SupportedLanguage } from "@/features/Lang/lang";
import { InterviewCoreData, InterviewQuiz } from "../types";
import { getUrlStart } from "@/features/Lang/getUrlStart";
import { PracticeProvider } from "@/app/practiceProvider";
import { WebViewWall } from "@/features/Auth/WebViewWall";
import { Stack } from "@mui/material";
import { QuizProgressBar } from "@/features/Goal/Quiz/components/QuizProgressBar";
import { useRouter } from "next/navigation";

export interface InterviewQuizPageProps {
  interviewCoreData: InterviewCoreData;
  interviewQuiz: InterviewQuiz;
  lang: SupportedLanguage;
  id: string;
}

export const InterviewQuizPage = ({ interviewCoreData, lang, id }: InterviewQuizPageProps) => {
  const pageUrl = getUrlStart(lang) + `interview/${id}`;
  const router = useRouter();
  return (
    <PracticeProvider>
      <WebViewWall>
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
          <p>
            Interview Quiz Page - {interviewCoreData.title} ({lang})
          </p>
        </Stack>
      </WebViewWall>
    </PracticeProvider>
  );
};
