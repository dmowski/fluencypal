'use client';
import {
  createContext,
  useContext,
  ReactNode,
  JSX,
  useMemo,
  useState,
  useRef,
  useEffect,
} from 'react';
import { useAuth } from '../Auth/useAuth';
import { deleteDoc, doc, setDoc } from 'firebase/firestore';
import { useCollectionData } from 'react-firebase-hooks/firestore';
import { db } from '../Firebase/firebaseDb';
import {
  GoalElementProgress,
  ConversationResult,
  GoalPlan,
  PlanElement,
  PlanElementMode,
  GoalElementInfo,
} from './types';
import { useSettings } from '../Settings/useSettings';
import { ChatMessage } from '@/common/conversation';
import { useTextAi } from '../Ai/useTextAi';
import { fullEnglishLanguageName, SupportedLanguage } from '@/features/Lang/lang';
import { GoalQuiz } from '@/app/api/goal/types';
import { uniq } from '@/libs/uniq';
import { useUrlState } from '../Url/useUrlParam';

const appActivities = `The app supports the following activity types:
* words: Practice vocabulary related to a specific topic
* play: Role-play conversations (e.g. job interview)
* rule: Learn and practice grammar or concepts
* conversation: General conversation with AI on a specific topic`;

const exampleOfPlan = `Example of plan:
[
  {
    "type": "conversation",
    "title": "On the Street",
    "description": "Casual conversation about asking for directions",
    "details": "Student practices real-life interactions like asking for directions, understanding local responses, and reacting naturally. AI should vary levels of politeness, formality, and regional accents to build flexibility."
  },
  {
    "type": "words",
    "title": "Software Vocabulary",
    "description": "Vocabulary related to software development",
    "details": "Practice essential words used in programming, tools (e.g. Git, IDE), and collaboration (e.g. pull request, backlog). Student will match terms, fill gaps, and use new words in context."
  },
  {
    "type": "play",
    "title": "Job Interview Simulation",
    "description": "Mock technical interview for a software developer position",
    "details": "AI acts as an interviewer asking both technical and behavioral questions. Student must respond clearly and confidently. After each response, AI gives specific feedback on grammar, vocabulary, and fluency."
  },
  {
    "type": "rule",
    "title": "Past Simple Tense",
    "description": "Understanding and practicing past simple tense",
    "details": "Review past simple grammar rules. Student completes gap-fill exercises, rewrites present-tense sentences, and speaks about past events. AI highlights mistakes and corrects them with explanations."
  },
  {
    "type": "conversation",
    "title": "Workplace Culture",
    "description": "Discussion about working in an international team",
    "details": "Student practices discussing topics like remote work, teamwork, and workplace etiquette. AI introduces cultural nuances and encourages comparisons with the student's own experience to deepen understanding."
  }
]`;

interface GenerateGoalProps {
  conversationMessages: ChatMessage[];
  userInfo: string[];
  languageCode: SupportedLanguage;
  goalQuiz?: GoalQuiz;
  aiSystemMessage?: string;
}

interface PlanContextType {
  goals: GoalPlan[];
  loading: boolean;
  addGoalPlan: (goalPlan: GoalPlan) => Promise<void>;
  activeGoal: GoalPlan | null;
  deleteGoals: () => void;
  generateGoal: (input: GenerateGoalProps) => Promise<GoalPlan>;
  increaseStartCount: (plan: GoalPlan, goalElement: PlanElement) => void;
  isCraftingGoal: boolean;
  isCraftingError: boolean;
  setActiveGoal: (goalId: string) => Promise<void>;

  finishGoalElement: (goalElementId: string, results: ConversationResult) => Promise<void>;
  startGoalElement: (goalElementId: string) => Promise<void>;

  generateMoreElements: () => Promise<void>;

  openNextLesson: () => void;

  openElementModal: (goalElementId: string) => void;
  closeElementModal: () => void;

  activeGoalElementInfo: GoalElementInfo | null;
  nextElement: PlanElement | undefined;
}

const PlanContext = createContext<PlanContextType | null>(null);

