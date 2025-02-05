import { INIT_CONVERSATION_INSTRUCTIONS, MAIN_CONVERSATION_MODEL } from "@/data/ai";
import { getEphemeralKey } from "@/libs/getEphemeralKey";
import { sleep } from "@/libs/sleep";
import { useState } from "react";

export const useAiConversation = () => {
  const [isInitializing, setIsInitializing] = useState(false);

  const [isStarted, setIsStarted] = useState(false);

  const setInitConfigs = async (dataChannel: RTCDataChannel) => {
    if (!dataChannel) {
      console.log("❌ Data Channel not available");
      return;
    }
    await sleep(300);
    console.log("START");

    const event = {
      type: "session.update",
      session: {
        instructions: INIT_CONVERSATION_INSTRUCTIONS,
        /*tools: [
          {
            type: "function",
            name: "showRunes",
            description: "Show Runes Info on the screen",
            parameters: {
              type: "object",
              properties: {
                runeIds: {
                  type: "array",
                  description: "A list of rune IDs based on list of Runes",
                  items: {
                    type: "number",
                  },
                },
              },
            },
          },
        ],*/
      },
    };

    await sleep(300);
    dataChannel.send(JSON.stringify(event));
    await sleep(2000);
  };

  async function init() {
    const EPHEMERAL_KEY = await getEphemeralKey();
    const pc = new RTCPeerConnection();

    const audioEl = document.createElement("audio");
    audioEl.autoplay = true;
    pc.ontrack = (e) => (audioEl.srcObject = e.streams[0]);

    const ms = await navigator.mediaDevices.getUserMedia({
      audio: true,
    });
    pc.addTrack(ms.getTracks()[0]);

    const dc = pc.createDataChannel("oai-events");

    dc.addEventListener("message", (e) => {
      console.log(e);
    });

    dc.addEventListener("open", async () => {
      await setInitConfigs(dc);
      setIsInitializing(false);
      setIsStarted(true);
    });

    const offer = await pc.createOffer();
    await pc.setLocalDescription(offer);

    const baseUrl = "https://api.openai.com/v1/realtime";

    const sdpResponse = await fetch(`${baseUrl}?model=${MAIN_CONVERSATION_MODEL}`, {
      method: "POST",
      body: offer.sdp,
      headers: {
        Authorization: `Bearer ${EPHEMERAL_KEY}`,
        "Content-Type": "application/sdp",
      },
    });

    const answer: RTCSessionDescriptionInit = {
      type: "answer",
      sdp: await sdpResponse.text(),
    };
    await pc.setRemoteDescription(answer);
  }

  const startConversation = async () => {
    setIsInitializing(true);
    await init();
  };

  return {
    isInitializing,
    isStarted,
    startConversation,
  };
};
