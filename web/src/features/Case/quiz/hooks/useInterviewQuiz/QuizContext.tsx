'use client';
import { createContext } from 'react';
import { InterviewQuizContextType } from './types';

export const QuizContext = createContext<InterviewQuizContextType | null>(null);