function useProvidePlan(): PlanContextType {
  const auth = useAuth();
  const textAi = useTextAi();
  const [isCraftingGoal, setIsCraftingGoal] = useState(false);
  const [isCraftingError, setIsCraftingError] = useState(false);
  const settings = useSettings();

  const goalsCollectionRef = db.collections.goals(auth.uid);
  const [goals, loading] = useCollectionData(goalsCollectionRef);

  const addGoalPlan = async (goalPlan: GoalPlan) => {
    if (!goalsCollectionRef) {
      throw new Error('goalsCollectionRef ref is not defined');
    }
    const docRef = doc(goalsCollectionRef, goalPlan.id);
    await setDoc(docRef, goalPlan, { merge: true });
  };

  const generateGoalTitle = async (input: GenerateGoalProps): Promise<string> => {
    const fullLangName = fullEnglishLanguageName[input.languageCode];
    const systemMessage = `
You are professional ${fullLangName || 'English'} Teacher. 
Here is student/teacher conversation. Based on student's lever and their goal, formulate learning goal. 

Goal should me simple and clear. Max 3-4 words.
Example: Pass Job Interview
Return only goal without any wrapper phrases, because your response will be used as title on UI.
Use ${fullLangName || 'English'} language for generating goal.
If you can't formulate goal, return "General Practice" as goal.
`;

    const userMessage = `
===
Conversation:
${input.conversationMessages.map((message) => {
  const isBot = message.isBot;
  const author = isBot ? 'Teacher' : 'Student';
  const text = message.text;
  return `${author}: ${text}`;
})}
`;

    const goal = await textAi.generate({
      systemMessage,
      userMessage,
      model: 'gpt-4o',
      languageCode: input.languageCode,
    });

    return goal;
  };

  const generateElements = async (input: GenerateGoalProps): Promise<PlanElement[]> => {
    const fullLangName = fullEnglishLanguageName[input.languageCode];

    const systemMessageTop =
      input.aiSystemMessage ||
      `You are professional ${fullLangName} Teacher. 

Below is a conversation between a student and a teacher. Based on the student's level and goals, generate a personalized language learning plan that can be completed using our AI-powered language learning app.`;

    const systemMessage = `${systemMessageTop}
${appActivities}

Your output must be in valid JSON format with no additional text or explanation.
Your response will be parsed using JSON.parse().

${exampleOfPlan}

Use ${fullLangName} language for generating plan (title, description, details).
The plan should include at least 8 elements and must cover each type of activity. 5 of them should be 'conversation' type.
`;

    const userMessage = `Conversation:
${input.conversationMessages.map((message) => {
  const isBot = message.isBot;
  const author = isBot ? 'Teacher' : 'Student';
  const text = message.text;
  return `${author}: ${text}`;
})}
`;

    return generateElementsWithAi({
      systemMessage,
      userMessage,
      languageCode: input.languageCode,
    });
  };

  const generateExtenderElements = async (input: {
    languageCode: SupportedLanguage;
    existingElements: PlanElement[];
    progress: GoalElementProgress[];
  }): Promise<PlanElement[]> => {
    const fullLangName = fullEnglishLanguageName[input.languageCode];

    const systemMessage = `You are professional ${fullLangName} Teacher. 

Below is a student learning plan and progress.
Based on the date, generate next plan element that can be completed using our AI-powered language learning app.

${appActivities}

Your output must be in valid JSON format with no additional text or explanation.
Your response will be parsed using JSON.parse().

${exampleOfPlan}

Use ${fullLangName} language for generating plan (title, description, details).
The plan should include at least 4 elements.
`;

    const userMessage = `Active learning plan:
${JSON.stringify(input.existingElements, null, 2)}

Progress:
${JSON.stringify(input.progress, null, 2)}
`;

    return generateElementsWithAi({
      systemMessage,
      userMessage,
      languageCode: input.languageCode,
    });
  };

  const generateElementsWithAi = async (input: {
    systemMessage: string;
    userMessage: string;
    languageCode: SupportedLanguage;
  }): Promise<PlanElement[]> => {
    const parsedElements = await textAi.generateJson<AiGeneratedElement[]>({
      systemMessage: input.systemMessage,
      userMessage: input.userMessage,
      model: 'gpt-4o',
      languageCode: input.languageCode,
      attempts: 4,
    });

    interface AiGeneratedElement {
      type: string;
      title: string;
      description: string;
      details: string;
    }

    const formattedElements: PlanElement[] = parsedElements.map((element, index) => {
      const type = `${element?.type || ''}`.toLowerCase();
      const elementMode: PlanElementMode = type.includes('conversation')
        ? 'conversation'
        : type.includes('words')
          ? 'words'
          : type.includes('play')
            ? 'play'
            : type.includes('rule')
              ? 'rule'
              : 'conversation';

      const randomId = `${index}_${elementMode}_${Math.random().toString(36).substring(2, 15)}`;
      const details = `${element?.details || ''}`;
      const description = `${element?.description || ''}`;
      const title = `${element?.title || ''}`;

      const planElement: PlanElement = {
        id: randomId,
        title: title,
        subTitle: '',
        details: details,
        mode: elementMode,
        description: description,
        startCount: 0,
      };
      return planElement;
    });

    return formattedElements;
  };

  const generateGoal = async (input: GenerateGoalProps): Promise<GoalPlan> => {
    if (!goalsCollectionRef) {
      throw new Error('goalsCollectionRef ref is not defined');
    }
    setIsCraftingGoal(true);
    setIsCraftingError(false);

    const [elements, title] = await Promise.all([
      generateElements(input),
      generateGoalTitle(input),
    ]);
    const docRef = doc(goalsCollectionRef);
    const goalPlanId = docRef.id;
    const goalPlan: GoalPlan = {
      id: goalPlanId,
      title: title,
      elements: elements,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      languageCode: input.languageCode,
      goalQuiz: input.goalQuiz || null,
    };

    setIsCraftingGoal(false);
    return goalPlan;
  };

  const setActiveGoal = async (goalId: string) => {
    // Just update updatedAt to make it the latest
    if (!goalsCollectionRef) {
      throw new Error('goalsCollectionRef ref is not defined');
    }
    const docRef = doc(goalsCollectionRef, goalId);
    await setDoc(docRef, { updatedAt: Date.now() }, { merge: true });
  };

  const activeGoal = useMemo(() => {
    const lastGoal = goals
      ?.filter((goal) => {
        const isGoalActive = goal.languageCode === settings.languageCode;
        return isGoalActive;
      })
      .sort((a, b) => {
        if (a.updatedAt && b.updatedAt) {
          return b.updatedAt - a.updatedAt;
        }

        if (a.updatedAt && !b.updatedAt) {
          return -1;
        }

        if (!a.updatedAt && b.updatedAt) {
          return 1;
        }
        return b.createdAt - a.createdAt;
      })[0];

    if (lastGoal) {
      return lastGoal;
    }

    return null;
  }, [goals, settings.languageCode]);

  const deleteGoals = async () => {
    if (!goalsCollectionRef || !auth.uid) {
      throw new Error('goalsCollectionRef ref is not defined');
    }
    if (!activeGoal?.id) return;
    await deleteDoc(doc(goalsCollectionRef, activeGoal.id));
  };

  const updateActiveGoalProgress = async (data: GoalElementProgress) => {
    if (!goalsCollectionRef || !auth.uid) {
      throw new Error('goalsCollectionRef ref is not defined');
    }
    if (!activeGoal?.id) return;

    const existingProgress = activeGoal.progress || [];
    const cleanProgress = existingProgress.filter((p) => p.elementId !== data.elementId);
    cleanProgress.push(data);

    const docRef = doc(goalsCollectionRef, activeGoal.id);

    const updatedGoalData: Partial<GoalPlan> = {
      progress: cleanProgress,
    };
    await setDoc(docRef, updatedGoalData, { merge: true });
  };

  const startGoalElement = async (goalElementId: string) => {
    if (!activeGoal) return;
    const elementNotFound = !activeGoal.elements.find((el) => el.id === goalElementId);
    if (elementNotFound) {
      throw new Error('startGoalElement error: Goal element not found in active goal');
    }

    const existingProgress = activeGoal.progress || [];
    const elementProgress = existingProgress.find((p) => p.elementId === goalElementId);

    const newProgress: GoalElementProgress = {
      elementId: goalElementId,
      startedAtIso: new Date().toISOString(),
      completedAtIso: null,
      results: null,
      ...elementProgress,
      state: 'in_progress',
    };
    await updateActiveGoalProgress(newProgress);
  };

  const finishGoalElement = async (goalElementId: string, results: ConversationResult) => {
    if (!activeGoal) return;

    const elementNotFound = !activeGoal.elements.find((el) => el.id === goalElementId);
    if (elementNotFound) {
      throw new Error('startGoalElement error: Goal element not found in active goal');
    }

    const existingProgress = activeGoal.progress || [];
    const elementProgress = existingProgress.find((p) => p.elementId === goalElementId);

    const newProgress: GoalElementProgress = {
      elementId: goalElementId,
      startedAtIso: elementProgress?.startedAtIso || new Date().toISOString(),
      completedAtIso: new Date().toISOString(),
      results: results,
      state: 'completed',
    };
    await updateActiveGoalProgress(newProgress);
  };

  const isNeededToExtendActiveGoal = useMemo(() => {
    if (!activeGoal) return false;
    const existingProgress = activeGoal.progress || [];
    const completedElements = uniq(
      existingProgress.filter((p) => p.state === 'completed').map((p) => p.elementId),
    );

    return completedElements.length >= activeGoal.elements.length - 3;
  }, [activeGoal]);

  const isGeneratingExtenderGoal = useRef(false);

  const generateMoreElements = async (): Promise<void> => {
    if (isGeneratingExtenderGoal.current) return;
    if (!activeGoal || !goalsCollectionRef) return;

    console.log('Generating extended goal elements...');
    const newElements = await generateExtenderElements({
      languageCode: activeGoal.languageCode,
      existingElements: activeGoal.elements,
      progress: activeGoal.progress || [],
    });
    console.log('New elements', newElements);

    const updatedElements = [...activeGoal.elements, ...newElements];
    const docRef = doc(goalsCollectionRef, activeGoal.id);

    const updatedPlanData: Partial<GoalPlan> = {
      elements: updatedElements,
      updatedAt: Date.now(),
    };
    await setDoc(docRef, updatedPlanData, { merge: true });
    isGeneratingExtenderGoal.current = true;
  };

  useEffect(() => {
    if (isNeededToExtendActiveGoal) {
      generateMoreElements();
    }
  }, [isNeededToExtendActiveGoal]);

  const increaseStartCount = async (plan: GoalPlan, goalElement: PlanElement) => {
    if (!goalsCollectionRef) {
      return;
    }

    const planId = plan.id;
    const elementId = goalElement.id;
    const planData = goals?.find((goal) => goal.id === planId);
    if (!planData) return;
    const element = planData.elements.find((element) => element.id === elementId);
    if (!element) return;
    element.startCount = (element.startCount || 0) + 1;

    const docRef = doc(goalsCollectionRef, planId);
    await setDoc(docRef, { elements: planData.elements }, { merge: true });
  };

  const activeElements = useMemo(() => {
    if (!activeGoal) return [];
    const existingProgress = activeGoal.progress || [];
    const completedElements = uniq(
      existingProgress.filter((p) => p.state === 'completed').map((p) => p.elementId),
    );
    const activeEls = activeGoal.elements.filter((el) => !completedElements.includes(el.id));
    return activeEls;
  }, [activeGoal]);

  const [activeElementId, setActiveElementId] = useUrlState('plan-id', '', false);

  const activeGoalElementInfo = useMemo(() => {
    if (!activeGoal || !activeElementId) return null;
    const element = activeGoal.elements.find((el) => el.id === activeElementId);
    if (!element) return null;

    const goalElementInfo: GoalElementInfo = {
      goalElement: element,
      goalPlan: activeGoal,
    };
    return goalElementInfo;
  }, [activeGoal, activeElementId]);

  const nextElement = activeElements[0];

  const openNextLesson = (): void => {
    openElementModal(nextElement?.id || '');
  };

  const openElementModal = (goalElementId: string): void => {
    setActiveElementId(goalElementId);
  };

  const closeElementModal = (): void => {
    setActiveElementId('');
  };

  return {
    nextElement,
    setActiveGoal,
    goals: goals || [],
    activeGoal,
    increaseStartCount,
    loading,
    addGoalPlan,
    deleteGoals,
    generateGoal,
    isCraftingGoal,
    isCraftingError,

    finishGoalElement,
    startGoalElement,

    generateMoreElements,
    openNextLesson,
    activeGoalElementInfo,

    openElementModal,
    closeElementModal,
  };
}

export function PlanProvider({ children }: { children: ReactNode }): JSX.Element {
  const hook = useProvidePlan();
  return <PlanContext.Provider value={hook}>{children}</PlanContext.Provider>;
}

export const usePlan = (): PlanContextType => {
  const context = useContext(PlanContext);
  if (!context) {
    throw new Error('usePlan must be used within a UsageProvider');
  }
  return context;
};
