import FirebaseFirestore from "@google-cloud/firestore";
import { collection, doc, DocumentReference, SnapshotOptions } from "firebase/firestore";
import { firestore } from "./init";
import { TotalUsageInfo, UsageLog } from "@/common/usage";
import { UserSettings } from "@/common/user";
import { Conversation } from "@/common/conversation";

interface FirestoreDataConverter<T> {
  toFirestore(model: T): any;
  fromFirestore(snapshot: unknown, options?: SnapshotOptions): T;
}

const converter = <T>() => ({
  toFirestore: (data: Partial<T>) => data,
  fromFirestore: (snap: FirebaseFirestore.QueryDocumentSnapshot) => snap.data() as T,
});

export const dataPointCollection = <T>(collectionPath: string) =>
  collection(firestore, collectionPath).withConverter(converter<T>() as FirestoreDataConverter<T>);

const dataPointDocCache: Record<string, unknown> = {};

export const dataPointDoc = <T>(documentPath: string) => {
  const cache = dataPointDocCache[documentPath];
  if (cache) {
    return cache as DocumentReference<T, any>;
  }
  const docRef = doc(firestore, documentPath).withConverter(
    converter<T>() as FirestoreDataConverter<T>
  );
  dataPointDocCache[documentPath] = docRef;
  return docRef;
};

export const db = {
  documents: {
    totalUsage: (userId?: string) =>
      userId ? dataPointDoc<TotalUsageInfo>(`users/${userId}/stats/usage`) : null,
    usageLog: (userId?: string, usageId?: string) =>
      userId && usageId ? dataPointDoc<UsageLog>(`users/${userId}/usageLogs/${usageId}`) : null,

    userSettings: (userId?: string) =>
      userId ? dataPointDoc<UserSettings>(`users/${userId}`) : null,

    conversation: (userId?: string, conversationId?: string) =>
      userId && conversationId
        ? dataPointDoc<Conversation>(`users/${userId}/conversations/${conversationId}`)
        : null,
  },
};
