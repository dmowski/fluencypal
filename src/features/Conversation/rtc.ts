"use client";
import {
  AiVoice,
  calculateUsagePrice,
  convertUsdToHours,
  RealTimeModel,
  UsageEvent,
} from "@/common/ai";
import { sleep } from "@/libs/sleep";
import { ChatMessage, MessagesOrderMap } from "@/common/conversation";
import { UsageLog } from "@/common/usage";
import { SupportedLanguage } from "@/features/Lang/lang";
import { SendSdpOfferRequest, SendSdpOfferResponse } from "@/common/requests";

const sendSdpOffer = async (
  offer: RTCSessionDescriptionInit,
  model: RealTimeModel,
  authToken: string
): Promise<string> => {
  try {
    if (!offer.sdp) {
      throw new Error("SDP Offer is missing");
    }

    const request: SendSdpOfferRequest = {
      model,
      sdp: offer.sdp,
    };

    const sdpResponse = await fetch(`/api/sendSdpOffer`, {
      method: "POST",
      body: JSON.stringify(request),
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${authToken}`,
      },
    });

    if (!sdpResponse.ok) {
      throw new Error(`Failed to send SDP Offer: ${sdpResponse.status} ${sdpResponse.statusText}`);
    }

    const response: SendSdpOfferResponse = await sdpResponse.json();
    return response.sdpResponse;
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

type Modalities = "audio" | "text";

interface UpdateSessionProps {
  dataChannel: RTCDataChannel;
  initInstruction?: string;
  voice?: AiVoice;
  languageCode: SupportedLanguage;
  modalities: Modalities[];
}

const updateSession = async ({
  dataChannel,
  initInstruction,
  voice,
  languageCode,
  modalities,
}: UpdateSessionProps) => {
  if (!dataChannel) throw Error("Error on updateSession. dataChannel is not available");

  const event = {
    type: "session.update",
    session: {
      instructions: initInstruction,
      input_audio_transcription: {
        model: "gpt-4o-mini-transcribe",
        language: languageCode,
      },
      voice,
      modalities,

      turn_detection: {
        type: "semantic_vad",
        eagerness: "auto",
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
  onMessageOrder: (orderPart: MessagesOrderMap) => void;
  isMuted: boolean;
  onAddUsage: ({}: UsageLog) => void;
  languageCode: SupportedLanguage;
  voice?: AiVoice;
  isVolumeOn: boolean;
  authToken: string;
  isInitWebCamera?: boolean;
  webCamDescription?: string;
}

export type AiRtcInstance = Awaited<ReturnType<typeof initAiRtc>>;

interface InstructionState {
  baseInitInstruction: string;
  webCamDescription: string;
  correction: string;
}

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
  languageCode,
  voice,
  isVolumeOn,
  authToken,
  onMessageOrder,
  webCamDescription,
}: AiRtcConfig) => {
  const audioId = "audio_for_llm";
  const existingAudio = document.getElementById(audioId) as HTMLAudioElement | null;
  let audioEl = existingAudio;
  if (!audioEl) {
    audioEl = document.createElement("audio");

    audioEl.autoplay = true;
    audioEl.id = audioId;
    document.body.appendChild(audioEl);
  }

  await sleep(2000); // Important for mobile devices
  const userMedia = await navigator.mediaDevices.getUserMedia({
    audio: true,
  });
  await sleep(1000);

  const peerConnection = new RTCPeerConnection();
  peerConnection.ontrack = (e) => {
    const stream = e.streams[0];
    audioEl.srcObject = stream;
    monitorWebRtcAudio(stream, setIsAiSpeaking);
  };
  peerConnection.addTrack(userMedia.getTracks()[0]);

  const dataChannel = peerConnection.createDataChannel("oai-events");

  const messageHandler = (e: MessageEvent) => {
    setDebugInfo("green");
    const event = JSON.parse(e.data);
    const type = (event?.type || "") as string;
    //console.log("Event type:", type, "|", event);
    //console.log(JSON.stringify(event, null, 2));

    const previousItemId = event?.previous_item_id as string | undefined;
    const itemId = (event?.item_id || event.item?.id) as string | undefined;
    if (previousItemId && itemId) {
      onMessageOrder({
        [previousItemId]: itemId,
      });
    }

    if (type === "response.done") {
      const usageId = event?.event_id || "";
      const usageEvent: UsageEvent | null = event?.response?.usage;
      if (usageEvent) {
        const priceUsd = calculateUsagePrice(usageEvent, model);
        const priceHours = convertUsdToHours(priceUsd);
        onAddUsage({
          usageId,
          usageEvent,
          priceUsd,
          priceHours,
          createdAt: Date.now(),
          model,
          languageCode,
          type: "realtime",
        });
      }
    }

    // conversation.item.input_audio_transcription.delta
    if (type === "conversation.item.input_audio_transcription.delta") {
      const id = event?.item_id as string;
      const deltaMessage = event?.delta as string;
      if (id && deltaMessage) {
        const isBot = false;
        onAddDelta(id, deltaMessage, isBot);
      }
    }

    if (type === "response.audio_transcript.delta") {
      const id = event?.item_id as string;
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
        // console.log("TIMESTAMP CHECK event", event);
        onMessage({ isBot: false, text: userMessage, id });
      }
    }

    if (type === "response.done") {
      //console.log("event?.response?.output", event?.response?.output);
      const botAnswer = event?.response?.output
        .map((item: any) => {
          return (
            item?.content
              ?.map((content: any) => content?.transcript || content?.text || "")
              .join(" ")
              .trim() || ""
          );
        })
        .join(" ")
        .trim();

      const id = event?.response?.output?.[0]?.id as string | undefined;
      if (id && botAnswer) {
        onMessage({ isBot: true, text: botAnswer || "", id });
      }
    }

    if (type === "conversation.item.created") {
      if (
        event.item.role === "user" &&
        event.item.status === "completed" &&
        event.item.type === "message"
      ) {
        const id = event.item.id as string;
        const content = event.item.content || [];
        const userMessage = content
          .map((item: any) => {
            if (item.type === "input_text") {
              return item.text || "";
            }
            return "";
          })
          .join(" ")
          .trim();

        if (userMessage && id) {
          // console.log("TIMESTAMP CHECK event", event);
          onMessage({ isBot: false, text: userMessage, id });
        }
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

  const setDebugInfo = (color: string) => {};
  const closeEvent = () => {};
  const errorEvent = (e: any) => console.error("Data channel error", e);

  const instructionState: InstructionState = {
    baseInitInstruction: initInstruction,
    webCamDescription: webCamDescription || "",
    correction: "",
  };

  const getInstruction = (): string => {
    return [
      instructionState.baseInitInstruction,
      instructionState.webCamDescription,
      instructionState.correction,
    ]
      .filter((part) => part && part.length > 0)
      .join("\n");
  };

  const updateInstruction = async (partial: Partial<InstructionState>): Promise<void> => {
    Object.assign(instructionState, partial);
    const updatedInstruction = getInstruction();
    console.log("RTC updatedInstruction", updatedInstruction);
    await updateSession({
      ...sessionPrompts,
      initInstruction: updatedInstruction,
    });
  };

  const sessionPrompts: UpdateSessionProps = {
    dataChannel,
    initInstruction: getInstruction(),
    voice,
    languageCode,
    modalities: isVolumeOn ? ["audio", "text"] : ["text"],
  };

  const openHandler = async () => {
    await sleep(600);
    await updateInstruction({});
    onOpen();
  };

  dataChannel.addEventListener("message", messageHandler);
  dataChannel.addEventListener("open", openHandler);

  dataChannel.addEventListener("close", closeEvent);
  dataChannel.addEventListener("error", errorEvent);

  const offer = await peerConnection.createOffer();

  await peerConnection.setLocalDescription(offer);
  const answer: RTCSessionDescriptionInit = {
    type: "answer",
    sdp: await sendSdpOffer(offer, model, authToken),
  };
  await peerConnection.setRemoteDescription(answer);

  const closeHandler = () => {
    if (dataChannel) {
      dataChannel.removeEventListener("message", messageHandler);
      dataChannel.removeEventListener("open", openHandler);
      dataChannel.removeEventListener("close", closeEvent);
      dataChannel.removeEventListener("error", errorEvent);

      if (dataChannel.readyState !== "closed") {
        dataChannel.close();
        console.log("Data channel closed");
      }
    }

    if (peerConnection && peerConnection.signalingState !== "closed") {
      peerConnection.getSenders().forEach((sender, index) => {
        if (sender.track) {
          sender.track.stop();
          console.log("Track stopped - #", index);
        }
      });

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

  if (isMuted) toggleMute(true);

  const toggleVolume = async (isVolumeOn: boolean) => {
    if (!audioEl) return;
    audioEl.muted = !isVolumeOn;
    audioEl.volume = isVolumeOn ? 1 : 0;
  };

  const sendWebCamDescription = async (description: string) => {
    updateInstruction({ webCamDescription: description });
  };

  return {
    closeHandler,
    addUserChatMessage,
    triggerAiResponse,
    toggleMute,
    toggleVolume,
    sendWebCamDescription,
  };
};
