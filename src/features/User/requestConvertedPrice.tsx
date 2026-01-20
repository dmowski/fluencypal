import {
  ConvertPriceRequest,
  ConvertPriceResponse,
} from "@/app/api/convertPrice/types";

export const requestConvertedPrice = async (
  requestData: ConvertPriceRequest,
) => {
  const response = await fetch("/api/convertPrice", {
    method: "POST",
    body: JSON.stringify(requestData),
    headers: {
      "Content-Type": "application/json",
    },
  });
  const data = (await response.json()) as ConvertPriceResponse;
  return data;
};
