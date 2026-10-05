import type { Checkpoint, MetricsSummary } from "../shared/metrics";
import { formatCount, formatDuration, formatLatency, formatUsd } from "../shared/format";
import { Stat } from "./Stat";

export function MetricsBlock({
  elapsedMs,
  summary,
  checkpoints,
  notes,
  title = "Call report",
}: {
  elapsedMs: number;
  summary: MetricsSummary;
  checkpoints: Checkpoint[];
  notes?: string;
  title?: string;
}) {
  const trend = costTrend(checkpoints);
  return (
    <section className="grid gap-4">
      <h2 className="text-sm font-medium text-zinc-300">{title}</h2>
      <dl className="grid grid-cols-2 gap-x-6 gap-y-3 text-sm sm:grid-cols-3">
        <Stat label="Duration" value={formatDuration(elapsedMs)} />
        <Stat label="Turns" value={formatCount(summary.turns)} />
        <Stat label="First response" value={formatLatency(summary.firstResponseLatencyMs)} />
        <Stat label="Avg latency" value={formatLatency(summary.averageLatencyMs)} />
        <Stat label="P95 latency" value={formatLatency(summary.p95LatencyMs)} />
        <Stat label="Last latency" value={formatLatency(summary.lastLatencyMs)} />
        <Stat label="Avg interrupt" value={formatLatency(summary.averageInterruptionMs)} />
        <Stat label="Last interrupt" value={formatLatency(summary.lastInterruptionMs)} />
        <Stat label="AI cost" value={formatUsd(summary.totalCostUsd)} />
        <Stat label="Cost / minute" value={formatUsd(summary.costPerMinuteUsd)} />
        <Stat label="Input text tokens" value={formatCount(summary.tokens.inputTextTokens)} />
        <Stat label="Input audio tokens" value={formatCount(summary.tokens.inputAudioTokens)} />
        <Stat label="Output text tokens" value={formatCount(summary.tokens.outputTextTokens)} />
        <Stat label="Output audio tokens" value={formatCount(summary.tokens.outputAudioTokens)} />
        <Stat label="Input tokens / min" value={formatCount(summary.inputTokensPerMinute, 0)} />
        <Stat label="Output tokens / min" value={formatCount(summary.outputTokensPerMinute, 0)} />
      </dl>
      {notes && (
        <p className="text-xs text-zinc-500">{notes} Each response.done usage block is added as that turn's bill.</p>
      )}
      <ExperimentTable elapsedMs={elapsedMs} summary={summary} checkpoints={checkpoints} />
      {trend && (
        <p className="text-sm text-zinc-300">
          Cost/minute from {trend.from} min to {trend.to} min: {formatUsd(trend.delta)} (
          {trend.delta > 0.00005 ? "up" : trend.delta < -0.00005 ? "down" : "flat"})
        </p>
      )}
    </section>
  );
}

function ExperimentTable({
  elapsedMs,
  summary,
  checkpoints,
}: {
  elapsedMs: number;
  summary: MetricsSummary;
  checkpoints: Checkpoint[];
}) {
  return (
    <div className="overflow-auto">
      <table className="w-full border-collapse text-left text-sm">
        <thead className="text-xs text-zinc-500">
          <tr>
            <th className="py-2 pr-3 font-medium">Mark</th>
            <th className="py-2 pr-3 font-medium">Cost</th>
            <th className="py-2 pr-3 font-medium">$/min</th>
            <th className="py-2 pr-3 font-medium">Avg latency</th>
            <th className="py-2 pr-3 font-medium">In tok/min</th>
            <th className="py-2 font-medium">Out tok/min</th>
          </tr>
        </thead>
        <tbody className="font-mono text-xs">
          {checkpoints.map((row) => (
            <tr key={row.minute} className="border-t border-zinc-800">
              <td className="py-2 pr-3">{row.minute} min</td>
              <td className="py-2 pr-3">{formatUsd(row.totalCostUsd)}</td>
              <td className="py-2 pr-3">{formatUsd(row.costPerMinuteUsd)}</td>
              <td className="py-2 pr-3">{formatLatency(row.averageLatencyMs)}</td>
              <td className="py-2 pr-3">{formatCount(row.inputTokensPerMinute, 0)}</td>
              <td className="py-2">{formatCount(row.outputTokensPerMinute, 0)}</td>
            </tr>
          ))}
          <tr className="border-t border-zinc-800 text-zinc-300">
            <td className="py-2 pr-3">now {formatDuration(elapsedMs)}</td>
            <td className="py-2 pr-3">{formatUsd(summary.totalCostUsd)}</td>
            <td className="py-2 pr-3">{formatUsd(summary.costPerMinuteUsd)}</td>
            <td className="py-2 pr-3">{formatLatency(summary.averageLatencyMs)}</td>
            <td className="py-2 pr-3">{formatCount(summary.inputTokensPerMinute, 0)}</td>
            <td className="py-2">{formatCount(summary.outputTokensPerMinute, 0)}</td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}

function costTrend(checkpoints: Checkpoint[]) {
  const priced = checkpoints.filter((item) => item.costPerMinuteUsd != null);
  const first = priced[0];
  const last = priced[priced.length - 1];
  if (!first || !last || first === last) return null;
  if (first.costPerMinuteUsd == null || last.costPerMinuteUsd == null) return null;
  return {
    from: first.minute,
    to: last.minute,
    delta: last.costPerMinuteUsd - first.costPerMinuteUsd,
  };
}
