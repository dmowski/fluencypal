import { setAudioOutput } from "../audio/devices";
import { normalizeSdp } from "../shared/format";
import { FIRST_RESPONSE } from "../shared/instructions";
import { readLevel } from "../shared/levels";
import { CallMetrics, type Checkpoint, type MetricsSummary } from "../shared/metrics";
import { parseUsage, type RegionPricing } from "../shared/pricing";
import {
  appendTranscriptDelta,
  emptyTranscript,
  finishTranscript,
  type TranscriptLine,
  type TranscriptState,
} from "./transcript";

export type { TranscriptLine };

export type TurnMode = "smart_turn" | "server_vad";

export type CallOptions = {
  voice: string;
  instructions: string;
  turnDetection: TurnMode;
  pricing: RegionPricing;
  micDeviceId: string;
  outputDeviceId: string;
};

export type CallPhase = "idle" | "connecting" | "live" | "ended" | "error";

export type SavedReport = {
  savedAt: string;
  elapsedMs: number;
  summary: MetricsSummary;
  checkpoints: Checkpoint[];
  errors: string[];
};

export type CallSnapshot = {
  phase: CallPhase;
  status: string;
  connectionState: string;
  iceState: string;
  speaker: "you" | "qwen" | "idle";
  inputLevel: number;
  outputLevel: number;
  muted: boolean;
  elapsedMs: number;
  summary: MetricsSummary;
  checkpoints: Checkpoint[];
  errors: string[];
  events: string[];
  transcript: TranscriptLine[];
  lastUsage: unknown;
};

const STORAGE_KEY = "realtime-qwen-last-report";
const SPEECH_THRESHOLD = 0.045;
const SPEECH_HANGOVER_MS = 220;
const INTERRUPT_THRESHOLD = 0.07;
const INTERRUPT_HOLD_MS = 80;
const REMOTE_THRESHOLD = 0.008;
const LEVEL_BUFFER = 1024;

const emptySummary = (pricing: RegionPricing): MetricsSummary => new CallMetrics().summarize(0, pricing);

export function emptySnapshot(pricing: RegionPricing): CallSnapshot {
  return {
    phase: "idle",
    status: "Idle",
    connectionState: "new",
    iceState: "new",
    speaker: "idle",
    inputLevel: 0,
    outputLevel: 0,
    muted: false,
    elapsedMs: 0,
    summary: emptySummary(pricing),
    checkpoints: [],
    errors: [],
    events: [],
    transcript: [],
    lastUsage: null,
  };
}

export function loadSavedReport(): SavedReport | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as SavedReport;
    if (!parsed || typeof parsed.elapsedMs !== "number" || !parsed.summary) return null;
    return parsed;
  } catch {
    return null;
  }
}

type JsonRecord = Record<string, unknown>;

function asRecord(value: unknown): JsonRecord | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;
  return value as JsonRecord;
}

async function decodeMessage(data: unknown): Promise<string> {
  if (typeof data === "string") return data;
  if (data instanceof ArrayBuffer) return new TextDecoder().decode(data);
  if (ArrayBuffer.isView(data)) return new TextDecoder().decode(data);
  if (typeof Blob !== "undefined" && data instanceof Blob) return data.text();
  return "";
}

function waitForIce(pc: RTCPeerConnection, timeoutMs: number) {
  if (pc.iceGatheringState === "complete") return Promise.resolve();
  return new Promise<void>((resolve) => {
    const done = () => {
      window.clearTimeout(timer);
      pc.removeEventListener("icegatheringstatechange", onChange);
      resolve();
    };
    const onChange = () => {
      if (pc.iceGatheringState === "complete") done();
    };
    const timer = window.setTimeout(done, timeoutMs);
    pc.addEventListener("icegatheringstatechange", onChange);
  });
}

