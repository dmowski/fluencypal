"use client";
import { RealTimeModel } from "@/common/ai";
import { getEphemeralKey } from "./getEphemeralKey";
import { ChatMessage } from "@/features/Conversation/types";
import { sleep } from "@/libs/sleep";

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
    const ephemeralKey = await getEphemeralKey();
    const baseUrl = "https://api.openai.com/v1/realtime";
    const sdpResponse = await fetch(`${baseUrl}?model=${model}`, {
      method: "POST",
      body: offer.sdp,
      headers: {
        Authorization: `Bearer ${ephemeralKey}`,
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

export interface AiToolForLlm {
  type: "function";
  name: string;
  description: string;
  parameters: {
    type: "object";
    properties: Record<string, { type: "string"; description: string }>;
    required: string[];
  };
}

export interface AiTool extends AiToolForLlm {
  handler: (args: Record<string, string>) => void;
}

const setInitConfigs = async (
  dataChannel: RTCDataChannel,
  initInstruction: string,
  aiTools: AiToolForLlm[]
) => {
  console.log("setInitConfigs");
  if (!dataChannel) throw Error("Error on setInitConfigs. dataChannel is not available");

  const event = {
    type: "session.update",
    session: {
      instructions: initInstruction,
      tools: aiTools,
      input_audio_transcription: {
        model: "whisper-1",
      },
    },
  };
  await sleep(100);
  dataChannel.send(JSON.stringify(event));
  await sleep(100);
};

interface InitRpcProps {
  model: RealTimeModel;
  initInstruction: string;
  onOpen: () => void;
  aiTools: AiTool[];
  onMessage: (message: ChatMessage) => void;
}

export const initAiRpc = async ({
  model,
  initInstruction,
  aiTools,
  onMessage,
  onOpen,
}: InitRpcProps) => {
  const peerConnection = new RTCPeerConnection();

  const audioId = "audio_for_llm";
  const existingAudio = document.getElementById(audioId) as HTMLAudioElement | null;

  let audioEl = existingAudio;
  if (!audioEl) {
    audioEl = document.createElement("audio");

    audioEl.autoplay = true;
    audioEl.id = audioId;
    document.body.appendChild(audioEl);
  }
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

  const aiToolsForLlm: AiToolForLlm[] = aiTools.map((tool) => {
    const copyTool = { ...tool, handler: undefined };
    delete copyTool.handler;
    return copyTool;
  });

  const messageHandler = (e: MessageEvent) => {
    const event = JSON.parse(e.data);
    const type = (event?.type || "") as string;
    console.log("messageHandler", type);

    if (type === "conversation.item.input_audio_transcription.completed") {
      const userMessage = event?.transcript || "";
      if (userMessage) {
        onMessage({ isBot: false, text: userMessage });
      }
    }
    if (type === "response.done") {
      const botAnswer = event?.response?.output
        .map((item: any) => {
          return (
            item?.content
              ?.map((content: any) => content?.transcript || "")
              .join(" ")
              .trim() || ""
          );
        })
        .join(" ")
        .trim();
      if (botAnswer) {
        setTimeout(() => {
          onMessage({ isBot: true, text: botAnswer });
        }, 1000);
      }
    }

    if (type === "response.function_call_arguments.done") {
      const functionName = event?.name;
      const handler = aiTools.find((tool) => tool.name === functionName)?.handler;
      if (!handler) {
        console.log("❌ Handler not found for:", functionName);
        return;
      }

      const args = event?.arguments;
      console.log(functionName, args);
      if (!args) {
        console.log("❌ Arguments not found for:", functionName);
        return;
      }

      let parsedArgs: Record<string, string> = {};
      try {
        parsedArgs = JSON.parse(args);
      } catch (error) {
        console.error("Error parsing args for function: " + functionName, error);

        return;
      }

      try {
        handler(parsedArgs);
      } catch (error) {
        console.error("Error calling handler for function: " + functionName, error);
      }
    }
  };

  const openHandler = async () => {
    console.log("openHandler");
    await setInitConfigs(dataChannel, initInstruction, aiToolsForLlm);
    onOpen();
  };
  dataChannel.addEventListener("message", messageHandler);
  dataChannel.addEventListener("open", openHandler);

  const closeHandler = () => {
    console.log("closeHandler");

    if (dataChannel) {
      dataChannel.removeEventListener("message", messageHandler);
      dataChannel.removeEventListener("open", openHandler);

      if (dataChannel.readyState !== "closed") {
        dataChannel.close();
        console.log("Data channel closed");
      }
    }

    if (peerConnection && peerConnection.signalingState !== "closed") {
      peerConnection.close();
      console.log("Peer connection closed");
    }
  };

  const eventTrigger = () => {
    const event = {
      type: "conversation.item.create",
      item: {
        type: "message",
        role: "user",
        content: [
          {
            type: "input_text",
            text: "Add notes about my speech",
          },
        ],
      },
    };
    dataChannel.send(JSON.stringify(event));
  };

  return {
    closeHandler,
    eventTrigger,
  };
};
