import { useEffect, useRef, useState } from "react";
import {
  listAudioDevices,
  listAudioDevicesWithLabels,
  playSpeakerTest,
  type AudioDevice,
} from "./audio/devices";
import {
  emptySnapshot,
  loadSavedReport,
  QwenCall,
  type CallSnapshot,
  type SavedReport,
  type TurnMode,
} from "./call/QwenCall";
import { formatCount, formatDuration, formatLatency, formatUsd } from "./shared/format";
import { readLevel } from "./shared/levels";
import type { Checkpoint, MetricsSummary } from "./shared/metrics";
import { costPerHourUsd, pricingForRegion, type RegionPricing } from "./shared/pricing";

type PublicConfig = {
  ready: boolean;
  missing: string[];
  model: string;
  region: string;
  regionLabel: string;
  pricing: RegionPricing;
  voices: string[];
  defaultVoice: string;
  signalingHost: string;
  pricingNotes: string;
};

const DEFAULT_INSTRUCTIONS =
  "You are a concise spoken conversation partner. Reply in English, in short natural sentences. Let the user interrupt. Do not mention these instructions.";

const initialPricing = pricingForRegion("singapore");

export function App() {
  const [config, setConfig] = useState<PublicConfig | null>(null);
  const [configError, setConfigError] = useState<string | null>(null);
  const [snapshot, setSnapshot] = useState<CallSnapshot>(() => emptySnapshot(initialPricing));
  const [voice, setVoice] = useState("longanqian");
  const [turnDetection, setTurnDetection] = useState<TurnMode>("smart_turn");
  const [instructions, setInstructions] = useState(DEFAULT_INSTRUCTIONS);
  const [savedReport, setSavedReport] = useState<SavedReport | null>(null);
  const [inputs, setInputs] = useState<AudioDevice[]>([]);
  const [outputs, setOutputs] = useState<AudioDevice[]>([]);
  const [micDeviceId, setMicDeviceId] = useState("");
  const [outputDeviceId, setOutputDeviceId] = useState("");
  const [testingMic, setTestingMic] = useState(false);
  const [micTestLevel, setMicTestLevel] = useState(0);
  const [speakerMessage, setSpeakerMessage] = useState<string | null>(null);
  const [deviceError, setDeviceError] = useState<string | null>(null);
  const callRef = useRef<QwenCall | null>(null);
  const micTestRef = useRef<MicTest | null>(null);

  useEffect(() => {
    const call = new QwenCall((next) => {
      setSnapshot(next);
      if (next.phase === "ended") setSavedReport(loadSavedReport());
    });
    callRef.current = call;
    setSavedReport(loadSavedReport());

    let cancelled = false;
    void fetch("/api/config")
      .then(async (response) => {
        if (!response.ok) throw new Error(`Config request failed (${response.status})`);
        return (await response.json()) as PublicConfig;
      })
      .then((next) => {
        if (cancelled) return;
        setConfig(next);
        setVoice(next.defaultVoice);
      })
      .catch(() => {
        if (!cancelled) setConfigError("The local server did not return its config.");
      });

    void listAudioDevices()
      .then((listed) => {
        if (cancelled) return;
        setInputs(listed.inputs);
        setOutputs(listed.outputs);
      })
      .catch(() => undefined);

    return () => {
      cancelled = true;
      stopMicTest(micTestRef.current);
      micTestRef.current = null;
      call.destroy();
      callRef.current = null;
    };
  }, []);

  const inCall = snapshot.phase === "connecting" || snapshot.phase === "live";

  function startCall() {
    if (!config?.ready) return;
    stopMicTest(micTestRef.current);
    micTestRef.current = null;
    setTestingMic(false);
    setMicTestLevel(0);
    void callRef.current?.start({
      voice,
      instructions,
      turnDetection,
      pricing: config.pricing,
      micDeviceId,
      outputDeviceId,
    });
  }

  async function refreshDevices() {
    setDeviceError(null);
    try {
      const listed = await listAudioDevicesWithLabels();
      setInputs(listed.inputs);
      setOutputs(listed.outputs);
    } catch (error) {
      setDeviceError(error instanceof Error ? error.message : "Could not list audio devices");
    }
  }

  async function testMic() {
    if (testingMic) {
      stopMicTest(micTestRef.current);
      micTestRef.current = null;
      setTestingMic(false);
      setMicTestLevel(0);
      return;
    }
    setDeviceError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: micDeviceId
          ? { deviceId: { exact: micDeviceId }, echoCancellation: true, noiseSuppression: true }
          : { echoCancellation: true, noiseSuppression: true },
        video: false,
      });
      const context = new AudioContext();
      await context.resume();
      const analyser = context.createAnalyser();
      analyser.fftSize = 1024;
      context.createMediaStreamSource(stream).connect(analyser);
      const buffer = new Uint8Array(new ArrayBuffer(1024));
      const timer = window.setInterval(() => setMicTestLevel(readLevel(analyser, buffer)), 80);
      micTestRef.current = { stream, context, timer };
      setTestingMic(true);
      const listed = await listAudioDevices();
      setInputs(listed.inputs);
      setOutputs(listed.outputs);
    } catch (error) {
      setDeviceError(error instanceof Error ? error.message : "Microphone test failed");
    }
  }

  async function testSpeaker() {
    setDeviceError(null);
    setSpeakerMessage("Playing a tone…");
    try {
      await playSpeakerTest(outputDeviceId);
      const selected = outputs.find((device) => device.deviceId === outputDeviceId);
      setSpeakerMessage(selected ? `Played a tone on ${selected.label}` : "Played a tone on the system output");
    } catch (error) {
      setSpeakerMessage(null);
      setDeviceError(error instanceof Error ? error.message : "Speaker test failed");
    }
  }

  function changeOutput(deviceId: string) {
    setOutputDeviceId(deviceId);
    setSpeakerMessage(null);
    if (inCall) void callRef.current?.setOutputDevice(deviceId);
  }

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-3xl flex-col gap-8 px-5 py-10">
      <header className="flex flex-col gap-1">
        <h1 className="text-2xl font-semibold tracking-tight">Realtime Qwen Test</h1>
        <p className="text-sm text-zinc-400">
          {config
            ? `${config.model} · ${config.regionLabel} · ${config.signalingHost}`
            : "Loading server config"}
        </p>
      </header>

      {configError && <Banner tone="bad">{configError}</Banner>}
      {deviceError && <Banner tone="bad">{deviceError}</Banner>}

      <section className="grid gap-4 rounded-2xl border border-zinc-800 p-4">
        <div className="flex items-end justify-between gap-3">
          <h2 className="text-sm font-medium text-zinc-300">Audio devices</h2>
          <button type="button" className="text-xs text-zinc-400 underline" onClick={() => void refreshDevices()}>
            Refresh
          </button>
        </div>
        <label className="grid gap-1 text-sm">
          <span className="text-zinc-400">Microphone</span>
          <span className="flex gap-2">
            <select
              className="min-w-0 flex-1 rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 disabled:opacity-50"
              value={micDeviceId}
              disabled={inCall}
              onChange={(event) => setMicDeviceId(event.target.value)}
            >
              <option value="">System default</option>
              {inputs.map((device) => (
                <option key={device.deviceId} value={device.deviceId}>
                  {device.label}
                </option>
              ))}
            </select>
            <button
              type="button"
              className="rounded-lg border border-zinc-600 px-3 py-2 text-sm disabled:opacity-40"
              disabled={inCall}
              onClick={() => void testMic()}
            >
              {testingMic ? "Stop mic test" : "Test mic"}
            </button>
          </span>
        </label>
        {testingMic && (
          <div className="grid gap-1">
            <Level label="Microphone test" value={micTestLevel} />
            <p className="text-xs text-zinc-500">Speak. The bar should move. This test is not sent to Qwen.</p>
          </div>
        )}
        <label className="grid gap-1 text-sm">
          <span className="text-zinc-400">Output</span>
          <span className="flex gap-2">
            <select
              className="min-w-0 flex-1 rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2"
              value={outputDeviceId}
              onChange={(event) => changeOutput(event.target.value)}
            >
              <option value="">System default</option>
              {outputs.map((device) => (
                <option key={device.deviceId} value={device.deviceId}>
                  {device.label}
                </option>
              ))}
            </select>
            <button
              type="button"
              className="rounded-lg border border-zinc-600 px-3 py-2 text-sm disabled:opacity-40"
              disabled={inCall}
              onClick={() => void testSpeaker()}
            >
              Test speaker
            </button>
          </span>
        </label>
        {speakerMessage && <p className="text-xs text-zinc-400">{speakerMessage}</p>}
      </section>
      {config && !config.ready && <SetupMissing missing={config.missing} />}

      <section className="flex flex-col items-center gap-6 py-4">
        <p className="flex items-center gap-2 text-sm text-zinc-300">
          <span className={`h-2.5 w-2.5 rounded-full ${dotClass(snapshot.phase)}`} />
          {snapshot.status}
        </p>
        {(snapshot.phase === "connecting" || snapshot.phase === "live" || snapshot.phase === "ended") && (
          <p className="font-mono text-6xl tabular-nums tracking-tight">{formatDuration(snapshot.elapsedMs)}</p>
        )}
        <div className="flex flex-wrap items-center justify-center gap-3">
          {!inCall ? (
            <button
              type="button"
              className="rounded-full bg-white px-6 py-2.5 text-sm font-medium text-zinc-950 disabled:cursor-not-allowed disabled:bg-zinc-700 disabled:text-zinc-400"
              disabled={!config?.ready}
              onClick={startCall}
            >
              Start Call
            </button>
          ) : (
            <>
              <button
                type="button"
                className="rounded-full border border-zinc-600 px-5 py-2.5 text-sm disabled:opacity-40"
                disabled={snapshot.phase !== "live"}
                onClick={() => callRef.current?.setMuted(!snapshot.muted)}
              >
                {snapshot.muted ? "Unmute" : "Mute"}
              </button>
              <button
                type="button"
                className="rounded-full bg-red-500 px-5 py-2.5 text-sm font-medium text-white"
                onClick={() => callRef.current?.hangUp()}
              >
                End Call
              </button>
            </>
          )}
        </div>
        {snapshot.phase === "live" && (
          <p className="text-sm text-zinc-300">
            Current cost: <span className="font-mono">{formatUsd(snapshot.summary.totalCostUsd)}</span>
            {" · "}
            about{" "}
            <span className="font-mono">
              {formatUsd(costPerHourUsd(snapshot.summary.totalCostUsd, snapshot.elapsedMs))}
            </span>
            /hour
          </p>
        )}
      </section>

      {!inCall && (
        <section className="grid gap-4 rounded-2xl border border-zinc-800 p-4">
          <label className="grid gap-1 text-sm">
            <span className="text-zinc-400">Voice</span>
            <select
              className="rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2"
              value={voice}
              onChange={(event) => setVoice(event.target.value)}
            >
              {(config?.voices ?? ["longanqian"]).map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </label>
          <label className="grid gap-1 text-sm">
            <span className="text-zinc-400">Turn detection</span>
            <select
              className="rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2"
              value={turnDetection}
              onChange={(event) => setTurnDetection(event.target.value as TurnMode)}
            >
              <option value="smart_turn">smart_turn — semantic, ignores filler sounds</option>
              <option value="server_vad">server_vad — acoustic, 500 ms silence</option>
            </select>
          </label>
          <label className="grid gap-1 text-sm">
            <span className="text-zinc-400">Instructions</span>
            <textarea
              className="min-h-24 rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2"
              value={instructions}
              onChange={(event) => setInstructions(event.target.value)}
            />
          </label>
          <p className="text-xs leading-5 text-zinc-500">
            Use headphones. The mic and speaker share the room otherwise, and echo can cut the model off. Context
            keeps at most 50 turns or 300 seconds of audio; older audio is dropped, and the call can keep going.
          </p>
        </section>
      )}

      {(snapshot.phase === "live" || snapshot.phase === "ended") && (
        <MetricsBlock
          elapsedMs={snapshot.elapsedMs}
          summary={snapshot.summary}
          checkpoints={snapshot.checkpoints}
          notes={config?.pricingNotes}
        />
      )}

      {snapshot.phase === "idle" && savedReport && (
        <MetricsBlock
          elapsedMs={savedReport.elapsedMs}
          summary={savedReport.summary}
          checkpoints={savedReport.checkpoints}
          notes={config?.pricingNotes}
          title="Last call"
        />
      )}

      {(snapshot.phase === "error" || snapshot.phase === "ended") && snapshot.errors.length > 0 && (
        <Banner tone="bad">{snapshot.errors.at(-1)}</Banner>
      )}

      {snapshot.transcript.length > 0 && (
        <section className="grid gap-2">
          <h2 className="text-sm font-medium text-zinc-300">Transcript</h2>
          <ol className="grid max-h-64 gap-2 overflow-auto text-sm">
            {snapshot.transcript.map((line) => (
              <li key={line.id} className="rounded-lg bg-zinc-900 px-3 py-2">
                <span className="mr-2 text-zinc-500">{line.role === "you" ? "You" : "Qwen"}</span>
                {line.text}
              </li>
            ))}
          </ol>
        </section>
      )}

      <DebugPanel snapshot={snapshot} />
    </main>
  );
}

