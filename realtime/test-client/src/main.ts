import { configureAuthEmulator, getIdToken, signInWithGoogle, signOutUser, watchAuth } from './firebase.js';
import { describeMicError, MicrophoneSession, type AudioCapture } from './audioCapture.js';
import { RealtimeSessionClient } from './sessionClient.js';

const $ = <T extends HTMLElement>(id: string) => document.getElementById(id) as T;

const useEmulator = $<HTMLInputElement>('use-emulator');
const signInGoogleBtn = $<HTMLButtonElement>('sign-in-google');
const signOutBtn = $<HTMLButtonElement>('sign-out');
const authStatus = $<HTMLParagraphElement>('auth-status');

const systemInstruction = $<HTMLTextAreaElement>('system-instruction');
const mode = $<HTMLSelectElement>('mode');
const voice = $<HTMLSelectElement>('voice');
const voiceEnabled = $<HTMLInputElement>('voice-enabled');
const micMuted = $<HTMLInputElement>('mic-muted');
const connectBtn = $<HTMLButtonElement>('connect');
const disconnectBtn = $<HTMLButtonElement>('disconnect');
const sessionStatus = $<HTMLParagraphElement>('session-status');

const talkHint = $<HTMLParagraphElement>('talk-hint');
const micStatus = $<HTMLParagraphElement>('mic-status');
const callToggleBtn = $<HTMLButtonElement>('call-toggle');
const pttBtn = $<HTMLButtonElement>('ptt');
const typedMessage = $<HTMLInputElement>('typed-message');
const sendTextBtn = $<HTMLButtonElement>('send-text');
const transcriptEl = $<HTMLDivElement>('transcript');
const usageLog = $<HTMLPreElement>('usage-log');

const transcriptById = new Map<string, HTMLSpanElement>();
const microphone = new MicrophoneSession();

let signedIn = false;
let capture: AudioCapture | null = null;
let callActive = false;
let micAccessPending = false;

const isRealtimeMode = () => mode.value === 'RealTimeConversation';

const setMicStatus = (text: string, state: 'idle' | 'ready' | 'error' | 'pending' = 'idle') => {
  micStatus.textContent = text;
  micStatus.classList.remove('ready', 'error');
  if (state === 'ready') {
    micStatus.classList.add('ready');
  }
  if (state === 'error') {
    micStatus.classList.add('error');
  }
};

const updateTalkHint = (connected: boolean) => {
  if (!connected) {
    talkHint.textContent = 'Connect first, then allow microphone access and use the control below.';
    return;
  }

  if (micMuted.checked) {
    talkHint.textContent = 'Microphone is muted in session settings. Uncheck “Mic muted” to speak.';
    return;
  }

  if (isRealtimeMode()) {
    talkHint.textContent = 'Click “Start call” to stream your microphone. The server commits each turn after a short pause.';
    return;
  }

  talkHint.textContent = 'Hold “Hold to talk” while speaking, then release to send. Or type a message below.';
};

const client = new RealtimeSessionClient({
  onStatus: (status) => {
    sessionStatus.textContent = status;
  },
  onSessionReady: (config) => {
    void prepareMicrophone();
    if (config.mode === 'RealTimeConversation') {
      client.sendJson({ type: 'assistant.trigger' });
    }
  },
  onTranscriptDelta: (messageId, role, delta) => {
    const body = ensureTranscriptMessage(messageId, role);
    body.textContent = `${body.textContent ?? ''}${delta}`;
  },
  onTranscriptDone: (messageId, role, text) => {
    const body = ensureTranscriptMessage(messageId, role);
    body.textContent = text;
  },
  onUsage: (entry) => {
    usageLog.textContent = `${entry}\n\n${usageLog.textContent ?? ''}`.trim();
  },
  onError: (message) => {
    sessionStatus.textContent = `Error: ${message}`;
  },
});

const ensureTranscriptMessage = (messageId: string, role: 'user' | 'assistant'): HTMLSpanElement => {
  const existing = transcriptById.get(messageId);
  if (existing) {
    return existing;
  }

  const wrapper = document.createElement('div');
  wrapper.className = `message ${role}`;
  wrapper.dataset.messageId = messageId;

  const label = document.createElement('span');
  label.className = 'role';
  label.textContent = role;

  const body = document.createElement('span');
  wrapper.append(label, body);

  transcriptEl.prepend(wrapper);
  transcriptById.set(messageId, body);
  return body;
};

const syncTalkControls = (connected: boolean) => {
  const realtime = isRealtimeMode();

  callToggleBtn.classList.toggle('hidden', !realtime);
  pttBtn.classList.toggle('hidden', realtime);

  const micBlocked = micMuted.checked || !microphone.isReady;
  callToggleBtn.disabled = !connected || micBlocked;
  pttBtn.disabled = !connected || micBlocked || realtime;

  updateTalkHint(connected);

  if (!connected) {
    void stopCall();
  }
};

const setConnectedUi = (connected: boolean) => {
  connectBtn.disabled = connected || !signedIn;
  disconnectBtn.disabled = !connected;
  typedMessage.disabled = !connected;
  sendTextBtn.disabled = !connected;
  syncTalkControls(connected);

  if (!connected) {
    setMicStatus('Microphone: not requested yet');
  }
};

const readSessionConfig = () => ({
  languageCode: 'en',
  mode: mode.value as 'PushToTalk' | 'RealTimeConversation',
  voiceEnabled: voiceEnabled.checked,
  micMuted: micMuted.checked,
  systemInstruction: systemInstruction.value.trim(),
  voice: voice.value as 'shimmer' | 'ash' | 'marin' | 'verse',
});

