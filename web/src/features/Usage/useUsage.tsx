'use client';
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
} from 'react';
import { useAuth } from '../Auth/useAuth';
import { getDoc } from 'firebase/firestore';
import { useCollectionData, useDocumentData } from 'react-firebase-hooks/firestore';
import { PaymentLog, TotalUsageInfo, UsageLog } from '@/features/Usage/usage';
import { db } from '../Firebase/firebaseDb';
import { useRouter, useSearchParams } from 'next/navigation';
import { initWelcomeBalanceRequest } from './initWelcomeBalanceRequest';
import { createUsageLog } from './createUsageLog';
import dayjs from 'dayjs';
import { useUrlState } from '../Url/useUrlState';
import { sleep } from '@/libs/sleep';

interface UsageContextType extends TotalUsageInfo {
  usageLogs: UsageLog[];
  isFullAccess: boolean;
  paymentLogs?: PaymentLog[];
  setUsageLogs: Dispatch<SetStateAction<UsageLog[]>>;
  isShowPaymentModal: boolean;
  togglePaymentModal: (isOpen: boolean) => void;
  isSuccessPayment: boolean;
  loading: boolean;
  balanceHours: number;
  isWelcomeBalanceInitialized: boolean;
}

const UsageContext = createContext<UsageContextType | null>(null);

function useProvideUsage(): UsageContextType {
  const [usageLogs, setUsageLogs] = useState<UsageLog[]>([]);
  const [isShowPaymentModal, setIsShowPaymentModal] = useUrlState('paymentModal', false, true);
  const [isSuccessPayment, setIsSuccessPayment] = useUrlState('paymentSuccess', false, true);
  const [isWelcomeBalanceInitialized, setIsWelcomeBalanceInitialized] = useState(false);

  const togglePaymentModal = async (isOpen: boolean) => {
    setIsShowPaymentModal(isOpen);

    if (!isOpen && isSuccessPayment) {
      await sleep(500);
      setIsSuccessPayment(false);
    }
  };

  const auth = useAuth();
  const userId = auth.uid;

  const totalUsageDoc = db.documents.totalUsage(userId);
  const paymentLogCollection = db.collections.paymentLog(userId);
  const [paymentLogs] = useCollectionData(paymentLogCollection ? paymentLogCollection : null);

  const [totalUsage, loadingTotalUsage] = useDocumentData<TotalUsageInfo>(totalUsageDoc);

  const usageLogExistsRef = useRef<{ [usageId: string]: boolean }>({});
  const createUsageLogWrapper = async (log: UsageLog) => {
    if (usageLogExistsRef.current[log.usageId]) return;

    const logDocRef = db.documents.usageLog(userId, log.usageId);
    if (!logDocRef) return;

    const dbLog = await getDoc(logDocRef);
    const isExists = dbLog.exists();
    if (isExists) {
      usageLogExistsRef.current[log.usageId] = true;
      return;
    }

    await createUsageLog({ usageLog: log }, await auth.getToken());
    usageLogExistsRef.current[log.usageId] = true;
  };

  const saveLogs = async (logs: UsageLog[]) => {
    if (!userId) return;

    await Promise.all(
      logs.map(async (log) => {
        await createUsageLogWrapper(log);
      }),
    );
  };

  useEffect(() => {
    if (!userId) return;
    saveLogs(usageLogs);
  }, [usageLogs, userId]);

  const isBalanceInit = useRef(false);
  const initWelcomeBalance = async () => {
    if (!totalUsageDoc || !userId || isBalanceInit.current) {
      return;
    }
    const docData = await getDoc(totalUsageDoc);
    const totalData = docData.data();
    if (!totalData) {
      console.log('ADD START BALANCE');
      isBalanceInit.current = true;
      await initWelcomeBalanceRequest({}, await auth.getToken());
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
    throw new Error('useUsage must be used within a UsageProvider');
  }
  return context;
};
