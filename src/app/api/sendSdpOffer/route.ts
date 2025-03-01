import { SendSdpOfferRequest, SendSdpOfferResponse } from "@/common/requests";
import { getEphemeralToken } from "../token/getEphemeralToken";

export async function POST(request: Request) {
  const body = (await request.json()) as SendSdpOfferRequest;
  const ephemeralKey = await getEphemeralToken(body.model);

  const baseUrl = "https://api.openai.com/v1/realtime";
  const sdpResponse = await fetch(`${baseUrl}?model=${body.model}`, {
    method: "POST",
    body: body.sdp,
    headers: {
      Authorization: `Bearer ${ephemeralKey}`,
      "Content-Type": "application/sdp",
    },
  });

  if (!sdpResponse.ok) {
    throw new Error(`Failed to send SDP Offer: ${sdpResponse.status} ${sdpResponse.statusText}`);
  }

  const response: SendSdpOfferResponse = {
    sdpResponse: await sdpResponse.text(),
  };

  return Response.json(response);
}
