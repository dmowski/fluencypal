import { existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export const voiceFixturesDir = path.join(__dirname, '../fixtures/voice');

/** User-recorded WAV fixtures (silence → speech → silence). */
export const USER_RECORDING_WAV_FILES = ['whats-your-name.wav', 'case-2.wav'] as const;

export type UserRecordingWav = (typeof USER_RECORDING_WAV_FILES)[number];

export const USER_RECORDING_WAV = 'whats-your-name.wav' as const satisfies UserRecordingWav;
export const CASE_2_WAV = 'case-2.wav' as const satisfies UserRecordingWav;

export const micWavForRecording = (recording: UserRecordingWav): string =>
  recording.replace(/\.wav$/i, '-48k-mono.wav');

export const USER_RECORDING_MIC_WAV = micWavForRecording(USER_RECORDING_WAV);
export const CASE_2_MIC_WAV = micWavForRecording(CASE_2_WAV);

export type VoiceFixtureName =
  | UserRecordingWav
  | typeof USER_RECORDING_MIC_WAV
  | typeof CASE_2_MIC_WAV
  | 'hello-24k-mono.wav'
  | 'silence-24k-mono.wav'
  | 'loud-interrupt-24k-mono.wav'
  | 'hello-48k-mono.wav';

export const isUserRecordingWav = (name: string): name is UserRecordingWav =>
  (USER_RECORDING_WAV_FILES as readonly string[]).includes(name);

export const voiceFixturePath = (name: VoiceFixtureName): string =>
  path.join(voiceFixturesDir, name);

const requiredApiFixtures: VoiceFixtureName[] = [USER_RECORDING_WAV, CASE_2_WAV, 'silence-24k-mono.wav'];

export const voiceFixturesReady = (options: { browser?: boolean; recording?: UserRecordingWav } = {}): boolean => {
  const apiFiles = options.recording
    ? ([options.recording] as VoiceFixtureName[])
    : requiredApiFixtures;

  if (!apiFiles.every((name) => existsSync(voiceFixturePath(name)))) {
    return false;
  }

  if (options.browser) {
    const mic = options.recording ? micWavForRecording(options.recording) : USER_RECORDING_MIC_WAV;
    return existsSync(voiceFixturePath(mic as VoiceFixtureName));
  }

  return true;
};

export const voiceFixturesSkipReason = (options: {
  browser?: boolean;
  recording?: UserRecordingWav;
} = {}): string | null => {
  if (!process.env.OPENAI_API_KEY) {
    return 'OPENAI_API_KEY is not set';
  }

  const recording = options.recording ?? USER_RECORDING_WAV;
  if (!existsSync(voiceFixturePath(recording))) {
    return `Missing ${recording} in ${voiceFixturesDir}`;
  }

  if (options.browser) {
    const mic = micWavForRecording(recording) as VoiceFixtureName;
    if (!existsSync(voiceFixturePath(mic))) {
      return `Missing ${mic} — run: pnpm e2e:fixtures:normalize`;
    }
  }

  return null;
};
