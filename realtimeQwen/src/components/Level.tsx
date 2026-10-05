export function Level({ label, value }: { label: string; value: number }) {
  const width = Math.max(0, Math.min(100, Math.round(value * 500)));
  return (
    <div className="grid gap-1">
      <div className="flex justify-between text-xs text-zinc-500">
        <span>{label}</span>
        <span className="font-mono">{value.toFixed(3)}</span>
      </div>
      <div className="h-1.5 overflow-hidden rounded bg-zinc-800">
        <div className="h-full bg-emerald-400" style={{ width: `${width}%` }} />
      </div>
    </div>
  );
}
