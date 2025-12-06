import { SupportedLanguage, supportedLanguages } from "@/features/Lang/lang";
import { getAllInterviews } from "../data";
import { NotFoundPage } from "@/features/NotFound/NotFoundPage";
import { InterviewQuizPage } from "./InterviewQuizPage";

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
    <InterviewQuizPage
      interviewCoreData={interviewData.coreData}
      lang={supportedLang}
      id={id}
      interviewQuiz={interviewData.quiz}
    />
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
