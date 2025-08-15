import { UserSettings, UserSettingsWithId } from "@/common/user";
import { getDB } from "../config/firebase";
import { AiUserInfo } from "@/common/userInfo";

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

export const getUserConversationCount = async (userId: string): Promise<number> => {
  const db = getDB();
  const conversationsCollection = await db
    .collection("users")
    .doc(userId)
    .collection("conversations")
    .get();
  return conversationsCollection.size || 0;
};

export const getUserLastConversationDate = async (userId: string): Promise<string | null> => {
  const db = getDB();
  const conversationsCollection = await db
    .collection("users")
    .doc(userId)
    .collection("conversations")
    .orderBy("createdAt", "desc")
    .limit(1)
    .get();
  if (conversationsCollection.empty) {
    return null;
  }
  const lastConversation = conversationsCollection.docs[0];
  return lastConversation.data().updatedAtIso;
};
