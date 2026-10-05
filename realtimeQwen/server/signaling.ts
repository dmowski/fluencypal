import type { IncomingMessage, ServerResponse } from "node:http";
import { loadEnv, type Connect } from "vite";
import pricingFile from "../pricing.json" with { type: "json" };
import type { PricingRegion, RegionPricing } from "../src/shared/pricing";

export const DEFAULT_MODEL = "qwen-audio-3.0-realtime-flash";

export const DEFAULT_WEBRTC_URLS: Record<PricingRegion, string> = {
  singapore: "https://maas.qwencloudapi.com/api/v1/webrtc/realtime",
  beijing: "https://dashscope.aliyuncs.com/api/v1/webrtc/realtime",
};

export type ServerEnv = {
  apiKey: string;
  model: string;
  region: PricingRegion;
  webrtcUrl: string;
};

export type PublicConfig = {
  ready: boolean;
  missing: string[];
  model: string;
  region: PricingRegion;
  regionLabel: string;
  pricing: RegionPricing;
  voices: string[];
  defaultVoice: string;
  signalingHost: string;
  pricingNotes: string;
};

export const VOICES = [
  "longanqian",
  "longanlingxin",
  "longanlingxi",
  "longanxiaoxin",
  "longanlufeng",
] as const;

function regionFrom(value: string | undefined): PricingRegion {
  return value === "beijing" ? "beijing" : "singapore";
}

export function readServerEnv(mode: string, cwd: string): ServerEnv {
  const file = loadEnv(mode, cwd, "");
  const region = regionFrom(process.env.QWEN_REGION || file.QWEN_REGION);
  const model = (process.env.QWEN_MODEL || file.QWEN_MODEL || DEFAULT_MODEL).trim();
  const webrtcUrl = (
    process.env.QWEN_WEBRTC_URL ||
    file.QWEN_WEBRTC_URL ||
    DEFAULT_WEBRTC_URLS[region]
  ).trim();
  const apiKey = (process.env.DASHSCOPE_API_KEY || file.DASHSCOPE_API_KEY || "").trim();
  return { apiKey, model, region, webrtcUrl };
}

export function publicConfig(env: ServerEnv): PublicConfig {
  const missing = env.apiKey ? [] : ["DASHSCOPE_API_KEY"];
  let signalingHost = env.webrtcUrl;
  try {
    signalingHost = new URL(env.webrtcUrl).host;
  } catch {
    signalingHost = env.webrtcUrl;
  }
  return {
    ready: missing.length === 0,
    missing,
    model: env.model,
    region: env.region,
    regionLabel: pricingFile.regions[env.region].label,
    pricing: pricingFile.regions[env.region],
    voices: [...VOICES],
    defaultVoice: VOICES[0],
    signalingHost,
    pricingNotes: pricingFile.notes,
  };
}

export function validateOffer(sdp: string): string | null {
  if (sdp.length < 20 || sdp.length > 200_000) return "SDP has an unexpected size";
  if (!sdp.includes("m=audio")) return "Offer SDP must include an audio track";
  return null;
}

export type SdpResult = { ok: true; answer: string } | { ok: false; status: number; error: string };

export async function exchangeSdp(offer: string, env: ServerEnv): Promise<SdpResult> {
  if (!env.apiKey) {
    return { ok: false, status: 500, error: "DASHSCOPE_API_KEY is not set on the server" };
  }

  let url: URL;
  try {
    url = new URL(env.webrtcUrl);
  } catch {
    return { ok: false, status: 500, error: "QWEN_WEBRTC_URL is not a valid URL" };
  }
  url.searchParams.set("model", env.model);

  const response = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${env.apiKey}`,
      "Content-Type": "application/sdp",
    },
    body: offer,
  });
  const text = await response.text();
  if (!response.ok) {
    return { ok: false, status: response.status, error: text.slice(0, 800) || response.statusText };
  }
  return { ok: true, answer: text };
}

function sendJson(res: ServerResponse, status: number, body: unknown) {
  res.statusCode = status;
  res.setHeader("content-type", "application/json; charset=utf-8");
  res.end(JSON.stringify(body));
}

async function readBody(req: IncomingMessage): Promise<string> {
  const chunks: Buffer[] = [];
  for await (const chunk of req) {
    chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
  }
  return Buffer.concat(chunks).toString("utf8");
}

export function attachSignaling(middlewares: Connect.Server, env: ServerEnv) {
  middlewares.use(async (req, res, next) => {
    const request = req as IncomingMessage;
    const response = res as ServerResponse;
    try {
      const path = request.url?.split("?")[0];
      if (path === "/api/config" && request.method === "GET") {
        sendJson(response, 200, publicConfig(env));
        return;
      }
      if (path === "/api/sdp" && request.method === "POST") {
        const offer = await readBody(request);
        const invalid = validateOffer(offer);
        if (invalid) {
          sendJson(response, 400, { error: invalid });
          return;
        }
        const result = await exchangeSdp(offer, env);
        if (!result.ok) {
          sendJson(response, result.status, { error: result.error });
          return;
        }
        response.statusCode = 200;
        response.setHeader("content-type", "application/sdp");
        response.end(result.answer);
        return;
      }
      next();
    } catch (error) {
      const message = error instanceof Error ? error.message : "Signaling failed";
      sendJson(response, 500, { error: message });
    }
  });
}
