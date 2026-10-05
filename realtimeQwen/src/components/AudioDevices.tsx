import { useEffect, useImperativeHandle, useRef, useState, type Ref } from "react";
import {
  listAudioDevices,
  listAudioDevicesWithLabels,
  playSpeakerTest,
  type AudioDevice,
} from "../audio/devices";
import { readLevel } from "../shared/levels";
import { Banner } from "./Banner";
import { Level } from "./Level";

export type AudioDevicesHandle = {
  stopMicTest: () => void;
};

type MicTest = {
  stream: MediaStream;
  context: AudioContext;
  timer: number;
};

export function AudioDevices({
  ref,
  inCall,
  onMicDeviceId,
  onOutputDeviceId,
}: {
  ref?: Ref<AudioDevicesHandle>;
  inCall: boolean;
  onMicDeviceId: (deviceId: string) => void;
  onOutputDeviceId: (deviceId: string) => void;
}) {
  const [inputs, setInputs] = useState<AudioDevice[]>([]);
  const [outputs, setOutputs] = useState<AudioDevice[]>([]);
  const [micDeviceId, setMicDeviceId] = useState("");
  const [outputDeviceId, setOutputDeviceId] = useState("");
  const [testingMic, setTestingMic] = useState(false);
  const [micTestLevel, setMicTestLevel] = useState(0);
  const [speakerMessage, setSpeakerMessage] = useState<string | null>(null);
  const [deviceError, setDeviceError] = useState<string | null>(null);
  const micTestRef = useRef<MicTest | null>(null);

  function stopMicTest() {
    releaseMicTest(micTestRef.current);
    micTestRef.current = null;
    setTestingMic(false);
    setMicTestLevel(0);
  }

  useImperativeHandle(ref, () => ({ stopMicTest }), []);

  useEffect(() => {
    let cancelled = false;
    void listAudioDevices()
      .then((listed) => {
        if (cancelled) return;
        setInputs(listed.inputs);
        setOutputs(listed.outputs);
      })
      .catch(() => undefined);
    return () => {
      cancelled = true;
      releaseMicTest(micTestRef.current);
      micTestRef.current = null;
    };
  }, []);

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
      stopMicTest();
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

  function chooseMic(deviceId: string) {
    setMicDeviceId(deviceId);
    onMicDeviceId(deviceId);
  }

  function chooseOutput(deviceId: string) {
    setOutputDeviceId(deviceId);
    setSpeakerMessage(null);
    onOutputDeviceId(deviceId);
  }

  return (
    <>
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
              onChange={(event) => chooseMic(event.target.value)}
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
              onChange={(event) => chooseOutput(event.target.value)}
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
    </>
  );
}

function releaseMicTest(test: MicTest | null) {
  if (!test) return;
  window.clearInterval(test.timer);
  test.stream.getTracks().forEach((track) => track.stop());
  void test.context.close();
}
