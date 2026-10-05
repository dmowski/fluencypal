import type { ServerEnv } from "./signaling";
import { voiceById } from "../src/shared/voices";

const SAMPLE_RATE = 24_000;
const PREVIEW_TEXT = "Hi, I'm ready when you are.";
const cache = new Map<string, Buffer>();
const inflight = new Map<string, Promise<Buffer>>();

export type PreviewResult = { ok: true; wav: Buffer } | { ok: false; status: number; error: string };

export function pcm16ToWav(pcm: Buffer, sampleRate = SAMPLE_RATE): Buffer {
  const header = Buffer.alloc(44);
  header.write("RIFF", 0);
  header.writeUInt32LE(36 + pcm.length, 4);
  header.write("WAVE", 8);
  header.write("fmt ", 12);
  header.writeUInt32LE(16, 16);
  header.writeUInt16LE(1, 20);
  header.writeUInt16LE(1, 22);
  header.writeUInt32LE(sampleRate, 24);
  header.writeUInt32LE(sampleRate * 2, 28);
  header.writeUInt16LE(2, 32);
  header.writeUInt16LE(16, 34);
  header.write("data", 36);
  header.writeUInt32LE(pcm.length, 40);
  return Buffer.concat([header, pcm]);
}

export function realtimeWsUrl(env: ServerEnv): string {
  const url = new URL(env.webrtcUrl);
  url.protocol = url.protocol === "http:" ? "ws:" : "wss:";
  url.pathname = "/api-ws/v1/realtime";
  url.search = "";
  url.searchParams.set("model", env.model);
  return url.toString();
}

export async function loadVoicePreview(voiceId: string, env: ServerEnv): Promise<PreviewResult> {
  const voice = voiceById(voiceId);
  if (!voice) return { ok: false, status: 404, error: "Unknown voice" };

  const cached = cache.get(voice.id);
  if (cached) return { ok: true, wav: cached };

  const pending = inflight.get(voice.id);
  if (pending) {
    try {
      return { ok: true, wav: await pending };
    } catch (error) {
      const message = error instanceof Error ? error.message : "Could not load this voice";
      return { ok: false, status: 502, error: message };
    }
  }

  const job = (voice.sampleUrl ? fetchSample(voice.sampleUrl) : synthesize(voice.id, env)).then((wav) => {
    cache.set(voice.id, wav);
    return wav;
  });
  inflight.set(voice.id, job);
  try {
    return { ok: true, wav: await job };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Could not load this voice";
    return { ok: false, status: 502, error: message };
  } finally {
    inflight.delete(voice.id);
  }
}

async function fetchSample(url: string): Promise<Buffer> {
  const response = await fetch(url);
  if (!response.ok) throw new Error(`Sample request failed (${response.status})`);
  const wav = Buffer.from(await response.arrayBuffer());
  if (wav.subarray(0, 4).toString("ascii") !== "RIFF") throw new Error("Sample was not a WAV file");
  return wav;
}

type SocketEvent = {
  type?: string;
  delta?: string;
  error?: { message?: string };
};

type NodeSocket = WebSocket & { send(data: string): void };

function openSocket(url: string, apiKey: string): Promise<NodeSocket> {
  const Socket = WebSocket as unknown as new (
    address: string,
    options?: { headers?: Record<string, string> },
  ) => NodeSocket;
  return new Promise((resolve, reject) => {
    const socket = new Socket(url, { headers: { Authorization: `Bearer ${apiKey}` } });
    const fail = () => reject(new Error("Voice preview connection failed"));
    socket.addEventListener("open", () => {
      socket.removeEventListener("error", fail);
      resolve(socket);
    });
    socket.addEventListener("error", fail);
  });
}

function readEvents(socket: NodeSocket) {
  const pending: SocketEvent[] = [];
  const waiters: Array<(event: SocketEvent) => void> = [];
  socket.addEventListener("message", (message) => {
    void messageText(message.data).then((text) => {
      let event: SocketEvent;
      try {
        event = JSON.parse(text) as SocketEvent;
      } catch {
        return;
      }
      const waiter = waiters.shift();
      if (waiter) waiter(event);
      else pending.push(event);
    });
  });

  return {
    next(timeoutMs: number): Promise<SocketEvent> {
      const existing = pending.shift();
      if (existing) return Promise.resolve(existing);
      return new Promise((resolve, reject) => {
        const timer = setTimeout(() => reject(new Error("Voice preview timed out")), timeoutMs);
        waiters.push((event) => {
          clearTimeout(timer);
          resolve(event);
        });
      });
    },
  };
}

async function messageText(data: unknown): Promise<string> {
  if (typeof data === "string") return data;
  if (Buffer.isBuffer(data)) return data.toString("utf8");
  if (data instanceof ArrayBuffer) return Buffer.from(data).toString("utf8");
  if (typeof Blob !== "undefined" && data instanceof Blob) return data.text();
  return String(data);
}

async function synthesize(voiceId: string, env: ServerEnv): Promise<Buffer> {
  if (!env.apiKey) throw new Error("DASHSCOPE_API_KEY is not set on the server");
  const socket = await openSocket(realtimeWsUrl(env), env.apiKey);
  const events = readEvents(socket);
  const chunks: Buffer[] = [];
  try {
    await until(events, "session.created");
    socket.send(
      JSON.stringify({
        type: "session.update",
        session: {
          modalities: ["text", "audio"],
          voice: voiceId,
          instructions: "Speak the user's sentence in a natural voice. Do not add anything else.",
          turn_detection: null,
        },
      }),
    );
    await until(events, "session.updated");
    socket.send(
      JSON.stringify({
        type: "conversation.item.create",
        item: {
          type: "message",
          role: "user",
          content: [{ type: "input_text", text: PREVIEW_TEXT }],
        },
      }),
    );
    socket.send(JSON.stringify({ type: "response.create" }));

    const started = Date.now();
    while (Date.now() - started < 25_000) {
      const event = await events.next(25_000);
      if (event.type === "error") throw new Error(event.error?.message || "Voice preview failed");
      if (event.type === "response.audio.delta" || event.type === "response.output_audio.delta") {
        if (event.delta) chunks.push(Buffer.from(event.delta, "base64"));
      }
      if (event.type === "response.done") break;
    }
  } finally {
    socket.close();
  }
  if (chunks.length === 0) throw new Error("The voice preview had no audio");
  return pcm16ToWav(Buffer.concat(chunks));
}

async function until(events: ReturnType<typeof readEvents>, type: string): Promise<void> {
  const started = Date.now();
  while (Date.now() - started < 15_000) {
    const event = await events.next(15_000);
    if (event.type === "error") throw new Error(event.error?.message || "Voice preview failed");
    if (event.type === type) return;
  }
  throw new Error(`Timed out waiting for ${type}`);
}
