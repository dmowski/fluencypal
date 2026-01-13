"use client";
import { createContext, useContext, ReactNode, JSX, useState, useEffect } from "react";
import { LessonPlan, LessonPlanAnalysis, LessonPlanStep } from "./type";
import { useAiConversation } from "../Conversation/useAiConversation";
import { useTextAi } from "../Ai/useTextAi";
import { getSortedMessages } from "../Conversation/getSortedMessages";
import { GoalElementInfo } from "../Plan/types";
import { useAiUserInfo } from "../Ai/useAiUserInfo";
import { useSettings } from "../Settings/useSettings";

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
  const settings = useSettings();

  // message, analysis map
  const [lessonAnalysisProgress, setLessonAnalysisProgress] = useState<
    Record<string, "in-progress" | "done" | undefined>
  >({});
  const [lessonAnalysisResult, setLessonAnalysisResult] = useState<
    Record<string, LessonPlanAnalysis | null | undefined>
  >({});

  const ai = useTextAi();

  const getActivePlanAsText = (): string => {
    if (!activeLessonPlan) return "";
    let planText = `## Lesson Plan:\n\n`;
    activeLessonPlan.steps.forEach((step, index) => {
      planText += `Step ${index}: ${step.stepTitle}\n Teacher instructions:\n${step.teacherInstructions}\nDescription For Student:\n${step.stepDescriptionForStudent}\n`;
    });
    return planText;
  };

  const getActiveConversationAsText = () => {
    const sortedMessages = getSortedMessages({
      conversation: aiConversation.conversation,
      messageOrder: aiConversation.messageOrder,
    });

    const lastMessageText = sortedMessages[sortedMessages.length - 1]?.text || "";

    let conversationText = `## Conversation so far:\n\n`;
    sortedMessages.forEach((message) => {
      conversationText += `${message.isBot ? "Teacher" : "Student"}: ${message.text}\n`;
    });

    return { conversationText, lastMessageText };
  };

  useEffect(() => {
    setActiveLessonPlan(null);
  }, [aiConversation.isClosing]);

  const analyzeActiveConversation = async () => {
    const activePlan = getActivePlanAsText();
    const activeConversation = getActiveConversationAsText();

    const lastMessage = activeConversation.lastMessageText;
    const currentStatus = lessonAnalysisProgress[lastMessage];
    if (currentStatus === "in-progress" || currentStatus === "done") {
      console.log("Analysis already in progress for this message, skipping.");
      return;
    }

    setLessonAnalysisProgress((prev) => ({
      ...prev,
      [lastMessage]: "in-progress",
    }));

    console.log("🔥 Starting analyzing:", activeConversation.lastMessageText);

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

If you notice that the teacher is asking the student to repeat after him, prevent this behavior by forcing the teacher to use alternative methods of engaging the student in the learning process and propose direct messages the teacher should say instead.

${activePlan}

Format the response as a JSON object containing {
"progress": number, // the cumulative percentage of the lesson plan completed (0-100), do not reduce from previous
"isFine": true/false, // whether the lesson plan is being followed correctly
"suggestionsToTeacher": "Specific suggestions here if needed, or empty. Use direct voice addressing the teacher. Give examples of what to say",
"comments": "additional comments for debug purposes"
}

The previous analysis was:
${JSON.stringify(previousProgress, null, 2)}
`;
    const userMessage = `${activeConversation.conversationText}\n\nPlease provide your analysis.`;

    const start = Date.now();
    try {
      const result = await ai.generateJson<LessonPlanAnalysis>({
        systemMessage: systemInstructions,
        userMessage: userMessage,
        attempts: 2,
        model: "gpt-4o",
      });
      const end = Date.now();

      console.log(`result ${(end - start) / 1000} seconds`, JSON.stringify({ result }, null, 2));

      if (result) {
        setLessonAnalysisResult((prev) => ({
          ...prev,
          [lastMessage]: result,
        }));
        setActiveProgress(result);
        aiConversation.setLessonPlanAnalysis(result);
      }
    } catch (error) {
      console.error("Error during lesson plan analysis:", error);
    }

    setLessonAnalysisProgress((prev) => ({
      ...prev,
      [lastMessage]: "done",
    }));
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

Plan should contain 2-3 steps.
On the first step in teacherInstructions, include a start message to introduce the topic to the student.

Student language is ${settings.userSettings?.nativeLanguageCode || "en"}. And he is learning ${settings.fullLanguageName || "English"}.

Format the response as a JSON array with each step containing "stepTitle", "stepDescriptionForStudent", and "teacherInstructions".
  `;
    //console.log("systemMessage", systemMessage);
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

  const [lastMessageUpdateTime, setLastMessageUpdateTime] = useState(0);
  const [isReadyToAnalyze, setIsReadyToAnalyze] = useState(false);

  useEffect(() => {
    setLastMessageUpdateTime(Date.now());
    setIsReadyToAnalyze(false);

    const timer = setTimeout(() => {
      setIsReadyToAnalyze(true);
    }, 3000);

    return () => clearTimeout(timer);
  }, [JSON.stringify(aiConversation.conversation)]);

  useEffect(() => {
    if (!isReadyToAnalyze) return;

    const isEnoughMessages = aiConversation.conversation.length > 1;
    if (!isEnoughMessages) {
      return;
    }

    if (!activeLessonPlan) {
      console.log("skip");
      return;
    }

    analyzeActiveConversation();
  }, [lastMessageUpdateTime, isReadyToAnalyze, activeLessonPlan]);

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
