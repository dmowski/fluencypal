import type { TurnMode } from "../call/QwenCall";
import { VoiceCards } from "./VoiceCards";

export function CallSettings({
  voice,
  outputDeviceId,
  turnDetection,
  instructions,
  onSelectVoice,
  onTurnDetection,
  onInstructions,
}: {
  voice: string;
  outputDeviceId: string;
  turnDetection: TurnMode;
  instructions: string;
  onSelectVoice: (id: string) => void;
  onTurnDetection: (mode: TurnMode) => void;
  onInstructions: (value: string) => void;
}) {
  return (
    <section className="grid gap-4 rounded-2xl border border-zinc-800 p-4">
      <VoiceCards selected={voice} outputDeviceId={outputDeviceId} onSelect={onSelectVoice} />
      <label className="grid gap-1 text-sm">
        <span className="text-zinc-400">Turn detection</span>
        <select
          className="rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2"
          value={turnDetection}
          onChange={(event) => onTurnDetection(event.target.value as TurnMode)}
        >
          <option value="smart_turn">smart_turn — semantic, ignores filler sounds</option>
          <option value="server_vad">server_vad — acoustic, 500 ms silence</option>
        </select>
      </label>
      <label className="grid gap-1 text-sm">
        <span className="text-zinc-400">Instructions</span>
        <textarea
          className="min-h-64 rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2"
          value={instructions}
          onChange={(event) => onInstructions(event.target.value)}
        />
      </label>
      <p className="text-xs leading-5 text-zinc-500">
        Use headphones. The mic and speaker share the room otherwise, and echo can cut the model off. Context keeps
        at most 50 turns or 300 seconds of audio; older audio is dropped, and the call can keep going.
      </p>
    </section>
  );
}
