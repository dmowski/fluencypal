import { SubmitBattleRequest } from "@/features/Game/types";
import { validateAuthToken } from "../../config/firebase";
import { submitBattle } from "@/features/Game/api/submitBattle";

export async function POST(request: Request) {
  await validateAuthToken(request);

  const data = (await request.json()) as SubmitBattleRequest;
  const response = await submitBattle(data);
  return Response.json(response);
}
