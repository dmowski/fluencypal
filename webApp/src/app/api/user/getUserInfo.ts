import { UserSettings, UserSettingsWithId } from '@/features/Settings/userSettings';
import { getDB } from '../config/firebase';
import { AiUserInfo } from '@/features/User/userInfo';
import { Conversation, UserConversationsMeta } from '@/features/Conversation/conversation';
import { QuizSurvey2 } from '@/features/Goal/Quiz/types';
import { InterviewQuizSurvey } from '@/features/Case/types';
import dayjs from 'dayjs';
import { DailyTaskProgress } from '@/features/Tasks/types';
import { GoalPlan } from '@/features/Plan/types';
import { parseInteractiveLessonStore } from '@/features/InteractiveLesson/storage';
import { InteractiveLessonStore } from '@/features/InteractiveLesson/types';

export interface StripeUserInfo {
  customerId: string;
}

export const getStripeUserInfo = async (userId: string): Promise<StripeUserInfo | null> => {
  const db = getDB();
  const stripeDoc = await db
    .collection('users')
    .doc(userId)
    .collection('paymentInfo')
    .doc('stripeInfo')
    .get();

  if (!stripeDoc.exists) {
    return null;
  }

  const data = stripeDoc.data() as StripeUserInfo;
  return data;
};

export const setStripeUserInfo = async (userId: string, info: StripeUserInfo): Promise<void> => {
  const db = getDB();
  await db
    .collection('users')
    .doc(userId)
    .collection('paymentInfo')
    .doc('stripeInfo')
    .set(info, { merge: true });
};

export const getUserInfo = async (userId: string) => {
  const db = getDB();
  const userDoc = await db.collection('users').doc(userId).get();
  if (!userDoc.exists) {
    throw new Error('User not found');
  }
  const data = userDoc.data() as UserSettings;
  return { ...data, id: userDoc.id };
};

export const updateUserInfo = async (userId: string, info: Partial<UserSettings>) => {
  const db = getDB();
  await db.collection('users').doc(userId).set(info, { merge: true });
};

export const getUserAiInfo = async (userId: string) => {
  const db = getDB();
  const userDoc = await db
    .collection('users')
    .doc(userId)
    .collection('stats')
    .doc('aiUserInfo')
    .get();
  if (!userDoc.exists) {
    return null;
  }

  const data = userDoc.data() as AiUserInfo;
  return data;
};

export const getAllUsersWithIds = async ({ limits }: { limits?: number }) => {
  const db = getDB();

  const usersCollection =
    limits === undefined
      ? await db.collection('users').get()
      : await db.collection('users').orderBy('lastLoginAtDateTime', 'desc').limit(limits).get();

  const users: UserSettingsWithId[] = usersCollection.docs.map((doc) => {
    const data = doc.data() as UserSettings;
    return { id: doc.id, ...data };
  });
  return users;
};

export const getRecentCreatedUsers = async (limit: number): Promise<UserSettingsWithId[]> => {
  const db = getDB();
  const usersCollection = await db
    .collection('users')
    .orderBy('createdAtIso', 'desc')
    .limit(limit)
    .get();

  return usersCollection.docs.map((doc) => {
    const data = doc.data() as UserSettings;
    return { id: doc.id, ...data };
  });
};

export const isEmailNotificationsEnabled = async (userId: string): Promise<boolean> => {
  const db = getDB();
  const userDoc = await db.collection('users').doc(userId).get();
  if (!userDoc.exists) {
    throw new Error('User not found');
  }
  const data = userDoc.data() as UserSettings;
  return data.isSendEmailNotifications !== false;
};

interface UserEmailLogs {
  isWelcomeMessageSent?: boolean;
}

export const getEmailLogs = async (userId: string): Promise<UserEmailLogs | null> => {
  const db = getDB();
  const userDoc = await db
    .collection('users')
    .doc(userId)
    .collection('stats')
    .doc('emailsNotifications')
    .get();

  if (!userDoc.exists) {
    return null;
  }

  const data = userDoc.data() as UserEmailLogs;
  return data;
};

export const setEmailLogs = async (userId: string, info: Partial<UserEmailLogs>): Promise<void> => {
  const db = getDB();
  await db
    .collection('users')
    .doc(userId)
    .collection('stats')
    .doc('emailsNotifications')
    .set(info, { merge: true });
};

export const getUserDailyTasksProgress = async (userId: string): Promise<DailyTaskProgress[]> => {
  const db = getDB();
  const progressCollection = await db
    .collection('users')
    .doc(userId)
    .collection('dailyTasks')
    .get();

  const data: DailyTaskProgress[] = progressCollection.docs.map((doc) => {
    const data = doc.data() as DailyTaskProgress;
    return { ...data };
  });

  return data;
};

export const getUserInteractiveLessonStores = async (
  userId: string,
): Promise<InteractiveLessonStore[]> => {
  const db = getDB();
  const lessonsCollection = await db
    .collection('users')
    .doc(userId)
    .collection('interactiveLessons')
    .get();

  return lessonsCollection.docs.map((doc) => parseInteractiveLessonStore(doc.data()));
};

export const getUserGoals = async (userId: string): Promise<GoalPlan[]> => {
  const db = getDB();
  const goalsCollection = await db.collection('users').doc(userId).collection('goals').get();

  return goalsCollection.docs.map((doc) => {
    const data = doc.data() as GoalPlan;
    return { ...data, id: data.id || doc.id };
  });
};

export const getUsersQuizSurvey = async (userId: string): Promise<QuizSurvey2[]> => {
  const db = getDB();
  const quizCollection = await db.collection('users').doc(userId).collection('quiz2').get();
  const data: QuizSurvey2[] = quizCollection.docs.map((doc) => {
    const data = doc.data() as QuizSurvey2;
    return { ...data };
  });

  return data;
};

export const getUsersInterviewSurvey = async (userId: string): Promise<InterviewQuizSurvey[]> => {
  const db = getDB();
  const quizCollection = await db.collection('users').doc(userId).collection('interview').get();
  const data: InterviewQuizSurvey[] = quizCollection.docs.map((doc) => {
    const data = doc.data() as InterviewQuizSurvey;
    return { ...data };
  });

  return data;
};

export const getUserConversationsMeta = async (userId: string): Promise<UserConversationsMeta> => {
  const db = getDB();
  const conversationsCollection = await db
    .collection('users')
    .doc(userId)
    .collection('conversations')
    .orderBy('createdAt', 'desc')
    .get();

  const docs = conversationsCollection.docs.map((doc) => doc.data() as Conversation);

  const conversationCount = docs.length || 0;
  const lastConversationDate = docs[0]?.updatedAtIso || null;
  const totalMessages = docs.reduce((acc, doc) => acc + (doc.messages.length || 0), 0);

  const today = dayjs().subtract(24, 'hour');

  const todayConversations = docs.filter((doc) => dayjs(doc.updatedAtIso).isAfter(today));
  const todayMessages = todayConversations.reduce(
    (acc, doc) => acc + (doc.messages.length || 0),
    0,
  );

  const lastHour = dayjs().subtract(1, 'hour');
  const lastHourConversations = docs.filter((doc) => dayjs(doc.updatedAtIso).isAfter(lastHour));
  const lastHourMessages = lastHourConversations.reduce(
    (acc, doc) => acc + (doc.messages.length || 0),
    0,
  );

  return {
    conversationCount,
    lastConversationDate,
    totalMessages,
    todayMessages,
    lastHourMessages,
    conversations: docs,
  };
};
