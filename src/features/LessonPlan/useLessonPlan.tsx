"use client";
import { createContext, useContext, ReactNode, JSX, useState, useEffect, useRef } from "react";
import { LessonPlan, LessonPlanAnalysis } from "./type";
import { useAiConversation } from "../Conversation/useAiConversation";
import { useTextAi } from "../Ai/useTextAi";
import { getSortedMessages } from "../Conversation/getSortedMessages";

interface LessonPlanContextType {
  loading: boolean;
  activeLessonPlan: LessonPlan | null;
  setActiveLessonPlan: (plan: LessonPlan) => void;
  activeProgress: LessonPlanAnalysis | null;
}

const LessonPlanContext = createContext<LessonPlanContextType | null>(null);

function useProvideLessonPlan(): LessonPlanContextType {
  const [activeLessonPlan, setActiveLessonPlan] = useState<LessonPlan | null>(null);
  const aiConversation = useAiConversation();

  const [activeProgress, setActiveProgress] = useState<LessonPlanAnalysis | null>(null);

  const ai = useTextAi();

  const activeConversationMessage = aiConversation.conversation;

  const getActivePlanAsText = (): string => {
    if (!activeLessonPlan) return "";
    let planText = `## Lesson Plan:\n\n`;
    activeLessonPlan.steps.forEach((step, index) => {
      planText += `Step ${index}: ${step.stepTitle}\n Teacher instructions:\n${step.teacherInstructions}\nDescription For Student:\n${step.stepDescriptionForStudent}\n`;
    });
    return planText;
  };

  const getActiveConversationAsText = (): string => {
    const sortedMessages = getSortedMessages({
      conversation: aiConversation.conversation,
      messageOrder: aiConversation.messageOrder,
    });

    let conversationText = `## Conversation so far:\n\n`;
    sortedMessages.forEach((message) => {
      conversationText += `${message.isBot ? "Teacher" : "Student"}: ${message.text}\n`;
    });

    // ai
    return conversationText;
  };

  useEffect(() => {
    setActiveLessonPlan(null);
  }, [aiConversation.isClosing]);
  const isAnalyzingRef = useRef(false);

  const analyzeActiveConversation = async () => {
    isAnalyzingRef.current = true;
    console.log("ANALYZING CONVERSATION");
    const activePlan = getActivePlanAsText();
    const activeConversation = getActiveConversationAsText();

    const systemInstructions = `You are supervisor AI helping the teacher to follow the lesson plan.

Analyze the conversation between the AI tutor that can only talk and listen and the student based on the lesson plan provided. 

Analyze the conversation and determine if the teacher is following the lesson plan correctly.

If teacher is not following the lesson plan, provide specific suggestions on how to get back on track.

If the student is struggling, suggest specific strategies or activities that the teacher can implement to help the student improve.

Your analysis should be concise and focused on actionable insights for the teacher.


${activePlan}

Format the response as a JSON object containing {
"activeStepIndex": number, // index of the current step in the lesson plan (0-based)
"isFine": true/false, // whether the lesson plan is being followed correctly
"suggestionsToTeacher": "specific suggestions here if needed, or empty",
"comments": "additional comments for debug purposes"
}
`;
    const userMessage = `${activeConversation}\n\nPlease provide your analysis.`;
    console.log("activeConversation", activeConversation);

    const start = Date.now();
    const result = await ai.generateJson<LessonPlanAnalysis>({
      systemMessage: systemInstructions,
      userMessage: userMessage,
      attempts: 2,
      model: "gpt-4o",
    });
    const end = Date.now();
    console.log(
      `result ${(end - start) / 1000} seconds`,
      JSON.stringify({ userMessage, systemInstructions, result }, null, 2)
    );

    if (result) {
      setActiveProgress(result);
    }

    isAnalyzingRef.current = false;
  };

  useEffect(() => {
    const isSkip =
      activeConversationMessage.length > 1 && activeLessonPlan && !isAnalyzingRef.current;
    if (isSkip) {
      return;
    }

    const timeout = setTimeout(() => {
      analyzeActiveConversation();
    }, 1000);

    return () => clearTimeout(timeout);
  }, [activeConversationMessage.length]);

  return {
    loading: false,
    activeLessonPlan,
    activeProgress,
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
