import { SupportedLanguage } from "@/features/Lang/lang";
import { InterviewData } from "../types";
import { getUrlStart } from "@/features/Lang/getUrlStart";

export interface InterviewQuizPageProps {
  interviewData: InterviewData;
  lang: SupportedLanguage;
  id: string;
}

export const InterviewQuizPage = ({ interviewData, lang, id }: InterviewQuizPageProps) => {
  const pageUrl = getUrlStart(lang) + `interview/${id}`;
  return (
    <div>
      <p>
        Interview Quiz Page - {interviewData.title} ({lang})
      </p>
      <p>{pageUrl}</p>
    </div>
  );
};