export class QwenCall {
  private metrics = new CallMetrics();
  private options: CallOptions | null = null;
  private phase: CallPhase = "idle";
  private status = "Idle";
  private closed = false;
  private pc: RTCPeerConnection | null = null;
  private audioContext: AudioContext | null = null;
  private micStream: MediaStream | null = null;
  private micTrack: MediaStreamTrack | null = null;
  private audioSender: RTCRtpSender | null = null;
  private micAnalyser: AnalyserNode | null = null;
  private remoteAnalyser: AnalyserNode | null = null;
  private remoteTrackId: string | null = null;
  private remoteAudio: HTMLAudioElement | null = null;
  private remoteMonitor: MediaStream | null = null;
  private outputDeviceId = "";
  private sendChannel: RTCDataChannel | null = null;
  private readonly micBuffer = new Uint8Array(new ArrayBuffer(LEVEL_BUFFER));
  private readonly remoteBuffer = new Uint8Array(new ArrayBuffer(LEVEL_BUFFER));
  private frame = 0;
  private startedAt: number | null = null;
  private endedAt: number | null = null;
  private sessionUpdateSent = false;
  private sessionCreated = false;
  private sessionReady = false;
  private micEnabled = false;
  private userMuted = false;
  private userSpeaking = false;
  private lastLoudAt = 0;
  private assistantActive = false;
  private outputSuppressed = false;
  private armFirstAudio = false;
  private remoteWasSilent = true;
  private interruptHoldStart: number | null = null;
  private interruptLockedUntil = 0;
  private vadArmedAt = 0;
  private inputLevel = 0;
  private outputLevel = 0;
  private errors: string[] = [];
  private events: string[] = [];
  private transcriptState: TranscriptState = emptyTranscript();
  private assistantItemKey = "qwen-0";
  private userItemKey = "you-0";
  private turnSerial = 0;
  private sawAudioTranscript = false;
  private greetingSent = false;
  private hiddenItemIds = new Set<string>();
  private lastUsage: unknown = null;
  private lastPublish = 0;
  private dirty = false;
  private sessionFallback: number | null = null;
  private stopping = false;

  constructor(private readonly onChange: (snapshot: CallSnapshot) => void) {}