const prepareMicrophone = async (): Promise<boolean> => {
  if (micMuted.checked || micAccessPending || microphone.isReady) {
    syncTalkControls(client.isConnected);
    return microphone.isReady;
  }

  micAccessPending = true;
  setMicStatus('Microphone: waiting for browser permission…', 'pending');

  try {
    await microphone.requestAccess();
    setMicStatus('Microphone: ready', 'ready');
    syncTalkControls(client.isConnected);
    return true;
  } catch (error) {
    setMicStatus(`Microphone: ${describeMicError(error)}`, 'error');
    syncTalkControls(client.isConnected);
    return false;
  } finally {
    micAccessPending = false;
  }
};

configureAuthEmulator(useEmulator.checked);

watchAuth((user) => {
  signedIn = Boolean(user);
  authStatus.textContent = user ? `Signed in as ${user.email ?? user.uid}` : 'Not signed in';
  signOutBtn.disabled = !user;
  connectBtn.disabled = !user || client.isConnected;
});

mode.addEventListener('change', () => {
  syncTalkControls(client.isConnected);
});

signInGoogleBtn.addEventListener('click', async () => {
  configureAuthEmulator(useEmulator.checked);
  signInGoogleBtn.disabled = true;

  try {
    await signInWithGoogle();
  } catch (error) {
    authStatus.textContent = error instanceof Error ? error.message : 'Google sign in failed';
  } finally {
    signInGoogleBtn.disabled = false;
  }
});

signOutBtn.addEventListener('click', async () => {
  await stopCall();
  client.disconnect();
  microphone.release();
  await signOutUser();
  setConnectedUi(false);
});

connectBtn.addEventListener('click', async () => {
  try {
    const token = await getIdToken();
    client.connect(token, readSessionConfig());
    setConnectedUi(true);
  } catch (error) {
    sessionStatus.textContent = error instanceof Error ? error.message : 'Connect failed';
  }
});

disconnectBtn.addEventListener('click', async () => {
  await stopCall();
  client.disconnect();
  microphone.release();
  setConnectedUi(false);
});

voiceEnabled.addEventListener('change', () => {
  if (client.isConnected) {
    client.updateSession({ voiceEnabled: voiceEnabled.checked });
  }
});

micMuted.addEventListener('change', async () => {
  if (micMuted.checked) {
    await stopCall();
  } else if (client.isConnected) {
    await prepareMicrophone();
  }

  syncTalkControls(client.isConnected);

  if (client.isConnected) {
    client.updateSession({ micMuted: micMuted.checked });
  }
});

const startCall = async () => {
  if (!client.isConnected || micMuted.checked || capture || callActive) {
    return;
  }

  if (!(await prepareMicrophone())) {
    return;
  }

  try {
    capture = await microphone.startCapture((chunk) => {
      client.sendAudioChunk(chunk);
    });
  } catch (error) {
    setMicStatus(`Microphone: ${describeMicError(error)}`, 'error');
    return;
  }

  callActive = true;
  callToggleBtn.textContent = 'End call';
  callToggleBtn.classList.add('active');
  sessionStatus.textContent = 'Call active — speak naturally';
};

const stopCall = async () => {
  if (!capture) {
    callActive = false;
    callToggleBtn.textContent = 'Start call';
    callToggleBtn.classList.remove('active');
    return;
  }

  capture.stop();
  capture = null;
  callActive = false;
  callToggleBtn.textContent = 'Start call';
  callToggleBtn.classList.remove('active');

  if (client.isConnected) {
    client.sendJson({ type: 'user.turn.commit' });
  }
};

callToggleBtn.addEventListener('click', () => {
  if (callActive) {
    void stopCall();
    return;
  }

  void startCall();
});

const startPushToTalk = async () => {
  if (!client.isConnected || micMuted.checked || capture || isRealtimeMode()) {
    return;
  }

  if (!(await prepareMicrophone())) {
    return;
  }

  try {
    capture = await microphone.startCapture((chunk) => {
      client.sendAudioChunk(chunk);
    });
  } catch (error) {
    setMicStatus(`Microphone: ${describeMicError(error)}`, 'error');
    return;
  }

  pttBtn.classList.add('recording');
  pttBtn.textContent = 'Recording… release to send';
};

const stopPushToTalk = () => {
  if (!capture || isRealtimeMode()) {
    return;
  }

  capture.stop();
  capture = null;
  pttBtn.classList.remove('recording');
  pttBtn.textContent = 'Hold to talk';
  client.sendJson({ type: 'user.turn.commit' });
};

pttBtn.addEventListener('mousedown', () => {
  void startPushToTalk();
});

pttBtn.addEventListener('mouseup', stopPushToTalk);
pttBtn.addEventListener('mouseleave', stopPushToTalk);

pttBtn.addEventListener('touchstart', (event) => {
  event.preventDefault();
  void startPushToTalk();
});

pttBtn.addEventListener('touchend', (event) => {
  event.preventDefault();
  stopPushToTalk();
});

sendTextBtn.addEventListener('click', () => {
  const text = typedMessage.value.trim();
  if (!text) {
    return;
  }

  client.sendTextTurn(text);
  typedMessage.value = '';
});

typedMessage.addEventListener('keydown', (event) => {
  if (event.key === 'Enter') {
    sendTextBtn.click();
  }
});

setConnectedUi(false);
