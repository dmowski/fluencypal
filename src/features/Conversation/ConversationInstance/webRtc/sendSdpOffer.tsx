import { RealTimeModel } from '@/common/ai';
import { SendSdpOfferRequest, SendSdpOfferResponse } from '@/common/requests';

export const sendSdpOffer = async (
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