  async start(options: CallOptions) {
    if (this.phase === "connecting" || this.phase === "live") return;
    this.resetState(options);
    this.phase = "connecting";
    this.status = "Requesting microphone";
    this.publish(true);

    try {
      this.outputDeviceId = options.outputDeviceId;
      this.audioContext = new AudioContext();
      await this.audioContext.resume();
      this.micStream = await navigator.mediaDevices.getUserMedia({
        audio: {
          ...(options.micDeviceId ? { deviceId: { exact: options.micDeviceId } } : {}),
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
          channelCount: 1,
        },
        video: false,
      });
      const [track] = this.micStream.getAudioTracks();
      if (!track || this.phase !== "connecting") {
        track?.stop();
        if (this.phase !== "connecting") return;
        throw new Error("No microphone track");
      }
      this.micTrack = track;
      track.enabled = false;

      const micSource = this.audioContext.createMediaStreamSource(this.micStream);
      this.micAnalyser = this.audioContext.createAnalyser();
      this.micAnalyser.fftSize = LEVEL_BUFFER;
      micSource.connect(this.micAnalyser);

      const pc = new RTCPeerConnection({
        iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
      });
      this.pc = pc;
      // Keep the mic off the peer connection until session.update is accepted.
      // Qwen rejects turn_detection changes after the first audio packet.
      const transceiver = pc.addTransceiver("audio", { direction: "sendrecv" });
      this.audioSender = transceiver.sender;
      pc.ontrack = (event) => {
        if (event.track.kind !== "audio") return;
        const stream = event.streams[0] ?? new MediaStream([event.track]);
        this.attachRemote(stream);
      };
      pc.ondatachannel = (event) => this.bindChannel(event.channel);
      pc.onconnectionstatechange = () => {
        this.dirty = true;
        if (!this.stopping && pc.connectionState === "failed") {
          this.fail("WebRTC connection failed");
        }
        this.publish(true);
      };
      pc.oniceconnectionstatechange = () => {
        this.dirty = true;
        this.publish(false);
      };

      const channel = pc.createDataChannel("oai-events");
      this.bindChannel(channel);
      this.sendChannel = channel;

      this.status = "Creating WebRTC offer";
      this.publish(true);
      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);
      await waitForIce(pc, 2500);
      if (this.phase !== "connecting") return;

      this.status = "Exchanging SDP";
      this.publish(true);
      const localSdp = pc.localDescription?.sdp ?? "";
      const response = await fetch("/api/sdp", {
        method: "POST",
        headers: { "Content-Type": "application/sdp" },
        body: localSdp,
      });
      const body = await response.text();
      if (this.phase !== "connecting") return;
      if (!response.ok) throw new Error(errorFromResponse(body));

      await pc.setRemoteDescription({ type: "answer", sdp: normalizeSdp(body) });
      if (this.phase !== "connecting") return;
      this.status = "Waiting for session";
      this.sessionFallback = window.setTimeout(() => {
        if (this.closed || this.sessionReady) return;
        this.sessionCreated = true;
        this.sendSessionUpdate();
        this.pushError("No session.updated event. Microphone was enabled anyway.");
        this.enableMic();
        this.markLive();
        this.sendGreeting();
        this.publish(true);
      }, 8000);
      this.publish(true);
      this.frame = window.requestAnimationFrame(this.loop);
    } catch (error) {
      this.fail(error instanceof Error ? error.message : "Could not start the call");
    }
  }

  async setOutputDevice(deviceId: string) {
    this.outputDeviceId = deviceId;
    if (!this.remoteAudio) return;
    try {
      await setAudioOutput(this.remoteAudio, deviceId);
    } catch (error) {
      this.pushError(error instanceof Error ? error.message : "Could not switch the speaker");
      this.publish(true);
    }
  }

  setMuted(muted: boolean) {
    this.userMuted = muted;
    if (this.micTrack && this.micEnabled) this.micTrack.enabled = !muted;
    if (muted && this.userSpeaking) {
      this.userSpeaking = false;
      this.metrics.speechEnded(this.lastLoudAt || performance.now(), "local");
      this.dirty = true;
    }
    this.publish(true);
  }

  hangUp() {
    if (this.startedAt != null) this.finish();
    else {
      this.phase = "idle";
      this.status = "Idle";
      this.cleanupMedia();
      this.publish(true);
    }
  }

  destroy() {
    this.closed = true;
    this.cleanupMedia();
  }

  private resetState(options: CallOptions) {
    this.cleanupMedia();
    this.closed = false;
    this.options = options;
    this.metrics = new CallMetrics();
    this.stopping = false;
    this.startedAt = null;
    this.endedAt = null;
    this.sessionUpdateSent = false;
    this.sessionCreated = false;
    this.sessionReady = false;
    this.micEnabled = false;
    this.userMuted = false;
    this.userSpeaking = false;
    this.assistantActive = false;
    this.outputSuppressed = false;
    this.armFirstAudio = false;
    this.remoteWasSilent = true;
    this.interruptHoldStart = null;
    this.errors = [];
    this.events = [];
    this.transcriptState = emptyTranscript();
    this.assistantItemKey = "qwen-0";
    this.userItemKey = "you-0";
    this.turnSerial = 0;
    this.sawAudioTranscript = false;
    this.greetingSent = false;
    this.hiddenItemIds = new Set();
    this.lastUsage = null;
    this.inputLevel = 0;
    this.outputLevel = 0;
  }

  private loop = () => {
    if (this.closed || (this.phase !== "connecting" && this.phase !== "live")) return;
    this.frame = window.requestAnimationFrame(this.loop);
    const now = performance.now();
    this.inputLevel = readLevel(this.micAnalyser, this.micBuffer);
    this.outputLevel = readLevel(this.remoteAnalyser, this.remoteBuffer);

    if (this.micEnabled && !this.userMuted && now >= this.vadArmedAt) {
      this.observeSpeech(now, this.inputLevel, this.outputLevel);
    }
    this.observeAssistantAudio(now, this.outputLevel);
    if (this.startedAt != null && this.options) {
      this.metrics.noteElapsed(now - this.startedAt, this.options.pricing);
    }
    this.publish(false);
  };

  private observeSpeech(now: number, input: number, output: number) {
    const loud = input >= SPEECH_THRESHOLD;
    if (loud) {
      if (!this.userSpeaking) {
        this.userSpeaking = true;
        this.metrics.speechStarted(now);
        this.dirty = true;
      }
      this.lastLoudAt = now;
    } else if (this.userSpeaking && now - this.lastLoudAt >= SPEECH_HANGOVER_MS) {
      this.userSpeaking = false;
      this.metrics.speechEnded(this.lastLoudAt, "local");
      this.dirty = true;
    }

    const assistantAudible =
      this.assistantActive && !this.outputSuppressed && output >= REMOTE_THRESHOLD;
    const interruptLoud = input >= Math.max(INTERRUPT_THRESHOLD, output * 1.8);
    if (assistantAudible && interruptLoud && now >= this.interruptLockedUntil) {
      if (this.interruptHoldStart == null) this.interruptHoldStart = now;
      else if (now - this.interruptHoldStart >= INTERRUPT_HOLD_MS) this.suppressPlayback(now);
    } else {
      this.interruptHoldStart = null;
    }
  }

  private observeAssistantAudio(now: number, output: number) {
    const loud = output >= REMOTE_THRESHOLD;
    if (!loud) this.remoteWasSilent = true;
    if (this.armFirstAudio && this.remoteWasSilent && loud && !this.outputSuppressed) {
      this.metrics.assistantAudio(now);
      this.armFirstAudio = false;
      this.dirty = true;
    }
  }

  private suppressPlayback(at: number) {
    if (this.outputSuppressed) return;
    this.outputSuppressed = true;
    if (this.remoteAudio) this.remoteAudio.volume = 0;
    this.armFirstAudio = false;
    this.metrics.playbackMuted(at);
    this.dirty = true;
  }

  private releasePlayback() {
    this.outputSuppressed = false;
    if (this.remoteAudio) this.remoteAudio.volume = 1;
    this.armFirstAudio = true;
    const alreadyAudible = this.outputLevel >= REMOTE_THRESHOLD;
    this.remoteWasSilent = !alreadyAudible;
    if (alreadyAudible) {
      this.metrics.assistantAudio(performance.now());
      this.armFirstAudio = false;
    }
    this.interruptLockedUntil = performance.now() + 400;
  }

  private attachRemote(stream: MediaStream) {
    const track = stream.getAudioTracks()[0];
    if (!this.audioContext || !track) return;
    if (this.remoteTrackId === track.id && this.remoteAudio) return;
    this.remoteTrackId = track.id;
    this.remoteAnalyser?.disconnect();

    const playback = new MediaStream([track]);
    if (!this.remoteAudio) this.remoteAudio = new Audio();
    this.remoteAudio.autoplay = true;
    this.remoteAudio.srcObject = playback;
    this.remoteAudio.volume = this.outputSuppressed ? 0 : 1;
    void setAudioOutput(this.remoteAudio, this.outputDeviceId).catch((error: unknown) => {
      this.pushError(error instanceof Error ? error.message : "Could not select the speaker");
      this.publish(true);
    });
    void this.remoteAudio.play().catch((error: unknown) => {
      this.pushError(error instanceof Error ? error.message : "Playback was blocked");
      this.publish(true);
    });

    this.remoteMonitor?.getTracks().forEach((item) => item.stop());
    this.remoteMonitor = new MediaStream([track.clone()]);
    const source = this.audioContext.createMediaStreamSource(this.remoteMonitor);
    this.remoteAnalyser = this.audioContext.createAnalyser();
    this.remoteAnalyser.fftSize = LEVEL_BUFFER;
    source.connect(this.remoteAnalyser);
  }

  private bindChannel(channel: RTCDataChannel) {
    channel.onmessage = (event) => {
      void this.onChannelMessage(event.data);
    };
    channel.onopen = () => {
      if (!this.sendChannel || channel.label === "oai-events") this.sendChannel = channel;
      this.sendSessionUpdate();
    };
  }

  private sendSessionUpdate() {
    if (this.sessionUpdateSent || !this.sessionCreated) return;
    if (!this.sendChannel || this.sendChannel.readyState !== "open" || !this.options) return;
    const turnDetection =
      this.options.turnDetection === "server_vad"
        ? { type: "server_vad", threshold: 0.5, silence_duration_ms: 500 }
        : { type: "smart_turn" };
    this.sendChannel.send(
      JSON.stringify({
        event_id: `evt_${crypto.randomUUID()}`,
        type: "session.update",
        session: {
          modalities: ["text", "audio"],
          voice: this.options.voice,
          instructions: this.options.instructions,
          turn_detection: turnDetection,
        },
      }),
    );
    this.sessionUpdateSent = true;
  }

  private async onChannelMessage(data: unknown) {
    const text = await decodeMessage(data);
    let parsed: unknown;
    try {
      parsed = JSON.parse(text);
    } catch {
      return;
    }
    const event = asRecord(parsed);
    if (!event || typeof event.type !== "string") return;
    if (!event.type.endsWith(".delta")) this.pushEvent(event.type);
    this.handleEvent(event);
    this.publish(true);
  }

  private handleEvent(event: JsonRecord) {
    const now = performance.now();
    const type = String(event.type);
    if (type === "session.created") {
      this.sessionCreated = true;
      this.sendSessionUpdate();
      return;
    }
    if (type === "session.updated") {
      this.sessionReady = true;
      this.enableMic();
      this.markLive();
      this.sendGreeting();
      return;
    }
    if (type === "error") {
      const error = asRecord(event.error);
      this.pushError(typeof error?.message === "string" ? error.message : "Model error");
      return;
    }
    if (type === "input_audio_buffer.speech_started") {
      this.turnSerial += 1;
      this.userItemKey = `you-${this.turnSerial}`;
      this.metrics.speechStarted(now);
      if (this.assistantActive) this.suppressPlayback(now);
      return;
    }
    if (type === "input_audio_buffer.speech_stopped") {
      this.metrics.speechEnded(now, "server");
      return;
    }
    if (type === "conversation.item.created") {
      this.noteHiddenGreeting(event);
      return;
    }
    if (type === "conversation.item.input_audio_transcription.delta") {
      const key = eventKey(event, this.userItemKey);
      if (this.hiddenItemIds.has(key)) return;
      this.transcriptState = appendTranscriptDelta(this.transcriptState, "you", key, rawString(event, ["delta"]));
      return;
    }
    if (type === "conversation.item.input_audio_transcription.completed") {
      const key = eventKey(event, this.userItemKey);
      if (this.hiddenItemIds.has(key)) return;
      this.transcriptState = finishTranscript(
        this.transcriptState,
        "you",
        key,
        stringField(event, ["transcript", "text"]),
      );
      return;
    }
    if (type === "response.created") {
      this.turnSerial += 1;
      this.assistantItemKey = `qwen-${this.turnSerial}`;
      this.sawAudioTranscript = false;
      this.assistantActive = true;
      this.metrics.responseCreated(now);
      this.releasePlayback();
      return;
    }
    if (type === "response.audio_transcript.delta" || type === "response.output_audio_transcript.delta") {
      this.sawAudioTranscript = true;
      this.transcriptState = appendTranscriptDelta(
        this.transcriptState,
        "qwen",
        this.assistantItemKey,
        rawString(event, ["delta"]),
      );
      return;
    }
    if (type === "response.text.delta") return;
    if (
      type === "response.audio_transcript.done" ||
      type === "response.output_audio_transcript.done" ||
      type === "response.text.done"
    ) {
      if (type === "response.text.done" && this.sawAudioTranscript) return;
      if (type !== "response.text.done") this.sawAudioTranscript = true;
      this.transcriptState = finishTranscript(
        this.transcriptState,
        "qwen",
        this.assistantItemKey,
        stringField(event, ["transcript", "text"]),
      );
      return;
    }
    if (type === "response.done") {
      const response = asRecord(event.response);
      const status = typeof response?.status === "string" ? response.status : "completed";
      const responseId = typeof response?.id === "string" ? response.id : null;
      this.lastUsage = response?.usage ?? null;
      this.metrics.responseDone(now, status, parseUsage(response?.usage), responseId);
      this.assistantActive = false;
      if (status === "cancelled") this.suppressPlayback(now);
    }
  }

  private enableMic() {
    if (this.micEnabled) return;
    this.micEnabled = true;
    this.vadArmedAt = performance.now() + 300;
    if (!this.micTrack) return;
    this.micTrack.enabled = !this.userMuted;
    void this.audioSender?.replaceTrack(this.micTrack);
  }

  private markLive() {
    if (this.startedAt != null) return;
    this.startedAt = performance.now();
    this.phase = "live";
    this.status = "Connected";
    if (this.sessionFallback != null) {
      window.clearTimeout(this.sessionFallback);
      this.sessionFallback = null;
    }
  }

  private sendGreeting() {
    if (this.greetingSent || !this.sendChannel || this.sendChannel.readyState !== "open") return;
    this.greetingSent = true;
    this.sendChannel.send(
      JSON.stringify({
        event_id: `evt_${crypto.randomUUID()}`,
        type: "conversation.item.create",
        item: {
          type: "message",
          role: "user",
          content: [{ type: "input_text", text: "Hello." }],
        },
      }),
    );
  }

  private noteHiddenGreeting(event: JsonRecord) {
    const item = asRecord(event.item);
    if (!item || item.role !== "user" || !Array.isArray(item.content)) return;
    const text = item.content
      .map((part) => {
        const record = asRecord(part);
        return record && typeof record.text === "string" ? record.text : "";
      })
      .join("")
      .trim();
    if (text !== "Hello." || typeof item.id !== "string" || this.hiddenItemIds.has(item.id)) return;
    this.hiddenItemIds.add(item.id);
    this.transcriptState = {
      ...this.transcriptState,
      lines: this.transcriptState.lines.filter((line) => line.role !== "you" || line.text.trim() !== "Hello."),
    };
    if (!this.sendChannel || this.sendChannel.readyState !== "open") return;
    this.sendChannel.send(
      JSON.stringify({
        event_id: `evt_${crypto.randomUUID()}`,
        type: "response.create",
        response: { instructions: FIRST_RESPONSE },
      }),
    );
  }

  private pushEvent(type: string) {
    this.events = [...this.events, type].slice(-30);
  }

  private pushError(message: string) {
    this.errors = [...this.errors, message].slice(-8);
    this.dirty = true;
  }

  private fail(message: string) {
    if (this.phase === "ended") return;
    this.pushError(message);
    if (this.startedAt == null) {
      this.phase = "error";
      this.status = "Error";
      this.cleanupMedia();
      this.publish(true);
      return;
    }
    this.finish(message);
  }

  private finish(message?: string) {
    if (this.phase === "ended") return;
    if (message) this.pushError(message);
    this.endedAt = performance.now();
    this.phase = "ended";
    this.status = message ? "Disconnected" : "Call ended";
    this.saveReport();
    this.cleanupMedia();
    this.publish(true);
  }

  private saveReport() {
    if (!this.options || this.startedAt == null) return;
    const report: SavedReport = {
      savedAt: new Date().toISOString(),
      elapsedMs: this.elapsedMs(),
      summary: this.metrics.summarize(this.elapsedMs(), this.options.pricing),
      checkpoints: this.metrics.checkpoints.map((checkpoint) => ({ ...checkpoint })),
      errors: [...this.errors],
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(report));
  }

  private elapsedMs() {
    if (this.startedAt == null) return 0;
    return Math.max(0, (this.endedAt ?? performance.now()) - this.startedAt);
  }

  private cleanupMedia() {
    this.stopping = true;
    if (this.frame) window.cancelAnimationFrame(this.frame);
    this.frame = 0;
    if (this.sessionFallback != null) window.clearTimeout(this.sessionFallback);
    this.sessionFallback = null;
    this.micStream?.getTracks().forEach((track) => track.stop());
    this.micStream = null;
    this.micTrack = null;
    this.audioSender = null;
    this.micEnabled = false;
    try {
      this.sendChannel?.close();
    } catch {
      /* already closed */
    }
    this.sendChannel = null;
    try {
      this.pc?.close();
    } catch {
      /* already closed */
    }
    this.pc = null;
    void this.audioContext?.close();
    this.audioContext = null;
    this.micAnalyser = null;
    if (this.remoteAudio) {
      this.remoteAudio.pause();
      this.remoteAudio.srcObject = null;
    }
    this.remoteAudio = null;
    this.remoteMonitor?.getTracks().forEach((track) => track.stop());
    this.remoteMonitor = null;
    this.remoteAnalyser = null;
    this.remoteTrackId = null;
  }

  private publish(immediate: boolean) {
    if (this.closed) return;
    const now = performance.now();
    if (!immediate && !this.dirty && now - this.lastPublish < 100) return;
    this.dirty = false;
    this.lastPublish = now;
    this.onChange(this.snapshot());
  }

  private snapshot(): CallSnapshot {
    const pricing = this.options?.pricing;
    const elapsedMs = this.elapsedMs();
    const summary = pricing ? this.metrics.summarize(elapsedMs, pricing) : emptySummary(fallbackPricing);
    let speaker: CallSnapshot["speaker"] = "idle";
    if (!this.outputSuppressed && this.outputLevel >= REMOTE_THRESHOLD) speaker = "qwen";
    else if (this.inputLevel >= SPEECH_THRESHOLD && !this.userMuted) speaker = "you";
    else if (this.assistantActive && !this.outputSuppressed) speaker = "qwen";

    return {
      phase: this.phase,
      status: this.status,
      connectionState: this.pc?.connectionState ?? (this.phase === "ended" ? "closed" : "new"),
      iceState: this.pc?.iceConnectionState ?? "closed",
      speaker,
      inputLevel: this.inputLevel,
      outputLevel: this.outputSuppressed ? 0 : this.outputLevel,
      muted: this.userMuted,
      elapsedMs,
      summary,
      checkpoints: this.metrics.checkpoints.map((checkpoint) => ({ ...checkpoint })),
      errors: this.errors,
      events: this.events,
      transcript: this.transcriptState.lines,
      lastUsage: this.lastUsage,
    };
  }
}

const fallbackPricing: RegionPricing = {
  label: "",
  inputText: 0,
  inputAudio: 0,
  outputText: 0,
  outputAudio: 0,
  outputTextIncludedInAudio: true,
};

function eventKey(event: JsonRecord, fallback: string): string {
  return typeof event.item_id === "string" && event.item_id ? event.item_id : fallback;
}

function rawString(event: JsonRecord, keys: string[]): string {
  for (const key of keys) {
    const value = event[key];
    if (typeof value === "string" && value.length > 0) return value;
  }
  return "";
}

function stringField(event: JsonRecord, keys: string[]): string {
  return rawString(event, keys).trim();
}

function errorFromResponse(body: string): string {
  try {
    const parsed = JSON.parse(body) as { error?: unknown };
    if (typeof parsed.error === "string" && parsed.error.trim()) return parsed.error.slice(0, 500);
    const nested = asRecord(parsed.error);
    if (typeof nested?.message === "string") return nested.message.slice(0, 500);
  } catch {
    /* plain text */
  }
  const text = body.trim();
  return text ? text.slice(0, 500) : "SDP exchange failed";
}
