import type { CallSnapshot } from "../call/QwenCall";
import { formatDuration, formatUsd } from "../shared/format";
import { costPerHourUsd } from "../shared/pricing";

export function CallControls({
  phase,
  status,
  elapsedMs,
  muted,
  canStart,
  totalCostUsd,
  onStart,
  onToggleMute,
  onHangUp,
}: {
  phase: CallSnapshot["phase"];
  status: string;
  elapsedMs: number;
  muted: boolean;
  canStart: boolean;
  totalCostUsd: number;
  onStart: () => void;
  onToggleMute: () => void;
  onHangUp: () => void;
}) {
  const inCall = phase === "connecting" || phase === "live";
  return (
    <section className="flex flex-col items-center gap-6 py-4">
      <p className="flex items-center gap-2 text-sm text-zinc-300">
        <span className={`h-2.5 w-2.5 rounded-full ${dotClass(phase)}`} />
        {status}
      </p>
      {(phase === "connecting" || phase === "live" || phase === "ended") && (
        <p className="font-mono text-6xl tabular-nums tracking-tight">{formatDuration(elapsedMs)}</p>
      )}
      <div className="flex flex-wrap items-center justify-center gap-3">
        {!inCall ? (
          <button
            type="button"
            className="rounded-full bg-white px-6 py-2.5 text-sm font-medium text-zinc-950 disabled:cursor-not-allowed disabled:bg-zinc-700 disabled:text-zinc-400"
            disabled={!canStart}
            onClick={onStart}
          >
            Start Call
          </button>
        ) : (
          <>
            <button
              type="button"
              className="rounded-full border border-zinc-600 px-5 py-2.5 text-sm disabled:opacity-40"
              disabled={phase !== "live"}
              onClick={onToggleMute}
            >
              {muted ? "Unmute" : "Mute"}
            </button>
            <button
              type="button"
              className="rounded-full bg-red-500 px-5 py-2.5 text-sm font-medium text-white"
              onClick={onHangUp}
            >
              End Call
            </button>
          </>
        )}
      </div>
      {phase === "live" && (
        <p className="text-sm text-zinc-300">
          Current cost: <span className="font-mono">{formatUsd(totalCostUsd)}</span>
          {" · "}
          about <span className="font-mono">{formatUsd(costPerHourUsd(totalCostUsd, elapsedMs))}</span>
          /hour
        </p>
      )}
    </section>
  );
}

function dotClass(phase: CallSnapshot["phase"]) {
  if (phase === "live") return "bg-emerald-400";
  if (phase === "connecting") return "bg-amber-300";
  if (phase === "error") return "bg-red-400";
  return "bg-zinc-600";
}
