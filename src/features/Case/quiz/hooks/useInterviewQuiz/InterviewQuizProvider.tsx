'use client';

import { SupportedLanguage } from '@/features/Lang/lang';
import { JSX, ReactNode } from 'react';
import { InterviewCoreData, InterviewQuiz } from '../../../types';
import { useProvideInterviewQuizContext } from './useProvideInterviewQuizContext';
import { QuizContext } from './QuizContext';

export function InterviewQuizProvider({
  interviewId,
  children,
  lang,
  coreData,
  quiz,
}: {
  interviewId: string;
  children: ReactNode;
  lang: SupportedLanguage;
  coreData: InterviewCoreData;
  quiz: InterviewQuiz;
}): JSX.Element {
  const hook = useProvideInterviewQuizContext({
    lang,
    coreData,
    quiz,
    interviewId,
  });
  return <QuizContext.Provider value={hook}>{children}</QuizContext.Provider>;
}
