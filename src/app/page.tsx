"use client";

import { useState } from "react";

export default function Home() {
  const [isStarted, setIsStarted] = useState(false);
  const [isStarting, setIsStarting] = useState(false);

  async function init() {
    const tokenResponse = await fetch("/api/token");
    const data = await tokenResponse.json();

    const EPHEMERAL_KEY = data.client_secret.value;
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
      // Realtime server events appear here!
      console.log(e);
    });

    const offer = await pc.createOffer();
    await pc.setLocalDescription(offer);

    const baseUrl = "https://api.openai.com/v1/realtime";
    const model = "gpt-4o-mini-realtime-preview-2024-12-17";
    const sdpResponse = await fetch(`${baseUrl}?model=${model}`, {
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

  const onStart = async () => {
    setIsStarting(true);
    await init();
    setIsStarting(false);
    setIsStarted(true);
  };

  return (
    <main className="">
      {isStarted ? (
        <div className="flex flex-col items-center justify-center h-screen">
          <p>Talk</p>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center h-screen">
          {isStarting ? (
            <p>Loading...</p>
          ) : (
            <>
              <button onClick={onStart} className="px-10 rounded py-4 border">
                Start
              </button>
            </>
          )}
        </div>
      )}
    </main>
  );
}
