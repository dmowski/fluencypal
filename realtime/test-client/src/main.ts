import { isInAppBrowser, shouldUseRedirectSignIn } from './authEnvironment.js';
import {
  configureAuthEmulator,
  getIdToken,
  sendEmailSignInLink,
  signInWithGoogle,
  signOutUser,
  waitForAuthBootstrap,
  watchAuth,
} from './firebase.js';
import { describeMicError, MicrophoneSession, computeChunkRms, unlockAudioPlayback, getCaptureWarmupMs, type AudioCapture } from './audioCapture.js';
import { getAppEnvironment, getBackendLabel, isLocalDev, shouldDefaultEmulator } from './env.js';
import { RealtimeSessionClient } from './sessionClient.js';
import { bindDebugLogPanel, clearDebugLog, copyDebugLogToClipboard, debugLog, setDebugLogContext } from './debugLog.js';
import { SessionUsageTracker, type UsageEntry } from './sessionUsage.js';

const $ = <T extends HTMLElement>(id: string) => document.getElementById(id) as T;

const subtitle = $<HTMLParagraphElement>('subtitle');
const envBadge = $<HTMLSpanElement>('env-badge');
const emulatorRow = $<HTMLLabelElement>('emulator-row');
const authHint = $<HTMLParagraphElement>('auth-hint');
const stepSignIn = $<HTMLLIElement>('step-sign-in');
const stepConnect = $<HTMLLIElement>('step-connect');
const stepTalk = $<HTMLLIElement>('step-talk');

const useEmulator = $<HTMLInputElement>('use-emulator');
const signInGoogleBtn = $<HTMLButtonElement>('sign-in-google');
const signOutBtn = $<HTMLButtonElement>('sign-out');
const authStatus = $<HTMLParagraphElement>('auth-status');
const authBrowserWarning = $<HTMLParagraphElement>('auth-browser-warning');
const toggleEmailSignInBtn = $<HTMLButtonElement>('toggle-email-sign-in');
const emailSignInForm = $<HTMLDivElement>('email-sign-in-form');
const emailInput = $<HTMLInputElement>('email-input');
const sendEmailLinkBtn = $<HTMLButtonElement>('send-email-link');
const emailSignInHint = $<HTMLParagraphElement>('email-sign-in-hint');

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
const sessionPriceTotal = $<HTMLParagraphElement>('session-price-total');
const debugLogEl = $<HTMLPreElement>('debug-log');
const copyDebugLogBtn = $<HTMLButtonElement>('copy-debug-log');
const clearDebugLogBtn = $<HTMLButtonElement>('clear-debug-log');
const debugLogStatus = $<HTMLParagraphElement>('debug-log-status');

const transcriptById = new Map<string, HTMLSpanElement>();
const microphone = new MicrophoneSession();
const usageTracker = new SessionUsageTracker();

const parseUsageStage = (stage: string): UsageEntry['stage'] | null => {
  if (stage === 'stt' || stage === 'llm' || stage === 'tts' || stage === 'vision') {
    return stage;
  }
  return null;
};

const renderUsagePanel = () => {
  sessionPriceTotal.textContent = usageTracker.formatSummaryLine();
  if (usageTracker.allEntries.length === 0) {
    usageLog.textContent = 'No usage yet.';
    return;
  }

  usageLog.textContent = usageTracker.allEntries.map((entry) => usageTracker.formatEntryLine(entry)).join('\n');
};

let signedIn = false;
let capture: AudioCapture | null = null;
let callActive = false;
let micAccessPending = false;
let greetingSent = false;

const syncDebugContext = () => {
  setDebugLogContext({
    signedIn,
    connected: client.isConnected,
    callActive,
    mode: mode.value,
    voiceEnabled: voiceEnabled.checked,
    micMuted: micMuted.checked,
    sessionStatus: sessionStatus.textContent ?? '',
    micStatus: micStatus.textContent ?? '',
  });
};

