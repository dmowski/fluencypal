import { InterviewQuizSurvey } from "@/features/Case2/types";

export const MIN_CHARACTERS_FOR_TRANSCRIPT = 20;

export const initEmptyData: InterviewQuizSurvey = {
  answers: {},
  results: {},
  createdAtIso: new Date().toISOString(),
  updatedAtIso: new Date().toISOString(),
};
