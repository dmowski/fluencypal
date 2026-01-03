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
  useRef,
} from "react";
import { useAuth } from "../Auth/useAuth";
import { getDoc } from "firebase/firestore";
import { useCollectionData, useDocumentData } from "react-firebase-hooks/firestore";
import { PaymentLog, TotalUsageInfo, UsageLog } from "@/common/usage";
import { db } from "../Firebase/firebaseDb";
import { useRouter, useSearchParams } from "next/navigation";
import { initWelcomeBalanceRequest } from "./initWelcomeBalanceRequest";
import { createUsageLog } from "./createUsageLog";
import dayjs from "dayjs";

interface UsageContextType extends TotalUsageInfo {
  usageLogs: UsageLog[];
  isFullAccess: boolean;
  paymentLogs?: PaymentLog[];
  setUsageLogs: Dispatch<SetStateAction<UsageLog[]>>;
  isShowPaymentModal: boolean;
  togglePaymentModal: (isOpen: boolean, isSuccessPayment?: boolean) => void;
  isSuccessPayment: boolean;
  loading: boolean;
  balanceHours: number;
  isWelcomeBalanceInitialized: boolean;
}

const UsageContext = createContext<UsageContextType | null>(null);

function useProvideUsage(): UsageContextType {
  const [usageLogs, setUsageLogs] = useState<UsageLog[]>([]);
  const [isShowPaymentModal, setIsShowPaymentModal] = useState(false);
  const [isSuccessPayment, setIsSuccessPayment] = useState(false);
  const [isWelcomeBalanceInitialized, setIsWelcomeBalanceInitialized] = useState(false);
  const searchParams = useSearchParams();
  const isPaymentModalInUrl = searchParams.get("paymentModal") === "true";
  const router = useRouter();

  useEffect(() => {
    if (isPaymentModalInUrl && isPaymentModalInUrl !== isShowPaymentModal) {
      togglePaymentModal(true, isSuccessPayment);
      return;
    }

    if (!isPaymentModalInUrl && isShowPaymentModal) {
      togglePaymentModal(false);
    }
  }, [isPaymentModalInUrl]);

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

  const isBalanceInit = useRef(false);
  const initWelcomeBalance = async () => {
    if (!totalUsageDoc || !userId || isBalanceInit.current) {
      return;
    }
    const docData = await getDoc(totalUsageDoc);
    const totalData = docData.data();
    if (!totalData) {
      console.log("ADD START BALANCE");
      isBalanceInit.current = true;
      await initWelcomeBalanceRequest(
        {
          languageCode: "en",
        },
        await auth.getToken()
      );
    }

    setIsWelcomeBalanceInitialized(true);
  };

  useEffect(() => {
    if (!userId) return;
    initWelcomeBalance();
  }, [userId, totalUsageDoc]);

  const activeSubscriptionTill = totalUsage?.activeSubscriptionTill
    ? dayjs(totalUsage.activeSubscriptionTill).isAfter(dayjs())
    : false;
  const isFullAccess =
    activeSubscriptionTill || (!!totalUsage?.balanceHours && totalUsage.balanceHours > 0);

  return {
    isFullAccess: isFullAccess,
    lastUpdatedAt: totalUsage?.lastUpdatedAt || 0,
    activeSubscriptionTill: activeSubscriptionTill
      ? totalUsage?.activeSubscriptionTill || undefined
      : undefined,
    usedHours: totalUsage?.usedHours || 0,
    balanceHours: totalUsage?.balanceHours || 0,
    isWelcomeBalanceInitialized,

    loading: loadingTotalUsage || !totalUsage,
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