const showDebugLogStatus = (message: string, isError = false) => {
  debugLogStatus.hidden = false;
  debugLogStatus.textContent = message;
  debugLogStatus.classList.toggle('error', isError);
  window.setTimeout(() => {
    debugLogStatus.hidden = true;
  }, 2500);
};

const isRealtimeMode = () => mode.value === 'RealTimeConversation';

type StatusTone = 'idle' | 'ok' | 'active' | 'warning' | 'error';

const setStatusPill = (element: HTMLElement, text: string, tone: StatusTone) => {
  element.textContent = text;
  element.className = `status-pill status-${tone}${element === micStatus ? ' mic-status' : ''}`;
};

const updateSteps = () => {
  stepSignIn.classList.toggle('step-done', signedIn);
  stepSignIn.classList.toggle('step-active', !signedIn);
  stepConnect.classList.toggle('step-done', client.isConnected);
  stepConnect.classList.toggle('step-active', signedIn && !client.isConnected);
  stepTalk.classList.toggle('step-done', callActive);
  stepTalk.classList.toggle('step-active', client.isConnected && !callActive);
};

const initEnvironment = () => {
  const environment = getAppEnvironment();
  envBadge.textContent = environment === 'local' ? 'Local dev' : 'Production';
  envBadge.className = `badge badge-${environment}`;

  useEmulator.checked = shouldDefaultEmulator();
  emulatorRow.hidden = !isLocalDev();

  subtitle.innerHTML =
    environment === 'local'
      ? `Backend: <code>${getBackendLabel()}</code>`
      : `Backend: <code>${getBackendLabel()}</code> · production Firebase`;

  authHint.textContent = isLocalDev()
    ? 'Optional: enable the emulator for instant fake sign-in, or sign in with real Google.'
    : 'Sign in with Google (redirect on mobile) or email link if Google is blocked.';

  if (isInAppBrowser()) {
    authBrowserWarning.textContent =
      'You are in an in-app browser (e.g. Instagram or Telegram). Google sign-in usually fails here — open this page in Safari or Chrome, or use email sign-in.';
    authBrowserWarning.classList.remove('hidden');
  } else if (shouldUseRedirectSignIn()) {
    authBrowserWarning.textContent = 'Mobile browser detected — Google will open in a full-page redirect.';
    authBrowserWarning.classList.remove('hidden');
  }
};

const setMicStatus = (text: string, state: 'idle' | 'ready' | 'error' | 'pending' = 'idle') => {
  const label = text.replace(/^Microphone:\s*/i, 'Mic: ');
  const tone: StatusTone =
    state === 'ready' ? 'ok' : state === 'error' ? 'error' : state === 'pending' ? 'warning' : 'idle';
  setStatusPill(micStatus, label, tone);
};

const setSessionStatusText = (text: string, tone: StatusTone = 'idle') => {
  setStatusPill(sessionStatus, text, tone);
};

const setAuthStatusText = (text: string, tone: StatusTone = 'idle') => {
  setStatusPill(authStatus, text, tone);
};

const updateTalkHint = (connected: boolean) => {
  if (!connected) {
    talkHint.textContent = signedIn
      ? 'Click Connect to open a WebSocket session.'
      : 'Complete step 1 — sign in with Google first.';
    return;
  }

  if (micMuted.checked) {
    talkHint.textContent = 'Microphone is muted in session settings. Uncheck “Mic muted” to speak.';
    return;
  }

  if (isRealtimeMode()) {
    talkHint.textContent =
      'Click “Start call”. The assistant greets you first; wait until mic status says “listening”, then speak naturally.';
    return;
  }

  talkHint.textContent = 'Hold “Hold to talk” while speaking, then release to send. Or type a message below.';
};

