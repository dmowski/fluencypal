import WebSocket from 'ws';
import { getDB } from '@/app/api/config/firebase';
import { appendLiveTranscript, liveTranscriptToMessages, LiveTranscriptLine } from '../transcripts';
import { demoRef, readDemo } from './backend';
import {
  demoDeadline,
  DEMO_WARNING_MS,
  DEMO_CONNECT_MS,
  DEMO_DURATION_MS,
  DemoSession,
} from './policy';

const delay = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms));

// Attach BEFORE returning SDP. Never give a browser an unsupervised demo session.
export const superviseDemo = async (session: DemoSession) => {
  const socket = new WebSocket(
    `wss://api.openai.com/v1/live/sessions/${encodeURIComponent(session.sessionId)}/attach`,
    {
      headers: { Authorization: `Bearer ${process.env.OPENAI_API_KEY}` },
      handshakeTimeout: 10_000,
    },
  );
  let closed = false;
  let failed = false;
  let lines: LiveTranscriptLine[] = [];
  socket.on('error', () => {
    failed = true;
  });
  socket.on('close', () => {
    failed = true;
  });
  socket.on('message', (raw) => {
    try {
      const event = JSON.parse(raw.toString()) as Record<string, unknown>;
      if (event.type === 'session.closed') closed = true;
      lines = appendLiveTranscript(lines, event).slice(-100);
    } catch {
      /* Non-JSON frames do not contain transcripts. */
    }
  });
  await new Promise<void>((resolve, reject) => {
    socket.once('open', resolve);
    socket.once('error', reject);
  });
  const send = (event: Record<string, unknown>) => {
    if (socket.readyState === WebSocket.OPEN) socket.send(JSON.stringify(event));
  };
  const forceClose = async () => {
    for (let attempt = 0; attempt < 3 && !closed; attempt++) {
      let control = socket;
      try {
        if (socket.readyState !== WebSocket.OPEN) {
          control = new WebSocket(
            `wss://api.openai.com/v1/live/sessions/${encodeURIComponent(session.sessionId)}/attach`,
            {
              headers: { Authorization: `Bearer ${process.env.OPENAI_API_KEY}` },
              handshakeTimeout: 5000,
            },
          );
          control.on('error', () => undefined);
          control.on('message', (raw) => {
            try {
              if (JSON.parse(raw.toString()).type === 'session.closed') closed = true;
            } catch {
              /* Ignore malformed events. */
            }
          });
          await new Promise<void>((resolve, reject) => {
            control.once('open', resolve);
            control.once('error', reject);
          });
        }
        control.send(JSON.stringify({ type: 'session.close', event_id: 'demo-limit' }));
        for (let i = 0; i < 20 && !closed; i++) await delay(250);
      } catch {
        /* Retry through a fresh control connection. */
      } finally {
        control.close();
      }
    }
    if (!closed) throw new Error('Demo provider closure was not confirmed');
  };
  let closing: Promise<void> | null = null;
  const close = () => (closing ??= forceClose());
  const finish = async () => {
    await close();
    socket.close();
    const messages = liveTranscriptToMessages(lines.map((line) => ({ ...line, closed: true })));
    await getDB()
      .collection('users')
      .doc(session.uid)
      .collection('conversations')
      .doc(session.sessionId)
      .set({
        id: session.sessionId,
        languageCode: session.language,
        mode: 'open-ai-live',
        rolePlayId: null,
        createdAt: session.createdAt,
        createdAtIso: new Date(session.createdAt).toISOString(),
        updatedAt: Date.now(),
        updatedAtIso: new Date().toISOString(),
        messages,
        messagesCount: messages.length,
        messageOrder: {},
        source: 'demo',
      });
    await demoRef(session.uid).update({ closedAt: Date.now() });
  };
  return async () => {
    // Independent of Firestore reads: a slow database must not extend a free call.
    const watchdog = setTimeout(
      () => {
        void close().catch(console.error);
      },
      Math.max(0, session.createdAt + DEMO_CONNECT_MS + DEMO_DURATION_MS - Date.now()),
    );
    let warned = false;
    let greeted = false;
    try {
      while (!closed && !failed) {
        const current = await readDemo(session.uid);
        if (!current || current.closedAt) break;
        if (current.startedAt && !greeted) {
          greeted = true;
          send({
            type: 'session.instructions.append',
            event_id: 'demo-greeting',
            delegation_id: null,
            content:
              'Speak first. Greet the student briefly in the selected learning language and ask what they enjoy doing in their free time.',
          });
        }
        const remaining = demoDeadline(current) - Date.now();
        if (remaining <= 0) break;
        if (current.startedAt && remaining <= DEMO_WARNING_MS && !warned) {
          warned = true;
          send({
            type: 'session.instructions.append',
            event_id: 'demo-wrap-up',
            delegation_id: null,
            content:
              'There are 30 seconds left in this free demo. Briefly let the student know. Offer one useful corrected phrase from what they actually said if there is a clear mistake, otherwise mention something they expressed well. Never invent a mistake or assign a level. Finish warmly.',
          });
        }
        await delay(Math.min(2000, remaining));
      }
    } finally {
      try {
        await finish();
      } finally {
        clearTimeout(watchdog);
        socket.close();
      }
    }
  };
};
