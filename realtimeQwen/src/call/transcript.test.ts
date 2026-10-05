import { describe, expect, it } from "vitest";
import { appendTranscriptDelta, beginUserTurn, emptyTranscript, finishTranscript } from "./transcript";

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

  it("places a late user transcript before the reply that followed that speech", () => {
    let state = appendTranscriptDelta(emptyTranscript(), "qwen", "greet", "Hello! How has your day been going?");
    state = finishTranscript(state, "qwen", "greet", "Hello! How has your day been going?");
    state = beginUserTurn(state);
    state = appendTranscriptDelta(state, "qwen", "reply", "I'm doing great");
    state = finishTranscript(
      state,
      "qwen",
      "reply",
      "I'm doing great, thank you for asking! Recently, I've been enjoying reading.",
    );
    state = finishTranscript(state, "you", "user-1", "I'm doing fine, thank you. How are you?");
    state = finishTranscript(
      state,
      "qwen",
      "reply-copy",
      "I'm doing great, thank you for asking! Recently, I've been enjoying reading.",
    );

    expect(state.lines.map((line) => `${line.role}:${line.text}`)).toEqual([
      "qwen:Hello! How has your day been going?",
      "you:I'm doing fine, thank you. How are you?",
      "qwen:I'm doing great, thank you for asking! Recently, I've been enjoying reading.",
    ]);
  });
});