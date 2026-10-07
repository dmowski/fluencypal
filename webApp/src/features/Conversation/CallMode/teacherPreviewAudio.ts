import { AiVoice } from '@/features/Ai/ai';

export const teacherPreviewSrc = (voice: AiVoice): string => `/audio/teachers/${voice}.mp3`;
