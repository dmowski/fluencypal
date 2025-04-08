"use client";
import { createContext, useContext, ReactNode, JSX, useMemo } from "react";
import { useAuth } from "../Auth/useAuth";
import { doc, setDoc } from "firebase/firestore";
import { useCollectionData } from "react-firebase-hooks/firestore";
import { db } from "../Firebase/db";
import { GoalPlan } from "./types";
import { useSettings } from "../Settings/useSettings";

interface PlanContextType {
  goals: GoalPlan[];
  loading: boolean;
  addGoalPlan: (goalPlan: GoalPlan) => void;
  latestGoal: GoalPlan | null;
}

const PlanContext = createContext<PlanContextType | null>(null);

function useProvidePlan(): PlanContextType {
  const auth = useAuth();
  const settings = useSettings();

  const collectionRef = db.collections.goals(auth.uid);
  const [goals, loading] = useCollectionData(collectionRef);

  const addGoalPlan = async (goalPlan: GoalPlan) => {
    if (!collectionRef) {
      throw new Error("Words stats doc ref is not defined");
    }
    const docRef = doc(collectionRef, goalPlan.id);
    await setDoc(docRef, goalPlan, { merge: true });
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

  return {
    goals: goals || [],
    latestGoal,
    loading,
    addGoalPlan,
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
