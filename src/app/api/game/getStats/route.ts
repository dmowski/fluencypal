import { getGameUsersPoints } from "../../../../features/Game/api/statsResources";

export async function GET() {
  const gameUserPoints = await getGameUsersPoints();
  return Response.json(gameUserPoints);
}
