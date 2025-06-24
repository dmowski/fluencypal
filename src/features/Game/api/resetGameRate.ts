import { getGameUsersPoints, setGameUsersPoints } from "./statsResources";

export const resetGameRate = async (): Promise<void> => {
  const points = await getGameUsersPoints();

  Object.keys(points).forEach((username) => {
    const currentPoints = points[username] || 1;
    points[username] = Math.max(currentPoints - 3, 1);
  });

  await setGameUsersPoints(points);
};
