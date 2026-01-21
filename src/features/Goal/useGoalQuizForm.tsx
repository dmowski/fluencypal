import { useEffect, useState } from 'react';
import { SupportedLanguage } from '../Lang/lang';
import { NativeLangCode } from '@/libs/language/type';

interface GoalQuizData {
  description: string;
  languageToLearn: SupportedLanguage;
  nativeLanguage: NativeLangCode | null;
  minPerDay: number;
  level: string;
}

const STORAGE_KEY = 'goalQuizData';

export const useGoalQuizForm = (defaultData: GoalQuizData) => {
  const [data, setData] = useState<GoalQuizData>(defaultData);
  const [isQuizDataLoading, setIsQuizDataLoading] = useState<boolean>(true);

  const saveDataToStorage = (data: GoalQuizData) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  };
  const getDataFromStorage = (): GoalQuizData | null => {
    const storageData = localStorage.getItem(STORAGE_KEY);
    if (storageData) {
      try {
        return JSON.parse(storageData) as GoalQuizData;
      } catch (error) {
        console.error('Failed to parse goal quiz data from storage:', error);
        return null;
      }
    }
    return null;
  };

  useEffect(() => {
    const isWindow = typeof window !== 'undefined';
    if (!isWindow) {
      return;
    }

    setTimeout(() => {
      const storedData = getDataFromStorage();
      if (storedData) {
        setData(storedData);
      }
      setIsQuizDataLoading(false);
    }, 100);
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
    isQuizDataLoading,
    data,
  };
};
