import { NextResponse } from 'next/server';
import { validateAuthToken } from '@/app/api/config/firebase';
import { assertVoiceChatParticipant } from '@/features/Chat/VoiceChat/backend/access';
import {
  createVoiceChatMessage,
  getReadMetadata,
  listVoiceChatMessages,
} from '@/features/Chat/VoiceChat/backend/messages';
import {
  parseSendMessageForm,
  voiceChatErrorResponse,
} from '@/features/Chat/VoiceChat/backend/http';
import {
  VoiceChatListMessagesResponse,
  VoiceChatSendMessageResponse,
} from '@/features/Chat/VoiceChat/types';

export async function GET(request: Request) {
  try {
    const user = await validateAuthToken(request);
    await assertVoiceChatParticipant(user.uid);
    const [messages, read] = await Promise.all([
      listVoiceChatMessages(),
      getReadMetadata(user.uid),
    ]);
    const response: VoiceChatListMessagesResponse = {
      messages,
      listenedMessageIds: Object.keys(read).filter((id) => read[id]),
    };
    return NextResponse.json(response);
  } catch (error) {
    return voiceChatErrorResponse(error);
  }
}

export async function POST(request: Request) {
  try {
    const user = await validateAuthToken(request);
    await assertVoiceChatParticipant(user.uid);

    const form = await parseSendMessageForm(request);
    const buffer = Buffer.from(await form.audio.arrayBuffer());
    const message = await createVoiceChatMessage({
      senderId: user.uid,
      parentMessageId: form.parentMessageId,
      audioBuffer: buffer,
      contentType: form.audio.type || 'audio/webm',
      durationSec: Math.round(form.durationSec),
    });
    return NextResponse.json<VoiceChatSendMessageResponse>({ message });
  } catch (error) {
    return voiceChatErrorResponse(error);
  }
}
