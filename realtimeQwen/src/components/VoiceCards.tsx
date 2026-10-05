import { useEffect, useRef, useState } from "react";
import { setAudioOutput } from "../audio/devices";
import { VOICES } from "../shared/voices";

export function VoiceCards({
  selected,
  outputDeviceId,
  onSelect,
}: {
  selected: string;
  outputDeviceId: string;
  onSelect: (id: string) => void;
}) {
  const [busyId, setBusyId] = useState<string | null>(null);
  const [playingId, setPlayingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const urlRef = useRef<string | null>(null);
  const requestRef = useRef(0);

  function stopPreview() {
    requestRef.current += 1;
    audioRef.current?.pause();
    audioRef.current = null;
    if (urlRef.current) URL.revokeObjectURL(urlRef.current);
    urlRef.current = null;
    setPlayingId(null);
    setBusyId(null);
  }

  useEffect(() => stopPreview, []);

  async function play(id: string) {
    if (busyId === id || playingId === id) {
      stopPreview();
      return;
    }
    stopPreview();
    const request = requestRef.current;
    setError(null);
    setBusyId(id);
    try {
      const response = await fetch(`/api/voice-preview?voice=${encodeURIComponent(id)}`);
      if (requestRef.current !== request) return;
      if (!response.ok) {
        const body = (await response.json().catch(() => null)) as { error?: string } | null;
        throw new Error(body?.error || "Could not load this voice");
      }
      const url = URL.createObjectURL(await response.blob());
      if (requestRef.current !== request) {
        URL.revokeObjectURL(url);
        return;
      }
      urlRef.current = url;
      const audio = new Audio(url);
      audioRef.current = audio;
      audio.addEventListener("ended", () => {
        if (audioRef.current === audio) stopPreview();
      });
      await setAudioOutput(audio, outputDeviceId);
      if (requestRef.current !== request) return;
      await audio.play();
      setPlayingId(id);
      setBusyId(null);
    } catch (playError) {
      if (requestRef.current !== request) return;
      stopPreview();
      setError(playError instanceof Error ? playError.message : "Could not play this voice");
    }
  }

  return (
    <div className="grid gap-2">
      <span className="text-sm text-zinc-400">Voice</span>
      <div className="grid gap-2 sm:grid-cols-2">
        {VOICES.map((item) => {
          const active = item.id === selected;
          const playing = playingId === item.id;
          const busy = busyId === item.id;
          return (
            <div
              key={item.id}
              className={`flex items-center gap-3 rounded-xl border px-3 py-2 ${
                active ? "border-white bg-zinc-900" : "border-zinc-800 bg-zinc-950"
              }`}
            >
              <button
                type="button"
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-zinc-600 text-zinc-100 hover:border-zinc-400"
                aria-label={playing ? `Stop ${item.name}` : `Play ${item.name}`}
                onClick={() => void play(item.id)}
              >
                {busy ? <Spinner /> : playing ? <StopIcon /> : <PlayIcon />}
              </button>
              <button type="button" className="grid min-w-0 flex-1 text-left" onClick={() => onSelect(item.id)}>
                <span className="truncate text-sm">{item.name}</span>
                <span className="truncate font-mono text-xs text-zinc-500">{item.id}</span>
                <span className="truncate text-xs text-zinc-400">{item.detail}</span>
              </button>
            </div>
          );
        })}
      </div>
      {error && <p className="text-xs text-red-300">{error}</p>}
    </div>
  );
}

function PlayIcon() {
  return (
    <svg viewBox="0 0 20 20" className="h-4 w-4 fill-current" aria-hidden="true">
      <path d="M6.5 4.2v11.6L16 10 6.5 4.2z" />
    </svg>
  );
}

function StopIcon() {
  return (
    <svg viewBox="0 0 20 20" className="h-4 w-4 fill-current" aria-hidden="true">
      <rect x="5" y="5" width="10" height="10" rx="1.5" />
    </svg>
  );
}

function Spinner() {
  return <span className="h-4 w-4 animate-spin rounded-full border-2 border-zinc-500 border-t-zinc-100" />;
}
