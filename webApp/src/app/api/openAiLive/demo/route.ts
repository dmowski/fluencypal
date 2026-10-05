import { after } from 'next/server';
import { getDB, validateAuthToken } from '@/app/api/config/firebase';
import {
  fullEnglishLanguageName,
  supportedLanguages,
  SupportedLanguage,
} from '@/features/Lang/lang';
import { createOpenAiLiveSession } from '@/features/OpenAiLive/backend/createLiveSession';
import { openAiLiveErrorResponse } from '@/features/OpenAiLive/backend/requireUser';
import { buildOpenAiLiveInstructions } from '@/features/OpenAiLive/instructions';
import { demoRef, DemoLimitError, readDemo, reserveDemo } from '@/features/OpenAiLive/demo/backend';
import { demoDeadline, DEMO_DURATION_MS, DemoSession } from '@/features/OpenAiLive/demo/policy';
import { superviseDemo } from '@/features/OpenAiLive/demo/supervise';

export const runtime = 'nodejs';
export const maxDuration = 300;

export async function POST(request: Request) {
  try {
    const user = await validateAuthToken(request);
    if (!user.uid) return Response.json({ error: 'Please reload and try again.' }, { status: 401 });
    const body = await request.json();
    if (body.action === 'ready' || body.action === 'close') {
      const result = await demoRef(user.uid).firestore.runTransaction(async (tx) => {
        const ref = demoRef(user.uid);
        const session = (await tx.get(ref)).data() as DemoSession | undefined;
        if (!session || session.sessionId !== body.sessionId) throw new Error('Demo not found');
        if (body.action === 'close') {
          tx.update(ref, { closedAt: Date.now() });
          return { remainingMs: 0 };
        }
        if (session.closedAt || Date.now() >= demoDeadline(session))
          throw new Error('Your demo has ended.');
        const startedAt = session.startedAt ?? Date.now();
        if (session.startedAt === null) tx.update(ref, { startedAt });
        return { remainingMs: Math.max(0, startedAt + DEMO_DURATION_MS - Date.now()) };
      });
      return Response.json(result);
    }
    if (
      body.action !== 'start' ||
      typeof body.sdp !== 'string' ||
      body.sdp.length < 10 ||
      body.sdp.length > 200_000 ||
      !supportedLanguages.includes(body.language) ||
      body.consent !== true
    ) {
      return Response.json(
        { error: 'Choose a language and accept the demo terms.' },
        { status: 400 },
      );
    }
    // Vercel overwrites this header; never trust caller-controlled x-forwarded-for.
    const ip = process.env.VERCEL === '1' ? request.headers.get('x-vercel-forwarded-for') : 'local';
    if (!ip) throw new Error('Demo is unavailable on this host.');
    if (!process.env.OPENAI_API_KEY)
      throw new Error('The demo is temporarily unavailable. Please try again later.');
    await reserveDemo(user.uid, ip);
    const language = body.language as SupportedLanguage;
    const created = await createOpenAiLiveSession({
      userId: user.uid,
      sdp: body.sdp,
      voice: 'marin',
      demo: true,
      instructions:
        buildOpenAiLiveInstructions({
          mode: 'talk',
          languageName: fullEnglishLanguageName[language],
          nativeLanguageName: null,
          voiceName: 'Marin',
          pace: 'Speak slowly with short, easy sentences.',
          userInfo: '',
          grammarNotes: '',
        }) +
        '\nThis is a three-minute beginner-friendly demo. Start by greeting the student and asking what they enjoy doing in their free time. Help them with a simple example if they get stuck. Ask only one question per turn.',
    });
    const session: DemoSession = {
      uid: user.uid,
      sessionId: created.sessionId,
      language,
      createdAt: Date.now(),
      startedAt: null,
      closedAt: null,
    };
    await demoRef(user.uid).set(session);
    const userRef = getDB().collection('users').doc(user.uid);
    await getDB().runTransaction(async (tx) => {
      const existing = (await tx.get(userRef)).data();
      if (!existing?.languageCode) tx.set(userRef, { languageCode: language }, { merge: true });
    });
    const supervise = await superviseDemo(session);
    after(supervise);
    return Response.json(created);
  } catch (error) {
    if (error instanceof DemoLimitError)
      return Response.json({ error: error.message }, { status: 429 });
    return openAiLiveErrorResponse(error);
  }
}

export async function GET(request: Request) {
  try {
    const user = await validateAuthToken(request);
    const session = await readDemo(user.uid);
    const conversation = session?.sessionId
      ? await getDB()
          .collection('users')
          .doc(user.uid)
          .collection('conversations')
          .doc(session.sessionId)
          .get()
      : null;
    const messages = conversation?.data()?.messages as
      | { id: string; text: string; isBot: boolean }[]
      | undefined;
    return Response.json(
      {
        used: !!session,
        language: session?.language ?? 'en',
        lines: (messages ?? []).map((message) => ({
          id: message.id,
          text: message.text,
          role: message.isBot ? 'assistant' : 'user',
          closed: true,
        })),
      },
      { headers: { 'Cache-Control': 'private, no-store' } },
    );
  } catch (error) {
    return openAiLiveErrorResponse(error);
  }
}