const client = new RealtimeSessionClient({
  onStatus: (status) => {
    const tone: StatusTone = status.includes('Error')
      ? 'error'
      : status.includes('ready') || status.includes('listening')
        ? 'ok'
        : status.includes('Connected') || status.includes('Call active')
          ? 'active'
          : 'idle';
    setSessionStatusText(status, tone);
    syncDebugContext();
    updateSteps();
  },
  onSessionReady: () => {
    void prepareMicrophone();
  },
  onMicUploadBlockedChange: (blocked) => {
    if (!callActive || !isRealtimeMode()) {
      return;
    }

    debugLog('call', blocked ? 'mic_paused' : 'mic_listening');

    if (blocked) {
      setSessionStatusText('Call active — assistant speaking (mic paused)', 'warning');
      return;
    }

    setSessionStatusText('Call active — listening…', 'ok');
    syncDebugContext();
  },
  onTranscriptDelta: (messageId, role, delta) => {
    const body = ensureTranscriptMessage(messageId, role);
    body.textContent = `${body.textContent ?? ''}${delta}`;
  },
  onTranscriptDone: (messageId, role, text) => {
    const body = ensureTranscriptMessage(messageId, role);
    body.textContent = text;
  },
  onUsage: ({ stage, model, usageEvent, createdAt }) => {
    const parsedStage = parseUsageStage(stage);
    if (!parsedStage || !usageEvent) {
      return;
    }

    usageTracker.record(
      parsedStage,
      model,
      {
        input_tokens: usageEvent.input_tokens ?? 0,
        output_tokens: usageEvent.output_tokens ?? 0,
        total_tokens: usageEvent.total_tokens,
        audioDurationSeconds: usageEvent.audioDurationSeconds,
      },
      createdAt ?? Date.now(),
    );
    renderUsagePanel();
  },
  onError: (message) => {
    debugLog('error', message);
    setSessionStatusText(`Error: ${message}`, 'error');
    syncDebugContext();
  },
});

bindDebugLogPanel(debugLogEl);
syncDebugContext();

copyDebugLogBtn.addEventListener('click', async () => {
  syncDebugContext();
  const copied = await copyDebugLogToClipboard();
  if (copied) {
    showDebugLogStatus('Logs copied to clipboard.');
    debugLog('client', 'logs_copied');
    return;
  }

  showDebugLogStatus('Could not copy logs. Select and copy from the panel manually.', true);
});

clearDebugLogBtn.addEventListener('click', () => {
  clearDebugLog();
  debugLog('client', 'logs_cleared');
});

const hideTranscriptEmpty = () => {
  transcriptEl.querySelector('.transcript-empty')?.remove();
};

const ensureTranscriptMessage = (messageId: string, role: 'user' | 'assistant'): HTMLSpanElement => {
  hideTranscriptEmpty();
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
    setMicStatus('Mic: not requested');
  }

  updateSteps();
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
  setMicStatus('Mic: waiting for permission…', 'pending');

  try {
    await microphone.requestAccess();
    setMicStatus('Mic: ready', 'ready');
    syncTalkControls(client.isConnected);
    return true;
  } catch (error) {
    setMicStatus(`Mic: ${describeMicError(error)}`, 'error');
    syncTalkControls(client.isConnected);
    return false;
  } finally {
    micAccessPending = false;
  }
};

initEnvironment();
configureAuthEmulator(useEmulator.checked);
renderUsagePanel();

void (async () => {
  setAuthStatusText('Checking sign-in…', 'warning');
  try {
    const user = await waitForAuthBootstrap();
    if (user) {
      debugLog('auth', 'bootstrap_sign_in_complete', { email: user.email ?? user.uid });
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Sign-in failed';
    setAuthStatusText(message, 'error');
    debugLog('auth', 'bootstrap_error', { message });
  } finally {
    signInGoogleBtn.disabled = false;
  }
})();

useEmulator.addEventListener('change', () => {
  authHint.textContent = 'Reload the page after changing the emulator setting.';
});

watchAuth((user) => {
  signedIn = Boolean(user);
  setAuthStatusText(
    user ? `Signed in · ${user.email ?? user.uid}` : 'Not signed in',
    user ? 'ok' : 'idle',
  );
  signOutBtn.disabled = !user;
  connectBtn.disabled = !user || client.isConnected;
  syncDebugContext();
  updateSteps();
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
    if (error instanceof Error && error.message.includes('Redirecting')) {
      setAuthStatusText('Redirecting to Google…', 'warning');
      return;
    }

    setAuthStatusText(error instanceof Error ? error.message : 'Google sign in failed', 'error');
    signInGoogleBtn.disabled = false;
  } finally {
    if (!shouldUseRedirectSignIn() || useEmulator.checked) {
      signInGoogleBtn.disabled = false;
    }
  }
});

