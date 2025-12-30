import { getGameUsersPoints, getGameUsersUserNames, setGameUsersPoints } from "./statsResources";

export const resetGameRate = async ({ increase }: { increase: number }): Promise<void> => {
  const [points, userNames] = await Promise.all([getGameUsersPoints(), getGameUsersUserNames()]);

  Object.keys(userNames).forEach((userId) => {
    const currentPoints = points[userId] || 1;
    points[userId] = Math.max(currentPoints + increase, 1);
  });

  await setGameUsersPoints(points);
};
