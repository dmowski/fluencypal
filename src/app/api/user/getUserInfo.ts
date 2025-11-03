import { UserSettings, UserSettingsWithId } from "@/common/user";
import { getDB } from "../config/firebase";
import { AiUserInfo } from "@/common/userInfo";
import { Conversation, UserConversationsMeta } from "@/common/conversation";
import { QuizSurvey2 } from "@/features/Goal/Quiz/types";

export interface StripeUserInfo {
  customerId: string;
}

export const getStripeUserInfo = async (userId: string): Promise<StripeUserInfo | null> => {
  const db = getDB();
  const stripeDoc = await db
    .collection("users")
    .doc(userId)
    .collection("paymentInfo")
    .doc("stripeInfo")
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
    .collection("users")
    .doc(userId)
    .collection("paymentInfo")
    .doc("stripeInfo")
    .set(info, { merge: true });
};

export const getUserInfo = async (userId: string) => {
  const db = getDB();
  const userDoc = await db.collection("users").doc(userId).get();
  if (!userDoc.exists) {
    throw new Error("User not found");
  }
  const data = userDoc.data() as UserSettings;
  return { ...data, id: userDoc.id };
};

export const getUserAiInfo = async (userId: string) => {
  const db = getDB();
  const userDoc = await db
    .collection("users")
    .doc(userId)
    .collection("stats")
    .doc("aiUserInfo")
    .get();
  if (!userDoc.exists) {
    return null;
  }

  const data = userDoc.data() as AiUserInfo;
  return data;
};

export const getAllUsersWithIds = async () => {
  const db = getDB();
  const usersCollection = await db.collection("users").get();
  const users: UserSettingsWithId[] = usersCollection.docs.map((doc) => {
    const data = doc.data() as UserSettings;
    return { id: doc.id, ...data };
  });
  return users;
};

export const getUsersQuizSurvey = async (userId: string): Promise<QuizSurvey2[]> => {
  const db = getDB();
  const quizCollection = await db.collection("users").doc(userId).collection("quiz2").get();
  const data: QuizSurvey2[] = quizCollection.docs.map((doc) => {
    const data = doc.data() as QuizSurvey2;
    return { ...data };
  });

  return data;
};

export const getUserConversationsMeta = async (userId: string): Promise<UserConversationsMeta> => {
  const db = getDB();
  const conversationsCollection = await db
    .collection("users")
    .doc(userId)
    .collection("conversations")
    .orderBy("createdAt", "desc")
    .get();

  const docs = conversationsCollection.docs.map((doc) => doc.data() as Conversation);

  const conversationCount = docs.length || 0;
  const lastConversationDate = docs[0]?.updatedAtIso || null;
  const totalMessages = docs.reduce((acc, doc) => acc + (doc.messages.length || 0), 0);

  return {
    conversationCount,
    lastConversationDate,
    totalMessages,
  };
};
