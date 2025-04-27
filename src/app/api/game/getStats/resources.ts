import { GameUsersPoints } from "@/features/Game/types";
import { getDB } from "../../config/firebase";

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
  username: string;
  points: number;
}
export const increaseUserPoints = async ({ username, points }: increaseUserPointsProps) => {
  const db = getDB();

  const stat = await getGameUsersPoints();
  const oldValue = stat[username] || 0;
  const newValue = oldValue + points;

  await db
    .collection("game")
    .doc("gamePoints")
    .set({ [username]: newValue }, { merge: true });
};
