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
import { doc, getDoc, setDoc } from "firebase/firestore";
import { useCollectionData, useDocumentData } from "react-firebase-hooks/firestore";
import {
  PaymentLog,
  PaymentLogType,
  TotalUsageInfo,
  UsageLog,
  WELCOME_BONUS,
} from "@/common/usage";
import { db } from "../Firebase/db";
import { useRouter, useSearchParams } from "next/navigation";

interface UsageContextType extends TotalUsageInfo {
  usageLogs: UsageLog[];
  paymentLogs?: PaymentLog[];
  setUsageLogs: Dispatch<SetStateAction<UsageLog[]>>;
  addBalance: (amount: number, type: PaymentLogType) => void;
  isShowPaymentModal: boolean;
  togglePaymentModal: (isOpen: boolean) => void;
}

const UsageContext = createContext<UsageContextType | null>(null);

function useProvideUsage(): UsageContextType {
  const [usageLogs, setUsageLogs] = useState<UsageLog[]>([]);
  const [isShowPaymentModal, setIsShowPaymentModal] = useState(false);

  const router = useRouter();

  const togglePaymentModal = (isOpen: boolean) => {
    setIsShowPaymentModal(isOpen);
    if (isOpen) {
      router.push(`${window.location.pathname}?paymentModal=true`, { scroll: false });
    } else {
      router.push(window.location.pathname, { scroll: false });
    }
  };

  const auth = useAuth();
  const userId = auth.uid;

  const totalUsageDoc = db.documents.totalUsage(userId);
  const paymentLogCollection = db.collections.paymentLog(userId);
  const [paymentLogs] = useCollectionData(paymentLogCollection ? paymentLogCollection : null);

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

  const addPaymentLog = async (amountAdded: number, type: PaymentLogType) => {
    if (!userId || !paymentLogCollection) return;
    const docRef = doc(paymentLogCollection);

    const paymentLog: PaymentLog = {
      id: docRef.id,
      amountAdded,
      createdAt: Date.now(),
      type,
    };

    await setDoc(docRef, paymentLog);
  };

  const addBalance = (amount: number, type: PaymentLogType) => {
    if (!userId || !totalUsageDoc) return;

    const newTotalUsage: TotalUsageInfo = {
      balance: (totalUsage?.balance || 0) + amount,
      usedBalance: totalUsage?.usedBalance || 0,
      lastUpdatedAt: Date.now(),
    };

    addPaymentLog(amount, type);

    setDoc(totalUsageDoc, newTotalUsage);
  };

  const initWelcomeBalance = async () => {
    if (!totalUsageDoc || !userId) {
      return;
    }
    const docData = await getDoc(totalUsageDoc);
    const totalData = docData.data();
    if (!totalData) {
      console.log("ADD START BALANCE");
      addBalance(WELCOME_BONUS, "welcome");
    }
  };

  useEffect(() => {
    if (!userId) return;
    initWelcomeBalance();
  }, [userId, totalUsageDoc]);

  return {
    ...totalUsageClean,
    paymentLogs: paymentLogs,
    usageLogs,
    setUsageLogs,
    addBalance,
    isShowPaymentModal,
    togglePaymentModal,
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
