"use client";
import { calculateUsagePrice, RealTimeModel, UsageEvent } from "@/common/ai";
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
  handler: (args: Record<string, string>) => Promise<void>;
}

const updateSession = async (
  dataChannel: RTCDataChannel,
  initInstruction: string,
  aiTools: AiToolForLlm[]
) => {
  if (!dataChannel) throw Error("Error on updateSession. dataChannel is not available");

  const event = {
    type: "session.update",
    session: {
      instructions: initInstruction,
      tools: aiTools,
      input_audio_transcription: {
        model: "whisper-1",
      },
      turn_detection: {
        type: "server_vad",
        threshold: 0.5,
        prefix_padding_ms: 500,
        silence_duration_ms: 1500,
        create_response: true,
      },
    },
  };
  await sleep(100);
  dataChannel.send(JSON.stringify(event));
  await sleep(100);
};

const monitorWebRtcAudio = (stream: MediaStream, setIsAiSpeaking: (speaking: boolean) => void) => {
  const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
  const analyser = audioContext.createAnalyser();
  analyser.fftSize = 512;

  const source = audioContext.createMediaStreamSource(stream);
  source.connect(analyser);

  const bufferLength = analyser.frequencyBinCount;
  const dataArray = new Uint8Array(bufferLength);

  let lastSpeakingState = false; // Store the previous state

  const checkSpeaking = () => {
    analyser.getByteFrequencyData(dataArray);
    const volume = dataArray.reduce((sum, val) => sum + val, 0) / bufferLength;

    const isSpeaking = volume > 10; // Adjust this threshold as needed

    if (isSpeaking !== lastSpeakingState) {
      setIsAiSpeaking(isSpeaking);
      lastSpeakingState = isSpeaking;
    }

    setTimeout(checkSpeaking, 100);
  };

  checkSpeaking();
};

export interface AiRtcConfig {
  model: RealTimeModel;
  initInstruction: string;
  onOpen: () => void;
  aiTools: AiTool[];
  onMessage: (message: ChatMessage) => void;
  onAddDelta: (id: string, delta: string, isBot: boolean) => void;
  setIsAiSpeaking: (speaking: boolean) => void;
  setIsUserSpeaking: (speaking: boolean) => void;
  isMuted: boolean;
  onAddUsage: ({}: {
    usageId: string;
    usageEvent: UsageEvent;
    price: number;
    createdAt: number;
  }) => void;
}

export type AiRtcInstance = Awaited<ReturnType<typeof initAiRtc>>;

export const initAiRtc = async ({
  model,
  initInstruction,
  aiTools,
  onMessage,
  onOpen,
  setIsAiSpeaking,
  setIsUserSpeaking,
  isMuted,
  onAddDelta,
  onAddUsage,
}: AiRtcConfig) => {
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

  peerConnection.ontrack = (e) => {
    const stream = e.streams[0];
    audioEl.srcObject = stream;
    monitorWebRtcAudio(stream, setIsAiSpeaking);
  };

  const userMedia = await navigator.mediaDevices.getUserMedia({
    audio: true,
  });
  peerConnection.addTrack(userMedia.getTracks()[0]);
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
    //console.log("Event type:", type);
    //console.log(JSON.stringify(event, null, 2));

    if (type === "response.done") {
      const usageId = event?.event_id || "";
      const usageEvent: UsageEvent | null = event?.response?.usage;
      if (usageEvent) {
        const price = calculateUsagePrice(usageEvent, model);
        onAddUsage({ usageId, usageEvent, price, createdAt: Date.now() });
      }
    }

    if (type === "response.audio_transcript.delta") {
      const id = event?.response_id as string;
      const deltaMessage = event?.delta as string;
      if (id && deltaMessage) {
        const isBot = true;
        onAddDelta(id, deltaMessage, isBot);
      }
    }

    if (type === "input_audio_buffer.speech_started") {
      setIsUserSpeaking(true);
    }

    if (type === "input_audio_buffer.speech_stopped") {
      setIsUserSpeaking(false);
    }

    if (type === "error") {
      console.error("Error in messageHandler", event);
    }

    if (type === "conversation.item.input_audio_transcription.completed") {
      const userMessage = event?.transcript || "";
      if (userMessage) {
        const id = event?.item_id as string;
        onMessage({ isBot: false, text: userMessage, id });
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
        const id = event?.response?.id || (`${Date.now()}` as string);
        onMessage({ isBot: true, text: botAnswer, id });
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
    await updateSession(dataChannel, initInstruction, aiToolsForLlm);
    onOpen();
  };
  dataChannel.addEventListener("message", messageHandler);
  dataChannel.addEventListener("open", openHandler);

  const closeHandler = () => {
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

  const addUserChatMessage = (message: string) => {
    const event = {
      type: "conversation.item.create",
      item: {
        type: "message",
        role: "user",
        content: [
          {
            type: "input_text",
            text: message,
          },
        ],
      },
    };
    dataChannel.send(JSON.stringify(event));
  };

  const updateSessionTrigger = async (instruction: string) => {
    await updateSession(dataChannel, instruction, aiToolsForLlm);
  };

  const triggerAiResponse = async () => {
    const event = {
      type: "response.create",
    };
    dataChannel.send(JSON.stringify(event));
  };

  const toggleMute = (mute: boolean) => {
    userMedia.getTracks().forEach((track) => {
      track.enabled = !mute;
    });
  };

  if (isMuted) {
    toggleMute(true);
  }

  return {
    closeHandler,
    addUserChatMessage,
    updateSessionTrigger,
    triggerAiResponse,
    toggleMute,
  };
};
