"use client";
import { createContext, useContext, ReactNode, useMemo, JSX } from "react";
import { useAuth } from "../Auth/useAuth";
import { setDoc, query, where } from "firebase/firestore";
import { useCollectionData } from "react-firebase-hooks/firestore";
import { Homework } from "@/common/homework";
import { db } from "../Firebase/firebaseDb";
import { useSettings } from "../Settings/useSettings";

interface HomeworkContextType {
  incompleteHomeworks: Homework[];
  completeHomeworks: Homework[];
  loadingHomeworks: boolean;
  errorHomeworks: Error | undefined;
  saveHomework: (homework: Homework) => Promise<string>;
  doneHomework: (homeworkId: string) => Promise<void>;
  shipHomework: (homeworkId: string) => Promise<void>;
}

const HomeworkContext = createContext<HomeworkContextType | null>(null);

function useProvideHomework(): HomeworkContextType {
  const auth = useAuth();
  const settings = useSettings();
  const userId = auth.uid;

  const allHomeworkQuery = useMemo(() => {
    const lang = settings.languageCode;
    if (!lang) {
      return null;
    }

    const homeworkCollection = db.collections.homework(userId);
    return homeworkCollection
      ? query(homeworkCollection, where("languageCode", "==", lang))
      : null;
  }, [userId, settings.languageCode]);

  const [allHomeworks = [], loadingHomeworks, errorHomeworks] =
    useCollectionData(allHomeworkQuery);

  const incompleteHomeworks = allHomeworks.filter(
    (h) => !h.isDone && !h.isSkip,
  );
  const completeHomeworks = allHomeworks.filter((h) => h.isDone && !h.isSkip);

  const saveHomework = async (homework: Homework): Promise<string> => {
    const docRef = db.documents.homework(userId, homework.id);
    if (!docRef) {
      throw new Error("Invalid Homework document reference");
    }

    await setDoc(docRef, homework);
    return docRef.id;
  };

  const doneHomework = async (homeworkId: string) => {
    const docRef = db.documents.homework(userId, homeworkId);
    if (!docRef) {
      throw new Error("Invalid Homework document reference");
    }
    await setDoc(docRef, { isDone: true }, { merge: true });
  };

  const shipHomework = async (homeworkId: string) => {
    const docRef = db.documents.homework(userId, homeworkId);
    if (!docRef) {
      throw new Error("Invalid Homework document reference");
    }
    await setDoc(
      docRef,
      { isDone: true, isSkip: true, isSkipAt: Date.now() },
      { merge: true },
    );
  };

  return {
    incompleteHomeworks,
    completeHomeworks,
    loadingHomeworks,
    errorHomeworks,
    saveHomework,
    doneHomework,
    shipHomework,
  };
}

export function HomeworkProvider({
  children,
}: {
  children: ReactNode;
}): JSX.Element {
  const homeworkData = useProvideHomework();

  return (
    <HomeworkContext.Provider value={homeworkData}>
      {children}
    </HomeworkContext.Provider>
  );
}

export function useHomework(): HomeworkContextType {
  const context = useContext(HomeworkContext);
  if (!context) {
    throw new Error("useHomework must be used within a HomeworkProvider");
  }
  return context;
}
