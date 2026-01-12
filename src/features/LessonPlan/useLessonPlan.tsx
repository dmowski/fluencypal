"use client";
import { createContext, useContext, ReactNode, JSX, useState, useEffect, act } from "react";
import { LessonPlan } from "./type";
import { useAiConversation } from "../Conversation/useAiConversation";

interface LessonPlanContextType {
  loading: boolean;
  activeLessonPlan: LessonPlan | null;
  setActiveLessonPlan: (plan: LessonPlan) => void;
}

const LessonPlanContext = createContext<LessonPlanContextType | null>(null);

function useProvideLessonPlan(): LessonPlanContextType {
  const [activeLessonPlan, setActiveLessonPlan] = useState<LessonPlan | null>(null);
  const aiConversation = useAiConversation();

  const activeConversationMessage = aiConversation.conversation;

  useEffect(() => {
    setActiveLessonPlan(null);
  }, [aiConversation.isClosing]);

  const analyzeActiveConversation = () => {
    console.log("ANALYZING CONVERSATION");
  };

  useEffect(() => {
    if (activeConversationMessage.length > 3 && activeLessonPlan) {
      analyzeActiveConversation();
    }
  }, [activeConversationMessage]);

  return {
    loading: false,
    activeLessonPlan,
    setActiveLessonPlan,
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
