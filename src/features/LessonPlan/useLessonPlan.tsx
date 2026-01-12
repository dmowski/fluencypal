"use client";
import { createContext, useContext, ReactNode, JSX } from "react";

interface LessonPlanContextType {
  loading: boolean;
}

const LessonPlanContext = createContext<LessonPlanContextType | null>(null);

function useProvideLessonPlan(): LessonPlanContextType {
  return {
    loading: false,
  };
}

export function LessonPlanProvider({ children }: { children: ReactNode }): JSX.Element {
  const hook = useProvideLessonPlan();
  return <LessonPlanContext.Provider value={hook}>{children}</LessonPlanContext.Provider>;
}

export const useLessonPlan = (): LessonPlanContextType => {
  const context = useContext(LessonPlanContext);
  if (!context) {
    throw new Error("useLessonPlan must be used within a LessonPlanProvider");
  }
  return context;
};
