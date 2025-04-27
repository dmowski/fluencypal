import { getGameUsersPoints } from "./resources";

export async function GET() {
  const gameUserPoints = await getGameUsersPoints();
  return Response.json(gameUserPoints);
}
