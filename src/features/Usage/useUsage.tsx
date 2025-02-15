import { useEffect, useMemo, useState } from "react";
import { useAuth } from "../Auth/useAuth";
import { doc, DocumentReference, setDoc } from "firebase/firestore";
import { firestore } from "../Firebase/init";
import { useCollectionData, useDocumentData } from "react-firebase-hooks/firestore";

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

export const useUsage = () => {
  const [usageLogs, setUsageLogs] = useState<UsageLog[]>([]);

  const auth = useAuth();
  const userId = auth.uid;
  // todo: read total usage from firestore

  const totalUsageDoc = useMemo(() => {
    if (!userId) {
      return null;
    }

    const docRef = doc(
      firestore,
      `users/${userId}/usage/total`
    ) as DocumentReference<TotalUsageInfo>;

    return docRef;
  }, [userId]);

  const [totalUsage] = useDocumentData(totalUsageDoc);

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
    const totalTokensFromNewLogs = newUsageLogs.reduce((acc, log) => acc + log.tokens, 0);
    const newTotalUsage: TotalUsageInfo = {
      ...totalUsage,
      totalUsageTokensUsed: (totalUsage?.totalUsageTokensUsed || 0) + totalTokensFromNewLogs,
      totalUsageTokensAvailable: totalUsage?.totalUsageTokensAvailable || 0,
      lastUpdatedAt: now,
    };

    if (totalUsageDoc) {
      console.log("Update total usage", newTotalUsage);
      setDoc(totalUsageDoc, newTotalUsage);
    }
  }, [totalUsage, usageLogs, userId]);

  return { totalUsage, usageLogs, setUsageLogs };
};
