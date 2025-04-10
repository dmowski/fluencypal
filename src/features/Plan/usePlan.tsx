"use client";
import { createContext, useContext, ReactNode, JSX, useMemo, useState } from "react";
import { useAuth } from "../Auth/useAuth";
import { doc, setDoc } from "firebase/firestore";
import { useCollectionData } from "react-firebase-hooks/firestore";
import { db } from "../Firebase/db";
import { GoalPlan, PlanElement, PlanElementMode } from "./types";
import { useSettings } from "../Settings/useSettings";
import { deleteCollectionDocs } from "../Firebase/init";
import { ChatMessage } from "@/common/conversation";
import { AiUserInfoRecord } from "@/common/userInfo";
import { useTextAi } from "../Ai/useTextAi";

interface GenerateGoalProps {
  conversationMessage: ChatMessage[];
  userInfo: AiUserInfoRecord[];
}
interface PlanContextType {
  goals: GoalPlan[];
  loading: boolean;
  addGoalPlan: (goalPlan: GoalPlan) => Promise<void>;
  latestGoal: GoalPlan | null;
  deleteGoals: () => void;
  generateGoal: (input: GenerateGoalProps) => Promise<GoalPlan>;
  increaseStartCount: (plan: GoalPlan, goalElement: PlanElement) => void;
  isCraftingGoal: boolean;
  isCraftingError: boolean;
}

const PlanContext = createContext<PlanContextType | null>(null);

