import { GetEphemeralTokenResponse } from "@/common/requests";
import { getEphemeralToken } from "./getEphemeralToken";

export async function GET(request: Request) {
  const model = new URL(request.url).searchParams.get("model");
  if (!model) {
    throw new Error("model Get param is required");
  }
  const ephemeralToken = await getEphemeralToken(model);

  const responseData: GetEphemeralTokenResponse = {
    ephemeralKey: ephemeralToken,
  };

  return Response.json(responseData);
}
