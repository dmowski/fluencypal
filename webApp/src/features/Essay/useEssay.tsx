'use client';
import { useState, createContext, useContext, ReactNode, JSX } from 'react';
import { useTextAi } from '@/features/Ai/useTextAi';
import { Essay } from './types';

const STORAGE_KEY = 'essays';

const loadEssays = (): Essay[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as Essay[];
  } catch {
    return [];
  }
};

const saveEssays = (essays: Essay[]) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(essays));
};

interface EssayContextType {
  essays: Essay[];
  lastEssay: Essay | null;
  createEssay: () => Essay;
  updateEssay: (id: string, text: string) => void;
  appendToEssay: (id: string, transcript: string) => void;
  deleteEssay: (id: string) => void;
  analyzeEssay: (id: string) => Promise<void>;
  analyzingEssayId: string | null;
}

const EssayContext = createContext<EssayContextType | null>(null);

function useProvideEssay(): EssayContextType {
  const [essays, setEssays] = useState<Essay[]>(() => loadEssays());
  const [analyzingEssayId, setAnalyzingEssayId] = useState<string | null>(null);
  const textAi = useTextAi();

  const createEssay = (): Essay => {
    const newEssay: Essay = {
      id: crypto.randomUUID(),
      text: '',
      createdAtIso: new Date().toISOString(),
      updatedAtIso: new Date().toISOString(),
      analysis: null,
    };
    setEssays((prev) => {
      const updated = [...prev, newEssay];
      saveEssays(updated);
      return updated;
    });
    return newEssay;
  };

  const updateEssay = (id: string, text: string) => {
    setEssays((prev) => {
      const updated = prev.map((e) =>
        e.id === id ? { ...e, text, updatedAtIso: new Date().toISOString() } : e,
      );
      saveEssays(updated);
      return updated;
    });
  };

  const appendToEssay = (id: string, transcript: string) => {
    setEssays((prev) => {
      const updated = prev.map((e) => {
        if (e.id !== id) return e;
        const separator = e.text.length > 0 ? ' ' : '';
        const newText = e.text + separator + transcript;
        return { ...e, text: newText, updatedAtIso: new Date().toISOString() };
      });
      saveEssays(updated);
      return updated;
    });
  };

  const deleteEssay = (id: string) => {
    setEssays((prev) => {
      const updated = prev.filter((e) => e.id !== id);
      saveEssays(updated);
      return updated;
    });
  };

  const analyzeEssay = async (id: string) => {
    const essay = essays.find((e) => e.id === id);
    if (!essay || !essay.text.trim()) return;

    setAnalyzingEssayId(id);
    try {
      const analysis = await textAi.generate({
        systemMessage: `You are an expert writing coach. Analyze the provided essay and return a markdown-formatted analysis covering:

## Style
Evaluate how well the essay is written: clarity, structure, tone, flow, and overall quality.

## Grammar Mistakes
List grammar mistakes found and explain how to fix each one. If there are no mistakes, say so.`,
        userMessage: essay.text,
        model: 'gpt-4o',
      });
      setEssays((prev) => {
        const updated = prev.map((e) =>
          e.id === id ? { ...e, analysis, updatedAtIso: new Date().toISOString() } : e,
        );
        saveEssays(updated);
        return updated;
      });
    } finally {
      setAnalyzingEssayId(null);
    }
  };

  const lastEssay = essays.length > 0 ? essays[essays.length - 1] : null;

  return {
    essays,
    lastEssay,
    createEssay,
    updateEssay,
    appendToEssay,
    deleteEssay,
    analyzeEssay,
    analyzingEssayId,
  };
}

export function EssayProvider({ children }: { children: ReactNode }): JSX.Element {
  const hook = useProvideEssay();
  return <EssayContext.Provider value={hook}>{children}</EssayContext.Provider>;
}

export const useEssay = (): EssayContextType => {
  const context = useContext(EssayContext);
  if (!context) {
    throw new Error('useEssay must be used within an EssayProvider');
  }
  return context;
};
