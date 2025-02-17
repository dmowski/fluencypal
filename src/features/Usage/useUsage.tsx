"use client";
import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  ReactNode,
  JSX,
  Dispatch,
  SetStateAction,
} from "react";
import { useAuth } from "../Auth/useAuth";
import { doc, DocumentReference, setDoc } from "firebase/firestore";
import { firestore } from "../Firebase/init";
import { useDocumentData } from "react-firebase-hooks/firestore";
import { RealTimeModel, UsageEvent } from "@/common/ai";

export interface UsageLog {
  usageId: string;
  usageEvent: UsageEvent;
  model: RealTimeModel;
  price: number;
  createdAt: number;
}

export interface TotalUsageInfo {
  lastUpdatedAt: number;
  usedBalance: number; // $
  balance: number; // $
}

interface UsageContextType extends TotalUsageInfo {
  usageLogs: UsageLog[];
  setUsageLogs: Dispatch<SetStateAction<UsageLog[]>>;
  addBalance: (amount: number) => void;
  isShowPaymentModal: boolean;
  setIsShowPaymentModal: Dispatch<SetStateAction<boolean>>;
}

const UsageContext = createContext<UsageContextType | null>(null);

function useProvideUsage(): UsageContextType {
  const [usageLogs, setUsageLogs] = useState<UsageLog[]>([]);
  const [isShowPaymentModal, setIsShowPaymentModal] = useState(false);
  const auth = useAuth();
  const userId = auth.uid;

  const totalUsageDoc = useMemo(() => {
    return userId
      ? (doc(firestore, `users/${userId}/stats/usage`) as DocumentReference<TotalUsageInfo>)
      : null;
  }, [userId]);

  const [totalUsage] = useDocumentData<TotalUsageInfo>(totalUsageDoc);

  const saveLogs = async (logs: UsageLog[]) => {
    if (!userId) return;

    await Promise.all(
      logs.map(async (log) => {
        const docRef = doc(
          firestore,
          `users/${userId}/usageLogs/${log.usageId}`
        ) as DocumentReference<UsageLog>;
        setDoc(docRef, log, { merge: true });
      })
    );
  };

  useEffect(() => {
    if (!userId) {
      return;
    }

    const lastUpdated = totalUsage?.lastUpdatedAt || 0;
    const now = Date.now();
    const newUsageLogs = usageLogs.filter((log) => log.createdAt > lastUpdated);
    if (newUsageLogs.length === 0) {
      return;
    }

    saveLogs(newUsageLogs);

    const newUsed = newUsageLogs.reduce((acc, log) => acc + log.price, 0);

    const newTotalUsage: TotalUsageInfo = {
      balance: (totalUsage?.balance || 0) - newUsed,
      usedBalance: (totalUsage?.usedBalance || 0) + newUsed,
      lastUpdatedAt: now,
    };

    if (totalUsageDoc) {
      setDoc(totalUsageDoc, newTotalUsage);
    }
  }, [totalUsage, usageLogs, userId, totalUsageDoc]);

  const totalUsageClean: TotalUsageInfo = {
    lastUpdatedAt: totalUsage?.lastUpdatedAt || 0,
    usedBalance: totalUsage?.usedBalance || 0,
    balance: totalUsage?.balance || 0,
  };

  const addBalance = (amount: number) => {
    if (!userId || !totalUsageDoc) return;

    const newTotalUsage: TotalUsageInfo = {
      balance: (totalUsage?.balance || 0) + amount,
      usedBalance: totalUsage?.usedBalance || 0,
      lastUpdatedAt: Date.now(),
    };

    setDoc(totalUsageDoc, newTotalUsage);
  };

  return {
    ...totalUsageClean,
    usageLogs,
    setUsageLogs,
    addBalance,
    isShowPaymentModal,
    setIsShowPaymentModal,
  };
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
