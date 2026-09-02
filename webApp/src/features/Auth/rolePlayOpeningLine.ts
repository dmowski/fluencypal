import { AiVoice } from '@/features/Ai/ai';
import { RolePlayInstruction } from '@/features/RolePlay/types';

export interface RolePlayOpeningLine {
  text: string;
  voice: AiVoice;
  audioSrc: string;
}

export function getRolePlayOpeningAudioSrc(rolePlayId: string): string {
  return `/audio/role-openings/${rolePlayId}.mp3`;
}

export function getRolePlayOpeningLine(
  scenario: RolePlayInstruction | null | undefined,
): RolePlayOpeningLine | null {
  const text = scenario?.exampleOfFirstMessageFromAi?.trim() ?? '';
  if (!scenario || !text) {
    return null;
  }

  return {
    text,
    voice: scenario.voice,
    audioSrc: getRolePlayOpeningAudioSrc(scenario.id),
  };
}
