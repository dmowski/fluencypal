"use client";
import { createContext, useContext, ReactNode, JSX, useState, useEffect, useRef } from "react";
import { LessonPlan, LessonPlanAnalysis, LessonPlanStep } from "./type";
import { useAiConversation } from "../Conversation/useAiConversation";
import { useTextAi } from "../Ai/useTextAi";
import { getSortedMessages } from "../Conversation/getSortedMessages";
import { GoalElementInfo } from "../Plan/types";
import { useAiUserInfo } from "../Ai/useAiUserInfo";

interface LessonPlanContextType {
  loading: boolean;
  activeLessonPlan: LessonPlan | null;
  setActiveLessonPlan: (plan: LessonPlan) => void;
  activeProgress: LessonPlanAnalysis | null;
  createLessonPlan: (goalInfo: GoalElementInfo, skipCache?: boolean) => Promise<LessonPlan>;
}

const LessonPlanContext = createContext<LessonPlanContextType | null>(null);

function useProvideLessonPlan(): LessonPlanContextType {
  const [activeLessonPlan, setActiveLessonPlan] = useState<LessonPlan | null>(null);
  const aiConversation = useAiConversation();

  const [activeProgress, setActiveProgress] = useState<LessonPlanAnalysis | null>(null);

  const ai = useTextAi();

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

    return conversationText;
  };

  useEffect(() => {
    setActiveLessonPlan(null);
  }, [aiConversation.isClosing]);
  const isAnalyzingRef = useRef(false);

  const analyzeActiveConversation = async () => {
    if (!activeLessonPlan) return;
    isAnalyzingRef.current = true;
    const activePlan = getActivePlanAsText();
    const activeConversation = getActiveConversationAsText();
    console.log("🔥 Starting analyzing");

    const initActiveProgress: LessonPlanAnalysis = {
      progress: 0,
      isFine: true,
      suggestionsToTeacher: "",
      comments: "Initial state",
    };

    const previousProgress = activeProgress || initActiveProgress;

    const systemInstructions = `You are supervisor AI helping the teacher to follow the lesson plan.

Analyze the conversation between the AI tutor that can only talk and listen and the student based on the lesson plan provided. 

Analyze the conversation and determine if the teacher is following the lesson plan correctly.

If teacher is not following the lesson plan, provide specific suggestions on how to get back on track.

If the student is struggling, suggest specific strategies or activities that the teacher can implement to help the student improve.

Your analysis should be concise and focused on actionable insights for the teacher.

${activePlan}

Format the response as a JSON object containing {
"progress": number, // the cumulative percentage of the lesson plan completed (0-100), do not reduce from previous
"isFine": true/false, // whether the lesson plan is being followed correctly
"suggestionsToTeacher": "specific suggestions here if needed, or empty. Use direct voice addressing the teacher. Give examples of what to say or do next.",
"comments": "additional comments for debug purposes"
}

The previous analysis was:
${JSON.stringify(previousProgress, null, 2)}
`;
    const userMessage = `${activeConversation}\n\nPlease provide your analysis.`;

    const start = Date.now();
    const result = await ai.generateJson<LessonPlanAnalysis>({
      systemMessage: systemInstructions,
      userMessage: userMessage,
      attempts: 2,
      model: "gpt-4o",
    });
    const end = Date.now();

    //console.log(userMessage);
    //console.log("systemInstructions", systemInstructions);
    console.log(`result ${(end - start) / 1000} seconds`, JSON.stringify({ result }, null, 2));

    if (result) {
      setActiveProgress(result);
      aiConversation.setLessonPlanAnalysis(result);
    }

    isAnalyzingRef.current = false;
  };

  const getLessonPlanFromStorage = (elementId: string): LessonPlan | null => {
    const stored = localStorage.getItem(`lessonPlan_${elementId}`);
    if (stored) {
      try {
        const plan: LessonPlan = JSON.parse(stored);
        return plan;
      } catch (error) {
        console.error("Error parsing lesson plan from storage:", error);
        return null;
      }
    }
    return null;
  };

  const setLessonPlanToStorage = (elementId: string, plan: LessonPlan) => {
    localStorage.setItem(`lessonPlan_${elementId}`, JSON.stringify(plan));
  };

  const aiUserInfo = useAiUserInfo();

  const createLessonPlan = async (
    goalInfo: GoalElementInfo,
    skipCache?: boolean
  ): Promise<LessonPlan> => {
    const storagePlan = getLessonPlanFromStorage(goalInfo.goalElement.id);
    if (storagePlan && !skipCache) {
      setActiveLessonPlan(storagePlan);
      return storagePlan;
    }

    const userInfo = (aiUserInfo.userInfo?.records || []).join(". ");

    const mainGoal = goalInfo.goalPlan.title;
    const elementTitle = goalInfo.goalElement.title;
    const elementDescription = goalInfo.goalElement.description;
    const elementDetails = goalInfo.goalElement.details;

    const systemMessage = `Your goal is to create a detailed lesson plan for a speech lesson.
  
  This plan will be used by a AI tutor that can only talk and listen.
  
  The student's main goal is:
  ${mainGoal}
  
  The lesson element is titled:
  ${elementTitle}
  
  The lesson description:
  ${elementDescription}
  
  The lesson details:
  ${elementDetails}
  
  Info about student:
  ${userInfo}
  
  Provide a step-by-step lesson plan with clear objectives and activities.
  
  Plan should contain 3-5 steps.
  On the first step in teacherInstructions, include a start message to introduce the topic to the student.
  
  Format the response as a JSON array with each step containing "stepTitle", "stepDescriptionForStudent", and "teacherInstructions".
  `;

    const response = await ai.generateJson<LessonPlanStep[]>({
      systemMessage,
      userMessage: `Create the lesson plan as specified.`,
      attempts: 2,
      model: "gpt-4o",
    });

    const plan: LessonPlan = { steps: response };
    setLessonPlanToStorage(goalInfo.goalElement.id, plan);
    setActiveLessonPlan(plan);

    return plan;
  };

  const activeConversationMessageRef = useRef(0);
  activeConversationMessageRef.current = aiConversation.conversation.length;
  useEffect(() => {
    const timeout = setTimeout(() => {
      const isGood =
        activeConversationMessageRef.current > 1 && activeLessonPlan && !isAnalyzingRef.current;
      if (!isGood) {
        return;
      }

      analyzeActiveConversation();
    }, 3000);

    return () => clearTimeout(timeout);
  }, [JSON.stringify(aiConversation.conversation), activeLessonPlan]);

  return {
    loading: false,
    activeLessonPlan,
    activeProgress,
    setActiveLessonPlan,
    createLessonPlan,
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
