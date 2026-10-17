'use client';

import { useEffect, useState } from 'react';
import { Stack } from '@mui/material';

const BAR_COUNT = 72;
const SILENCE = 0.08;

const peaksFromBuffer = (buffer: AudioBuffer): number[] => {
  const channel = buffer.getChannelData(0);
  const block = Math.max(1, Math.floor(channel.length / BAR_COUNT));
  const peaks: number[] = [];
  for (let index = 0; index < BAR_COUNT; index += 1) {
    const start = index * block;
    let sum = 0;
    let samples = 0;
    for (let offset = 0; offset < block; offset += 16) {
      sum += Math.abs(channel[start + offset] || 0);
      samples += 1;
    }
    peaks.push(samples ? sum / samples : 0);
  }
  const loudest = Math.max(...peaks, 0.001);
  return peaks.map((peak) => peak / loudest);
};

const previewPeaks = (seed: string): number[] => {
  let hash = 0;
  for (const char of seed) hash = (hash * 33 + char.charCodeAt(0)) >>> 0;
  return Array.from({ length: BAR_COUNT }, (_, index) => {
    hash = (hash * 1664525 + 1013904223 + index) >>> 0;
    return (hash % 100) / 100;
  });
};

export const VoiceWaveform = ({
  audioUrl,
  audioRef,
  onPlayingChange,
  previewSeed,
}: {
  audioUrl: string | null;
  audioRef: React.RefObject<HTMLAudioElement | null>;
  onPlayingChange?: (isPlaying: boolean) => void;
  previewSeed?: string;
}) => {
  const [peaks, setPeaks] = useState<number[]>(() =>
    previewSeed ? previewPeaks(previewSeed) : [],
  );
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (previewSeed || !audioUrl) return;
    let cancelled = false;
    const load = async () => {
      const response = await fetch(audioUrl);
      const bytes = await response.arrayBuffer();
      const context = new AudioContext();
      try {
        const decoded = await context.decodeAudioData(bytes.slice(0));
        if (!cancelled) setPeaks(peaksFromBuffer(decoded));
      } catch (error) {
        console.error('Could not draw the voice waveform', error);
      } finally {
        await context.close();
      }
    };
    void load();
    return () => {
      cancelled = true;
    };
  }, [audioUrl, previewSeed]);

  const seek = (clientX: number, element: HTMLDivElement) => {
    const audio = audioRef.current;
    const rect = element.getBoundingClientRect();
    const ratio = Math.min(1, Math.max(0, (clientX - rect.left) / rect.width));
    if (audio && Number.isFinite(audio.duration)) {
      audio.currentTime = ratio * audio.duration;
    }
    setProgress(ratio);
  };

  const bars = peaks.length > 0 ? peaks : Array.from({ length: BAR_COUNT }, () => 0);

  return (
    <Stack
      data-testid="voice-chat-waveform"
      direction="row"
      onPointerDown={(event) => {
        if (previewSeed) return;
        event.currentTarget.setPointerCapture(event.pointerId);
        seek(event.clientX, event.currentTarget);
      }}
      onPointerMove={(event) => {
        if (!event.currentTarget.hasPointerCapture(event.pointerId)) return;
        seek(event.clientX, event.currentTarget);
      }}
      sx={{
        position: 'relative',
        flex: 1,
        height: 32,
        alignItems: 'center',
        justifyContent: 'space-between',
        cursor: previewSeed ? 'default' : 'pointer',
        touchAction: 'none',
      }}
    >
      {bars.map((peak, index) => {
        const quiet = peak < SILENCE;
        return (
          <Stack
            key={index}
            sx={{
              width: quiet ? 3 : 3,
              height: quiet ? 3 : Math.max(6, Math.round(peak * 26)),
              borderRadius: quiet ? '50%' : '2px',
              backgroundColor: quiet ? 'rgba(255,255,255,0.35)' : 'rgba(210,214,220,0.9)',
              flexShrink: 0,
            }}
          />
        );
      })}
      {previewSeed ? null : (
        <Stack
          sx={{
            position: 'absolute',
            top: '50%',
            left: `${progress * 100}%`,
            width: 12,
            height: 12,
            marginLeft: '-6px',
            marginTop: '-6px',
            borderRadius: '50%',
            backgroundColor: '#2f80ed',
            pointerEvents: 'none',
          }}
        />
      )}
      {audioUrl ? (
        <audio
          ref={audioRef}
          src={audioUrl}
          style={{ display: 'none' }}
          onPlay={() => onPlayingChange?.(true)}
          onPause={() => onPlayingChange?.(false)}
          onTimeUpdate={(event) => {
            const audio = event.currentTarget;
            if (!audio.duration) return;
            setProgress(audio.currentTime / audio.duration);
          }}
          onEnded={() => {
            setProgress(0);
            onPlayingChange?.(false);
          }}
        />
      ) : null}
    </Stack>
  );
};