toggleEmailSignInBtn.addEventListener('click', () => {
  emailSignInForm.classList.toggle('hidden');
});

sendEmailLinkBtn.addEventListener('click', async () => {
  configureAuthEmulator(useEmulator.checked);
  sendEmailLinkBtn.disabled = true;
  emailSignInHint.classList.remove('hidden');

  try {
    await sendEmailSignInLink(emailInput.value);
    emailSignInHint.textContent = 'Check your email and open the link on this device.';
    debugLog('auth', 'email_link_sent');
  } catch (error) {
    emailSignInHint.textContent = error instanceof Error ? error.message : 'Failed to send email';
    emailSignInHint.classList.add('error');
  } finally {
    sendEmailLinkBtn.disabled = false;
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
    debugLog('call', 'connect_click');
    await unlockAudioPlayback();
    usageTracker.reset();
    renderUsagePanel();
    const token = await getIdToken();
    client.connect(token, readSessionConfig());
    setConnectedUi(true);
  } catch (error) {
    setSessionStatusText(error instanceof Error ? error.message : 'Connect failed', 'error');
  }
});

disconnectBtn.addEventListener('click', async () => {
  await stopCall();
  client.disconnect();
  microphone.release();
  greetingSent = false;
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

  debugLog('call', 'start');

  if (!(await prepareMicrophone())) {
    return;
  }

  await unlockAudioPlayback();
  debugLog('mic', 'warmup_ms', { ms: getCaptureWarmupMs() });

  try {
    let captureChunkCount = 0;
    capture = await microphone.startCapture((chunk) => {
      captureChunkCount += 1;
      if (captureChunkCount === 1 || captureChunkCount % 50 === 0) {
        const pcm = new Int16Array(chunk);
        debugLog('mic', 'capture', {
          rms: Math.round(computeChunkRms(pcm)),
          bytes: chunk.byteLength,
          blocked: client.isMicUploadBlocked,
        });
      }
      client.sendAudioChunk(chunk);
    });
  } catch (error) {
    setMicStatus(`Mic: ${describeMicError(error)}`, 'error');
    return;
  }

  callActive = true;
  callToggleBtn.textContent = 'End call';
  callToggleBtn.classList.add('active');
  setSessionStatusText('Call active — starting…', 'active');
  syncDebugContext();
  updateSteps();

  if (isRealtimeMode() && !greetingSent) {
    await unlockAudioPlayback();
    debugLog('call', 'assistant_trigger');
    client.sendJson({ type: 'assistant.trigger' });
    greetingSent = true;
  } else if (!client.isMicUploadBlocked) {
    setSessionStatusText('Call active — listening…', 'ok');
  }
};

const stopCall = async () => {
  if (!capture) {
    callActive = false;
    callToggleBtn.textContent = 'Start call';
    callToggleBtn.classList.remove('active');
    return;
  }

  debugLog('call', 'stop', { micBlocked: client.isMicUploadBlocked });

  capture.stop();
  capture = null;
  callActive = false;
  callToggleBtn.textContent = 'Start call';
  callToggleBtn.classList.remove('active');
  syncDebugContext();
  updateSteps();

  if (client.isConnected) {
    debugLog('call', 'user_turn_commit_on_stop');
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
    setMicStatus(`Mic: ${describeMicError(error)}`, 'error');
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
updateSteps();
