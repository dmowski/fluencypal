import { UserSettings } from "@/common/user";
import { getDB } from "../config/firebase";
import { AiUserInfo } from "@/common/userInfo";

export const getUserInfo = async (userId: string) => {
  const db = getDB();
  const userDoc = await db.collection("users").doc(userId).get();
  if (!userDoc.exists) {
    throw new Error("User not found");
  }
  const data = userDoc.data() as UserSettings;
  return data;
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
