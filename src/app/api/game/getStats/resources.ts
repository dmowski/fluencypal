import { GameUsersPoints } from "@/features/Game/types";
import { getDB } from "../../config/firebase";
import { getGameProfile } from "../profile/getGameProfile";

import firebaseAdmin from "firebase-admin";

export const getGameUsersPoints = async (): Promise<GameUsersPoints> => {
  const db = getDB();
  const userDoc = await db.collection("game").doc("gamePoints").get();
  if (!userDoc.exists) {
    return {};
  }
  const data = userDoc.data() as GameUsersPoints;
  return data;
};

export const renameUserInRateStat = async (
  oldUsername: string,
  newUsername: string
): Promise<void> => {
  const db = getDB();
  const userPoints = await getGameUsersPoints();

  if (!userPoints[oldUsername]) {
    throw new Error(`User ${oldUsername} does not exist.`);
  }

  const points = userPoints[oldUsername];

  await db
    .collection("game")
    .doc("gamePoints")
    .set(
      {
        [newUsername]: points,
        [oldUsername]: firebaseAdmin.firestore.FieldValue.delete(),
      },
      { merge: true }
    );
};

export const isUserIsGameWinner = async (userId: string): Promise<boolean> => {
  const [pointes, gameProfile] = await Promise.all([getGameUsersPoints(), getGameProfile(userId)]);
  const username = gameProfile?.username;

  if (!username) {
    return false;
  }

  const sortedUserNames = Object.keys(pointes).sort((a, b) => pointes[b] - pointes[a]);
  const userIndex = sortedUserNames.indexOf(username);
  const isTop5 = userIndex < 5;

  return isTop5;
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

  stat[username] = newValue;
  return stat;
};
