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
