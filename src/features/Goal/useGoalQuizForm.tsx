import { useEffect, useState } from "react";
import { SupportedLanguage } from "../Lang/lang";

interface GoalQuizData {
  description: string;
  languageToLearn: SupportedLanguage;
  nativeLanguage: SupportedLanguage;
  step: number;
  minPerDay: number;
  level: string;
}

const STORAGE_KEY = "goalQuizData";

export const useGoalQuizForm = (defaultData: GoalQuizData) => {
  const [data, setData] = useState<GoalQuizData>(defaultData);

  const saveDataToStorage = (data: GoalQuizData) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  };
  const getDataFromStorage = (): GoalQuizData | null => {
    const data = localStorage.getItem(STORAGE_KEY);
    if (data) {
      try {
        return JSON.parse(data) as GoalQuizData;
      } catch (error) {
        console.error("Failed to parse goal quiz data from storage:", error);
        return null;
      }
    }
    return null;
  };

  useEffect(() => {
    const isWindow = typeof window !== "undefined";
    if (!isWindow) {
      return;
    }

    setTimeout(() => {
      const storedData = getDataFromStorage();
      if (storedData) {
        setData(storedData);
      }
    }, 3000);
  }, []);

  const updateData = (newData: Partial<GoalQuizData>) => {
    const updatedData = {
      ...data,
      ...newData,
    };
    setData(updatedData);
    saveDataToStorage(updatedData);
  };

  return {
    updateData,
    data,
  };
};
