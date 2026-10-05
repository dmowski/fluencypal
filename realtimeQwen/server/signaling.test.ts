import { afterEach, describe, expect, it, vi } from "vitest";
import { exchangeSdp, publicConfig, validateOffer, type ServerEnv } from "./signaling";

const env: ServerEnv = {
  apiKey: "test-key",
  model: "qwen-audio-3.0-realtime-flash",
  region: "singapore",
  webrtcUrl: "https://maas.qwencloudapi.com/api/v1/webrtc/realtime",
};

const offer = "v=0\r\nm=audio 9 UDP/TLS/RTP/SAVPF 111\r\n";

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("signaling", () => {
  it("rejects an offer without audio", () => {
    expect(validateOffer(`${"v=0\r\n".repeat(8)}m=video 9 UDP/TLS/RTP/SAVPF 96\r\n`)).toMatch(/audio/);
  });

  it("posts the offer with the server key and returns the answer", async () => {
    const fetchMock = vi.fn(async (_url: string | URL, init?: RequestInit) => {
      expect(String(init?.headers && (init.headers as Record<string, string>).Authorization)).toBe(
        "Bearer test-key",
      );
      expect(init?.body).toBe(offer);
      return new Response("v=0\r\n", { status: 200 });
    });
    vi.stubGlobal("fetch", fetchMock);

    const result = await exchangeSdp(offer, env);
    expect(result).toEqual({ ok: true, answer: "v=0\r\n" });
    const called = fetchMock.mock.calls[0]?.[0];
    expect(String(called)).toContain("model=qwen-audio-3.0-realtime-flash");
  });

  it("does not put the API key in the public config", () => {
    const config = publicConfig(env);
    expect(JSON.stringify(config)).not.toContain("test-key");
    expect(config.ready).toBe(true);
    expect(config.signalingHost).toBe("maas.qwencloudapi.com");
    expect(publicConfig({ ...env, apiKey: "" }).ready).toBe(false);
  });
});
