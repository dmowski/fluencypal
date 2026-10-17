'use client';

import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { Stack } from '@mui/material';

const SAMPLE_COUNT = 96;
const SILENCE = 0.08;
const BAR_WIDTH = 3;
const BAR_GAP = 2;

const peaksFromBuffer = (buffer: AudioBuffer): number[] => {
  const channel = buffer.getChannelData(0);
  const block = Math.max(1, Math.floor(channel.length / SAMPLE_COUNT));
  const peaks: number[] = [];
  for (let index = 0; index < SAMPLE_COUNT; index += 1) {
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

const resample = (samples: number[], count: number): number[] => {
  if (count <= 0) return [];
  return Array.from({ length: count }, (_, index) => {
    const start = Math.floor((index * samples.length) / count);
    const end = Math.max(start + 1, Math.floor(((index + 1) * samples.length) / count));
    let sum = 0;
    for (let cursor = start; cursor < end; cursor += 1) sum += samples[cursor] || 0;
    return sum / (end - start);
  });
};

const previewPeaks = (seed: string, count: number): number[] => {
  let hash = 0;
  for (const char of seed) hash = (hash * 33 + char.charCodeAt(0)) >>> 0;
  return Array.from({ length: count }, (_, index) => {
    hash = (hash * 1664525 + 1013904223 + index) >>> 0;
    return (hash % 100) / 100;
  });
};

const barCountForWidth = (width: number): number => {
  if (width <= 0) return 24;
  return Math.max(8, Math.min(72, Math.floor((width + BAR_GAP) / (BAR_WIDTH + BAR_GAP))));
};

export const VoiceWaveform = ({
  audioUrl,
  audioRef,
  onPlayingChange,
  onDuration,
  previewSeed,
}: {
  audioUrl: string | null;
  audioRef: React.RefObject<HTMLAudioElement | null>;
  onPlayingChange?: (isPlaying: boolean) => void;
  onDuration?: (seconds: number) => void;
  previewSeed?: string;
}) => {
  const trackRef = useRef<HTMLDivElement | null>(null);
  const [barCount, setBarCount] = useState(32);
  const [samples, setSamples] = useState<number[]>([]);
  const [progress, setProgress] = useState(0);

  useLayoutEffect(() => {
    const node = trackRef.current;
    if (!node) return;
    const apply = () => {
      const next = barCountForWidth(node.clientWidth);
      setBarCount((current) => (current === next ? current : next));
    };
    apply();
    const observer = new ResizeObserver(apply);
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (previewSeed || !audioUrl) return;
    let cancelled = false;
    const load = async () => {
      const response = await fetch(audioUrl);
      const bytes = await response.arrayBuffer();
      const context = new AudioContext();
      try {
        const decoded = await context.decodeAudioData(bytes.slice(0));
        if (!cancelled) setSamples(peaksFromBuffer(decoded));
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

  const bars = useMemo(() => {
    if (previewSeed) return previewPeaks(previewSeed, barCount);
    if (samples.length > 0) return resample(samples, barCount);
    return Array.from({ length: barCount }, () => 0);
  }, [barCount, previewSeed, samples]);

  return (
    <Stack
      ref={trackRef}
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
        minWidth: 0,
        width: '100%',
        height: 26,
        alignItems: 'center',
        justifyContent: 'space-between',
        overflow: 'hidden',
        cursor: previewSeed ? 'default' : 'pointer',
        touchAction: 'none',
      }}
    >
      {bars.map((peak, index) => {
        const quiet = peak < SILENCE;
        const barHeight = quiet ? 3 : Math.max(5, Math.round(peak * 22));
        return (
          <Stack
            key={index}
            sx={{
              width: BAR_WIDTH,
              flexShrink: 0,
              height: barHeight,
              borderRadius: quiet ? '50%' : '2px',
              backgroundColor: quiet ? 'rgba(255,255,255,0.35)' : 'rgba(210,214,220,0.9)',
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
          preload="auto"
          playsInline
          style={{
            position: 'absolute',
            width: 1,
            height: 1,
            opacity: 0,
            pointerEvents: 'none',
          }}
          onLoadedMetadata={(event) => {
            const duration = event.currentTarget.duration;
            if (Number.isFinite(duration) && duration > 0) onDuration?.(duration);
          }}
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
