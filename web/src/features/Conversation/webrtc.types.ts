export interface GetEphemeralTokenRequest {
  model: string;
}

export interface GetEphemeralTokenResponse {
  ephemeralKey: string;
}

export interface SendSdpOfferRequest {
  model: string;
  sdp: string;
}

export interface SendSdpOfferResponse {
  sdpResponse: string;
}
