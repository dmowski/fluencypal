export function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="grid gap-0.5">
      <dt className="text-xs text-zinc-500">{label}</dt>
      <dd className="font-mono text-sm">{value}</dd>
    </div>
  );
}
