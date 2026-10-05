import { describe, expect, it, vi } from "vitest";
import type { ServerEnv } from "./signaling";
import { loadVoicePreview, pcm16ToWav, realtimeWsUrl } from "./voicePreview";

const env: ServerEnv = {
  apiKey: "test-key",
  model: "qwen-audio-3.0-realtime-flash",
  region: "singapore",
  webrtcUrl: "https://maas.qwencloudapi.com/api/v1/webrtc/realtime",
};

describe("voice preview", () => {
  it("wraps pcm in a wav header", () => {
    const wav = pcm16ToWav(Buffer.from([0, 1, 2, 3]));
    expect(wav.subarray(0, 4).toString("ascii")).toBe("RIFF");
    expect(wav.subarray(8, 12).toString("ascii")).toBe("WAVE");
    expect(wav.length).toBe(48);
  });

  it("builds the realtime websocket url from the webrtc host", () => {
    expect(realtimeWsUrl(env)).toBe(
      "wss://maas.qwencloudapi.com/api-ws/v1/realtime?model=qwen-audio-3.0-realtime-flash",
    );
  });

  it("rejects an unknown voice before any network call", async () => {
    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);
    const result = await loadVoicePreview("not-a-voice", env);
    expect(result).toEqual({ ok: false, status: 404, error: "Unknown voice" });
    expect(fetchMock).not.toHaveBeenCalled();
    vi.unstubAllGlobals();
  });
});
