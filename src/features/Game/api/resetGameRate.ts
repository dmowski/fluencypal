import { getGameUsersPoints, setGameUsersPoints } from "./statsResources";

export const resetGameRate = async (): Promise<void> => {
  const points = await getGameUsersPoints();

  Object.keys(points).forEach((username) => {
    if (points[username]) {
      points[username] = Math.max(points[username] - 1, 1);
    }
  });

  await setGameUsersPoints(points);
};
