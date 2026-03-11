import { RealTimeModel } from '@/common/ai';
import { SendSdpOfferRequest, SendSdpOfferResponse } from '@/common/requests';
import { sleep } from '@/libs/sleep';

const sendSdpOfferRaw = async (
  offer: RTCSessionDescriptionInit,
  model: RealTimeModel,
  getAuthToken: () => Promise<string>,
): Promise<string> => {
  try {
    if (!offer.sdp) {
      throw new Error('SDP Offer is missing');
    }

    const request: SendSdpOfferRequest = {
      model,
      sdp: offer.sdp,
    };

    const sdpResponse = await fetch(`/api/sendSdpOffer`, {
      method: 'POST',
      body: JSON.stringify(request),
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${await getAuthToken()}`,
      },
    });

    if (!sdpResponse.ok) {
      throw new Error(`Failed to send SDP Offer: ${sdpResponse.status} ${sdpResponse.statusText}`);
    }

    const response: SendSdpOfferResponse = await sdpResponse.json();
    return response.sdpResponse;
  } catch (error) {
    console.error('Error in sendSdpOffer:', error);
    throw error;
  }
};

export const sendSdpOffer = async (
  offer: RTCSessionDescriptionInit,
  model: RealTimeModel,
  getAuthToken: () => Promise<string>,
  retries = 3,
): Promise<string> => {
  try {
    return await sendSdpOfferRaw(offer, model, getAuthToken);
  } catch (error) {
    if (retries > 0) {
      console.warn(`sendSdpOffer failed. Retrying... (${retries} attempts left)`, error);
      await sleep(1000);
      return sendSdpOffer(offer, model, getAuthToken, retries - 1);
    } else {
      console.error('sendSdpOffer failed after multiple attempts:', error);
      throw error;
    }
  }
};
