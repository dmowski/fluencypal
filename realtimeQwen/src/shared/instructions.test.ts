import { describe, expect, it } from "vitest";
import { instructionsForVoice } from "./instructions";

describe("teacher instructions", () => {
  it("uses the selected voice and leaves out backend delegation", () => {
    const prompt = instructionsForVoice("longanlingxin");
    expect(prompt).toContain("You are Long An Ling Xin, a calm, friendly English speaking teacher.");
    expect(prompt).toContain("cannot analyze an accent");
    expect(prompt).not.toContain("Delegate");
    expect(prompt).not.toContain("Backend tools");
  });
});
