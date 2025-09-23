import { getGameUsersPoints, getGameUsersUserNames, setGameUsersPoints } from "./statsResources";

export const resetGameRate = async (): Promise<void> => {
  const [points, userNames] = await Promise.all([getGameUsersPoints(), getGameUsersUserNames()]);

  Object.keys(userNames).forEach((userId) => {
    const currentPoints = points[userId] || 1;
    points[userId] = Math.max(currentPoints - 3, 1);
  });

  await setGameUsersPoints(points);
};