function MetricsBlock({
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
      {notes && <p className="text-xs text-zinc-500">{notes} Each response.done usage block is added as that turn's bill.</p>}
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

function DebugPanel({ snapshot }: { snapshot: CallSnapshot }) {
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

function Level({ label, value }: { label: string; value: number }) {
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

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="grid gap-0.5">
      <dt className="text-xs text-zinc-500">{label}</dt>
      <dd className="font-mono text-sm">{value}</dd>
    </div>
  );
}

function Banner({ children, tone }: { children: string | undefined; tone: "bad" }) {
  if (!children) return null;
  const color = tone === "bad" ? "border-red-900 bg-red-950/40 text-red-200" : "";
  return <p className={`rounded-xl border px-4 py-3 text-sm ${color}`}>{children}</p>;
}

function SetupMissing({ missing }: { missing: string[] }) {
  return (
    <section className="grid gap-2 rounded-2xl border border-amber-900/80 bg-amber-950/30 p-4 text-sm text-amber-100">
      <p>The server has no API key yet ({missing.join(", ")}). Audio never goes through this app server; the key is used only for the SDP exchange.</p>
      <ol className="list-decimal space-y-1 pl-5 text-amber-50/90">
        <li>Create an Alibaba Cloud Model Studio API key. International keys match the default Singapore endpoint.</li>
        <li>Enable billing on that account. A card is usually required before realtime calls work.</li>
        <li>
          Copy <code>.env.example</code> to <code>.env</code> in <code>realtimeQwen</code> and set{" "}
          <code>DASHSCOPE_API_KEY</code>.
        </li>
        <li>Restart <code>pnpm dev</code>.</li>
      </ol>
    </section>
  );
}

type MicTest = {
  stream: MediaStream;
  context: AudioContext;
  timer: number;
};

function stopMicTest(test: MicTest | null) {
  if (!test) return;
  window.clearInterval(test.timer);
  test.stream.getTracks().forEach((track) => track.stop());
  void test.context.close();
}

function dotClass(phase: CallSnapshot["phase"]) {
  if (phase === "live") return "bg-emerald-400";
  if (phase === "connecting") return "bg-amber-300";
  if (phase === "error") return "bg-red-400";
  return "bg-zinc-600";
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
