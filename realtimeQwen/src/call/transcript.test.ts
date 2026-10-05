import { describe, expect, it } from "vitest";
import { appendTranscriptDelta, emptyTranscript, finishTranscript } from "./transcript";

describe("transcript", () => {
  it("shows each delta as it arrives and replaces the line with the final text", () => {
    let state = emptyTranscript();
    state = appendTranscriptDelta(state, "qwen", "item-1", "Hi");
    state = appendTranscriptDelta(state, "qwen", "item-1", " there");
    expect(state.lines).toEqual([{ id: 1, role: "qwen", text: "Hi there" }]);

    state = finishTranscript(state, "qwen", "item-1", "Hi there.");
    expect(state.lines).toEqual([{ id: 1, role: "qwen", text: "Hi there." }]);
    state = finishTranscript(state, "qwen", "item-1", "Hi there.");
    expect(state.lines).toHaveLength(1);
  });

  it("starts a new line for the next speaker", () => {
    let state = appendTranscriptDelta(emptyTranscript(), "qwen", "a", "Hello");
    state = finishTranscript(state, "qwen", "a", "Hello.");
    state = appendTranscriptDelta(state, "you", "b", "My day ");
    state = appendTranscriptDelta(state, "you", "b", "was good");
    expect(state.lines.map((line) => line.text)).toEqual(["Hello.", "My day was good"]);
  });
});