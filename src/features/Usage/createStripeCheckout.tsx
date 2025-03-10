import { StripeCreateCheckoutResponse, StripeCreateCheckoutRequest } from "@/common/requests";

export const createStripeCheckout = async (conversationDate: StripeCreateCheckoutRequest) => {
  const response = await fetch("/api/createStripeCheckout", {
    method: "POST",
    body: JSON.stringify(conversationDate),
  });
  const data = (await response.json()) as StripeCreateCheckoutResponse;
  return data;
};
