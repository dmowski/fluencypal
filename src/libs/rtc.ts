import { RealTimeModel } from "@/data/ai";
import { getEphemeralKey } from "./getEphemeralKey";
import { sleep } from "./sleep";

/**
 * Sends an SDP (Session Description Protocol) offer to an API for processing.
 *
 * @param {RTCSessionDescriptionInit} offer - The WebRTC SDP offer containing session description details.
 * @param {RealTimeModel} model - The AI model to use for processing the SDP offer.
 * @returns {Promise<string>} The SDP response returned from the API.
 *
 * @throws {Error} If the API request fails or returns an unexpected response.
 *
 * @description
 * This function is used in a WebRTC communication flow where an SDP offer is
 * sent to an AI-powered real-time processing API (possibly for AI-driven audio/video interactions).
 *
 * It:
 * 1. Retrieves a temporary authorization key (`EPHEMERAL_KEY`).
 * 2. Sends the provided SDP offer to `https://api.openai.com/v1/realtime`, specifying
 *    the AI model to use.
 * 3. Returns the processed SDP response from the API.
 *
 * The API is expected to facilitate real-time AI-enhanced communication,
 * potentially modifying or routing the SDP data for further WebRTC negotiation.
 */
const sendSdpOffer = async (
  offer: RTCSessionDescriptionInit,
  model: RealTimeModel
): Promise<string> => {
  try {
    const EPHEMERAL_KEY = await getEphemeralKey();
    const baseUrl = "https://api.openai.com/v1/realtime";

    const sdpResponse = await fetch(`${baseUrl}?model=${model}`, {
      method: "POST",
      body: offer.sdp,
      headers: {
        Authorization: `Bearer ${EPHEMERAL_KEY}`,
        "Content-Type": "application/sdp",
      },
    });

    if (!sdpResponse.ok) {
      throw new Error(`Failed to send SDP Offer: ${sdpResponse.status} ${sdpResponse.statusText}`);
    }

    return await sdpResponse.text();
  } catch (error) {
    console.error("Error in sendSdpOffer:", error);
    throw error;
  }
};

const setInitConfigs = async (dataChannel: RTCDataChannel, initInstruction: string) => {
  console.log("setInitConfigs");
  if (!dataChannel) throw Error("Error on setInitConfigs. dataChannel is not available");

  const event = {
    type: "session.update",
    session: {
      instructions: initInstruction,
    },
  };
  await sleep(100);
  dataChannel.send(JSON.stringify(event));
  await sleep(1000);
};

interface InitRpcProps {
  model: RealTimeModel;
  initInstruction: string;
  onOpen: () => void;
  onMessage: (e: MessageEvent) => void;
}

export const initAiRpc = async ({ model, initInstruction, onMessage, onOpen }: InitRpcProps) => {
  const peerConnection = new RTCPeerConnection();

  const audioEl = document.createElement("audio");
  audioEl.autoplay = true;
  peerConnection.ontrack = (e) => (audioEl.srcObject = e.streams[0]);

  const ms = await navigator.mediaDevices.getUserMedia({
    audio: true,
  });
  peerConnection.addTrack(ms.getTracks()[0]);

  const dataChannel = peerConnection.createDataChannel("oai-events");

  const offer = await peerConnection.createOffer();
  await peerConnection.setLocalDescription(offer);

  const answer: RTCSessionDescriptionInit = {
    type: "answer",
    sdp: await sendSdpOffer(offer, model),
  };
  await peerConnection.setRemoteDescription(answer);
  const messageHandler = (e: MessageEvent) => {
    onMessage(e);
  };

  const openHandler = async () => {
    console.log("Data Channel opened");
    await setInitConfigs(dataChannel, initInstruction);
    onOpen();
  };
  dataChannel.addEventListener("message", messageHandler);
  dataChannel.addEventListener("open", openHandler);

  const closeHandler = () => {
    dataChannel.removeEventListener("message", messageHandler);
    dataChannel.removeEventListener("open", openHandler);
    peerConnection.close();
    audioEl.remove();
  };

  return {
    closeHandler,
  };
};
