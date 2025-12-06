import { useContext } from "react";
import { QuizContext } from "./QuizContext";
import { InterviewQuizContextType } from "./types";

export const useInterviewQuiz = (): InterviewQuizContextType => {
  const context = useContext(QuizContext);
  if (!context) {
    throw new Error("useInterviewQuiz must be used within a InterviewQuizProvider");
  }
  return context;
};
