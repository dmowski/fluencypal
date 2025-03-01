import { RealTimeModel } from "@/common/ai";
import { GetEphemeralTokenResponse } from "@/common/requests";

export const getEphemeralKey = async (model: RealTimeModel) => {
  const salt = Date.now();
  const response = await fetch("/api/token?model=" + model + "&salt=" + salt);
  const data = (await response.json()) as GetEphemeralTokenResponse;
  return data.ephemeralKey;
};
