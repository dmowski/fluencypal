import { resetGameRate } from "@/features/Game/api/resetGameRate";

export async function GET(request: Request) {
  await resetGameRate();
  return Response.json("Game Updated");
}
