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
import { getDoc, setDoc } from "firebase/firestore";
import { useCollectionData, useDocumentData } from "react-firebase-hooks/firestore";
import { PaymentLog, TotalUsageInfo, UsageLog } from "@/common/usage";
import { db } from "../Firebase/db";
import { useRouter } from "next/navigation";
import { initWelcomeBalanceRequest } from "./initWelcomeBalanceRequest";
import { createUsageLog } from "./createUsageLog";

interface UsageContextType extends TotalUsageInfo {
  usageLogs: UsageLog[];
  paymentLogs?: PaymentLog[];
  setUsageLogs: Dispatch<SetStateAction<UsageLog[]>>;
  isShowPaymentModal: boolean;
  togglePaymentModal: (isOpen: boolean, isSuccessPayment?: boolean) => void;
  isSuccessPayment: boolean;
}

const UsageContext = createContext<UsageContextType | null>(null);

function useProvideUsage(): UsageContextType {
  const [usageLogs, setUsageLogs] = useState<UsageLog[]>([]);
  const [isShowPaymentModal, setIsShowPaymentModal] = useState(false);
  const [isSuccessPayment, setIsSuccessPayment] = useState(false);

  const router = useRouter();

  const togglePaymentModal = (isOpen: boolean, isSuccessPayment?: boolean) => {
    setIsShowPaymentModal(isOpen);

    if (isSuccessPayment !== undefined) {
      setIsSuccessPayment(isSuccessPayment);
    }

    const searchParams = new URLSearchParams(window.location.search);

    if (isOpen) {
      searchParams.set("paymentModal", "true");
      const newUrl = `${window.location.pathname}?${searchParams.toString()}`;

      router.push(`${newUrl}`, { scroll: false });
    } else {
      searchParams.delete("paymentModal");
      searchParams.delete("paymentSuccess");
      searchParams.delete("session_id");
      searchParams.delete("paymentCanceled");

      const newUrl = `${window.location.pathname}?${searchParams.toString()}`;
      router.push(newUrl, { scroll: false });
      setIsSuccessPayment(false);
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
        await createUsageLog({ usageLog: log }, await auth.getToken());
      })
    );
  };

  useEffect(() => {
    if (!userId || !totalUsageDoc) {
      return;
    }

    const lastUpdated = totalUsage?.lastUpdatedAt || 0;
    const newUsageLogs = usageLogs.filter((log) => log.createdAt > lastUpdated);
    if (newUsageLogs.length === 0) {
      return;
    }

    saveLogs(newUsageLogs);
  }, [totalUsage, usageLogs, userId, totalUsageDoc]);

  const totalUsageClean: TotalUsageInfo = {
    lastUpdatedAt: totalUsage?.lastUpdatedAt || 0,
    usedBalance: totalUsage?.usedBalance || 0,
    balance: totalUsage?.balance || 0,
  };

  const initWelcomeBalance = async () => {
    if (!totalUsageDoc || !userId) {
      return;
    }
    const docData = await getDoc(totalUsageDoc);
    const totalData = docData.data();
    if (!totalData) {
      console.log("ADD START BALANCE");
      await initWelcomeBalanceRequest(
        {
          languageCode: "en",
        },
        await auth.getToken()
      );
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
    isShowPaymentModal,
    togglePaymentModal,
    isSuccessPayment,
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
