import { resetGameRate } from "@/features/Game/api/resetGameRate";

export async function GET(request: Request) {
  await resetGameRate({ increase: 0 });
  return Response.json("Game Updated");
}
