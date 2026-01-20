import { RealTimeModel } from "@/common/ai";
import {
  GetEphemeralTokenResponse,
  GetEphemeralTokenRequest,
} from "@/common/requests";

export const getEphemeralKey = async (
  model: RealTimeModel,
  authToken: string,
) => {
  const requestData: GetEphemeralTokenRequest = {
    model: model,
  };

  const response = await fetch("/api/token", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${authToken}`,
    },
    body: JSON.stringify(requestData),
  });
  const data = (await response.json()) as GetEphemeralTokenResponse;
  return data.ephemeralKey;
};
