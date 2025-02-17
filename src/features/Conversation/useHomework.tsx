"use client";
import { createContext, useContext, ReactNode, useMemo, JSX } from "react";
import { useAuth } from "../Auth/useAuth";
import {
  collection,
  doc,
  DocumentReference,
  setDoc,
  query,
  where,
  Query,
  CollectionReference,
} from "firebase/firestore";
import { useCollectionData } from "react-firebase-hooks/firestore";
import { firestore } from "../Firebase/init";
import { Homework } from "@/common/homework";

interface HomeworkContextType {
  incompleteHomeworks: Homework[];
  loadingHomeworks: boolean;
  errorHomeworks: Error | undefined;
  saveHomework: (homework: Homework) => Promise<string>;
  doneHomework: (homeworkId: string) => Promise<void>;
}

const HomeworkContext = createContext<HomeworkContextType | null>(null);

function useProvideHomework(): HomeworkContextType {
  const auth = useAuth();
  const userId = auth.uid;

  const incompleteQuery = useMemo(() => {
    if (!userId) return null;

    const homeworkCollection = collection(
      firestore,
      `users/${userId}/homeworks`
    ) as CollectionReference<Homework>;

    return query(homeworkCollection, where("isDone", "==", false));
  }, [userId]);

  const [incompleteHomeworks = [], loadingHomeworks, errorHomeworks] =
    useCollectionData(incompleteQuery);

  const saveHomework = async (homework: Homework): Promise<string> => {
    if (!userId) throw new Error("User not logged in.");

    const docRef = doc(
      firestore,
      `users/${userId}/homeworks/${homework.id}`
    ) as DocumentReference<Homework>;

    // Save the homework data to Firestore
    await setDoc(docRef, homework);
    return docRef.id;
  };

  const doneHomework = async (homeworkId: string) => {
    if (!userId) throw new Error("User not logged in.");

    const homeworkDoc = doc(
      firestore,
      `users/${userId}/homeworks/${homeworkId}`
    ) as DocumentReference<Homework>;

    await setDoc(homeworkDoc, { isDone: true }, { merge: true });
  };

  return {
    incompleteHomeworks,
    loadingHomeworks,
    errorHomeworks,
    saveHomework,
    doneHomework,
  };
}

export function HomeworkProvider({ children }: { children: ReactNode }): JSX.Element {
  const homeworkData = useProvideHomework();

  return <HomeworkContext.Provider value={homeworkData}>{children}</HomeworkContext.Provider>;
}

export function useHomework(): HomeworkContextType {
  const context = useContext(HomeworkContext);
  if (!context) {
    throw new Error("useHomework must be used within a HomeworkProvider");
  }
  return context;
}
