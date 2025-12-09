import { InterviewQuizSurvey } from "@/features/Interview/types";

export const MIN_CHARACTERS_FOR_TRANSCRIPT = 10;

export const initEmptyData: InterviewQuizSurvey = {
  answers: {},
  results: {},
  createdAtIso: new Date().toISOString(),
  updatedAtIso: new Date().toISOString(),
};
