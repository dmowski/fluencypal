import { NextResponse } from 'next/server';
import { validateAuthToken } from '@/app/api/config/firebase';
import { requestVoiceChatAccess } from '@/features/Chat/VoiceChat/backend/membership';
import { saveVoiceChatAudio } from '@/features/Chat/VoiceChat/backend/storage';
import {
  parseRequestAccessForm,
  voiceChatErrorResponse,
} from '@/features/Chat/VoiceChat/backend/http';
import { VoiceChatRequestAccessResponse } from '@/features/Chat/VoiceChat/types';
import { randomUUID } from 'crypto';

export async function POST(request: Request) {
  try {
    const user = await validateAuthToken(request);
    const form = await parseRequestAccessForm(request);

    const buffer = Buffer.from(await form.audio.arrayBuffer());
    const introId = `intro-${user.uid}-${randomUUID()}`;
    const { audioPath, contentType } = await saveVoiceChatAudio({
      id: introId,
      buffer,
      contentType: form.audio.type || 'audio/webm',
    });

    const member = await requestVoiceChatAccess({
      uid: user.uid,
      introAudioPath: audioPath,
      introDurationSec: Math.round(form.durationSec),
      introContentType: contentType,
    });

    return NextResponse.json<VoiceChatRequestAccessResponse>({ member });
  } catch (error) {
    return voiceChatErrorResponse(error);
  }
}
