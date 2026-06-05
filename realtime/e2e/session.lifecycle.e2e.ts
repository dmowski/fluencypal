import { afterEach, describe, expect, it } from "vitest";
import WebSocket from "ws";
import { readE2eState } from "./globalSetup.js";
import { createEmulatorTestUser, resetEmulatorState } from "./helpers/emulatorAuth.js";
import { parseServerMessage } from "../src/protocol/messages.js";

const wsUrl = () => {
  const baseUrl = readE2eState().realtimeBaseUrl.replace(/^http/, "ws");
  return `${baseUrl}/v1/session`;
};

const waitForOpen = (socket: WebSocket) =>
  new Promise<void>((resolve, reject) => {
    socket.once("open", () => resolve());
    socket.once("error", reject);
  });

const waitForMessage = (socket: WebSocket, timeoutMs = 10_000) =>
  new Promise<ReturnType<typeof parseServerMessage>>((resolve, reject) => {
    const timer = setTimeout(
      () => reject(new Error("Timed out waiting for WS message")),
      timeoutMs,
    );

    socket.once("message", (raw) => {
      clearTimeout(timer);
      resolve(parseServerMessage(JSON.parse(raw.toString())));
    });

    socket.once("error", (error) => {
      clearTimeout(timer);
      reject(error);
    });
  });

describe("websocket session lifecycle (e2e)", () => {
  afterEach(async () => {
    await resetEmulatorState();
  });

  it("session.start returns session.ready and session.end closes cleanly", async () => {
    const user = await createEmulatorTestUser();
    const socket = new WebSocket(wsUrl());

    await waitForOpen(socket);

    socket.send(
      JSON.stringify({
        type: "session.start",
        token: user.idToken,
        config: {
          languageCode: "en",
          mode: "RealTimeConversation",
          voiceEnabled: true,
          micEnabled: true,
          systemInstruction: "You are an English teacher.",
          voice: "shimmer",
        },
      }),
    );

    const ready = await waitForMessage(socket);
    expect(ready).toMatchObject({
      type: "session.ready",
      mode: "RealTimeConversation",
      voice: "shimmer",
    });

    socket.send(JSON.stringify({ type: "session.ping" }));
    const pong = await waitForMessage(socket);
    expect(pong).toEqual({ type: "session.pong" });

    socket.send(JSON.stringify({ type: "session.end" }));
    const ended = await waitForMessage(socket);
    expect(ended).toEqual({ type: "session.ended" });

    socket.close();
  });

  it("rejects session.start with invalid token", async () => {
    const socket = new WebSocket(wsUrl());
    await waitForOpen(socket);

    socket.send(
      JSON.stringify({
        type: "session.start",
        token: "invalid-token",
        config: {
          languageCode: "en",
          mode: "PushToTalk",
          voiceEnabled: false,
          micEnabled: false,
          systemInstruction: "Test",
          voice: "ash",
        },
      }),
    );

    const error = await waitForMessage(socket);
    expect(error).toMatchObject({
      type: "error",
      code: "invalid_token",
      fatal: true,
    });

    socket.close();
  });
});
