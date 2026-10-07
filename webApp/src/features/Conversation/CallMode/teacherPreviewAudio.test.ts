import fs from 'node:fs';
import path from 'node:path';
import { AI_VOICES } from '@/features/Ai/ai';
import { voiceAvatarMap } from './voiceAvatar';
import { teacherPreviewSrc } from './teacherPreviewAudio';

describe('teacher preview audio', () => {
  it('points each voice at a static mp3', () => {
    expect(AI_VOICES.map(teacherPreviewSrc)).toEqual([
      '/audio/teachers/ash.mp3',
      '/audio/teachers/shimmer.mp3',
      '/audio/teachers/marin.mp3',
      '/audio/teachers/verse.mp3',
    ]);
  });

  it('matches the hello line and voice instructions used to generate the files', () => {
    const source = fs.readFileSync(
      path.join(__dirname, '../../../../scripts/teacherPreviewClips.mjs'),
      'utf8',
    );
    for (const voice of AI_VOICES) {
      expect(source).toContain(voiceAvatarMap[voice].helloPhrases[0]);
      expect(source).toContain(voiceAvatarMap[voice].voiceInstruction);
    }
  });
});
