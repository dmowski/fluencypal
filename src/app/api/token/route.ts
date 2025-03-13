import { GetOpenAiTokenRequest, GetEphemeralTokenResponse } from "@/common/requests";
import { getEphemeralToken } from "./getEphemeralToken";

export async function POST(request: Request) {
  const aiRequest = (await request.json()) as GetOpenAiTokenRequest;

  const model = aiRequest.model;
  if (!model) {
    throw new Error("model Get param is required");
  }

  const ephemeralToken = await getEphemeralToken(model);

  const responseData: GetEphemeralTokenResponse = {
    ephemeralKey: ephemeralToken,
  };

  return Response.json(responseData);
}
