'use client';
import { createContext, useContext, ReactNode, JSX, useState } from 'react';
import { LessonPlan, LessonPlanStep } from './type';
import { useTextAi } from '../Ai/useTextAi';
import { GoalElementInfo } from '../Plan/types';
import { useAiUserInfo } from '../User/useAiUserInfo';
import { useSettings } from '../Settings/useSettings';

interface LessonPlanContextType {
  loading: boolean;
  activeLessonPlan: LessonPlan | null;
  setActiveLessonPlan: (plan: LessonPlan | null) => void;
  createLessonPlan: ({
    goalInfo,
    skipCache,
    words,
    rule,
  }: {
    goalInfo: GoalElementInfo;
    skipCache?: boolean;
    words?: string[];
    rule?: string;
  }) => Promise<LessonPlan>;
}

const LessonPlanContext = createContext<LessonPlanContextType | null>(null);

function useProvideLessonPlan(): LessonPlanContextType {
  const [activeLessonPlan, setActiveLessonPlan] = useState<LessonPlan | null>(null);
  const settings = useSettings();
  const ai = useTextAi();
  const aiUserInfo = useAiUserInfo();

  const createLessonPlan = async ({
    goalInfo,
    skipCache,
    words,
    rule,
  }: {
    goalInfo: GoalElementInfo;
    skipCache?: boolean;
    words?: string[];
    rule?: string;
  }): Promise<LessonPlan> => {
    if (skipCache && typeof localStorage !== 'undefined') {
      localStorage.removeItem(`lessonPlan_${goalInfo.goalElement.id}`);
    }

    const storagePlan = skipCache ? null : getLessonPlanFromStorage(goalInfo.goalElement.id);
    if (storagePlan && !skipCache) {
      setActiveLessonPlan(storagePlan);
      return storagePlan;
    }

    const mainGoal = goalInfo.goalPlan.title;
    const elementTitle = goalInfo.goalElement.title;
    const elementDescription = goalInfo.goalElement.description;
    const elementDetails = goalInfo.goalElement.details;

    const numberOfSteps = '4';

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

${words ? `Words to learn: ${words.join(', ')}` : ''}

${rule ? `Rule to learn: ${rule}` : ''}

Info about student:
${aiUserInfo.advancedUserRecords}

Provide a step-by-step lesson plan with clear objectives and activities.

Plan should contain ${numberOfSteps} steps.
On the first step in teacherInstructions, include a start message to introduce the topic to the student.

Student is learning ${settings.fullLanguageName || 'English'}. Use this language in the lesson plan.

Format the response as a JSON array with each step containing "stepTitle", "stepDescriptionForStudent", and "teacherInstructions".

Return only the JSON array, do not include any additional text.
  `;

    const response = await ai.generateJson<LessonPlanStep[]>({
      systemMessage,
      userMessage: `Create the lesson plan as specified.`,
      attempts: 4,
      model: 'gpt-5.6-luna',
    });

    const plan: LessonPlan = { steps: response };
    setLessonPlanToStorage(goalInfo.goalElement.id, plan);
    setActiveLessonPlan(plan);

    return plan;
  };

  return {
    loading: false,
    activeLessonPlan,
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
    throw new Error('useLessonPlan must be used within a LessonPlanProvider');
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
      console.error('Error parsing lesson plan from storage:', error);
      return null;
    }
  }
  return null;
};

const setLessonPlanToStorage = (elementId: string, plan: LessonPlan) => {
  localStorage.setItem(`lessonPlan_${elementId}`, JSON.stringify(plan));
};
