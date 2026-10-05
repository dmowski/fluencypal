import type { CallSnapshot } from "../call/QwenCall";
import { Level } from "./Level";
import { Stat } from "./Stat";

export function DebugPanel({ snapshot }: { snapshot: CallSnapshot }) {
  return (
    <details className="rounded-2xl border border-zinc-800 p-4" open={snapshot.phase === "live"}>
      <summary className="cursor-pointer text-sm text-zinc-300">Debug</summary>
      <div className="mt-4 grid gap-4 text-sm">
        <dl className="grid grid-cols-2 gap-3">
          <Stat label="Connection" value={snapshot.connectionState} />
          <Stat label="WebRTC" value={snapshot.iceState} />
          <Stat label="Speaker" value={snapshot.speaker} />
          <Stat label="Muted" value={snapshot.muted ? "yes" : "no"} />
        </dl>
        <Level label="Input audio level" value={snapshot.inputLevel} />
        <Level label="Output audio level" value={snapshot.outputLevel} />
        <div>
          <h3 className="mb-1 text-xs text-zinc-500">Events</h3>
          <p className="font-mono text-xs leading-5 text-zinc-400">
            {snapshot.events.length ? snapshot.events.join(" · ") : "—"}
          </p>
        </div>
        <div>
          <h3 className="mb-1 text-xs text-zinc-500">Last usage</h3>
          <pre className="overflow-auto rounded-lg bg-zinc-900 p-3 text-xs text-zinc-300">
            {snapshot.lastUsage ? JSON.stringify(snapshot.lastUsage, null, 2) : "—"}
          </pre>
        </div>
        {snapshot.errors.length > 0 && (
          <ul className="grid gap-1 text-xs text-red-300">
            {snapshot.errors.map((error) => (
              <li key={error}>{error}</li>
            ))}
          </ul>
        )}
      </div>
    </details>
  );
}
