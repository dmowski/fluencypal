import { useEffect, useRef, useState } from "react";
import {
  emptySnapshot,
  loadSavedReport,
  QwenCall,
  type CallSnapshot,
  type SavedReport,
  type TurnMode,
} from "./call/QwenCall";
import { AudioDevices, type AudioDevicesHandle } from "./components/AudioDevices";
import { Banner } from "./components/Banner";
import { CallControls } from "./components/CallControls";
import { CallSettings } from "./components/CallSettings";
import { DebugPanel } from "./components/DebugPanel";
import { MetricsBlock } from "./components/MetricsBlock";
import { SetupMissing } from "./components/SetupMissing";
import { Transcript } from "./components/Transcript";
import { instructionsForVoice } from "./shared/instructions";
import { pricingForRegion, type RegionPricing } from "./shared/pricing";

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

const initialPricing = pricingForRegion("singapore");

export function App() {
  const [config, setConfig] = useState<PublicConfig | null>(null);
  const [configError, setConfigError] = useState<string | null>(null);
  const [snapshot, setSnapshot] = useState<CallSnapshot>(() => emptySnapshot(initialPricing));
  const [voice, setVoice] = useState("longanqian");
  const [turnDetection, setTurnDetection] = useState<TurnMode>("smart_turn");
  const [instructions, setInstructions] = useState(() => instructionsForVoice("longanqian"));
  const [savedReport, setSavedReport] = useState<SavedReport | null>(null);
  const [micDeviceId, setMicDeviceId] = useState("");
  const [outputDeviceId, setOutputDeviceId] = useState("");
  const callRef = useRef<QwenCall | null>(null);
  const devicesRef = useRef<AudioDevicesHandle>(null);

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

    return () => {
      cancelled = true;
      call.destroy();
      callRef.current = null;
    };
  }, []);

  const inCall = snapshot.phase === "connecting" || snapshot.phase === "live";

  function selectVoice(id: string) {
    setInstructions((current) => (current === instructionsForVoice(voice) ? instructionsForVoice(id) : current));
    setVoice(id);
  }

  function startCall() {
    if (!config?.ready) return;
    devicesRef.current?.stopMicTest();
    void callRef.current?.start({
      voice,
      instructions,
      turnDetection,
      pricing: config.pricing,
      micDeviceId,
      outputDeviceId,
    });
  }

  function changeOutput(deviceId: string) {
    setOutputDeviceId(deviceId);
    if (inCall) void callRef.current?.setOutputDevice(deviceId);
  }

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-3xl flex-col gap-8 px-5 py-10">
      <header className="flex flex-col gap-1">
        <h1 className="text-2xl font-semibold tracking-tight">Realtime Qwen Test</h1>
        <p className="text-sm text-zinc-400">
          {config ? `${config.model} · ${config.regionLabel} · ${config.signalingHost}` : "Loading server config"}
        </p>
      </header>

      {configError && <Banner tone="bad">{configError}</Banner>}
      <AudioDevices
        ref={devicesRef}
        inCall={inCall}
        onMicDeviceId={setMicDeviceId}
        onOutputDeviceId={changeOutput}
      />
      {config && !config.ready && <SetupMissing missing={config.missing} />}

      <CallControls
        phase={snapshot.phase}
        status={snapshot.status}
        elapsedMs={snapshot.elapsedMs}
        muted={snapshot.muted}
        canStart={Boolean(config?.ready)}
        totalCostUsd={snapshot.summary.totalCostUsd}
        onStart={startCall}
        onToggleMute={() => callRef.current?.setMuted(!snapshot.muted)}
        onHangUp={() => callRef.current?.hangUp()}
      />

      {!inCall && (
        <CallSettings
          voice={voice}
          outputDeviceId={outputDeviceId}
          turnDetection={turnDetection}
          instructions={instructions}
          onSelectVoice={selectVoice}
          onTurnDetection={setTurnDetection}
          onInstructions={setInstructions}
        />
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

      <Transcript lines={snapshot.transcript} />
      <DebugPanel snapshot={snapshot} />
    </main>
  );
}
