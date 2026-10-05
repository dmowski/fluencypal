export type AudioDevice = {
  deviceId: string;
  label: string;
};

export async function listAudioDevices(): Promise<{ inputs: AudioDevice[]; outputs: AudioDevice[] }> {
  const devices = await navigator.mediaDevices.enumerateDevices();
  return {
    inputs: devices.filter((device) => device.kind === "audioinput").map(labelFor),
    outputs: devices.filter((device) => device.kind === "audiooutput").map(labelFor),
  };
}

/** Ask for the microphone once so Chrome reveals device names, then release it. */
export async function listAudioDevicesWithLabels(): Promise<{ inputs: AudioDevice[]; outputs: AudioDevice[] }> {
  let stream: MediaStream | null = null;
  try {
    stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
  } catch {
    return listAudioDevices();
  }
  try {
    return await listAudioDevices();
  } finally {
    stream.getTracks().forEach((track) => track.stop());
  }
}

export function toneWav(sampleRate = 44100): Blob {
  const beeps = [
    { frequency: 523.25, start: 0.05, seconds: 0.18 },
    { frequency: 659.25, start: 0.32, seconds: 0.28 },
  ];
  const total = Math.floor(sampleRate * 0.7);
  const samples = new Int16Array(total);
  for (const beep of beeps) {
    const start = Math.floor(beep.start * sampleRate);
    const count = Math.floor(beep.seconds * sampleRate);
    for (let i = 0; i < count; i += 1) {
      const index = start + i;
      if (index >= total) break;
      const attack = Math.min(1, i / 80);
      const release = Math.min(1, (count - i) / 200);
      const envelope = Math.min(attack, release);
      samples[index] = Math.sin((2 * Math.PI * beep.frequency * i) / sampleRate) * envelope * 0.45 * 0x7fff;
    }
  }

  const header = new ArrayBuffer(44);
  const view = new DataView(header);
  writeString(view, 0, "RIFF");
  view.setUint32(4, 36 + samples.byteLength, true);
  writeString(view, 8, "WAVE");
  writeString(view, 12, "fmt ");
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true);
  view.setUint16(22, 1, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * 2, true);
  view.setUint16(32, 2, true);
  view.setUint16(34, 16, true);
  writeString(view, 36, "data");
  view.setUint32(40, samples.byteLength, true);
  return new Blob([header, samples], { type: "audio/wav" });
}

export async function playSpeakerTest(deviceId: string): Promise<void> {
  const url = URL.createObjectURL(toneWav());
  const audio = new Audio(url);
  audio.volume = 1;
  try {
    await setAudioOutput(audio, deviceId);
    await audio.play();
    await new Promise<void>((resolve) => {
      audio.addEventListener("ended", () => resolve(), { once: true });
      window.setTimeout(resolve, 1200);
    });
  } finally {
    audio.pause();
    audio.src = "";
    URL.revokeObjectURL(url);
  }
}

export async function setAudioOutput(audio: HTMLAudioElement, deviceId: string): Promise<void> {
  if (!deviceId || typeof audio.setSinkId !== "function") return;
  await audio.setSinkId(deviceId);
}

function labelFor(device: MediaDeviceInfo, index: number): AudioDevice {
  const kind = device.kind === "audioinput" ? "Microphone" : "Speaker";
  return {
    deviceId: device.deviceId,
    label: device.label.trim() || `${kind} ${index + 1}`,
  };
}

function writeString(view: DataView, offset: number, value: string) {
  for (let i = 0; i < value.length; i += 1) view.setUint8(offset + i, value.charCodeAt(i));
}
