import { SupportedLanguage, supportedLanguages } from "@/features/Lang/lang";
import { getAllInterviews } from "../data";
import { NotFoundPage } from "@/features/NotFound/NotFoundPage";
import { InterviewQuizPage } from "./InterviewQuizPage";
import { WebViewWall } from "@/features/Auth/WebViewWall";
import { PracticeProvider } from "@/app/practiceProvider";
import { InterviewQuizProvider } from "./useQuiz";

export async function InterviewQuizPageNext({
  langParam,
  id,
}: {
  langParam: string | undefined;
  id: string;
}) {
  const lang = (langParam || "en") as SupportedLanguage;
  const allInterviews = getAllInterviews(lang);
  const supportedLang = supportedLanguages.find((l) => l === lang) || "en";
  const interviewData = allInterviews.interviews.find((interview) => interview.coreData.id === id);

  if (!interviewData) {
    return <NotFoundPage lang={supportedLang} />;
  }

  const content = (
    <PracticeProvider>
      <WebViewWall>
        <InterviewQuizProvider
          coreData={interviewData.coreData}
          quiz={interviewData.quiz}
          pageLang={lang}
          defaultLangToLearn={lang}
        >
          <InterviewQuizPage
            interviewCoreData={interviewData.coreData}
            lang={supportedLang}
            id={id}
            interviewQuiz={interviewData.quiz}
          />
        </InterviewQuizProvider>
      </WebViewWall>
    </PracticeProvider>
  );

  if (lang === "en") {
    return (
      <html lang="en">
        <body>{content}</body>
      </html>
    );
  }

  return content;
}
