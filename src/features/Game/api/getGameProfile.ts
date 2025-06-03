import { GameProfile } from "@/features/Game/types";
import { getDB } from "../../../app/api/config/firebase";

export const getGameProfile = async (userId: string): Promise<GameProfile | null> => {
  const db = getDB();
  const userDoc = await db.collection("users").doc(userId).collection("game").doc("profile").get();
  if (!userDoc.exists) {
    return null;
  }
  const data = userDoc.data() as GameProfile;
  return data;
};
