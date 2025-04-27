import { GameProfile } from "@/features/Game/types";
import { getDB } from "../../config/firebase";

export const updateGameProfile = async (
  userId: string,
  profile: GameProfile
): Promise<GameProfile | null> => {
  const db = getDB();
  const userDoc = await db
    .collection("users")
    .doc(userId)
    .collection("game")
    .doc("profile")
    .set(profile, { merge: true });

  if (!userDoc) {
    return null;
  }

  return profile;
};
