"use client";
import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
  JSX,
  Dispatch,
  SetStateAction,
} from "react";
import { useAuth } from "../Auth/useAuth";
import { setDoc } from "firebase/firestore";
import { useDocumentData } from "react-firebase-hooks/firestore";
import { TotalUsageInfo, UsageLog } from "@/common/usage";
import { db } from "../Firebase/db";

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

  const totalUsageDoc = db.documents.totalUsage(userId);

  const [totalUsage, loadingTotalUsage] = useDocumentData<TotalUsageInfo>(totalUsageDoc);
  const saveLogs = async (logs: UsageLog[]) => {
    if (!userId) return;

    await Promise.all(
      logs.map(async (log) => {
        const docRef = db.documents.usageLog(userId, log.usageId);
        if (!docRef) return;

        await setDoc(docRef, log, { merge: true });
      })
    );
  };

  useEffect(() => {
    if (!userId || !totalUsageDoc) {
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

    setDoc(totalUsageDoc, newTotalUsage);
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

  const START_BALANCE = 5;
  useEffect(() => {
    if (!userId || loadingTotalUsage || totalUsage) return;
    addBalance(START_BALANCE);
  }, [userId, loadingTotalUsage, totalUsage]);

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
