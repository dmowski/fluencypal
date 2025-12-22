import FirebaseFirestore from "@google-cloud/firestore";
import {
  collection,
  CollectionReference,
  doc,
  DocumentReference,
  SnapshotOptions,
} from "firebase/firestore";
import { firestore } from "./init";
import { PaymentLog, TotalUsageInfo, UsageLog } from "@/common/usage";
import { UserSettings } from "@/common/user";
import { Conversation } from "@/common/conversation";
import { Homework } from "@/common/homework";
import { UserTaskStats } from "@/common/userTask";
import { WordsStats } from "@/common/words";
import { AiUserInfo } from "@/common/userInfo";
import { SupportedLanguage } from "@/features/Lang/lang";
import { PhraseCorrection } from "../Corrections/types";
import { GoalPlan } from "../Plan/types";
import { GameAvatars, GameLastVisit, GameUserNames, GameUsersPoints } from "../Game/types";
import { QuizSurvey2 } from "../Goal/Quiz/types";
import { DailyQuestionAnswer, DailyQuestionLike } from "../Game/DailyQuestion/types";
import { InterviewQuizSurvey } from "../Case2/types";

interface FirestoreDataConverter<T> {
  toFirestore(model: T): any;
  fromFirestore(snapshot: unknown, options?: SnapshotOptions): T;
}

const converter = <T>() => ({
  toFirestore: (data: Partial<T>) => data,
  fromFirestore: (snap: FirebaseFirestore.QueryDocumentSnapshot) => snap.data() as T,
});

const dataPointCollectionCache: Record<string, unknown> = {};

export const dataPointCollection = <T>(collectionPath: string) => {
  const cache = dataPointCollectionCache[collectionPath];
  if (cache) {
    return cache as CollectionReference<T>;
  }
  const colRef = collection(firestore, collectionPath).withConverter(
    converter<T>() as FirestoreDataConverter<T>
  );
  dataPointCollectionCache[collectionPath] = colRef;
  return colRef;
};

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
  collections: {
    homework: (userId?: string) =>
      userId ? dataPointCollection<Homework>(`users/${userId}/homeworks`) : null,
    conversation: (userId?: string) =>
      userId ? dataPointCollection<Conversation>(`users/${userId}/conversations`) : null,

    paymentLog: (userId?: string) =>
      userId ? dataPointCollection<PaymentLog>(`users/${userId}/payments`) : null,
    phraseCorrections: (userId?: string) =>
      userId ? dataPointCollection<PhraseCorrection>(`users/${userId}/phraseCorrections`) : null,

    goals: (userId?: string) =>
      userId ? dataPointCollection<GoalPlan>(`users/${userId}/goals`) : null,
    dailyQuestionsAnswers: (userId?: string) =>
      userId ? dataPointCollection<DailyQuestionAnswer>(`dailyQuestionsAnswers`) : null,

    dailyQuestionsAnswersLikes: (userId?: string, answerDocId?: string) =>
      userId && answerDocId
        ? dataPointCollection<DailyQuestionLike>(`dailyQuestionsAnswers/${answerDocId}/likes`)
        : null,
  },
  documents: {
    homework: (userId?: string, homeworkId?: string) =>
      userId && homeworkId
        ? dataPointDoc<Homework>(`users/${userId}/homeworks/${homeworkId}`)
        : null,
    totalUsage: (userId?: string) =>
      userId ? dataPointDoc<TotalUsageInfo>(`users/${userId}/usage/totalUsage`) : null,

    gameRate2: dataPointDoc<GameUsersPoints>(`game2/gamePoints`),
    gameLastVisit2: dataPointDoc<GameLastVisit>(`game2/gameLastVisit`),
    gameAvatars2: dataPointDoc<GameAvatars>(`game2/gameAvatars`),
    gameUserNames2: dataPointDoc<GameUserNames>(`game2/gameUserNames`),

    usageLog: (userId?: string, usageId?: string) =>
      userId && usageId ? dataPointDoc<UsageLog>(`users/${userId}/usageLogs/${usageId}`) : null,

    userSettings: (userId?: string) =>
      userId ? dataPointDoc<UserSettings>(`users/${userId}`) : null,

    userTasksStats: (userId: string | null, language: SupportedLanguage | null) =>
      userId && language
        ? dataPointDoc<UserTaskStats>(`users/${userId}/stats/tasks_${language}`)
        : null,

    aiUserInfo: (userId: string | null) =>
      userId ? dataPointDoc<AiUserInfo>(`users/${userId}/stats/aiUserInfo`) : null,

    conversation: (userId?: string, conversationId?: string) =>
      userId && conversationId
        ? dataPointDoc<Conversation>(`users/${userId}/conversations/${conversationId}`)
        : null,

    userWordsStats: (userId: string | null, language: SupportedLanguage | null) =>
      userId && language
        ? dataPointDoc<WordsStats>(`users/${userId}/stats/words_${language}`)
        : null,

    quizSurvey2: (userId?: string, learningLanguage?: SupportedLanguage) =>
      userId && learningLanguage
        ? dataPointDoc<QuizSurvey2>(`users/${userId}/quiz2/${learningLanguage}`)
        : null,
    interviewQuizSurvey: (userId?: string, interviewId?: string) =>
      userId && interviewId
        ? dataPointDoc<InterviewQuizSurvey>(`users/${userId}/interview/${interviewId}`)
        : null,
  },
};
