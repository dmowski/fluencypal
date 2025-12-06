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
  const interviewData = allInterviews.interviews.find((interview) => interview.id === id);

  if (!interviewData) {
    return <NotFoundPage lang={supportedLang} />;
  }

  const content = <InterviewQuizPage lang={supportedLang} id={id} interviewData={interviewData} />;

  if (lang === "en") {
    return (
      <html lang="en">
        <body>{content}</body>
      </html>
    );
  }

  return content;
}
