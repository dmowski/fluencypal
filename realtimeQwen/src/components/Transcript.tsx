import type { TranscriptLine } from "../call/QwenCall";

export function Transcript({ lines }: { lines: TranscriptLine[] }) {
  if (lines.length === 0) return null;
  return (
    <section className="grid gap-2">
      <h2 className="text-sm font-medium text-zinc-300">Transcript</h2>
      <ol className="grid max-h-64 gap-2 overflow-auto text-sm">
        {lines.map((line) => (
          <li key={line.id} className="rounded-lg bg-zinc-900 px-3 py-2">
            <span className="mr-2 text-zinc-500">{line.role === "you" ? "You" : "Qwen"}</span>
            {line.text}
          </li>
        ))}
      </ol>
    </section>
  );
}
