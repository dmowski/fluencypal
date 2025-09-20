import { getGameUsersPoints, setGameUsersPoints } from "./statsResources";

export const resetGameRate = async (): Promise<void> => {
  const points = await getGameUsersPoints();

  Object.keys(points).forEach((userId) => {
    const currentPoints = points[userId] || 1;
    points[userId] = Math.max(currentPoints - 3, 1);
  });

  await setGameUsersPoints(points);
};
