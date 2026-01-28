'use client';
import { createContext, useContext, ReactNode, JSX, useState, useEffect, useRef } from 'react';
import { LessonPlan, LessonPlanAnalysis, LessonPlanStep } from './type';
import { useAiConversation } from '../Conversation/useAiConversation';
import { useTextAi } from '../Ai/useTextAi';
import { getSortedMessages } from '../Conversation/getSortedMessages';
import { GoalElementInfo } from '../Plan/types';
import { useAiUserInfo } from '../Ai/useAiUserInfo';
import { useSettings } from '../Settings/useSettings';
import { getHash } from '@/libs/hash';
import { MessagesOrderMap } from '@/common/conversation';

interface LessonPlanContextType {
  loading: boolean;
  activeLessonPlan: LessonPlan | null;
  setActiveLessonPlan: (plan: LessonPlan | null) => void;
  activeProgress: LessonPlanAnalysis | null;
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
  generateAnalysis: (temporaryUserMessage?: string) => Promise<LessonPlanAnalysis | null>;
}

const LessonPlanContext = createContext<LessonPlanContextType | null>(null);

function useProvideLessonPlan(): LessonPlanContextType {
  const [activeLessonPlan, setActiveLessonPlan] = useState<LessonPlan | null>(null);
  const aiConversation = useAiConversation();

  const [activeProgress, setActiveProgress] = useState<LessonPlanAnalysis | null>(null);
  const settings = useSettings();

  const isActiveConversation = aiConversation.conversation.length > 0 && aiConversation.isStarted;

  const lessonAnalysisResult = useRef<
    Record<string, Promise<LessonPlanAnalysis> | null | undefined>
  >({});

  const ai = useTextAi();

  const getActivePlanAsText = (): string => {
    if (!activeLessonPlan || !isActiveConversation) return '';
    let planText = `## Lesson Plan:\n\n`;
    activeLessonPlan.steps.forEach((step, index) => {
      planText += `Step ${index}: ${step.stepTitle}\n Teacher instructions:\n${step.teacherInstructions}\nDescription For Student:\n${step.stepDescriptionForStudent}\n`;
    });
    return planText;
  };

  const summaryMapRef = useRef<Record<string, Promise<string>>>({});

  const messageOrderRef = useRef<MessagesOrderMap>({});
  messageOrderRef.current = aiConversation.messageOrder;
  const conversationRef = useRef(aiConversation.conversation);
  conversationRef.current = aiConversation.conversation;

  const getActiveConversation = async (temporaryUserMessage?: string) => {
    const sortedMessages = getSortedMessages({
      conversation: conversationRef.current,
      messageOrder: messageOrderRef.current,
    });

    // Add temporary user message BEFORE computing summary window
    if (temporaryUserMessage) {
      const lastMessage = sortedMessages.length ? sortedMessages[sortedMessages.length - 1] : null;
      if (lastMessage && !lastMessage.isBot && lastMessage.text !== temporaryUserMessage) {
        sortedMessages.push({
          id: 'temporary_user_message',
          text: temporaryUserMessage,
          isBot: false,
        });
      }
    }

    const keepLast = 4; // keep latest 4 messages as-is
    const chunkSize = 5; // summarize in blocks of 5

    const activePlan = getActivePlanAsText();

    const summarySystemMessage = `You are an AI assistant that summarizes conversations between a teacher and a student for a language learning lesson plan.
Your task is to create a shorter version of conversation.

Format the summary as explicit facts: what the student and teacher said.
And add info what was don according to the lesson plan:
${activePlan}
`;

    const total = sortedMessages.length;
    const summarizeCount = Math.max(0, total - keepLast);

    // number of FULL 5-message chunks we can summarize
    const chunkCount = Math.floor(summarizeCount / chunkSize);

    let combinedSummary = '';

    if (chunkCount > 0) {
      const summaries: string[] = [];

      for (let chunkIndex = 0; chunkIndex < chunkCount; chunkIndex++) {
        const start = chunkIndex * chunkSize;
        const end = start + chunkSize; // exclusive

        let conversationToSummarize = `## Conversation chunk (${start + 1}-${end}):\n\n`;
        for (let i = start; i < end; i++) {
          const m = sortedMessages[i];
          conversationToSummarize += `${m.isBot ? 'Teacher' : 'Student'}: ${m.text}\n`;
        }

        const conversationKey = getHash(conversationToSummarize);

        const userMessage = `Please provide a concise summary of the following conversation chunk:\n\n${conversationToSummarize}`;

        if (!summaryMapRef.current[conversationKey]) {
          const summaryRequest = ai.generate({
            systemMessage: summarySystemMessage,
            userMessage,
            model: 'gpt-4o',
          });
          summaryMapRef.current[conversationKey] = summaryRequest;
        }

        const chunkSummary = await summaryMapRef.current[conversationKey];
        summaries.push(`Chunk ${chunkIndex + 1} (${start + 1}-${end}): ${chunkSummary}`);
      }

      combinedSummary = summaries.join('\n');
    }

    // After summarizing full chunks, keep the rest verbatim:
    // - any leftover messages before the last 4 (not enough to form a full chunk)
    // - plus the last 4 always
    const summarizedUntilIndexExclusive = chunkCount * chunkSize; // e.g. 10 means [0..9] summarized
    const messagesToKeepVerbatimFromIndex = summarizedUntilIndexExclusive;

    const lastMessageIndex = sortedMessages.length - 1;
    const lastMessage = sortedMessages.length > 0 ? sortedMessages[lastMessageIndex] : null;
    const lastMessageText = lastMessage ? lastMessage.text : '';

    let conversationText = `## Conversation so far:\n\n`;
    if (combinedSummary) {
      conversationText += `Summary of previous messages (chunked):\n${combinedSummary}\n\n`;
    }

    for (let i = messagesToKeepVerbatimFromIndex; i < sortedMessages.length; i++) {
      const m = sortedMessages[i];
      conversationText += `${m.isBot ? 'Teacher' : 'Student'}: ${m.text}\n`;
    }

    return { conversationText, lastMessageText, lastMessage, lastMessageIndex };
  };

  const generateAnalysis = async ({
    temporaryUserMessage,
    label,
  }: {
    temporaryUserMessage?: string;
    label: string;
  }): Promise<LessonPlanAnalysis | null> => {
    if (!activeLessonPlan || !isActiveConversation) {
      return null;
    }
    const activeConversation = await getActiveConversation(temporaryUserMessage);
    const key = `${activeConversation.lastMessageIndex}_${activeConversation.lastMessageText}`;

    console.log('key label', key, '|', label, 'temporaryUserMessage:', temporaryUserMessage);

    const activeResult = lessonAnalysisResult.current[key];
    if (activeResult) {
      return activeResult;
    }

    const initActiveProgress: LessonPlanAnalysis = {
      progress: aiConversation.conversation.length + 2,
      isFollowingPlan: true,
      teacherResponse: '',
    };

    if (aiConversation.conversation.length <= 4) {
      return initActiveProgress;
    }

    const process: Promise<LessonPlanAnalysis> = new Promise(async (resolve, reject) => {
      console.log('Analyzing lesson plan| ', label);

      const activePlan = getActivePlanAsText();
      const previousProgress = activeProgress || initActiveProgress;

      const systemInstructions = `You are supervisor AI directing the teacher to follow the lesson plan.

Analyze the conversation between the AI tutor that can only talk and listen and the student based on the lesson plan provided. 

Analyze the conversation and determine if the teacher is following the lesson plan correctly.

If teacher is not following the lesson plan, provide specific suggestions on how to get back on track.

If the student is struggling, suggest specific strategies or activities that the teacher can implement to help the student improve.

Your analysis should be concise and focused on actionable insights for the teacher.

If you notice that the teacher is asking the student to repeat after him, prevent this behavior by forcing the teacher to use alternative methods of engaging the student in the learning process and give a messages the teacher should say (use conversation language).

${activePlan}

Format the response as a JSON object containing {
"progress": number, // the cumulative percentage of the lesson plan completed (0-100), do not reduce from previous
"isFollowingPlan": boolean, // is the teacher following the lesson plan
"suggestionsToTeacher": "Specific suggestions to help the teacher get back on track if they are deviating from the lesson plan. If everything is fine, leave it empty.",
"teacherResponse": "Specific message the teacher should say to the student. It should be direct voice to teacher should say using conversation language. If teacher is doing relatively fine, leave this field empty."
}

teacherResponse is optional and should be used only when necessary to guide the teacher back on track.

If lesson is done (progress is 100), provide last teacherResponse to properly end the lesson.

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
          model: 'gpt-4o',
        });
        const end = Date.now();

        console.log(
          `result ${(end - start) / 1000} seconds`,
          label,
          '|' + activeConversation.lastMessageText + '|',
          { result, userMessage },
        );

        if (result) {
          resolve({
            ...result,
            progress:
              result.progress && result.progress > 90
                ? result.progress
                : Math.max(
                    result?.progress || previousProgress?.progress || 5,
                    previousProgress.progress || 5,
                  ),
          });
          return;
        }
      } catch (error) {
        console.error('Error during lesson plan analysis:', error);
        reject(error);
      }
    });

    lessonAnalysisResult.current[key] = process;
    return process;
  };

  const isAnalyzingConversationInProgress = useRef(false);

  const analyzeActiveConversation = async () => {
    const activeConversation = await getActiveConversation();
    const isSkipMessage =
      activeConversation.lastMessage?.isBot || activeConversation.lastMessage?.isInProgress;
    if (isSkipMessage) {
      return;
    }

    if (isAnalyzingConversationInProgress.current) {
      console.log('Analysis already in progress, skipping...');
      return;
    }

    isAnalyzingConversationInProgress.current = true;

    const result = await generateAnalysis({
      label: 'From conversation update',
    });
    if (!result) return;

    setActiveProgress(result);
    aiConversation.setLessonPlanAnalysis(result);
    isAnalyzingConversationInProgress.current = false;
  };

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
    const storagePlan = getLessonPlanFromStorage(goalInfo.goalElement.id);
    if (storagePlan && !skipCache) {
      setActiveLessonPlan(storagePlan);
      return storagePlan;
    }

    const userInfo = (aiUserInfo.userInfo?.records || []).join('. ');

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
${userInfo}

Provide a step-by-step lesson plan with clear objectives and activities.

Plan should contain ${numberOfSteps} steps.
On the first step in teacherInstructions, include a start message to introduce the topic to the student.

Student is learning ${settings.fullLanguageName || 'English'}. Use this language in the lesson plan.

Format the response as a JSON array with each step containing "stepTitle", "stepDescriptionForStudent", and "teacherInstructions".
  `;
    //console.log("systemMessage", systemMessage);
    const response = await ai.generateJson<LessonPlanStep[]>({
      systemMessage,
      userMessage: `Create the lesson plan as specified.`,
      attempts: 2,
      model: 'gpt-4o',
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
    const sortedMessages = getSortedMessages({
      conversation: aiConversation.conversation,
      messageOrder: aiConversation.messageOrder,
    });
    const lastMessage = sortedMessages[sortedMessages.length - 1];
    const timeoutTime = lastMessage?.isBot ? 3000 : 10;

    const timer = setTimeout(() => {
      setIsReadyToAnalyze(true);
    }, timeoutTime);

    return () => clearTimeout(timer);
  }, [JSON.stringify(aiConversation.conversation)]);

  useEffect(() => {
    if (!isReadyToAnalyze) return;

    if (!activeLessonPlan || !isActiveConversation) {
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
    generateAnalysis: (message?: string) =>
      generateAnalysis({
        temporaryUserMessage: message,
        label: 'From external call',
      }),
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
