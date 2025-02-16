"use client";
import { createContext, useContext, useEffect, useMemo, useState, ReactNode, JSX } from "react";
import { useAuth } from "../Auth/useAuth";
import { doc, DocumentReference, setDoc } from "firebase/firestore";
import { firestore } from "../Firebase/init";
import { useDocumentData } from "react-firebase-hooks/firestore";
import { pricePerMillionOutputAudioTokens } from "@/common/ai";

export interface UsageLog {
  id: string;
  tokens: number;
  createdAt: number;
}

export interface TotalUsageInfo {
  lastUpdatedAt: number;
  totalUsageTokensUsed: number;
  totalUsageTokensAvailable: number;
}

interface UsageContextType {
  tokenUsed: number;
  tokenUsedPrice: number;
  usageLogs: UsageLog[];
  setUsageLogs: (logs: UsageLog[]) => void;
}

const UsageContext = createContext<UsageContextType | null>(null);

function useProvideUsage(): UsageContextType {
  const [usageLogs, setUsageLogs] = useState<UsageLog[]>([]);
  const auth = useAuth();
  const userId = auth.uid;

  const totalUsageDoc = useMemo(() => {
    return userId
      ? (doc(firestore, `users/${userId}/usage/total`) as DocumentReference<TotalUsageInfo>)
      : null;
  }, [userId]);

  const [totalUsage] = useDocumentData<TotalUsageInfo>(totalUsageDoc);

  useEffect(() => {
    if (!userId || !totalUsage) {
      return;
    }

    const lastUpdated = totalUsage.lastUpdatedAt || 0;
    const now = Date.now();
    const newUsageLogs = usageLogs.filter((log) => log.createdAt > lastUpdated);
    if (newUsageLogs.length === 0) {
      return;
    }

    const totalTokensFromNewLogs = newUsageLogs.reduce((acc, log) => acc + log.tokens, 0);
    const newTotalUsage: TotalUsageInfo = {
      ...totalUsage,
      totalUsageTokensUsed: (totalUsage.totalUsageTokensUsed || 0) + totalTokensFromNewLogs,
      totalUsageTokensAvailable: totalUsage.totalUsageTokensAvailable || 0,
      lastUpdatedAt: now,
    };

    if (totalUsageDoc) {
      console.log("Update total usage", newTotalUsage);
      setDoc(totalUsageDoc, newTotalUsage);
    }
  }, [totalUsage, usageLogs, userId, totalUsageDoc]);

  const tokenUsed = totalUsage?.totalUsageTokensUsed || 0;
  const tokenUsedPrice = (tokenUsed / 1_000_000) * pricePerMillionOutputAudioTokens;

  return { tokenUsed, tokenUsedPrice, usageLogs, setUsageLogs };
}

export function UsageProvider({ children }: { children: ReactNode }): JSX.Element {
  const usage = useProvideUsage();
  return <UsageContext.Provider value={usage}>{children}</UsageContext.Provider>;
}

export const useUsage = (): UsageContextType => {
  const context = useContext(UsageContext);
  if (!context) {
    throw new Error("useUsage must be used within a UsageProvider");
  }
  return context;
};
