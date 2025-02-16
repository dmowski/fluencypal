import { RealTimeModel } from "@/common/ai";

export const getEphemeralKey = async (model: RealTimeModel) => {
  const salt = Date.now();
  const response = await fetch("/api/token?model=" + model + "&salt=" + salt);
  const data = await response.json();
  return data.client_secret.value as string;
};
