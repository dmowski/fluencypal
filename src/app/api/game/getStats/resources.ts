import { GameUsersPoints } from "@/features/Game/types";
import { getDB } from "../../config/firebase";
import { FieldValue } from "@google-cloud/firestore";

export const getGameUsersPoints = async (): Promise<GameUsersPoints> => {
  const db = getDB();
  const userDoc = await db.collection("game").doc("gamePoints").get();
  if (!userDoc.exists) {
    return {};
  }
  const data = userDoc.data() as GameUsersPoints;
  return data;
};

interface increaseUserPointsProps {
  userId: string;
  points: number;
}
export const increaseUserPoints = async ({ userId, points }: increaseUserPointsProps) => {
  const db = getDB();
  const userDoc = await db.collection("game").doc("gamePoints").get();
  if (!userDoc.exists) {
    return;
  }

  await db
    .collection("game")
    .doc("gamePoints")
    .set({ [userId]: FieldValue.increment(points) }, { merge: true });
};
