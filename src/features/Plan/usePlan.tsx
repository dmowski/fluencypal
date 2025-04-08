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
  addGoalPlan: (goalPlan: GoalPlan) => void;
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
Here is student/teacher conversation. Based on student's lever and their goal, formulate learning plan. 
The plan should be achieved using AI language learning app.

Abilities of language learning app.
* words: Practice words related to specific topic
* play: Role play conversation (Example Job interview)
* rule: Practice rules related to specific language, language area
* conversation: conversation with ai related to specific topic

Return plan in json format. Avoid wrapper phrases because your response will be used with JSON.parse function.
Example of plan:
[
{
"type": "conversation",
"title": "Street",
"description": "Conversation related to seeking help on the streets"
},
{
"type": "words",
"title": "Software",
"description": "Practice software development words"
},
{
"type": "words",
"title": "Behavior",
"description": "Practice words related to behavior interview"
},
{
"type": "play",
"title": "Job interview",
"description": "Interview role-play conversation; Position Software developer. Technical Interview "
},
{
"type": "play",
"title": "Daily standup",
"description": "Daily standup. Developer routine"
},
{
"type": "rule",
"title": "Past simple",
"description": "Practice rules related to past simple tense",
}
]

Use ${settings.fullLanguageName || "English"} language for generating plan (title and description).
Your plan should contain at least 8 elements. Including each type of ability`;

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

    const elements = await textAi.generate({
      systemMessage,
      userMessage,
      model: "gpt-4o",
    });

    const parsedElements = JSON.parse(elements);

    interface AiGeneratedElement {
      type: string;
      title: string;
      description: string;
    }

    const formattedElements: PlanElement[] = parsedElements.map((element: AiGeneratedElement) => {
      const randomId = Math.random().toString(36).substring(2, 15);

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

      const description = `${element?.description || ""}`;
      const title = `${element?.title || ""}`;

      const planElement: PlanElement = {
        id: randomId,
        title: title,
        subTitle: "",
        mode: elementMode,
        description: description,
        preparingInstructionForAi: "",
        instructionForAi: "",
        startCount: 0,
      };
      return planElement;
    });

    return formattedElements;
  };

  const generateGoal = async (input: GenerateGoalProps): Promise<GoalPlan> => {
    setIsCraftingGoal(true);
    setIsCraftingError(false);

    const [elements, title] = await Promise.all([
      generateElements(input),
      generateGoalTitle(input),
    ]);
    const randomId = Math.random().toString(36).substring(2, 15);
    const goalPlan: GoalPlan = {
      id: randomId,
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
