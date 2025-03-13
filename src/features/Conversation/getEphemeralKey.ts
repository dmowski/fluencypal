import { RealTimeModel } from "@/common/ai";
import { GetEphemeralTokenResponse, GetEphemeralTokenRequest } from "@/common/requests";

export const getEphemeralKey = async (model: RealTimeModel) => {
  const salt = Date.now();

  const requestData: GetEphemeralTokenRequest = {
    model: model,
  };

  const response = await fetch("/api/token", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(requestData),
  });
  const data = (await response.json()) as GetEphemeralTokenResponse;
  return data.ephemeralKey;
};
