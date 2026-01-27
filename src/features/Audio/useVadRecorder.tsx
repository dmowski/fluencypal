import { useCallback, useEffect, useRef, useState } from 'react';

type UseVadRecorderOptions = {
  onChunk: (blob: Blob, format: string, durationSeconds: number) => void;
  silenceMs?: number; // default 3000
  tickMs?: number; // default 50
  rmsThreshold?: number; // default 0.02
  minSpeechMs?: number; // default 250
  gateRecording?: () => boolean;

  /** Meter smoothing (0..1). Higher = smoother. Default 0.85 */
  levelSmoothing?: number;

  /** RMS range mapping for meter; tune for your env. */
  meterRmsMin?: number; // default 0.003

  //  meterRmsMax
  meterRmsMax?: number; // default 0.08
  onStop?: () => void;
  onStart?: () => void;
};

type UseVadRecorderReturn = {
  start: () => Promise<void>;
  stop: () => Promise<void>;
  isRunning: boolean;
  isSpeaking: boolean;
  lastError: string | null;

  /** Live mic level (0..1) for UI meter */
  inputLevel01: number;

  /** Debug: approximate dBFS (negative values). */
  inputDb: number;
};

function pickMimeType(): string | undefined {
  const candidates = ['audio/webm;codecs=opus', 'audio/webm', 'audio/mp4'];
  for (const c of candidates) {
    // @ts-ignore
    if (window.MediaRecorder?.isTypeSupported?.(c)) return c;
  }
  return undefined;
}

const clamp01 = (v: number) => Math.max(0, Math.min(1, v));

/**
 * Map RMS (~0..~0.1 typical) to a perceptual 0..1 meter.
 * Uses log-ish curve (sqrt after normalization) for nicer UI.
 */
function rmsToMeter01(rms: number, minRms: number, maxRms: number) {
  const norm = (rms - minRms) / (maxRms - minRms);
  return clamp01(Math.sqrt(clamp01(norm)));
}

function rmsToDb(rms: number) {
  // Avoid log(0)
  const v = Math.max(rms, 1e-8);
  return 20 * Math.log10(v); // ~ dBFS-ish (negative)
}

