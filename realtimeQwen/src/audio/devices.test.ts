import { describe, expect, it } from "vitest";
import { toneWav } from "./devices";

describe("speaker test tone", () => {
  it("builds a wav blob the audio element can play", async () => {
    const wav = toneWav();
    const bytes = new Uint8Array(await wav.arrayBuffer());
    expect(wav.type).toBe("audio/wav");
    expect(String.fromCharCode(...bytes.slice(0, 4))).toBe("RIFF");
    expect(String.fromCharCode(...bytes.slice(8, 12))).toBe("WAVE");
    expect(bytes.length).toBeGreaterThan(1000);
  });
});