function useProvidePlan(): PlanContextType {
  const auth = useAuth();
  const settings = useSettings();
  const textAi = useTextAi();
  const [isCraftingGoal, setIsCraftingGoal] = useState(false);
  const [isCraftingError, setIsCraftingError] = useState(false);

  const collectionRef = db.collections.goals(auth.uid);
  const [goals, loading] = useCollectionData(collectionRef);

  const addGoalPlan = async (goalPlan: GoalPlan) => {
    if (!collectionRef) {
      throw new Error("collectionRef ref is not defined");
    }
    const docRef = doc(collectionRef, goalPlan.id);
    await setDoc(docRef, goalPlan, { merge: true });
  };

  const generateGoalTitle = async (input: GenerateGoalProps): Promise<string> => {
    const systemMessage = `
You are professional ${settings.fullLanguageName || "English"} Teacher. 
Here is student/teacher conversation. Based on student's lever and their goal, formulate learning goal. 

Goal should me simple and clear. Max 3-4 words.
Example: Pass Job Interview
Return only goal without any wrapper phrases, because your response will be used as title on UI.
Use ${settings.fullLanguageName || "English"} language for generating goal.
If you can't formulate goal, return "General Practice" as goal.
`;

    const userMessage = `
===
Conversation:
${input.conversationMessage.map((message) => {
  const isBot = message.isBot;
  const author = isBot ? "Teacher" : "Student";
  const text = message.text;
  return `${author}: ${text}`;
})}
`;

    const goal = await textAi.generate({
      systemMessage,
      userMessage,
      model: "gpt-4o",
    });

    return goal;
  };

  const generateElements = async (input: GenerateGoalProps): Promise<PlanElement[]> => {
    const systemMessage = `
You are professional ${settings.fullLanguageName || "English"} Teacher. 

Below is a conversation between a student and a teacher. Based on the student's level and goals, generate a personalized language learning plan that can be completed using our AI-powered language learning app.

The app supports the following activity types:
* words: Practice vocabulary related to a specific topic
* play: Role-play conversations (e.g. job interview)
* rule: Learn and practice grammar or language rules
* conversation: General conversation with AI on a specific topic

Your output must be in valid JSON format with no additional text or explanation. It will be parsed using JSON.parse().

Example of plan:
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
    "type": "words",
    "title": "Behavioral Interview Vocabulary",
    "description": "Common words and phrases used in behavioral interviews",
    "details": "Learn expressions and vocabulary related to workplace behavior, leadership, and problem-solving (e.g. deadline, teamwork, responsibility). Practice them in short sentences and mock questions."
  },
  {
    "type": "play",
    "title": "Job Interview Simulation",
    "description": "Mock technical interview for a software developer position",
    "details": "AI acts as an interviewer asking both technical and behavioral questions. Student must respond clearly and confidently. After each response, AI gives specific feedback on grammar, vocabulary, and fluency."
  },
  {
    "type": "play",
    "title": "Daily Stand-Up Meeting",
    "description": "Role-play a developer’s daily stand-up",
    "details": "Student practices summarizing yesterday’s work, today’s plans, and blockers. AI provides realistic follow-up questions. Focus on past and future tense, fluency, and concise speaking."
  },
  {
    "type": "rule",
    "title": "Past Simple Tense",
    "description": "Understanding and practicing past simple tense",
    "details": "Review past simple grammar rules. Student completes gap-fill exercises, rewrites present-tense sentences, and speaks about past events. AI highlights mistakes and corrects them with explanations."
  },
  {
    "type": "rule",
    "title": "Conditionals",
    "description": "Practice zero, first, and second conditionals",
    "details": "Teach the form and function of conditionals using examples. Student practices constructing correct sentences, transforming incorrect ones, and using conditionals in context-based speaking."
  },
  {
    "type": "conversation",
    "title": "Workplace Culture",
    "description": "Discussion about working in an international team",
    "details": "Student practices discussing topics like remote work, teamwork, and workplace etiquette. AI introduces cultural nuances and encourages comparisons with the student's own experience to deepen understanding."
  }
]

Use ${settings.fullLanguageName || "English"} language for generating plan (title, description, details).
The plan should include at least 8 elements and must cover each type of activity.
`;

    const userMessage = `Conversation:
${input.conversationMessage.map((message) => {
  const isBot = message.isBot;
  const author = isBot ? "Teacher" : "Student";
  const text = message.text;
  return `${author}: ${text}`;
})}
`;

    const elements = await textAi.generate({
      systemMessage,
      userMessage,
      model: "gpt-4o",
    });

    const parsedElements = JSON.parse(elements) as AiGeneratedElement[];

    interface AiGeneratedElement {
      type: string;
      title: string;
      description: string;
      details: string;
    }

    const formattedElements: PlanElement[] = parsedElements.map((element, index) => {
      const type = `${element?.type || ""}`.toLowerCase();
      const elementMode: PlanElementMode = type.includes("conversation")
        ? "conversation"
        : type.includes("words")
          ? "words"
          : type.includes("play")
            ? "play"
            : type.includes("rule")
              ? "rule"
              : "conversation";

      const randomId = `${index}_${elementMode}_${Math.random().toString(36).substring(2, 15)}`;
      const details = `${element?.details || ""}`;
      const description = `${element?.description || ""}`;
      const title = `${element?.title || ""}`;

      const planElement: PlanElement = {
        id: randomId,
        title: title,
        subTitle: "",
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
    if (!collectionRef) {
      throw new Error("collectionRef ref is not defined");
    }
    setIsCraftingGoal(true);
    setIsCraftingError(false);

    const [elements, title] = await Promise.all([
      generateElements(input),
      generateGoalTitle(input),
    ]);
    const docRef = doc(collectionRef);
    const goalPlanId = docRef.id;
    const goalPlan: GoalPlan = {
      id: goalPlanId,
      title: title,
      elements: elements,
      createdAt: Date.now(),
      languageCode: settings.languageCode || "en",
    };

    setIsCraftingGoal(false);
    return goalPlan;
  };

  const latestGoal = useMemo(() => {
    const lastGoal = goals
      ?.filter((goal) => {
        const isGoalActive = goal.languageCode === settings.languageCode;
        return isGoalActive;
      })
      .sort((a, b) => b.createdAt - a.createdAt)[0];

    if (lastGoal) {
      return lastGoal;
    }

    return null;
  }, [goals, settings.languageCode]);

  const deleteGoals = async () => {
    if (!collectionRef || !auth.uid) {
      throw new Error("collectionRef ref is not defined");
    }

    await deleteCollectionDocs(`users/${auth.uid}/goals`);
  };

  const increaseStartCount = async (plan: GoalPlan, goalElement: PlanElement) => {
    if (!collectionRef) {
      return;
    }

    const planId = plan.id;
    const elementId = goalElement.id;
    const planData = goals?.find((goal) => goal.id === planId);
    if (!planData) return;
    const element = planData.elements.find((element) => element.id === elementId);
    if (!element) return;
    element.startCount = (element.startCount || 0) + 1;

    const docRef = doc(collectionRef, planId);
    await setDoc(docRef, { elements: planData.elements }, { merge: true });
  };

  return {
    goals: goals || [],
    latestGoal,
    increaseStartCount,
    loading,
    addGoalPlan,
    deleteGoals,
    generateGoal,
    isCraftingGoal,
    isCraftingError,
  };
}

export function PlanProvider({ children }: { children: ReactNode }): JSX.Element {
  const hook = useProvidePlan();
  return <PlanContext.Provider value={hook}>{children}</PlanContext.Provider>;
}

export const usePlan = (): PlanContextType => {
  const context = useContext(PlanContext);
  if (!context) {
    throw new Error("usePlan must be used within a UsageProvider");
  }
  return context;
};