export function useVadRecorder(options: UseVadRecorderOptions): UseVadRecorderReturn {
  const {
    onChunk,
    // silenceMs is how long to wait after speech ends before finalizing utterance
    silenceMs = 3000,

    // tickMs is how often to check for speech
    tickMs = 50,

    // rmsThreshold is the minimum RMS to consider "speaking"
    rmsThreshold = 0.02,

    // minSpeechMs is the minimum duration of speech to consider valid
    minSpeechMs = 250,

    gateRecording,

    // levelSmoothing
    levelSmoothing = 0.85,
    meterRmsMin = 0.003,
    meterRmsMax = 0.08,
    onStop,
    onStart,
  } = options;

  const [isRunning, setIsRunning] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [lastError, setLastError] = useState<string | null>(null);

  const [inputLevel01, setInputLevel01] = useState(0);
  const [inputDb, setInputDb] = useState(-120);

  const streamRef = useRef<MediaStream | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);

  const recorderRef = useRef<MediaRecorder | null>(null);
  const utteranceBlobsRef = useRef<BlobPart[]>([]);
  const vadTimerRef = useRef<number | null>(null);

  const speechStartedAtRef = useRef<number | null>(null);
  const lastVoiceAtRef = useRef<number | null>(null);
  const recordingRef = useRef(false);

  // meter smoothing state
  const smoothLevelRef = useRef(0);

  const computeRms = (analyser: AnalyserNode) => {
    const buffer = new Float32Array(analyser.fftSize);
    analyser.getFloatTimeDomainData(buffer);
    let sum = 0;
    for (let i = 0; i < buffer.length; i++) sum += buffer[i] * buffer[i];
    return Math.sqrt(sum / buffer.length);
  };

  const cleanup = useCallback(async () => {
    if (vadTimerRef.current) {
      window.clearInterval(vadTimerRef.current);
      vadTimerRef.current = null;
    }

    const rec = recorderRef.current;
    recorderRef.current = null;

    if (rec && rec.state !== 'inactive') {
      await new Promise<void>((resolve) => {
        rec.addEventListener('stop', () => resolve(), { once: true });
        rec.stop();
      });
    }

    utteranceBlobsRef.current = [];
    recordingRef.current = false;
    speechStartedAtRef.current = null;
    lastVoiceAtRef.current = null;
    setIsSpeaking(false);

    // reset meter
    smoothLevelRef.current = 0;
    setInputLevel01(0);
    setInputDb(-120);

    if (analyserRef.current) {
      analyserRef.current.disconnect();
      analyserRef.current = null;
    }

    if (audioCtxRef.current) {
      await audioCtxRef.current.close().catch(() => {});
      audioCtxRef.current = null;
    }

    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }

    setIsRunning(false);
    if (onStop) onStop();
  }, []);

  const finalizeUtterance = useCallback(() => {
    const rec = recorderRef.current;
    if (!rec || !recordingRef.current) return;

    recordingRef.current = false;
    setIsSpeaking(false);

    if (rec.state !== 'inactive') rec.stop();
  }, []);

  const startNewUtterance = useCallback(() => {
    const rec = recorderRef.current;
    if (!rec) return;

    utteranceBlobsRef.current = [];
    recordingRef.current = true;
    rec.start();
  }, []);

  const start = useCallback(async () => {
    setLastError(null);
    onStart && onStart();
    if (isRunning) return;

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
      });
      streamRef.current = stream;

      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      const audioCtx = new AudioCtx();
      audioCtxRef.current = audioCtx;

      const source = audioCtx.createMediaStreamSource(stream);
      const analyser = audioCtx.createAnalyser();
      analyser.fftSize = 2048;
      analyserRef.current = analyser;
      source.connect(analyser);

      const mimeType = pickMimeType();
      if (!window.MediaRecorder) throw new Error('MediaRecorder is not supported in this browser.');

      const rec = new MediaRecorder(stream, mimeType ? { mimeType } : undefined);
      recorderRef.current = rec;

      rec.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) utteranceBlobsRef.current.push(e.data);
      };

      rec.onstop = () => {
        const parts = utteranceBlobsRef.current;
        utteranceBlobsRef.current = [];

        const speechStartedAt = speechStartedAtRef.current;
        const lastVoiceAt = lastVoiceAtRef.current;
        speechStartedAtRef.current = null;
        lastVoiceAtRef.current = null;

        if (!speechStartedAt || !lastVoiceAt) return;
        const speechDur = lastVoiceAt - speechStartedAt;
        if (speechDur < minSpeechMs) return;
        const format = rec.mimeType || 'audio/webm';

        const blob = new Blob(parts, { type: format });

        const durationSeconds = speechDur / 1000;

        if (blob.size > 0) onChunk(blob, format, durationSeconds);
      };

      setIsRunning(true);

      vadTimerRef.current = window.setInterval(() => {
        const analyserNow = analyserRef.current;
        if (!analyserNow) return;

        // Optional gating (e.g., pause capture during TTS)
        if (gateRecording && !gateRecording()) {
          // keep meter alive even if gated (optional):
          const rms = computeRms(analyserNow);
          const rawLevel = rmsToMeter01(rms, meterRmsMin, meterRmsMax);
          smoothLevelRef.current =
            levelSmoothing * smoothLevelRef.current + (1 - levelSmoothing) * rawLevel;
          setInputLevel01(smoothLevelRef.current);
          setInputDb(rmsToDb(rms));

          if (recordingRef.current) finalizeUtterance();
          return;
        }

        const now = Date.now();
        const rms = computeRms(analyserNow);

        // Update meter every tick
        const rawLevel = rmsToMeter01(rms, meterRmsMin, meterRmsMax);
        smoothLevelRef.current =
          levelSmoothing * smoothLevelRef.current + (1 - levelSmoothing) * rawLevel;
        setInputLevel01(smoothLevelRef.current);
        setInputDb(rmsToDb(rms));

        const speakingNow = rms >= rmsThreshold;

        if (speakingNow) {
          setIsSpeaking(true);
          if (!speechStartedAtRef.current) speechStartedAtRef.current = now;
          lastVoiceAtRef.current = now;

          if (!recordingRef.current) startNewUtterance();
        } else {
          if (recordingRef.current && lastVoiceAtRef.current) {
            const silentFor = now - lastVoiceAtRef.current;
            if (silentFor >= silenceMs) finalizeUtterance();
          }
          if (lastVoiceAtRef.current && now - lastVoiceAtRef.current > 250) {
            setIsSpeaking(false);
          }
        }
      }, tickMs);
    } catch (e: any) {
      setLastError(e?.message || 'Failed to start mic/VAD.');
      await cleanup();
    }
  }, [
    cleanup,
    finalizeUtterance,
    gateRecording,
    isRunning,
    levelSmoothing,
    meterRmsMax,
    meterRmsMin,
    minSpeechMs,
    onChunk,
    rmsThreshold,
    silenceMs,
    startNewUtterance,
    tickMs,
  ]);

  const stop = useCallback(async () => {
    await cleanup();
  }, [cleanup]);

  useEffect(() => {
    return () => {
      cleanup();
    };
  }, [cleanup]);

  return {
    start,
    stop,
    isRunning,
    isSpeaking,
    lastError,
    inputLevel01,
    inputDb,
  };
}
